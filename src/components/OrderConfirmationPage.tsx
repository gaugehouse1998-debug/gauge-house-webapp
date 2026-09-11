import React from 'react';
import {
  CheckCircle2,
  Printer,
  MessageSquare,
  ArrowRight,
  Package,
  MapPin,
  Phone,
  Mail,
  Building,
  ShieldCheck,
  Truck,
  User,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { AdvancePaymentVerificationBox } from './AdvancePaymentVerificationBox';

interface OrderConfirmationPageProps {
  order: Order;
  navigate: (route: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, navigate }) => {
  const { formatPrice, settings } = useStore();

  const handlePrint = () => {
    window.print();
  };

  const isBankTransfer = order.paymentMethod === 'bank_transfer';

  const handleWhatsAppSend = () => {
    const phone = settings.whatsappNumber?.replace(/[^0-9]/g, '') || '923354499186';
    const lines = [
      `*NEW ORDER NOTIFICATION — GAUGE HOUSE*`,
      `*Order ID:* ${order.orderNumber}`,
      `*Customer:* ${order.customer.fullName}`,
      `*Phone:* ${order.customer.phone}`,
      `*City:* ${order.customer.city}`,
      order.customer.companyName ? `*Company:* ${order.customer.companyName}` : '',
      `*Payment Method:* Advance Bank Transfer (1Link / Raast)`,
      order.transactionId ? `*Transaction ID (TID):* ${order.transactionId}` : '',
      order.paymentStatus ? `*Payment Status:* ${order.paymentStatus}` : '',
      `\n*Items Ordered:*`,
      ...(order.items || []).map((it, idx) => {
        const variantText = it.selectedVariant?.attributes
          ? ` (${Object.entries(it.selectedVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')})`
          : '';
        return `${idx + 1}. ${it.productTitle}${variantText} x ${it.quantity} = ${formatPrice(it.subtotal)}`;
      }),
      `\n*Subtotal:* ${formatPrice(order.subtotal)}`,
      `*Shipping:* ${formatPrice(order.shipping)}`,
      `*Grand Total:* ${formatPrice(order.total)}`,
      order.notes ? `*Notes:* ${order.notes}` : '',
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-10 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-xs text-center print:shadow-none print:border-none">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider inline-block mb-3">
            Order Successfully Placed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Thank You, {order.customer.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed mb-6">
            Your industrial order has been received and registered in the Gauge House dispatch queue.
          </p>

          <div className="p-4 rounded-xl bg-neutral-900 text-white inline-block max-w-md w-full mb-6">
            <span className="text-[11px] text-neutral-400 uppercase tracking-widest font-semibold block">
              Official Order Reference Number
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-orange-400">
              {order.orderNumber}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              onClick={handleWhatsAppSend}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Order to WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={() => navigate('/catalog')}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advance Payment & Bank Transfer Verification Box */}
        <div className="print:hidden">
          <AdvancePaymentVerificationBox order={order} />
        </div>

        {/* Itemized Order Details & Invoice View */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-8 print:shadow-none print:border-neutral-300">
          {/* Header Row for Print Invoice */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-xl font-extrabold text-neutral-900 uppercase">
                GAUGE <span className="text-orange-600">HOUSE</span>
              </span>
              <p className="text-xs text-neutral-500">{settings.tagline}</p>
              <p className="text-xs text-neutral-500">{settings.address}</p>
            </div>
            <div className="sm:text-right text-xs text-neutral-600">
              <p><strong>Order No:</strong> {order.orderNumber}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className="uppercase text-orange-600 font-bold">{order.status}</span></p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-600" /> Customer Information
              </h3>
              <p><strong>Name:</strong> {order.customer.fullName}</p>
              <p><strong>Phone:</strong> {order.customer.phone}</p>
              <p><strong>Email:</strong> {order.customer.email}</p>
              {order.customer.companyName && (
                <p><strong>Company:</strong> {order.customer.companyName}</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" /> Shipping &amp; Payment Details
              </h3>
              <p><strong>Address:</strong> {order.customer.address}</p>
              <p><strong>City:</strong> {order.customer.city}</p>
              <p>
                <strong>Payment Mode:</strong>{' '}
                <span className="font-semibold text-neutral-900">
                  Advance Bank Transfer (1Link / Raast)
                </span>
              </p>
              {order.transactionId && (
                <p>
                  <strong>Transaction ID (TID):</strong>{' '}
                  <span className="font-mono font-bold text-neutral-900">{order.transactionId}</span>
                </p>
              )}
              {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Itemized Line Items
            </h3>
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Item & Specifications</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{item.productTitle}</p>
                        {item.selectedVariant?.attributes && (
                          <p className="text-[11px] text-orange-700 font-medium">
                            {Object.entries(item.selectedVariant.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{item.sku}</td>
                      <td className="py-3 px-4 text-center font-bold text-neutral-900">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-neutral-700">
                        {item.hasDiscount && item.regularPrice && (
                          <span className="line-through text-neutral-400 block text-[10px]">{formatPrice(item.regularPrice)}</span>
                        )}
                        <span className="font-semibold">{formatPrice(item.unitPrice)}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-neutral-900">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-bold text-neutral-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping:</span>
                <span className="font-bold text-neutral-900">{formatPrice(order.shipping)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm">
                <span className="font-bold text-neutral-900">Total:</span>
                <span className="font-extrabold text-orange-600 text-base">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
