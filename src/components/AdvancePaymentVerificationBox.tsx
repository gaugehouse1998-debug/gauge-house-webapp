import React, { useState, useEffect } from 'react';
import {
  Building2,
  Copy,
  Check,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  MessageCircle,
  X,
  FileCheck,
  ArrowRight
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
}) => {
  const { activePaymentAccounts, defaultPaymentAccount, formatPrice, settings } = useStore();
  const [currentOrder, setCurrentOrder] = useState<Order>(initialOrder);

  // Upload & UI states
  const [selectedBankId, setSelectedBankId] = useState<string>(
    currentOrder.selectedBankAccountId || defaultPaymentAccount?.id || ''
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(currentOrder.paymentProofUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showReuploadForm, setShowReuploadForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const processSelectedFile = (file: File) => {
    // Validate image format: JPG, JPEG, PNG, WEBP
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (!isImage) {
      setStatusMessage({
        type: 'error',
        text: 'Unsupported file format. Please upload a JPG, JPEG, or PNG screenshot of your payment receipt.',
      });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'File size exceeds 15MB. Please choose a smaller image or screenshot.',
      });
      return;
    }

    setProofFile(file);
    const localUrl = URL.createObjectURL(file);
    setProofPreview(localUrl);
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleSubmitProof = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!proofFile && !proofPreview) {
      setStatusMessage({
        type: 'error',
        text: 'Please select or drag your transaction slip / screenshot first.',
      });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(15);

    try {
      let finalProofUrl = currentOrder.paymentProofUrl || '';

      // Upload file to Firebase Storage (with durable fallback)
      if (proofFile) {
        const uploadRes = await uploadImageFile(
          proofFile,
          'payment_proofs',
          currentOrder.id,
          (pct) => setUploadProgress(pct)
        );
        finalProofUrl = uploadRes.url;
      }

      // Update Firestore order record
      await submitOrderPaymentProof(currentOrder.id, {
        paymentProofUrl: finalProofUrl,
        selectedBankAccountId: activeBank?.id || '',
        selectedBankName: activeBank?.bankName || '',
      });

      setStatusMessage({
        type: 'success',
        text: 'Transaction slip uploaded successfully! Our accounts department is reviewing your payment.',
      });
      setShowReuploadForm(false);
      setProofFile(null);
      setProofPreview(finalProofUrl);
    } catch (err: any) {
      console.error('Failed to upload payment slip:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to upload transaction proof. Please check your internet connection or send via WhatsApp.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    const phone = settings.whatsappNumber?.replace(/[^0-9]/g, '') || '923354499186';
    const message = `Hello Gauge House Accounts,\nI have a question regarding payment for Order ${currentOrder.orderNumber}.\nTotal Amount: ${formatPrice(currentOrder.total)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const paymentStatus = currentOrder.paymentStatus || 'unpaid';
  const hasUploadedProof = Boolean(currentOrder.paymentProofUrl);
  const isVerified = paymentStatus === 'verified';
  const isPending = paymentStatus === 'pending_verification';
  const isRejected = paymentStatus === 'rejected';

  return (
    <div id="payment-verification-section" className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight">
                Advance Bank Payment &amp; Slip Verification
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
          {isVerified && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Payment Verified &amp; Approved</span>
            </div>
          )}

          {isPending && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Under Verification (Slip Uploaded)</span>
            </div>
          )}

          {isRejected && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-extrabold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Payment Verification Issue</span>
            </div>
          )}

          {!isVerified && !isPending && !isRejected && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-extrabold">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Awaiting Payment Slip</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Status Messages / Notifications */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* 1. VERIFIED STATE */}
        {isVerified && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-sm text-emerald-950">
                  Payment Confirmed &amp; Dispatched for Order Processing!
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  Your advance payment for Order <strong className="font-mono">{currentOrder.orderNumber}</strong> ({formatPrice(currentOrder.total)}) has been verified by the Gauge House accounts department.
                </p>
                {currentOrder.verifiedAt && (
                  <p className="text-[11px] text-emerald-700">
                    Verified On: {new Date(currentOrder.verifiedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {currentOrder.paymentProofUrl && (
              <div className="pt-1 flex items-center gap-3">
                <img
                  src={currentOrder.paymentProofUrl}
                  alt="Verified Proof Receipt"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-lg border border-emerald-300 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setModalImage(currentOrder.paymentProofUrl!)}
                />
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 block">Verified Transaction Slip</span>
                  <button
                    type="button"
                    onClick={() => setModalImage(currentOrder.paymentProofUrl!)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Full Slip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. REJECTED STATE */}
        {isRejected && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-sm text-red-950">
                  Payment Verification Notice
                </p>
                <p className="text-red-800 leading-relaxed">
                  {currentOrder.rejectionReason ||
                    'The uploaded transaction slip could not be matched with bank statements. Please check your bank receipt and upload the correct slip.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. PENDING VERIFICATION STATE (Customer already uploaded slip) */}
        {isPending && !showReuploadForm && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  Transaction Slip Uploaded — Review in Progress
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Your payment slip has been recorded for Order <span className="font-mono font-bold">{currentOrder.orderNumber}</span>. Verification typically takes 15–30 minutes during business hours.
                </p>
                {currentOrder.paymentSubmittedAt && (
                  <p className="text-[11px] text-amber-700">
                    Uploaded On: {new Date(currentOrder.paymentSubmittedAt).toLocaleString()}
                  </p>
                )}
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
                  <span>View Uploaded Slip</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowReuploadForm(true)}
                className="px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-upload Slip</span>
              </button>
            </div>
          </div>
        )}

        {/* OFFICIAL BANK ACCOUNT TRANSFER DETAILS */}
        {activeBank && (!isVerified || showReuploadForm) && (
          <div className="bg-neutral-50 rounded-xl p-4 sm:p-5 border border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                  Transfer to Official Gauge House Account
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

            {/* Grid of Bank Details with 1-Click Copy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Bank Name */}
              <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
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
              <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                  Account Title (Beneficiary)
                </span>
                <p className="font-extrabold text-neutral-900 text-sm">{activeBank.accountTitle}</p>
                <p className="text-[11px] text-neutral-500">Official Merchant Title</p>
              </div>

              {/* Account Number with 1-click copy */}
              <div className="p-3 bg-white rounded-lg border border-neutral-200 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">
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
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">
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

            {/* Custom Instructions */}
            {activeBank.instructions && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <span className="font-bold">Instructions: </span>
                <span>{activeBank.instructions}</span>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD PAYMENT SLIP / TRANSACTION PROOF SECTION (NO MANUAL TID INPUT) */}
        {(!isVerified && (!hasUploadedProof || showReuploadForm || isRejected)) && (
          <form onSubmit={handleSubmitProof} className="bg-orange-50/50 rounded-xl p-5 border border-orange-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-orange-600" />
                  <span>Upload Transaction Proof / Payment Slip</span>
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  After transferring <strong className="text-neutral-900">{formatPrice(currentOrder.total)}</strong> from your mobile banking app or ATM, upload the transaction receipt/screenshot here.
                </p>
              </div>

              {showReuploadForm && (
                <button
                  type="button"
                  onClick={() => setShowReuploadForm(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Drag & Drop File Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all bg-white cursor-pointer ${
                isDragging
                  ? 'border-orange-600 bg-orange-50'
                  : proofPreview
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-neutral-300 hover:border-orange-500'
              }`}
            >
              <input
                type="file"
                id="payment-slip-input"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              {proofPreview ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0 shadow-xs">
                    <img
                      src={proofPreview}
                      alt="Selected Slip Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setModalImage(proofPreview)}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
                      title="View Slip"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-neutral-900">
                        {proofFile ? proofFile.name : 'Payment Slip Screenshot Ready'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Click below to confirm and submit to Gauge House accounts department.
                    </p>
                    <label
                      htmlFor="payment-slip-input"
                      className="inline-block text-[11px] font-bold text-orange-600 hover:underline cursor-pointer pt-1"
                    >
                      Change Screenshot
                    </label>
                  </div>
                </div>
              ) : (
                <label htmlFor="payment-slip-input" className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-neutral-900 block">
                      Click to Browse or Drag &amp; Drop Payment Slip Screenshot
                    </span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Supports JPG, JPEG, and PNG screenshots from any banking app
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-600 font-medium">
                  <span>Uploading transaction slip to secure storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isUploading || !proofPreview}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Payment Slip...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Payment Slip for Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="text-xs font-semibold text-neutral-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer py-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Assistance via WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Full-Screen Image Preview Modal */}
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
              alt="Payment Receipt Screenshot"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
