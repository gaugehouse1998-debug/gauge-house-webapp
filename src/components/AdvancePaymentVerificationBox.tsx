import React, { useState, useEffect } from 'react';
import {
  Building2,
  Copy,
  Check,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { Order, PaymentAccount } from '../types';
import { useStore } from '../context/StoreContext';
import { submitOrderPaymentProof } from '../services/firestoreService';
import { uploadImageFile } from '../lib/storageService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdvancePaymentVerificationBoxProps {
  order: Order;
  onPaymentUpdated?: (updatedOrder: Order) => void;
  compact?: boolean;
}

export const AdvancePaymentVerificationBox: React.FC<AdvancePaymentVerificationBoxProps> = ({
  order: initialOrder,
  onPaymentUpdated,
  compact = false,
}) => {
  const { activePaymentAccounts, defaultPaymentAccount, formatPrice, settings } = useStore();
  const [currentOrder, setCurrentOrder] = useState<Order>(initialOrder);

  // Form states
  const [tid, setTid] = useState(currentOrder.transactionId || '');
  const [paidAmount, setPaidAmount] = useState<number>(currentOrder.paidAmount || currentOrder.total);
  const [paymentNotes, setPaymentNotes] = useState(currentOrder.paymentNotes || '');
  const [selectedBankId, setSelectedBankId] = useState<string>(
    currentOrder.selectedBankAccountId || defaultPaymentAccount?.id || ''
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(currentOrder.paymentProofUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Keep live sync with Firestore for this order
  useEffect(() => {
    if (!currentOrder.id) return;
    const unsub = onSnapshot(doc(db, 'orders', currentOrder.id), (snap) => {
      if (snap.exists()) {
        const liveOrder = { id: snap.id, ...snap.data() } as Order;
        setCurrentOrder(liveOrder);
        if (onPaymentUpdated) onPaymentUpdated(liveOrder);
      }
    });
    return () => unsub();
  }, [currentOrder.id, onPaymentUpdated]);

  // Determine active bank to display
  const activeBank: PaymentAccount | undefined =
    activePaymentAccounts.find((a) => a.id === selectedBankId) ||
    defaultPaymentAccount ||
    activePaymentAccounts[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please upload a valid image file (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Screenshot file size exceeds 10MB limit.' });
      return;
    }

    setProofFile(file);
    const localUrl = URL.createObjectURL(file);
    setProofPreview(localUrl);
    setStatusMessage(null);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Transaction ID (TID) / Reference Number.' });
      return;
    }
    if (!paidAmount || paidAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid paid amount.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(10);

    try {
      let finalProofUrl = currentOrder.paymentProofUrl || '';

      // Upload file if new file was selected
      if (proofFile) {
        const uploadRes = await uploadImageFile(
          proofFile,
          'payment_proofs',
          currentOrder.id,
          (pct) => setUploadProgress(pct)
        );
        finalProofUrl = uploadRes.url;
      }

      await submitOrderPaymentProof(currentOrder.id, {
        transactionId: tid.trim(),
        paidAmount: Number(paidAmount),
        paymentProofUrl: finalProofUrl,
        paymentNotes: paymentNotes.trim(),
        selectedBankAccountId: activeBank?.id || '',
        selectedBankName: activeBank?.bankName || '',
      });

      setStatusMessage({
        type: 'success',
        text: 'Payment details submitted successfully! Our accounts team is reviewing your transaction.',
      });
      setShowEditForm(false);
      setProofFile(null);
    } catch (err: any) {
      console.error('Failed to submit payment proof:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to submit payment proof. Please try again or contact support.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    const phone = settings.whatsappNumber?.replace(/[^0-9]/g, '') || '923354499186';
    const message = `Hello Gauge House Accounts,\nI have a query regarding payment for Order ${currentOrder.orderNumber}.\nAmount: ${formatPrice(currentOrder.total)}\nTID: ${currentOrder.transactionId || 'Pending'}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const paymentStatus = currentOrder.paymentStatus || 'unpaid';

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Banner / Header */}
      <div className="p-5 sm:p-6 bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight">
                Advance Bank Payment &amp; TID Verification
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-orange-400 font-bold uppercase">
                1Link / Raast
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Order Ref: <strong className="text-white font-mono">{currentOrder.orderNumber}</strong> • Total Due:{' '}
              <strong className="text-orange-400 font-bold">{formatPrice(currentOrder.total)}</strong>
            </p>
          </div>
        </div>

        {/* Current Verification Status Badge */}
        <div>
          {paymentStatus === 'verified' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Payment Verified &amp; Approved</span>
            </div>
          )}

          {paymentStatus === 'pending_verification' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Under Verification (Pending Review)</span>
            </div>
          )}

          {paymentStatus === 'rejected' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-extrabold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Payment Verification Issue</span>
            </div>
          )}

          {(paymentStatus === 'unpaid' || paymentStatus === 'payment_pending') && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-extrabold">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Awaiting Deposit &amp; TID</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Status Alerts */}
        {paymentStatus === 'verified' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-emerald-950">
                Payment Confirmed &amp; Dispatched for Processing!
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Your payment of <strong className="font-bold">{formatPrice(currentOrder.paidAmount || currentOrder.total)}</strong> with Transaction ID{' '}
                <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-950">
                  {currentOrder.transactionId}
                </span>{' '}
                has been verified by Gauge House Accounts. Your industrial equipment is being calibrated and packaged for direct dispatch.
              </p>
              {currentOrder.verifiedAt && (
                <p className="text-[11px] text-emerald-700 pt-1">
                  Verified On: {new Date(currentOrder.verifiedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {paymentStatus === 'pending_verification' && !showEditForm && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  Transaction ID Submitted — Verifying with Bank Records
                </p>
                <p className="text-amber-800 leading-relaxed">
                  TID Reference:{' '}
                  <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-amber-950">
                    {currentOrder.transactionId}
                  </span>{' '}
                  • Amount: <strong className="font-bold">{formatPrice(currentOrder.paidAmount)}</strong>
                </p>
                <p className="text-[11px] text-amber-700">
                  Submitted On:{' '}
                  {currentOrder.paymentSubmittedAt
                    ? new Date(currentOrder.paymentSubmittedAt).toLocaleString()
                    : 'Recently'}
                  . Verification typically takes 15–30 minutes during business hours.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentOrder.paymentProofUrl && (
                <button
                  type="button"
                  onClick={() => setModalImage(currentOrder.paymentProofUrl!)}
                  className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Proof Receipt</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEditForm(true)}
                className="px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update TID / Re-upload</span>
              </button>
            </div>
          </div>
        )}

        {paymentStatus === 'rejected' && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-bold text-sm text-red-950">
                Payment Verification Notice
              </p>
              <p className="text-red-800 leading-relaxed">
                {currentOrder.rejectionReason ||
                  'The submitted Transaction ID (TID) could not be matched with our bank credit statement. Please verify your receipt and re-submit the valid TID or transfer slip.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditForm(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-submit Correct TID &amp; Proof Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BANK ACCOUNT DETAILS SECTION */}
        {activeBank ? (
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-5 border border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                  Transfer to Gauge House Bank Account
                </span>
                {activePaymentAccounts.length > 1 && (
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="text-xs font-semibold bg-white border border-neutral-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-orange-500"
                  >
                    {activePaymentAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} - {acc.accountNumber}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Industrial Merchant Account
              </span>
            </div>

            {/* Grid of Bank Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Bank Name & Title */}
              <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                  Bank Name &amp; Branch
                </span>
                <p className="font-extrabold text-neutral-900 text-sm">{activeBank.bankName}</p>
                {activeBank.branchName && (
                  <p className="text-[11px] text-neutral-500">
                    {activeBank.branchName} {activeBank.branchCode ? `(${activeBank.branchCode})` : ''}
                  </p>
                )}
              </div>

              {/* Account Title */}
              <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                  Account Title
                </span>
                <p className="font-extrabold text-neutral-900 text-sm">{activeBank.accountTitle}</p>
                <p className="text-[11px] text-neutral-500">Beneficiary Name</p>
              </div>

              {/* Account Number with 1-click copy */}
              <div className="p-3 bg-white rounded-lg border border-neutral-200 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                    Account Number
                  </span>
                  <span className="font-mono font-extrabold text-neutral-900 text-sm sm:text-base tracking-wider">
                    {activeBank.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeBank.accountNumber, 'acc_no')}
                  className="px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'acc_no' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* IBAN with 1-click copy */}
              {activeBank.iban && (
                <div className="p-3 bg-white rounded-lg border border-neutral-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                      IBAN / Raast Direct
                    </span>
                    <span className="font-mono font-extrabold text-neutral-900 text-xs sm:text-sm tracking-wider truncate block">
                      {activeBank.iban}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeBank.iban, 'iban_no')}
                    className="px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === 'iban_no' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Custom deposit instructions */}
            {activeBank.instructions && (
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Payment Instructions:</span>
                <p className="leading-relaxed">{activeBank.instructions}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-xs text-neutral-600">
            Official bank details will be sent via WhatsApp/Email. You can still submit your transaction ID below.
          </div>
        )}

        {/* SUBMISSION FORM (Shown if unpaid, or rejected, or user clicked edit) */}
        {(paymentStatus === 'unpaid' ||
          paymentStatus === 'payment_pending' ||
          paymentStatus === 'rejected' ||
          showEditForm) && (
          <form onSubmit={handleSubmitProof} className="bg-neutral-50/70 rounded-xl p-5 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900">
                  {currentOrder.transactionId ? 'Update Payment Verification Details' : 'Submit TID / Payment Proof'}
                </h4>
                <p className="text-xs text-neutral-500">
                  Enter the Transaction ID (TID) from your banking app / ATM receipt and upload a screenshot.
                </p>
              </div>

              {showEditForm && (
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TID / Ref Number */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Transaction ID (TID) / Reference No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  placeholder="e.g. 029104810294 or FT26090..."
                  className="w-full font-mono text-xs px-3 py-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-neutral-600 mt-1 block">
                  Found on your 1Link, Raast, or banking confirmation screen.
                </span>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Paid Amount (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="Order total amount"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-bold"
                />
                <span className="text-[10px] text-neutral-600 mt-1 block">
                  Order Total: {formatPrice(currentOrder.total)}
                </span>
              </div>
            </div>

            {/* Receipt / Screenshot Upload */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Payment Proof Receipt / Screenshot (Optional but recommended)
              </label>
              <div className="mt-1 flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 w-full border-2 border-dashed border-neutral-300 hover:border-orange-500 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors">
                  <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-neutral-700 block">
                    {proofFile ? proofFile.name : 'Upload Screenshot / Receipt'}
                  </span>
                  <span className="text-[10px] text-neutral-600 block">
                    JPG, PNG, or WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {proofPreview && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 bg-white shrink-0 group">
                    <img
                      src={proofPreview}
                      alt="Payment Proof Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setModalImage(proofPreview)}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 block text-right">
                    Uploading proof image... {uploadProgress}%
                  </span>
                </div>
              )}
            </div>

            {/* Sender Notes */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Sender Bank / Account Notes (Optional)
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Transferred from HBL mobile app by M. Farooq"
                className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Verification...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Payment Proof for Verification</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="text-xs font-semibold text-neutral-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Help with Bank Transfer via WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Image Preview Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={modalImage}
              alt="Payment Receipt Proof"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
