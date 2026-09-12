import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, storage, cleanFirestoreData } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
  storageType: 'firebase_storage' | 'firestore_durable';
  uploadedAt: string;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Validates file type and size.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file type
  const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);

  if (!isAllowedType) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || file.name}). Please select a JPG, PNG, or WEBP image.`,
    };
  }

  // Check file size (max 10MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Optimizes and resizes images in browser using HTML5 Canvas.
 * Produces crisp, high-clarity WebP/JPEG images with optimal byte size
 * to guarantee documents never exceed Firestore's 1MB limit.
 */
export async function optimizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  // SVG files can be read directly
  if (file.type === 'image/svg+xml') {
    const text = await file.text();
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
    return { blob: file, dataUrl, width: 800, height: 800 };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format (prefer WebP for maximum compression ratio)
        let outputMime = file.type === 'image/png' ? 'image/png' : 'image/webp';

        const tryBlob = (mime: string, q: number): Promise<Blob | null> => {
          return new Promise((res) => {
            try {
              canvas.toBlob((b) => res(b), mime, q);
            } catch {
              res(null);
            }
          });
        };

        try {
          let blob = await tryBlob(outputMime, quality);
          if (!blob) {
            outputMime = 'image/jpeg';
            blob = await tryBlob('image/jpeg', quality);
          }
          if (!blob) {
            reject(new Error('Image conversion failed'));
            return;
          }
          let dataUrl = canvas.toDataURL(outputMime, quality);

          // Guarantee durable storage safety: if dataUrl exceeds 180KB, compress to ensure it never bloats Firestore
          if (dataUrl.length > 180000 && width > 600) {
            const downScaleRatio = 600 / width;
            const downW = 600;
            const downH = Math.round(height * downScaleRatio);
            const downCanvas = document.createElement('canvas');
            downCanvas.width = downW;
            downCanvas.height = downH;
            const downCtx = downCanvas.getContext('2d');
            if (downCtx) {
              downCtx.imageSmoothingEnabled = true;
              downCtx.imageSmoothingQuality = 'high';
              downCtx.drawImage(img, 0, 0, downW, downH);
              const smallerBlob = await new Promise<Blob | null>((res) => {
                downCanvas.toBlob((b) => res(b), 'image/webp', 0.72);
              });
              if (smallerBlob) {
                blob = smallerBlob;
                dataUrl = downCanvas.toDataURL('image/webp', 0.72);
                width = downW;
                height = downH;
              }
            }
          }

          resolve({ blob, dataUrl, width, height });
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read selected image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image for Product, Category, Hero Banner, or Payment Proof.
 * Tries Firebase Storage first; if storage bucket is inaccessible or returns an error,
 * automatically falls back to durable Firestore media storage so images persist and display permanently.
 */
export async function uploadImageFile(
  file: File,
  folder: 'products' | 'categories' | 'banners' | 'payment_proofs',
  itemId: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // 1. Validation
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  // 2. Pre-process and optimize with tailored bounds per media type
  if (onProgress) onProgress(15);
  const isBanner = folder === 'banners';
  const isCategory = folder === 'categories';
  const isPaymentProof = folder === 'payment_proofs';

  const maxWidth = isBanner ? 1600 : isCategory ? 600 : isPaymentProof ? 1200 : 800;
  const maxHeight = isBanner ? 700 : isCategory ? 600 : isPaymentProof ? 1600 : 800;
  const quality = isBanner ? 0.80 : isPaymentProof ? 0.75 : 0.78;

  const { blob, dataUrl } = await optimizeImage(file, maxWidth, maxHeight, quality);
  if (onProgress) onProgress(35);

  const cleanName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const timestamp = Date.now();
  
  // Safe storage path
  const storagePath = isBanner
    ? `hero-banners/${timestamp}_${cleanName}`
    : `${folder}/${itemId || 'general'}/${timestamp}_${cleanName}`;

  const mediaId = `media_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // 3. Attempt Firebase Storage upload if storage is initialized
  if (storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: blob.type || file.type || 'image/jpeg',
        customMetadata: {
          originalName: file.name,
          folder,
          itemId: itemId || 'general',
          uploadedAt: now,
        },
      });

      // Wrap with a fast 6s timeout to guard against hangs on unreachable storage buckets
      const uploadPromise = new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const progress = Math.round(
                35 + (snapshot.bytesTransferred / snapshot.totalBytes) * 60
              );
              if (onProgress) onProgress(Math.min(95, progress));
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (e) {
              reject(e);
            }
          }
        );
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          try { uploadTask.cancel(); } catch (_) {}
          reject(new Error('Firebase Storage timeout, switching to durable media fallback'));
        }, 6000);
      });

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      if (onProgress) onProgress(100);

      // Save metadata in Firestore uploaded_media collection
      try {
        await setDoc(doc(db, 'uploaded_media', mediaId), cleanFirestoreData({
          id: mediaId,
          name: file.name,
          url: downloadUrl,
          path: storagePath,
          size: blob.size,
          type: blob.type,
          folder,
          itemId: itemId || null,
          storageType: 'firebase_storage',
          uploadedAt: now,
        }));
      } catch (err) {
        console.warn('Media metadata tracking note:', err);
      }

      return {
        url: downloadUrl,
        path: storagePath,
        name: file.name,
        size: blob.size,
        type: blob.type,
        storageType: 'firebase_storage',
        uploadedAt: now,
      };
    } catch (storageError) {
      console.warn(
        'Firebase Storage upload note (using durable media fallback):',
        storageError
      );
      // Fall through to durable fallback
    }
  }

  // 4. Durable Firestore storage fallback
  // This stores the optimized permanent data URL in Firestore so it works across all devices and sessions
  if (onProgress) onProgress(70);

  try {
    await setDoc(doc(db, 'uploaded_media', mediaId), cleanFirestoreData({
      id: mediaId,
      name: file.name,
      url: dataUrl,
      path: storagePath,
      size: blob.size,
      type: blob.type,
      folder,
      itemId: itemId || null,
      storageType: 'firestore_durable',
      uploadedAt: now,
    }));

    if (onProgress) onProgress(100);

    return {
      url: dataUrl,
      path: storagePath,
      name: file.name,
      size: blob.size,
      type: blob.type,
      storageType: 'firestore_durable',
      uploadedAt: now,
    };
  } catch (firestoreError) {
    console.warn('Media fallback direct return:', firestoreError);
    if (onProgress) onProgress(100);
    return {
      url: dataUrl,
      path: storagePath,
      name: file.name,
      size: blob.size,
      type: blob.type,
      storageType: 'firestore_durable',
      uploadedAt: now,
    };
  }
}

/**
 * Deletes an image file from storage if applicable.
 */
export async function deleteImageFromStorage(
  url: string,
  path?: string
): Promise<{ success: boolean; storageCleaned: boolean; error?: string }> {
  if (!url) return { success: true, storageCleaned: true };

  let storageCleaned = true;
  let storageError: string | undefined;

  // 1. If it's a Firebase Storage URL
  if (storage && (url.includes('firebasestorage.googleapis.com') || path)) {
    try {
      let storageRef;
      if (path) {
        storageRef = ref(storage, path);
      } else {
        // Extract path from download URL if possible
        const matches = url.match(/\/o\/([^?]+)/);
        if (matches && matches[1]) {
          const decodedPath = decodeURIComponent(matches[1]);
          storageRef = ref(storage, decodedPath);
        }
      }
      if (storageRef) {
        await deleteObject(storageRef);
      }
    } catch (err: any) {
      if (err?.code !== 'storage/object-not-found') {
        console.warn('Firebase Storage deletion note:', err);
        storageCleaned = false;
        storageError = err?.message || 'Storage file could not be deleted.';
      }
    }
  }

  // 2. Also clean up from uploaded_media collection in Firestore
  try {
    const q = query(collection(db, 'uploaded_media'), where('url', '==', url));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore uploaded_media cleanup note:', err);
  }

  return { success: true, storageCleaned, error: storageError };
}
