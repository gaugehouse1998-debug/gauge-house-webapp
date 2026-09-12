import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth, handleFirestoreError, cleanFirestoreData, OperationType } from '../lib/firebase';
import { deleteImageFromStorage } from '../lib/storageService';
import {
  Product,
  Category,
  Banner,
  Order,
  StoreSettings,
  OrderStatus,
  CustomerUser,
  PaymentAccount,
  PaymentMethod,
  PaymentStatus
} from '../types';
import {
  DEFAULT_STORE_SETTINGS,
  OFFICIAL_CATEGORIES,
  DEFAULT_BANNERS,
  SAMPLE_PRODUCTS
} from '../data/defaults';

const SUPER_ADMIN_EMAIL = 'gaugehouse1998@gmail.com';

// ---------------- PRODUCTS ----------------

export function subscribeToProducts(onData: (products: Product[]) => void, onError?: (err: unknown) => void) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Product);
      });
      // Sort by creation date descending
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export async function saveProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<string> {
  const path = 'products';
  try {
    const id = product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const docRef = doc(db, path, id);

    // Sanitize variant dimensions and variants to ensure no undefined values are ever written
    const cleanVariantDimensions = Array.isArray(product.variantDimensions)
      ? product.variantDimensions
          .filter((d) => d && typeof d === 'object' && d.name && d.name.trim())
          .map((d) => ({
            name: d.name.trim(),
            options: Array.isArray(d.options)
              ? d.options.map((o) => String(o || '').trim()).filter(Boolean)
              : [],
          }))
      : [];

    const cleanVariants = Array.isArray(product.variants)
      ? product.variants
          .filter((v) => v && typeof v === 'object' && v.id)
          .map((v) => {
            const item: any = {
              id: v.id,
              attributes: v.attributes || {},
              sku: v.sku || '',
              price: Number(v.price) || 0,
              stock: Number(v.stock) || 0,
              enabled: Boolean(v.enabled),
            };
            if (v.salePrice && Number(v.salePrice) > 0) {
              item.salePrice = Number(v.salePrice);
            }
            if (v.image && v.image.trim()) {
              item.image = v.image.trim();
            }
            return item;
          })
      : [];

    const data: Product = cleanFirestoreData({
      ...product,
      id,
      variantDimensions: cleanVariantDimensions,
      variants: cleanVariants,
      createdAt: product.createdAt || now,
      updatedAt: now,
    });
    await setDoc(docRef, data, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- CATEGORIES ----------------

export function subscribeToCategories(onData: (cats: Category[]) => void, onError?: (err: unknown) => void) {
  const path = 'categories';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Category);
      });
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export async function saveCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<string> {
  const path = 'categories';
  try {
    const id = category.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const docRef = doc(db, path, id);
    const data: Category = cleanFirestoreData({
      ...category,
      id,
      createdAt: category.createdAt || now,
      updatedAt: now,
    });
    await setDoc(docRef, data, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- BANNERS ----------------

export function subscribeToBanners(onData: (banners: Banner[]) => void, onError?: (err: unknown) => void) {
  const path = 'banners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Banner[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Banner);
      });
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export async function saveBanner(banner: Omit<Banner, 'id'> & { id?: string }): Promise<string> {
  const path = 'banners';
  try {
    const id = banner.id || `ban_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const docRef = doc(db, path, id);
    const data: Banner = cleanFirestoreData({
      ...banner,
      id,
      createdAt: banner.createdAt || now,
      updatedAt: now,
    });
    await setDoc(docRef, data, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- ORDERS ----------------

export function subscribeToOrders(onData: (orders: Order[]) => void, onError?: (err: unknown) => void) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Order);
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export function subscribeToUserOrders(userId: string, onData: (orders: Order[]) => void, onError?: (err: unknown) => void) {
  const path = 'orders';
  const q = query(collection(db, path), where('customer.userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Order);
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export async function createOrderInFirestore(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> & { status?: OrderStatus }
): Promise<Order> {
  const path = 'orders';
  try {
    // Generate human-readable order number: GH-2026-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const currentYear = new Date().getFullYear();
    const orderNumber = `GH-${currentYear}-${randomNum}`;
    const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const customerUid = orderData.customer?.userId || (orderData as any).customerUid || null;
    const isRegistered = Boolean(customerUid);
    const customerType = isRegistered ? 'registered' : 'guest';

    const paymentMethod: PaymentMethod = 'bank_transfer';
    let paymentStatus: PaymentStatus = orderData.paymentStatus || 'payment_pending';
    if (orderData.transactionId && orderData.transactionId.trim()) {
      paymentStatus = 'pending_verification';
    }

    const initialOrderStatus: OrderStatus =
      (orderData.orderStatus as OrderStatus) || 'payment_pending';

    const order: Order = cleanFirestoreData({
      ...orderData,
      id,
      orderId: id,
      orderNumber,
      customerUid: customerUid || null,
      customerEmail: (orderData.customer?.email || '').toLowerCase().trim(),
      customerName: (orderData.customer?.fullName || '').trim(),
      customerPhone: (orderData.customer?.phone || '').trim(),
      customerAddress: (orderData.customer?.address || '').trim(),
      customerCity: (orderData.customer?.city || '').trim(),
      customerType,
      totalAmount: orderData.total,
      paymentMethod,
      paymentStatus,
      transactionId: orderData.transactionId?.trim() || '',
      paidAmount: orderData.paidAmount ?? (orderData.transactionId ? orderData.total : 0),
      paymentProofUrl: orderData.paymentProofUrl || '',
      paymentSubmittedAt: orderData.transactionId ? now : '',
      paymentNotes: orderData.paymentNotes?.trim() || '',
      selectedBankAccountId: orderData.selectedBankAccountId || '',
      selectedBankName: orderData.selectedBankName || '',
      orderStatus: initialOrderStatus,
      status: initialOrderStatus,
      createdAt: now,
      updatedAt: now,
    });

    await setDoc(doc(db, path, id), order);

    // If authenticated customer, atomically update or create their users/{uid} profile
    if (customerUid) {
      try {
        const userDocRef = doc(db, 'users', customerUid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const prev = userSnap.data() as CustomerUser;
          const newOrderCount = (prev.orderCount || 0) + 1;
          const newTotalSpend = (prev.totalSpend || 0) + orderData.total;
          await setDoc(
            userDocRef,
            cleanFirestoreData({
              purchaseStatus: 'purchased',
              orderCount: newOrderCount,
              totalSpend: newTotalSpend,
              firstOrderAt: prev.firstOrderAt || now,
              lastOrderAt: now,
              phone: prev.phone || orderData.customer?.phone || '',
              address: prev.address || orderData.customer?.address || '',
              city: prev.city || orderData.customer?.city || '',
            }),
            { merge: true }
          );
        } else {
          // Never duplicate; initialize customer record if not pre-existing
          await setDoc(
            userDocRef,
            cleanFirestoreData({
              uid: customerUid,
              name: orderData.customer?.fullName || 'Customer',
              email: (orderData.customer?.email || '').toLowerCase().trim(),
              phone: (orderData.customer?.phone || '').trim(),
              address: (orderData.customer?.address || '').trim(),
              city: (orderData.customer?.city || '').trim(),
              createdAt: now,
              lastLoginAt: now,
              accountStatus: 'active',
              purchaseStatus: 'purchased',
              orderCount: 1,
              totalSpend: orderData.total,
              firstOrderAt: now,
              lastOrderAt: now,
            }),
            { merge: true }
          );
        }
      } catch (custErr) {
        console.warn('Could not sync customer lead purchase stats:', custErr);
      }
    }

    return order;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const updatePayload = cleanFirestoreData({
      status,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'orders', orderId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------- ADVANCE PAYMENT & TID VERIFICATION ----------------

export async function submitOrderPaymentProof(
  orderId: string,
  paymentData: {
    transactionId: string;
    paidAmount: number;
    paymentProofUrl?: string;
    paymentNotes?: string;
    selectedBankAccountId?: string;
    selectedBankName?: string;
  }
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const now = new Date().toISOString();
    const updatePayload = cleanFirestoreData({
      paymentStatus: 'pending_verification',
      transactionId: paymentData.transactionId.trim(),
      paidAmount: Number(paymentData.paidAmount) || 0,
      paymentProofUrl: paymentData.paymentProofUrl || '',
      paymentSubmittedAt: now,
      paymentNotes: paymentData.paymentNotes?.trim() || '',
      selectedBankAccountId: paymentData.selectedBankAccountId || '',
      selectedBankName: paymentData.selectedBankName || '',
      updatedAt: now,
    });
    await updateDoc(doc(db, 'orders', orderId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function verifyOrderPaymentInFirestore(
  orderId: string,
  adminEmail: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const now = new Date().toISOString();
    const updatePayload = cleanFirestoreData({
      paymentStatus: 'verified',
      orderStatus: 'processing',
      status: 'Processing', // Automatically promote order to Processing upon payment verification
      verifiedAt: now,
      verifiedBy: adminEmail,
      rejectionReason: null,
      rejectedAt: null,
      updatedAt: now,
    });
    await updateDoc(doc(db, 'orders', orderId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function rejectOrderPaymentInFirestore(
  orderId: string,
  rejectionReason: string,
  adminEmail: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const now = new Date().toISOString();
    const updatePayload = cleanFirestoreData({
      paymentStatus: 'rejected',
      orderStatus: 'payment_issue',
      status: 'payment_issue',
      rejectionReason: rejectionReason.trim(),
      rejectedAt: now,
      verifiedBy: adminEmail,
      updatedAt: now,
    });
    await updateDoc(doc(db, 'orders', orderId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderInFirestore(
  orderId: string,
  paymentProofUrl?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    // 1. Permanently delete the order document from Firestore
    await deleteDoc(doc(db, 'orders', orderId));

    // 2. Clean up payment proof image from Storage or uploaded_media if attached
    if (paymentProofUrl && paymentProofUrl.trim()) {
      try {
        await deleteImageFromStorage(paymentProofUrl);
      } catch (storageErr) {
        console.warn('Payment proof storage cleanup note during order deletion:', storageErr);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- PAYMENT / BANK ACCOUNTS MANAGEMENT ----------------

export function subscribeToPaymentAccounts(
  onData: (accounts: PaymentAccount[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'payment_accounts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PaymentAccount[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as PaymentAccount);
      });
      list.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (a.bankName || '').localeCompare(b.bankName || '');
      });
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export async function savePaymentAccountInFirestore(
  account: Partial<PaymentAccount>
): Promise<string> {
  const id = account.id || `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `payment_accounts/${id}`;
  const now = new Date().toISOString();

  try {
    const payload: PaymentAccount = cleanFirestoreData({
      ...account,
      id,
      bankName: (account.bankName || '').trim(),
      accountTitle: (account.accountTitle || '').trim(),
      accountNumber: (account.accountNumber || '').trim(),
      iban: (account.iban || '').trim().toUpperCase(),
      branchName: (account.branchName || '').trim(),
      branchCode: (account.branchCode || '').trim(),
      instructions: (account.instructions || '').trim(),
      active: account.active !== false,
      isDefault: Boolean(account.isDefault),
      createdAt: account.createdAt || now,
      updatedAt: now,
    });

    await setDoc(doc(db, 'payment_accounts', id), payload, { merge: true });

    // If marked default, unset default on other accounts
    if (account.isDefault) {
      try {
        const snap = await getDocs(collection(db, 'payment_accounts'));
        const batch = writeBatch(db);
        snap.forEach((d) => {
          if (d.id !== id && d.data()?.isDefault === true) {
            batch.update(d.ref, { isDefault: false, updatedAt: now });
          }
        });
        await batch.commit();
      } catch (batchErr) {
        console.warn('Could not unset other default accounts:', batchErr);
      }
    }

    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deletePaymentAccountInFirestore(id: string): Promise<void> {
  const path = `payment_accounts/${id}`;
  try {
    await deleteDoc(doc(db, 'payment_accounts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedDefaultPaymentAccountAction(): Promise<void> {
  const defaultAccount: Partial<PaymentAccount> = {
    id: 'bank_meezan_primary',
    bankName: 'Meezan Bank',
    accountTitle: 'Gauge House',
    accountNumber: '02010105829102',
    iban: 'PK12MEZN0002010105829102',
    branchName: 'Main Boulevard Branch, Lahore',
    branchCode: '0201',
    instructions: 'Please transfer the exact order amount via Online Banking (1Link / Raast) or ATM Transfer. After payment, enter your Transaction ID (TID) and upload the receipt screenshot below for rapid verification & dispatch.',
    active: true,
    isDefault: true,
  };
  await savePaymentAccountInFirestore(defaultAccount);
}

// ---------------- CUSTOMER DATABASE & LEADS ----------------

export function subscribeToCustomers(
  onData: (customers: CustomerUser[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CustomerUser[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as CustomerUser;
        const email = (data.email || '').toLowerCase().trim();
        // Admin account must NEVER appear in Customer List, Profiles, or Customer Count
        if (email === SUPER_ADMIN_EMAIL.toLowerCase() || (data as any).role === 'admin') {
          return;
        }
        list.push({ uid: d.id, ...data });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

export async function getCustomer(uid: string): Promise<CustomerUser | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data() as CustomerUser;
      if (data.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || (data as any).role === 'admin') {
        return null;
      }
      return { uid: snap.id, ...data };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCustomerProfile(
  profile: Partial<CustomerUser> & { uid: string }
): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    // Admin email should never be saved in users collection
    if (profile.email && profile.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return;
    }
    const cleanData = cleanFirestoreData({
      ...profile,
      role: 'customer',
      email: profile.email ? profile.email.toLowerCase().trim() : undefined,
    });
    await setDoc(doc(db, 'users', profile.uid), cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncCustomerOnAuth(
  user: User,
  extra?: { name?: string; phone?: string; address?: string; city?: string }
): Promise<CustomerUser | null> {
  // Admin account must NEVER be stored or synced in users collection
  if (user.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  const path = `users/${user.uid}`;
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'users', user.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const existing = snap.data() as CustomerUser;
      const updateData: Partial<CustomerUser> = {
        lastLoginAt: now,
        role: 'customer',
      };
      if (extra?.name && (!existing.name || existing.name === 'Customer')) {
        updateData.name = extra.name.trim();
      }
      if (extra?.phone && !existing.phone) {
        updateData.phone = extra.phone.trim();
      }
      if (extra?.address && !existing.address) {
        updateData.address = extra.address.trim();
      }
      if (extra?.city && !existing.city) {
        updateData.city = extra.city.trim();
      }
      await setDoc(docRef, cleanFirestoreData(updateData), { merge: true });
      return { ...existing, ...updateData, role: 'customer' };
    } else {
      // First-time registration / customer profile
      const newCustomer: CustomerUser = cleanFirestoreData({
        uid: user.uid,
        name: extra?.name?.trim() || user.displayName || user.email?.split('@')[0] || 'Customer',
        email: (user.email || '').toLowerCase().trim(),
        role: 'customer',
        phone: extra?.phone?.trim() || user.phoneNumber || '',
        address: extra?.address?.trim() || '',
        city: extra?.city?.trim() || '',
        createdAt: now,
        lastLoginAt: now,
        accountStatus: 'active',
        purchaseStatus: 'no_purchase',
        orderCount: 0,
        totalSpend: 0,
        firstOrderAt: null,
        lastOrderAt: null,
      });
      await setDoc(docRef, newCustomer, { merge: true });
      return newCustomer;
    }
  } catch (error) {
    console.error('Error syncing customer record:', error);
    return {
      uid: user.uid,
      name: extra?.name || user.displayName || 'Customer',
      email: user.email || '',
      role: 'customer',
      phone: extra?.phone || '',
      address: extra?.address || '',
      city: extra?.city || '',
      createdAt: now,
      lastLoginAt: now,
      accountStatus: 'active',
      purchaseStatus: 'no_purchase',
      orderCount: 0,
      totalSpend: 0,
      firstOrderAt: null,
      lastOrderAt: null,
    };
  }
}

export async function deleteCustomerPermanently(
  customerUid: string,
  customerEmail?: string
): Promise<{ deletedOrdersCount: number; deletedProofsCount: number }> {
  const path = `users/${customerUid}`;
  try {
    let deletedOrdersCount = 0;
    let deletedProofsCount = 0;

    // 1. Delete customer profile document from Firestore (`users/{uid}`)
    await deleteDoc(doc(db, 'users', customerUid));

    // 2. Find and delete all related personal-data records & payment proof files
    const cleanEmail = customerEmail ? customerEmail.toLowerCase().trim() : '';
    const ordersCol = collection(db, 'orders');
    const orderSnaps = await getDocs(ordersCol);

    const relatedOrdersToDelete: { id: string; paymentProofUrl?: string }[] = [];
    orderSnaps.forEach((docSnap) => {
      const data = docSnap.data();
      const orderCustomerUid = data.customerUid || data.customer?.userId;
      const orderCustomerEmail = (data.customerEmail || data.customer?.email || '').toLowerCase().trim();

      if (
        orderCustomerUid === customerUid ||
        (cleanEmail && orderCustomerEmail === cleanEmail)
      ) {
        relatedOrdersToDelete.push({
          id: docSnap.id,
          paymentProofUrl: data.paymentProofUrl,
        });
      }
    });

    for (const ord of relatedOrdersToDelete) {
      if (ord.paymentProofUrl) {
        try {
          await deleteImageFromStorage(ord.paymentProofUrl);
          deletedProofsCount++;
        } catch (storageErr) {
          console.warn('Storage cleanup notice for customer order:', storageErr);
        }
      }
      try {
        await deleteDoc(doc(db, 'orders', ord.id));
        deletedOrdersCount++;
      } catch (orderErr) {
        console.warn('Order document removal notice:', orderErr);
      }
    }

    // 3. Clean up uploaded media metadata associated with this customer
    try {
      const mediaCol = collection(db, 'uploaded_media');
      const mediaSnaps = await getDocs(mediaCol);
      for (const mSnap of mediaSnaps.docs) {
        const mData = mSnap.data();
        if (mData.uploadedBy === customerUid || (cleanEmail && mData.userEmail === cleanEmail)) {
          if (mData.url) {
            try {
              await deleteImageFromStorage(mData.url);
            } catch (_) {}
          }
          try {
            await deleteDoc(doc(db, 'uploaded_media', mSnap.id));
          } catch (_) {}
        }
      }
    } catch (_) {}

    // 4. Delete client Auth user if current user is the target customer
    if (auth.currentUser && auth.currentUser.uid === customerUid) {
      try {
        await auth.currentUser.delete();
      } catch (authErr) {
        console.warn('Auth user delete notice:', authErr);
      }
    }

    return { deletedOrdersCount, deletedProofsCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteCustomerAccountInFirestore(uid: string): Promise<void> {
  await deleteCustomerPermanently(uid);
}

// ---------------- SETTINGS ----------------

export function subscribeToSettings(onData: (settings: StoreSettings) => void, onError?: (err: unknown) => void) {
  const path = 'settings/general';
  return onSnapshot(
    doc(db, 'settings', 'general'),
    (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.data();
        const merged: StoreSettings = {
          ...DEFAULT_STORE_SETTINGS,
          ...raw,
          phones: (Array.isArray(raw.phones) && raw.phones.length > 0) ? raw.phones : DEFAULT_STORE_SETTINGS.phones,
          emails: (Array.isArray(raw.emails) && raw.emails.length > 0) ? raw.emails : DEFAULT_STORE_SETTINGS.emails,
        };
        onData(merged);
      } else {
        onData(DEFAULT_STORE_SETTINGS);
      }
    },
    (err) => {
      if (onError) onError(err);
      // Non-fatal, use defaults
      onData(DEFAULT_STORE_SETTINGS);
    }
  );
}

export async function saveSettings(settings: Partial<StoreSettings>): Promise<void> {
  const path = 'settings/general';
  try {
    const cleanSettings = cleanFirestoreData({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'settings', 'general'), cleanSettings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- ADMIN AUTH & CHECK ----------------

export async function checkUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  if (user.email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL.toLowerCase()) return false;

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      if (data?.role === 'admin' && data?.active !== false) return true;
    }
    const adminUserDoc = await getDoc(doc(db, 'admin_users', user.uid));
    if (adminUserDoc.exists()) {
      const data = adminUserDoc.data();
      if (data?.role === 'admin' && data?.active !== false) return true;
    }
  } catch {
    // If rules allow email check
    return user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  }
  return user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export async function ensureAdminRecord(user: User): Promise<void> {
  if (user.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    try {
      const now = new Date().toISOString();
      const adminData = {
        uid: user.uid,
        email: user.email.toLowerCase().trim(),
        displayName: user.displayName || 'Gauge House Admin',
        role: 'admin',
        active: true,
        updatedAt: now,
      };
      await setDoc(doc(db, 'admins', user.uid), adminData, { merge: true });
      await setDoc(doc(db, 'admin_users', user.uid), adminData, { merge: true });

      // Ensure the admin account NEVER exists in the users (customer) collection
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          await deleteDoc(userDocRef);
        }
      } catch {
        // Ignored if document already does not exist or blocked
      }
    } catch (e) {
      console.warn('Admin record sync note:', e);
    }
  }
}

// ---------------- SEED & SETUP HELPERS ----------------

export async function seedOfficialCategoriesAction(): Promise<number> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let count = 0;

  for (const cat of OFFICIAL_CATEGORIES) {
    const id = `cat_${cat.slug}`;
    const ref = doc(db, 'categories', id);
    batch.set(ref, cleanFirestoreData({
      ...cat,
      id,
      createdAt: now,
      updatedAt: now,
    }), { merge: true });
    count++;
  }

  // Also seed default hero banners if none exist
  for (let i = 0; i < DEFAULT_BANNERS.length; i++) {
    const banner = DEFAULT_BANNERS[i];
    const bannerId = `ban_default_${i + 1}`;
    const ref = doc(db, 'banners', bannerId);
    batch.set(ref, cleanFirestoreData({
      ...banner,
      id: bannerId,
      createdAt: now,
      updatedAt: now,
    }), { merge: true });
  }

  // Also write general settings
  batch.set(doc(db, 'settings', 'general'), cleanFirestoreData({
    ...DEFAULT_STORE_SETTINGS,
    updatedAt: now,
  }), { merge: true });

  await batch.commit();
  return count;
}

export async function seedSampleProductsAction(): Promise<number> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let count = 0;

  for (const p of SAMPLE_PRODUCTS) {
    const id = `sample_${p.slug}`;
    const ref = doc(db, 'products', id);
    batch.set(ref, cleanFirestoreData({
      ...p,
      id,
      createdAt: now,
      updatedAt: now,
    }), { merge: true });
    count++;
  }

  await batch.commit();
  return count;
}

export async function clearSampleProductsAction(): Promise<number> {
  const q = query(collection(db, 'products'), where('isSample', '==', true));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  let count = 0;

  snap.forEach((d) => {
    batch.delete(d.ref);
    count++;
  });

  if (count > 0) {
    await batch.commit();
  }
  return count;
}

// Convenient function aliases
export const saveProductInFirestore = saveProduct;
export const deleteProductInFirestore = deleteProduct;
export const saveCategoryInFirestore = saveCategory;
export const deleteCategoryInFirestore = deleteCategory;
export const saveBannerInFirestore = saveBanner;
export const deleteBannerInFirestore = deleteBanner;
export const updateOrderStatusInFirestore = updateOrderStatus;
export const saveStoreSettingsInFirestore = saveSettings;
export const seedDefaultCategories = seedOfficialCategoriesAction;
export const seedSampleProducts = seedSampleProductsAction;
export const clearSampleProducts = clearSampleProductsAction;
