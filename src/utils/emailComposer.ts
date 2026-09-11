import { Order } from '../types';

/**
 * Generates a pre-filled mailto URL for welcoming a customer to Gauge House.
 * Opens the user's default email composer with:
 * To = customer email
 * Subject = Welcome to Gauge House
 * Body = professional Gauge House welcome message
 */
export function getCustomerWelcomeMailto(email: string, customerName?: string): string {
  const cleanEmail = email.trim();
  const name = customerName?.trim() || 'Valued Customer';
  const subject = 'Welcome to Gauge House';

  const body = `Dear ${name},

Welcome to Gauge House! We are delighted to have you with us.

At Gauge House, we specialize in high-precision industrial instruments, pressure gauges, temperature indicators, digital calibrators, level transmitters, and flow sensors engineered to meet the most demanding industrial standards.

Your account gives you access to our complete product catalog, expedited quote requests, order history, and dedicated technical consultation.

If you have any questions regarding instrument specifications, need assistance with product selection, or would like to request a bulk industrial quotation, please feel free to reply directly to this email or reach out to our engineering support desk.

Thank you for choosing Gauge House as your trusted instrumentation partner.

Warm regards,

Customer Support Team
Gauge House
Email: support@gaugehouse.com
Website: www.gaugehouse.com`;

  return `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generates a pre-filled mailto URL for order confirmation.
 * Opens the user's default email composer with:
 * To = customer email
 * Subject = Gauge House Order Confirmation - [Order Number]
 * Body = automatically includes customer name, order number, items, total and payment/order status.
 */
export function getOrderConfirmationMailto(order: Order): string {
  const cleanEmail = (order.customer?.email || order.customerEmail || '').trim();
  const customerName = order.customer?.fullName || order.customerName || 'Valued Customer';
  const orderNumber = order.orderNumber || order.id;
  const statusDisplay = (order.orderStatus || order.status || 'New').toUpperCase();
  const paymentMethodDisplay =
    order.paymentMethod === 'bank_transfer' ? 'Advance Bank Transfer' : 'Cash on Delivery (COD)';
  const paymentStatusDisplay = (order.paymentStatus || 'unpaid').toUpperCase();
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent';

  // Format line items with quantities and prices
  const itemsText = (order.items || [])
    .map((item, idx) => {
      const title = item.productTitle || (item as any).product?.name || (item as any).title || 'Product Item';
      const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (item as any).price || 0;
      const subtotal = typeof item.subtotal === 'number' ? item.subtotal : unitPrice * item.quantity;
      const variantDesc = item.selectedVariant?.attributes
        ? ` (${Object.entries(item.selectedVariant.attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')})`
        : '';
      return `  ${idx + 1}. ${title}${variantDesc}\n     Quantity: ${item.quantity} | Unit Price: PKR ${unitPrice.toLocaleString()} | Subtotal: PKR ${subtotal.toLocaleString()}`;
    })
    .join('\n\n');

  const subject = `Gauge House Order Confirmation - ${orderNumber}`;

  const body = `Dear ${customerName},

Thank you for ordering with Gauge House! We are pleased to confirm that we have received your order.

--------------------------------------------------
ORDER DETAILS
--------------------------------------------------
Order Number: ${orderNumber}
Order Date: ${orderDate}
Current Order Status: ${statusDisplay}

DELIVERY ADDRESS:
${customerName}
${order.customer?.phone || ''}
${order.customer?.address || ''}
${order.customer?.city || ''}
${order.customer?.companyName ? `Company: ${order.customer.companyName}` : ''}

--------------------------------------------------
ORDERED ITEMS:
--------------------------------------------------
${itemsText || '  Standard Instrument Order'}

--------------------------------------------------
PAYMENT & FINANCIAL SUMMARY
--------------------------------------------------
Subtotal: PKR ${order.subtotal?.toLocaleString() || '0'}
Shipping: PKR ${order.shipping?.toLocaleString() || '0'}
Grand Total: PKR ${order.total?.toLocaleString() || '0'}
Payment Method: ${paymentMethodDisplay}
Payment Status: ${paymentStatusDisplay}${
    order.transactionId ? `\nTransaction ID (TID): ${order.transactionId}` : ''
  }${order.selectedBankName ? `\nSelected Bank: ${order.selectedBankName}` : ''}

--------------------------------------------------
NEXT STEPS:
${
  order.paymentMethod === 'bank_transfer' && order.paymentStatus !== 'verified'
    ? 'If you have not yet completed your payment transfer, please transfer the grand total to our designated bank account and upload your Transaction ID (TID) or transfer receipt in your customer order dashboard.\n\n'
    : ''
}Our fulfillment and quality control team is reviewing your instrument specifications. We will send you further tracking details as soon as your shipment is dispatched.

If you have any questions or require modifications to your order, simply reply to this email or contact our support team.

Warm regards,

Order Fulfillment Team
Gauge House
Email: orders@gaugehouse.com
Website: www.gaugehouse.com`;

  return `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
