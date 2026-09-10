import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Check,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  RefreshCw,
  Info
} from 'lucide-react';
import { PaymentAccount } from '../../types';
import {
  savePaymentAccountInFirestore,
  deletePaymentAccountInFirestore,
  seedDefaultPaymentAccountAction
} from '../../services/firestoreService';

interface AdminBankAccountsViewProps {
  accounts: PaymentAccount[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminBankAccountsView: React.FC<AdminBankAccountsViewProps> = ({
  accounts,
  showNotification,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setBankName('');
    setAccountTitle('Gauge House');
    setAccountNumber('');
    setIban('');
    setBranchName('');
    setBranchCode('');
    setInstructions('Please transfer the exact order amount via Online Banking (1Link / Raast) or ATM Transfer. After transfer, submit your Transaction ID (TID) and payment receipt screenshot for verification.');
    setIsActive(true);
    setIsDefault(accounts.length === 0);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (acc: PaymentAccount) => {
    setEditingAccount(acc);
    setBankName(acc.bankName || '');
    setAccountTitle(acc.accountTitle || '');
    setAccountNumber(acc.accountNumber || '');
    setIban(acc.iban || '');
    setBranchName(acc.branchName || '');
    setBranchCode(acc.branchCode || '');
    setInstructions(acc.instructions || '');
    setIsActive(acc.active !== false);
    setIsDefault(Boolean(acc.isDefault));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      setFormError('Bank name is required.');
      return;
    }
    if (!accountTitle.trim()) {
      setFormError('Account title is required.');
      return;
    }
    if (!accountNumber.trim()) {
      setFormError('Account number is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await savePaymentAccountInFirestore({
        id: editingAccount?.id,
        bankName: bankName.trim(),
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        iban: iban.trim().toUpperCase(),
        branchName: branchName.trim(),
        branchCode: branchCode.trim(),
        instructions: instructions.trim(),
        active: isActive,
        isDefault: isDefault,
        createdAt: editingAccount?.createdAt,
      });

      showNotification('success', `Bank account "${bankName}" saved successfully.`);
      setModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save bank account:', err);
      setFormError(err?.message || 'Failed to save bank account to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (acc: PaymentAccount) => {
    try {
      const nextActive = !acc.active;
      await savePaymentAccountInFirestore({
        ...acc,
        active: nextActive,
      });
      showNotification(
        'success',
        `${acc.bankName} is now ${nextActive ? 'active (visible at checkout)' : 'inactive (hidden from customers)'}.`
      );
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update account status.');
    }
  };

  const handleSetDefault = async (acc: PaymentAccount) => {
    try {
      await savePaymentAccountInFirestore({
        ...acc,
        isDefault: true,
      });
      showNotification('success', `${acc.bankName} is now the default bank account.`);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to set default account.');
    }
  };

  const handleDelete = async (acc: PaymentAccount) => {
    if (!window.confirm(`Are you sure you want to delete bank account "${acc.bankName} (${acc.accountNumber})"?`)) {
      return;
    }
    setIsDeletingId(acc.id);
    try {
      await deletePaymentAccountInFirestore(acc.id);
      showNotification('success', `Bank account "${acc.bankName}" deleted.`);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to delete bank account.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showNotification('info', `Copied "${text}" to clipboard.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSeedDefaultMeezan = async () => {
    try {
      await seedDefaultPaymentAccountAction();
      showNotification('success', 'Default Meezan Bank account added successfully.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to initialize default bank.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">
                Payment / Bank Accounts
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Manage bank accounts displayed to customers selecting Advance Bank Payment at checkout &amp; order confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {accounts.length === 0 && (
            <button
              onClick={handleSeedDefaultMeezan}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Add Meezan Bank Preset</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Security & Info Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Security &amp; Visibility Invariant</p>
          <p className="text-blue-800 leading-relaxed">
            Only accounts marked as <span className="font-semibold text-blue-900">Active</span> will be shown to customers choosing Advance Bank Payment. Bank account details are dynamically hidden for Cash on Delivery (COD) orders.
          </p>
        </div>
      </div>

      {/* Bank Accounts Grid / Cards */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-700">No Bank Accounts Configured</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-5">
            Add your company bank account details so customers can transfer order payments via 1Link, Raast, or ATM.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSeedDefaultMeezan}
              className="px-4 py-2 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg cursor-pointer"
            >
              Seed Official Meezan Bank
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm cursor-pointer"
            >
              Add Custom Account
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const isCopyAcc = copiedField === `acc_${acc.id}`;
            const isCopyIban = copiedField === `iban_${acc.id}`;

            return (
              <div
                key={acc.id}
                className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between ${
                  acc.active
                    ? 'border-neutral-200 shadow-sm hover:border-neutral-300'
                    : 'border-neutral-200 bg-neutral-50/60 opacity-80'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black text-xs">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-neutral-900 text-sm">
                            {acc.bankName}
                          </h3>
                          {acc.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-medium">
                          {acc.accountTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          acc.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                        }`}
                      >
                        {acc.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Account Details Block */}
                  <div className="py-3.5 space-y-2.5 text-xs">
                    {/* Account Number */}
                    <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                          Account Number
                        </span>
                        <span className="font-mono font-bold text-neutral-900 text-xs sm:text-sm tracking-wider">
                          {acc.accountNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(acc.accountNumber, `acc_${acc.id}`)}
                        className="p-1.5 rounded-md hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                        title="Copy Account Number"
                      >
                        {isCopyAcc ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* IBAN */}
                    {acc.iban && (
                      <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-600 block">
                            IBAN (International / Raast)
                          </span>
                          <span className="font-mono font-bold text-neutral-900 text-[11px] sm:text-xs tracking-wider break-all">
                            {acc.iban}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(acc.iban, `iban_${acc.id}`)}
                          className="p-1.5 rounded-md hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                          title="Copy IBAN"
                        >
                          {isCopyIban ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Branch Info */}
                    {(acc.branchName || acc.branchCode) && (
                      <div className="text-[11px] text-neutral-700 flex items-center gap-2 pt-0.5">
                        <span className="text-neutral-600 font-semibold">Branch:</span>
                        <span>
                          {acc.branchName}
                          {acc.branchCode ? ` (Code: ${acc.branchCode})` : ''}
                        </span>
                      </div>
                    )}

                    {/* Instructions */}
                    {acc.instructions && (
                      <div className="text-[11px] text-neutral-700 bg-amber-50/70 border border-amber-100 rounded-lg p-2.5">
                        <span className="font-semibold text-amber-900 block mb-0.5">Instructions:</span>
                        <p className="line-clamp-2 leading-relaxed">{acc.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(acc)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        acc.active
                          ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {acc.active ? 'Deactivate' : 'Activate'}
                    </button>

                    {!acc.isDefault && acc.active && (
                      <button
                        onClick={() => handleSetDefault(acc)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(acc)}
                      className="p-1.5 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Edit bank details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc)}
                      disabled={isDeletingId === acc.id}
                      className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete bank account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-neutral-200">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">
                    {editingAccount ? 'Edit Bank Account' : 'Add Official Bank Account'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Customers will deposit advance payments to this account.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank, Bank Alfalah, HBL, Allied Bank"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Account Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Account Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="e.g. Gauge House"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Account Number & IBAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 02010105829102"
                    className="w-full font-mono text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    IBAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    placeholder="e.g. PK12MEZN0002010105829102"
                    className="w-full font-mono text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Branch Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Branch Name / Location
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Main Boulevard Branch, Lahore"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. 0201"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Deposit Instructions */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Payment Instructions / Customer Deposit Note
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="Instructions displayed to customer regarding transfer reference and TID submission..."
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Toggles */}
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Active (Display this account to customers on checkout)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Primary / Default Account (Pre-selected for customers)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
