import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Clock,
  Eye,
  ShieldAlert,
  CheckCircle2,
  X,
  MessageCircle,
  Package,
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';
import { CustomerUser, Order } from '../../types';

interface CustomersViewProps {
  customers: CustomerUser[];
  orders: Order[];
  viewMode?: 'all' | 'leads';
  formatPrice: (amount: number) => string;
  onSelectOrder?: (order: Order) => void;
  onUpdateCustomerStatus?: (uid: string, status: 'active' | 'suspended') => Promise<void>;
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  viewMode = 'all',
  formatPrice,
  onSelectOrder,
  onUpdateCustomerStatus,
  onShowNotification
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'purchased' | 'no_purchase'>(
    viewMode === 'leads' ? 'purchased' : 'all'
  );
  const [cityFilter, setCityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'orders' | 'spend'>('newest');

  // Selected customer for full profile modal/drawer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);

  // Copy feedback tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (onShowNotification) {
      onShowNotification('info', `Copied ${label}: ${text}`);
    }
  };

  // Distinct cities for filter dropdown
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.city && c.city.trim()) set.add(c.city.trim());
    });
    return Array.from(set).sort();
  }, [customers]);

  // Orders mapped by customerUid or email
  const customerOrdersMap = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach((o) => {
      const uid = o.customerUid || o.customer?.userId;
      const email = (o.customerEmail || o.customer?.email || '').toLowerCase().trim();

      if (uid) {
        const existing = map.get(uid) || [];
        existing.push(o);
        map.set(uid, existing);
      }
      if (email) {
        const existingByEmail = map.get(email) || [];
        if (!existingByEmail.some((x) => x.id === o.id)) {
          existingByEmail.push(o);
          map.set(email, existingByEmail);
        }
      }
    });
    return map;
  }, [orders]);

  // Compute live order count and spend for each customer from real orders snapshot
  const enrichedCustomers = useMemo(() => {
    return customers.map((c) => {
      const ordersByUid = customerOrdersMap.get(c.uid) || [];
      const ordersByEmail = c.email ? customerOrdersMap.get(c.email.toLowerCase().trim()) || [] : [];
      // Combine and deduplicate
      const combined = [...ordersByUid];
      ordersByEmail.forEach((o) => {
        if (!combined.some((x) => x.id === o.id)) combined.push(o);
      });

      const actualOrderCount = Math.max(combined.length, c.orderCount || 0);
      const actualSpend = combined.length > 0
        ? combined.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0)
        : (c.totalSpend || 0);

      const hasPurchased = actualOrderCount > 0 || c.purchaseStatus === 'purchased';

      // Sort customer orders by date descending
      combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      const firstOrderDate = c.firstOrderAt || (combined.length > 0 ? combined[combined.length - 1].createdAt : null);
      const lastOrderDate = c.lastOrderAt || (combined.length > 0 ? combined[0].createdAt : null);

      return {
        ...c,
        orderCount: actualOrderCount,
        totalSpend: actualSpend,
        purchaseStatus: hasPurchased ? ('purchased' as const) : ('no_purchase' as const),
        firstOrderAt: firstOrderDate,
        lastOrderAt: lastOrderDate,
        liveOrders: combined,
      };
    });
  }, [customers, customerOrdersMap]);

  // Filtered & Sorted list
  const filteredCustomers = useMemo(() => {
    let result = enrichedCustomers;

    // View mode restriction if specifically 'leads'
    if (viewMode === 'leads') {
      result = result.filter((c) => c.purchaseStatus === 'purchased' || c.orderCount > 0);
    } else if (purchaseFilter !== 'all') {
      result = result.filter((c) => c.purchaseStatus === purchaseFilter);
    }

    // City Filter
    if (cityFilter !== 'all') {
      result = result.filter((c) => c.city?.toLowerCase() === cityFilter.toLowerCase());
    }

    // Search query (Name, Email, Phone, City, UID)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((c) => {
        return (
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.uid?.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortOrder === 'orders') {
        return (b.orderCount || 0) - (a.orderCount || 0);
      }
      if (sortOrder === 'spend') {
        return (b.totalSpend || 0) - (a.totalSpend || 0);
      }
      return 0;
    });
  }, [enrichedCustomers, viewMode, purchaseFilter, cityFilter, searchTerm, sortOrder]);

  // Export to CSV handler
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      if (onShowNotification) onShowNotification('info', 'No customer records to export.');
      return;
    }

    const headers = [
      'UID',
      'Name',
      'Email',
      'Phone',
      'City',
      'Address',
      'Account Status',
      'Purchase Status',
      'Total Orders',
      'Total Spend (PKR)',
      'Registration Date',
      'First Order Date',
      'Last Order Date'
    ];

    const rows = filteredCustomers.map((c) => [
      `"${c.uid}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.accountStatus || 'active'}"`,
      `"${c.purchaseStatus === 'purchased' ? 'Purchased' : 'No Purchase'}"`,
      c.orderCount || 0,
      c.totalSpend || 0,
      `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}"`,
      `"${c.firstOrderAt ? new Date(c.firstOrderAt).toLocaleDateString() : ''}"`,
      `"${c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = viewMode === 'leads' ? 'gauge_house_customer_leads.csv' : 'gauge_house_customers.csv';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowNotification) {
      onShowNotification('success', `Exported ${filteredCustomers.length} customer records to CSV.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            {viewMode === 'leads' ? 'Purchasing Customer Leads' : 'Customer Database'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {viewMode === 'leads'
              ? 'Qualified leads who have completed verified equipment purchases.'
              : 'Registered customer profiles, contact info, and lifetime instrument order records.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Email, Phone, City..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Purchase Status Filter (2 cols) */}
          {viewMode !== 'leads' && (
            <div className="md:col-span-3">
              <select
                value={purchaseFilter}
                onChange={(e) => setPurchaseFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
              >
                <option value="all">All Purchase Statuses</option>
                <option value="purchased">Purchased (Buyers)</option>
                <option value="no_purchase">No Purchase Yet</option>
              </select>
            </div>
          )}

          {/* City Filter (2 cols) */}
          <div className={viewMode === 'leads' ? 'md:col-span-4' : 'md:col-span-2'}>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
            >
              <option value="all">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting (2 cols) */}
          <div className={viewMode === 'leads' ? 'md:col-span-3' : 'md:col-span-2'}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="spend">Highest Spend</option>
              <option value="orders">Most Orders</option>
            </select>
          </div>
        </div>

        {/* Quick Result Metrics */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 px-1">
          <span>
            Showing <strong className="text-neutral-900">{filteredCustomers.length}</strong> of{' '}
            {customers.length} total registered customers
          </span>
          {searchTerm && (
            <span className="text-orange-600">
              Filtered for &ldquo;{searchTerm}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-950 text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Total Spend</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const hasPurchased = c.purchaseStatus === 'purchased' || (c.orderCount || 0) > 0;
                  return (
                    <tr
                      key={c.uid}
                      className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      {/* Customer Name */}
                      <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black text-xs flex items-center justify-center shrink-0">
                            {(c.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                              {c.name || 'Unnamed Customer'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono block">
                              UID: {c.uid.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email (Visible, copyable) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-neutral-800 text-xs font-semibold select-all">
                            {c.email || '—'}
                          </span>
                          {c.email && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(c.email, `email-${c.uid}`, 'Email');
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-orange-600 hover:bg-neutral-100 transition-colors"
                              title="Copy email address"
                            >
                              {copiedKey === `email-${c.uid}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-700 font-mono text-xs">
                            {c.phone || '—'}
                          </span>
                          {c.phone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(c.phone, `phone-${c.uid}`, 'Phone');
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-orange-600 hover:bg-neutral-100 transition-colors"
                              title="Copy phone number"
                            >
                              {copiedKey === `phone-${c.uid}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600">
                        {c.city || '—'}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 text-[11px]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Purchase Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {hasPurchased ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Purchased
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                            No Purchase
                          </span>
                        )}
                      </td>

                      {/* Number of Orders */}
                      <td className="py-3.5 px-4 text-center font-bold text-neutral-900 whitespace-nowrap">
                        {c.orderCount || 0}
                      </td>

                      {/* Total Spend */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-neutral-900 whitespace-nowrap font-mono">
                        {formatPrice(c.totalSpend || 0)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
                          }}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-orange-600 hover:text-white text-neutral-700 font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-bold text-neutral-700 text-sm">No customers found</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Try adjusting your search query or status filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUSTOMER PROFILE & ORDER HISTORY MODAL */}
      {/* ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center shadow-inner">
                  {(selectedCustomer.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                      {selectedCustomer.name || 'Unnamed Customer'}
                    </h3>
                    {selectedCustomer.purchaseStatus === 'purchased' || (selectedCustomer.orderCount || 0) > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Purchased Lead
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                        Registered Account
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    Firebase UID: {selectedCustomer.uid}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Total Orders
                </span>
                <span className="text-lg font-black text-neutral-900 mt-0.5 block">
                  {selectedCustomer.orderCount || (selectedCustomer as any).liveOrders?.length || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Total Spend
                </span>
                <span className="text-lg font-black text-orange-600 mt-0.5 block">
                  {formatPrice(selectedCustomer.totalSpend || 0)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  First Purchase
                </span>
                <span className="text-xs font-bold text-neutral-800 mt-1 block">
                  {selectedCustomer.firstOrderAt
                    ? new Date(selectedCustomer.firstOrderAt).toLocaleDateString()
                    : 'None yet'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Last Purchase
                </span>
                <span className="text-xs font-bold text-neutral-800 mt-1 block">
                  {selectedCustomer.lastOrderAt
                    ? new Date(selectedCustomer.lastOrderAt).toLocaleDateString()
                    : 'None yet'}
                </span>
              </div>
            </div>

            {/* Customer Details Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                Contact & Delivery Profile
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Email */}
                <div className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Email Address
                    </span>
                    <span className="font-semibold text-neutral-900 select-all font-mono">
                      {selectedCustomer.email || 'None'}
                    </span>
                  </div>
                  {selectedCustomer.email && (
                    <button
                      onClick={() => handleCopy(selectedCustomer.email, 'modal-email', 'Email')}
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
                      title="Copy Email"
                    >
                      {copiedKey === 'modal-email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Phone Number
                    </span>
                    <span className="font-semibold text-neutral-900 select-all font-mono">
                      {selectedCustomer.phone || 'None'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedCustomer.phone && (
                      <>
                        <button
                          onClick={() => handleCopy(selectedCustomer.phone, 'modal-phone', 'Phone')}
                          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          title="Copy Phone"
                        >
                          {copiedKey === 'modal-phone' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* City */}
                <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                  <span className="text-[10px] text-neutral-400 font-bold block">
                    City / Region
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {selectedCustomer.city || 'Unspecified'}
                  </span>
                </div>

                {/* Account Status */}
                <div className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">
                      Account Status
                    </span>
                    <span
                      className={`font-bold uppercase text-[11px] ${
                        selectedCustomer.accountStatus === 'suspended'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {selectedCustomer.accountStatus || 'active'}
                    </span>
                  </div>

                  {onUpdateCustomerStatus && (
                    <button
                      onClick={() => {
                        const newStatus =
                          selectedCustomer.accountStatus === 'suspended' ? 'active' : 'suspended';
                        onUpdateCustomerStatus(selectedCustomer.uid, newStatus);
                        setSelectedCustomer({
                          ...selectedCustomer,
                          accountStatus: newStatus,
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-[10px] font-bold text-neutral-700"
                    >
                      {selectedCustomer.accountStatus === 'suspended'
                        ? 'Reactivate'
                        : 'Suspend'}
                    </button>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2 p-3 rounded-xl border border-neutral-200 bg-white">
                  <span className="text-[10px] text-neutral-400 font-bold block">
                    Full Delivery Address
                  </span>
                  <span className="font-medium text-neutral-900 mt-0.5 block leading-relaxed">
                    {selectedCustomer.address || 'No address saved.'}
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER HISTORY SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-orange-600" />
                  Order History ({(selectedCustomer as any).liveOrders?.length || 0})
                </h4>
              </div>

              {(selectedCustomer as any).liveOrders && (selectedCustomer as any).liveOrders.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(selectedCustomer as any).liveOrders.map((ord: Order) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 hover:border-orange-300 transition-colors space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                          <span className="font-mono font-black text-neutral-900">
                            {formatPrice(ord.total || ord.totalAmount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="pl-2 border-l-2 border-orange-200 text-[11px] text-neutral-600 space-y-0.5">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {it.quantity}x {it.productTitle}
                              {it.selectedVariant?.attributes && (
                                <span className="text-neutral-400 ml-1">
                                  ({Object.values(it.selectedVariant.attributes).join(', ')})
                                </span>
                              )}
                            </span>
                            <span className="font-mono">{formatPrice(it.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {onSelectOrder && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(null);
                              onSelectOrder(ord);
                            }}
                            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Order in Orders Tab</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-400 text-xs">
                  This registered customer has not completed any orders yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Close Customer Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
