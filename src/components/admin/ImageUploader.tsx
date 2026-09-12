import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  Eye
} from 'lucide-react';
import {
  uploadImageFile,
  validateImageFile,
  deleteImageFromStorage,
  UploadResult
} from '../../lib/storageService';

// =========================================================================
// 1. MULTIPLE PRODUCT IMAGE GALLERY UPLOADER
// =========================================================================

interface ProductGalleryUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  productId?: string;
  disabled?: boolean;
}

export const ProductGalleryUploader: React.FC<ProductGalleryUploaderProps> = ({
  images,
  onChange,
  productId = 'temp_product',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  // Trigger file selection
  const handleOpenPicker = (replaceIndex: number | null = null) => {
    replaceIndexRef.current = replaceIndex;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process files selected from file dialog or drag-and-drop
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const fileList = Array.from(files);

    // Validate all files
    for (const file of fileList) {
      const val = validateImageFile(file);
      if (!val.valid) {
        setErrorMessage(val.error || 'Invalid file detected.');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatus(`Uploading ${fileList.length} image(s)...`);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadStatus(`Uploading ${file.name} (${i + 1}/${fileList.length})...`);

        const result = await uploadImageFile(file, 'products', productId, (p) => {
          const overall = Math.round(((i + p / 100) / fileList.length) * 100);
          setUploadProgress(overall);
        });

        uploadedUrls.push(result.url);
      }

      if (replaceIndexRef.current !== null && uploadedUrls.length > 0) {
        // Replace single image
        const targetIdx = replaceIndexRef.current;
        const oldUrl = images[targetIdx];
        const updated = [...images];
        updated[targetIdx] = uploadedUrls[0];
        onChange(updated);
        // Attempt background deletion of old image
        if (oldUrl) deleteImageFromStorage(oldUrl);
        replaceIndexRef.current = null;
      } else {
        // Append new images
        onChange([...images, ...uploadedUrls]);
      }

      setUploadStatus('Upload successful!');
      setTimeout(() => {
        setUploadStatus(null);
        setUploadProgress(0);
      }, 2500);
    } catch (err: any) {
      console.error('Image upload failure:', err);
      setErrorMessage(err?.message || 'Failed to upload image(s). Please try again.');
    } finally {
      setIsUploading(false);
      replaceIndexRef.current = null;
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Reorder Left
  const handleMoveLeft = (idx: number) => {
    if (idx <= 0) return;
    const newArr = [...images];
    const temp = newArr[idx - 1];
    newArr[idx - 1] = newArr[idx];
    newArr[idx] = temp;
    onChange(newArr);
  };

  // Reorder Right
  const handleMoveRight = (idx: number) => {
    if (idx >= images.length - 1) return;
    const newArr = [...images];
    const temp = newArr[idx + 1];
    newArr[idx + 1] = newArr[idx];
    newArr[idx] = temp;
    onChange(newArr);
  };

  // Set as Primary (moves to index 0)
  const handleSetPrimary = (idx: number) => {
    if (idx === 0) return;
    const newArr = [...images];
    const [selected] = newArr.splice(idx, 1);
    newArr.unshift(selected);
    onChange(newArr);
  };

  // Remove single image
  const handleRemoveImage = (idx: number) => {
    const toRemove = images[idx];
    const newArr = images.filter((_, i) => i !== idx);
    onChange(newArr);
    if (toRemove) {
      deleteImageFromStorage(toRemove);
    }
  };

  // Manual URL insertion
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Native Gallery/Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        multiple={replaceIndexRef.current === null}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || isUploading}
      />

      {/* Header with Title and Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-orange-600" />
            Product Image Gallery ({images.length} uploaded)
          </label>
          <p className="text-[11px] text-neutral-500">
            Upload from device gallery. The first image is the <strong className="text-orange-600">Primary Image</strong> shown on catalog cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {showUrlInput ? 'Hide URL Input' : 'Add via URL'}
          </button>
          <button
            type="button"
            onClick={() => handleOpenPicker(null)}
            disabled={disabled || isUploading}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Manual URL Input Bar (Collapsible) */}
      {showUrlInput && (
        <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 flex gap-2 items-center">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste direct HTTPS image link..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-black cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && handleOpenPicker(null)}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-orange-500 bg-orange-50/80 scale-[1.01]'
            : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-100 hover:border-neutral-400'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-800">
              {isUploading
                ? uploadStatus || 'Uploading...'
                : 'Click to open Device Gallery / File Picker or drag & drop pictures here'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Supports high-resolution JPG, PNG, WEBP (Up to 10MB each)
            </p>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-xs mx-auto mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-neutral-600">
              <span>{uploadStatus}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadStatus && !isUploading && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Gallery Image Grid with Card Actions */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Uploaded Photos ({images.length})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => {
              const isPrimary = idx === 0;
              return (
                <div
                  key={`${img}_${idx}`}
                  className={`relative group bg-white rounded-xl border-2 overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                    isPrimary ? 'border-orange-600 ring-2 ring-orange-500/20' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        Primary
                      </span>
                    )}

                    {/* Hover Quick Actions */}
                    <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        title="View Full Size"
                        className="p-2 bg-white/90 text-neutral-800 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenPicker(idx)}
                        title="Replace Picture"
                        className="p-2 bg-white/90 text-neutral-800 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Delete Image"
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Reorder and Controls Bar */}
                  <div className="p-2 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveLeft(idx)}
                        title="Move Left"
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono text-neutral-500">#{idx + 1}</span>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMoveRight(idx)}
                        title="Move Right"
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                      >
                        Make Primary
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. SINGLE IMAGE UPLOADER (FOR CATEGORIES, BANNERS, VARIANTS)
// =========================================================================

interface SingleImageUploaderProps {
  label: string;
  sublabel?: string;
  folder: 'categories' | 'banners' | 'products';
  itemId?: string;
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'video' | 'banner';
  onUploadingChange?: (isUploading: boolean) => void;
}

export const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
  label,
  sublabel,
  folder,
  itemId = 'item',
  value,
  onChange,
  aspectRatio = 'video',
  onUploadingChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    if (isUploading) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFile = async (file: File) => {
    if (!file || isUploading) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format. Please upload JPG, PNG, or WEBP under 10MB.');
      return;
    }

    // Immediate preview for instant user feedback
    const previewObjectUrl = URL.createObjectURL(file);
    setLocalPreview(previewObjectUrl);

    setIsUploading(true);
    setUploadProgress(15);
    if (onUploadingChange) onUploadingChange(true);

    try {
      const oldUrl = value;
      const res = await uploadImageFile(file, folder, itemId, (p) => {
        setUploadProgress(p);
      });

      onChange(res.url);
      setSuccessMessage(
        folder === 'banners'
          ? 'Hero banner uploaded successfully.'
          : 'Image uploaded successfully.'
      );

      if (oldUrl && oldUrl !== res.url && !oldUrl.startsWith('data:')) {
        deleteImageFromStorage(oldUrl);
      }
    } catch (err: any) {
      console.error('Upload failure:', err);
      setErrorMessage(err?.message || 'Failed to upload image. Please try again.');
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (onUploadingChange) onUploadingChange(false);
      try {
        URL.revokeObjectURL(previewObjectUrl);
      } catch (_) {}
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (isUploading) return;
    if (value && !value.startsWith('data:')) {
      deleteImageFromStorage(value);
    }
    setLocalPreview(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    onChange('');
  };

  const handleApplyUrl = () => {
    if (!urlInputValue.trim()) return;
    setLocalPreview(null);
    setErrorMessage(null);
    setSuccessMessage(folder === 'banners' ? 'Hero banner URL applied successfully.' : 'Image URL applied successfully.');
    onChange(urlInputValue.trim());
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-xs'
      : aspectRatio === 'banner'
      ? 'aspect-21/9'
      : 'aspect-16/9';

  const displayedImage = localPreview || value;

  return (
    <div className="space-y-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        disabled={isUploading}
      />

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-neutral-800">{label}</label>
          {sublabel && <p className="text-[11px] text-neutral-500">{sublabel}</p>}
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 px-2 py-0.5 rounded bg-neutral-100 cursor-pointer"
        >
          {showUrlInput ? 'Hide URL' : 'Use Direct URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="p-2.5 bg-neutral-100 rounded-xl flex gap-2">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Upload / Preview Card */}
      {displayedImage ? (
        <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border-2 border-neutral-200 group bg-neutral-100`}>
          <img
            src={displayedImage}
            alt={label}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Active Uploading Overlay */}
          {isUploading ? (
            <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white space-y-2">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-xs font-bold">
                  {folder === 'banners' ? 'Uploading hero banner...' : 'Uploading image...'}
                </p>
                <p className="text-[11px] text-neutral-300 font-mono">
                  {uploadProgress > 0 ? `${uploadProgress}% complete` : 'Optimizing resolution...'}
                </p>
              </div>
              <div className="w-44 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenPicker}
                className="px-3 py-1.5 bg-white text-neutral-900 font-bold text-xs rounded-lg shadow-sm hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isUploading) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={handleOpenPicker}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isUploading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
          } ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800">
                {isUploading ? `Uploading image (${uploadProgress}%)...` : 'Click or Drag Hero Banner Image'}
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                Supported formats: JPG, PNG, WEBP (Recommended: 1920×800 or wider, up to 10MB)
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="w-48 mx-auto mt-3 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleOpenPicker}
            className="text-[11px] underline font-bold hover:text-red-900 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
