import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Send,
  MessageSquare,
  Package,
  CreditCard,
  User,
  Phone,
  Mail,
  Edit,
  ShieldCheck,
  Archive,
  RefreshCw,
  Share2,
  ChevronDown,
  PackageCheck,
  X,
  Calendar,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { BanglaXpressLogo } from '../../BanglaXpressLogo';
import { OrderConfirmationModal } from '../../OrderConfirmationModal';

interface ShopifyOrderDetailViewProps {
  order: Order;
  onBack: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
  showToast: (msg: string) => void;
}

export const ShopifyOrderDetailView: React.FC<ShopifyOrderDetailViewProps> = ({
  order,
  onBack,
  onUpdateOrderStatus,
  onUpdateOrder,
  showToast
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [newComment, setNewComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showMoneyReceipt, setShowMoneyReceipt] = useState(false);

  // Delivery Modal State
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliveryCourier, setDeliveryCourier] = useState(order.courierName || 'Steadfast Courier');
  const [deliveryTrackingNumber, setDeliveryTrackingNumber] = useState(order.trackingNumber || `EXP-${order.id.replace('#', '')}`);
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [deliveryTime, setDeliveryTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [collectPaymentOnDelivery, setCollectPaymentOnDelivery] = useState(order.paymentStatus !== 'paid');
  const [notifyCustomerOnDelivery, setNotifyCustomerOnDelivery] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState('');

  // Synchronize when order prop updates
  React.useEffect(() => {
    setCurrentOrder(order);
    setDeliveryCourier(order.courierName || 'Steadfast Courier');
    setDeliveryTrackingNumber(order.trackingNumber || `EXP-${order.id.replace('#', '')}`);
    setCollectPaymentOnDelivery(order.paymentStatus !== 'paid');
  }, [order]);

  const isPaid = currentOrder.paymentStatus === 'paid';
  const isDelivered = currentOrder.status === 'delivered';
  const isFulfilled = currentOrder.status === 'delivered' || currentOrder.status === 'shipped';
  const isArchived = currentOrder.archived || currentOrder.status === 'delivered';

  // Open delivery modal with synchronized values
  const handleOpenDeliverModal = () => {
    setDeliveryCourier(currentOrder.courierName || 'Steadfast Courier');
    setDeliveryTrackingNumber(currentOrder.trackingNumber || `EXP-${currentOrder.id.replace('#', '')}`);
    setCollectPaymentOnDelivery(currentOrder.paymentStatus !== 'paid');
    setDeliveryDate(new Date().toISOString().slice(0, 10));
    setDeliveryTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setShowDeliverModal(true);
  };

  // Confirm Mark as Delivered
  const handleConfirmDelivery = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const wasUnpaid = currentOrder.paymentStatus !== 'paid';
    const shouldCollectPayment = collectPaymentOnDelivery && wasUnpaid;
    const newPaymentStatus = shouldCollectPayment ? 'paid' : currentOrder.paymentStatus;

    const deliveryTimestamp = `${deliveryTime}`;
    const newTimelineEvents: any[] = [];

    if (notifyCustomerOnDelivery) {
      newTimelineEvents.push({
        status: 'delivered' as OrderStatus,
        title: 'Delivery SMS & WhatsApp Sent',
        description: `Automated delivery confirmation sent to customer phone ${currentOrder.phone}.`,
        timestamp: deliveryTimestamp,
        completed: true
      });
    }

    if (shouldCollectPayment) {
      newTimelineEvents.push({
        status: 'delivered' as OrderStatus,
        title: 'COD Cash Collected Upon Delivery',
        description: `Courier rider collected ৳${currentOrder.total.toLocaleString()}.00 BDT full cash from ${currentOrder.customerName}. Payment reconciled to Paid.`,
        timestamp: deliveryTimestamp,
        completed: true
      });
    }

    newTimelineEvents.push({
      status: 'delivered' as OrderStatus,
      title: 'Order Marked as Delivered',
      description: `Package successfully delivered to ${currentOrder.customerName} (${currentOrder.address}) via ${deliveryCourier}.${deliveryTrackingNumber ? ` Tracking: ${deliveryTrackingNumber}.` : ''}${deliveryNote ? ` Note: ${deliveryNote}` : ''}`,
      timestamp: deliveryTimestamp,
      completed: true
    });

    const updated: Order = {
      ...currentOrder,
      status: 'delivered',
      paymentStatus: newPaymentStatus,
      courierName: deliveryCourier,
      trackingNumber: deliveryTrackingNumber,
      timeline: [...newTimelineEvents, ...currentOrder.timeline]
    };

    setCurrentOrder(updated);
    onUpdateOrderStatus(currentOrder.id, 'delivered');
    if (onUpdateOrder) onUpdateOrder(updated);
    setShowDeliverModal(false);
    showToast(`অর্ডার #${currentOrder.id} সফলভাবে Delivered হিসেবে চিহ্নিত হয়েছে!`);
  };

  // Revert Delivery (Undo)
  const handleRevertDelivery = () => {
    const newStatus: OrderStatus = 'shipped';
    const updated: Order = {
      ...currentOrder,
      status: newStatus,
      timeline: [
        {
          status: newStatus,
          title: 'Delivery Status Reverted',
          description: 'Order delivery status reset to Shipped (in transit).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        },
        ...currentOrder.timeline
      ]
    };

    setCurrentOrder(updated);
    onUpdateOrderStatus(currentOrder.id, newStatus);
    if (onUpdateOrder) onUpdateOrder(updated);
    showToast(`অর্ডারের স্ট্যাটাস Shipped এ পরিবর্তন করা হয়েছে!`);
  };

  // Copy tracking or order link
  const handleCopyOrderInfo = () => {
    navigator.clipboard.writeText(
      `Order: #${currentOrder.id}\nCustomer: ${currentOrder.customerName}\nPhone: ${currentOrder.phone}\nAddress: ${currentOrder.address}\nTotal: ৳${currentOrder.total}`
    );
    setIsCopied(true);
    showToast('অর্ডারের বিবরণ কপি করা হয়েছে!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Toggle Payment status
  const handleTogglePayment = () => {
    const newPaymentStatus = isPaid ? 'unpaid' : 'paid';
    const updated: Order = {
      ...currentOrder,
      paymentStatus: newPaymentStatus,
      timeline: [
        {
          status: currentOrder.status,
          title: newPaymentStatus === 'paid' ? 'Payment Collected' : 'Payment Marked Unpaid',
          description:
            newPaymentStatus === 'paid'
              ? `You manually marked ৳${currentOrder.total.toLocaleString()}.00 BDT as paid by ${currentOrder.paymentMethod.toUpperCase()}.`
              : 'Payment status changed to unpaid.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        },
        ...currentOrder.timeline
      ]
    };
    setCurrentOrder(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    showToast(newPaymentStatus === 'paid' ? 'পেমেন্ট Paid হিসেবে চিহ্নিত হয়েছে!' : 'পেমেন্ট Unpaid করা হয়েছে!');
  };

  // Toggle Fulfillment status
  const handleToggleFulfillment = () => {
    const newStatus: OrderStatus = isFulfilled ? 'pending' : 'shipped';
    onUpdateOrderStatus(currentOrder.id, newStatus);
    const updated: Order = {
      ...currentOrder,
      status: newStatus,
      timeline: [
        {
          status: newStatus,
          title: newStatus === 'shipped' ? 'Marked as Fulfilled' : 'Marked as Unfulfilled',
          description:
            newStatus === 'shipped'
              ? `You marked ${currentOrder.items.length} item(s) as fulfilled from Shop location.`
              : 'Order fulfillment status reset to unfulfilled.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        },
        ...currentOrder.timeline
      ]
    };
    setCurrentOrder(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    showToast(newStatus === 'shipped' ? 'অর্ডার Fulfilled হিসেবে চিহ্নিত হয়েছে!' : 'অর্ডার Unfulfilled করা হয়েছে!');
  };

  // Direct status dropdown selection (matching screenshot)
  const handleSelectStatus = (newStatus: OrderStatus) => {
    if (newStatus === currentOrder.status) return;

    if (newStatus === 'delivered') {
      // Open the delivery confirmation modal so user can confirm courier details & COD collection
      handleOpenDeliverModal();
      return;
    }

    const statusTitles: Record<OrderStatus, string> = {
      pending: 'Pending (অপেক্ষমান)',
      confirmed: 'Confirmed (নিশ্চিত)',
      processing: 'Processing (প্যাকিং)',
      shipped: 'Shipped (কুরিয়ারে)',
      delivered: 'Delivered (ডেলিভার্ড)',
      cancelled: 'Cancelled (বাতিল)'
    };

    onUpdateOrderStatus(currentOrder.id, newStatus);
    const updated: Order = {
      ...currentOrder,
      status: newStatus,
      timeline: [
        {
          status: newStatus,
          title: `Status Changed to ${statusTitles[newStatus]}`,
          description: `Order status updated to ${statusTitles[newStatus]} by staff.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        },
        ...currentOrder.timeline
      ]
    };
    setCurrentOrder(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    showToast(`অর্ডার স্ট্যাটাস '${statusTitles[newStatus]}' করা হয়েছে!`);
  };

  // Toggle Archived
  const handleToggleArchived = () => {
    const nextArchived = !isArchived;
    const updated: Order = {
      ...currentOrder,
      archived: nextArchived,
      timeline: [
        {
          status: currentOrder.status,
          title: nextArchived ? 'Order Archived' : 'Order Unarchived',
          description: nextArchived ? 'This order was archived.' : 'This order was unarchived.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true
        },
        ...currentOrder.timeline
      ]
    };
    setCurrentOrder(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    showToast(nextArchived ? 'অর্ডারটি Archived হয়েছে!' : 'অর্ডারটি Unarchived হয়েছে!');
  };

  // Add Comment to timeline
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newTimelineItem = {
      status: currentOrder.status,
      title: 'Staff Note',
      description: newComment.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true
    };

    const updated: Order = {
      ...currentOrder,
      timeline: [newTimelineItem, ...currentOrder.timeline]
    };
    setCurrentOrder(updated);
    if (onUpdateOrder) onUpdateOrder(updated);
    setNewComment('');
    showToast('টাইমলাইনে মন্তব্য যুক্ত হয়েছে!');
  };

  // Print invoice
  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  // Format order date nicely
  const formattedOrderDate = (() => {
    if (currentOrder.createdAt.includes('at')) return currentOrder.createdAt;
    try {
      const d = new Date(currentOrder.createdAt);
      if (!isNaN(d.getTime())) {
        return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      }
    } catch {
      // fallback
    }
    return currentOrder.createdAt;
  })();

  const fulfillmentCode = currentOrder.fulfillmentId || `#${currentOrder.id.replace('#', '')}-F1`;
  const confirmationCode = currentOrder.confirmationCode || currentOrder.trackingNumber || `EXP-${currentOrder.id}`;

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-[#202223] font-sans pb-16">
      {/* TOP HEADER & BREADCRUMBS (1:1 SHOPIFY PDF STYLE) */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Back to orders"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Checkbox & Order ID */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-0 cursor-pointer"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {currentOrder.id.startsWith('#') ? currentOrder.id : `#${currentOrder.id}`}
              </h1>

              {/* Invoice Pill (e.g. Invoice: GPE-776776 / BX-INV-1005) with Copy Icon */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-emerald-300 bg-emerald-50 text-[11px] font-mono shadow-2xs">
                <span className="text-emerald-700 font-medium">Invoice:</span>
                <span className="font-bold text-emerald-900">
                  {`BX-INV-${currentOrder.id.replace('#', '')}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`BX-INV-${currentOrder.id.replace('#', '')}`);
                    showToast('ইনভয়েস নম্বর কপি করা হয়েছে!');
                  }}
                  className="p-0.5 hover:bg-emerald-100 rounded text-emerald-700 transition-colors cursor-pointer ml-0.5"
                  title="Copy Invoice Number"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Badges: Payment, Fulfillment, Delivery, Archived */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Payment Badge - styled matching screenshot • Payment pending (COD) */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPaid ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                />
                <span>{isPaid ? 'Paid' : `Payment pending (${currentOrder.paymentMethod.toUpperCase()})`}</span>
              </span>

              {/* Fulfillment Badge - styled matching screenshot • Unfulfilled */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isFulfilled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFulfilled ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                />
                <span>{isDelivered ? 'Delivered' : isFulfilled ? 'Fulfilled' : 'Unfulfilled'}</span>
              </span>

              {/* Archived Badge */}
              {isArchived && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Archived
                </span>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Money Receipt & Cash Memo Button (Matching screenshot: মানি রিসিট (Receipt)) */}
            <button
              type="button"
              onClick={() => setShowMoneyReceipt(true)}
              className="px-3.5 py-1.5 bg-[#006838] hover:bg-[#005a30] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:shadow-xs group"
              title="অফিশিয়াল মানি রিসিট ও ক্যাশ মেমো দেখুন ও প্রিন্ট করুন"
            >
              <Receipt className="w-3.5 h-3.5 text-white/90 group-hover:scale-110 transition-transform" />
              <span>মানি রিসিট (Receipt)</span>
            </button>

            {/* Packing Slip Button (Matching screenshot) */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Print Packing Slip"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Packing Slip</span>
            </button>

            <button
              type="button"
              onClick={handleCopyOrderInfo}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <span>Copy details</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTogglePayment}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                isPaid
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isPaid ? 'Mark as unpaid' : 'Mark as paid'}
            </button>

            <button
              type="button"
              onClick={handleToggleFulfillment}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                isFulfilled
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-[#008060] text-white hover:bg-[#006e52]'
              }`}
            >
              {isFulfilled ? 'Mark as unfulfilled' : 'Fulfill items'}
            </button>

            {/* Mark as Delivered Option */}
            {!isDelivered ? (
              <button
                type="button"
                onClick={handleOpenDeliverModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#008060] text-white hover:bg-[#006e52] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:shadow-xs"
                title="Mark this order as delivered"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as delivered</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivered</span>
                </span>
                <button
                  type="button"
                  onClick={handleRevertDelivery}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
                  title="Revert delivery status to shipped"
                >
                  Undo delivery
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle Line: Date & Channel */}
        <div className="max-w-6xl mx-auto mt-1 pl-7 text-xs text-gray-500">
          <span>{formattedOrderDate} from {currentOrder.salesChannel || 'Online Store'}</span>
        </div>
      </div>

      {/* Printable Invoice Header with BanglaXpress Logo */}
      <div className="hidden print:flex flex-col items-center justify-center p-6 border-b border-gray-300 text-center bg-white">
        <BanglaXpressLogo variant="receipt" size="md" showTagline={true} showWebsite={true} />
        <h2 className="text-lg font-black text-gray-900 mt-2 uppercase tracking-wide">
          Official Order Invoice & Money Receipt
        </h2>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Order ID: #{currentOrder.id} • Invoice: BX-INV-{currentOrder.id.replace('#', '')}
        </p>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT (PDF MATCH) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: 8 COLS (Fulfillment, Payment, Timeline) */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. FULFILLMENT CARD */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
              {/* Header: Matches user screenshot with Status selector & location */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isDelivered
                        ? 'bg-emerald-600 text-white'
                        : isFulfilled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">
                        {isDelivered
                          ? `Delivered (${currentOrder.items.reduce((s, it) => s + it.quantity, 0)})`
                          : isFulfilled
                          ? `Fulfilled (${currentOrder.items.reduce((s, it) => s + it.quantity, 0)})`
                          : `Unfulfilled (${currentOrder.items.reduce((s, it) => s + it.quantity, 0)})`}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[10.5px] font-mono font-medium">
                        #Hub-01
                      </span>
                    </div>
                    <p className="text-[11.5px] text-gray-500 mt-0.5">
                      Location: Dhaka Central Warehouse ({currentOrder.courierName || 'Steadfast Courier'} Dispatch)
                    </p>
                  </div>
                </div>

                {/* Status Dropdown Option (1:1 with user image) */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <label htmlFor="order-status-select" className="text-xs text-gray-500 font-medium">
                    Status:
                  </label>
                  <div className="relative">
                    <select
                      id="order-status-select"
                      value={currentOrder.status}
                      onChange={(e) => handleSelectStatus(e.target.value as OrderStatus)}
                      className="appearance-none bg-white border border-gray-300 hover:border-gray-400 rounded-md py-1.5 pl-3 pr-8 text-xs font-bold text-gray-900 shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer min-w-[190px]"
                    >
                      <option value="pending">Pending (অপেক্ষমান)</option>
                      <option value="confirmed">Confirmed (নিশ্চিত)</option>
                      <option value="processing">Processing (প্যাকিং)</option>
                      <option value="shipped">Shipped (কুরিয়ারে)</option>
                      <option value="delivered">Delivered (ডেলিভার্ড)</option>
                      <option value="cancelled">Cancelled (বাতিল)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Line Items List */}
              <div className="divide-y divide-gray-100 pt-1">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 leading-snug hover:text-blue-600 cursor-pointer">
                          {item.name}
                        </h4>
                        {item.color && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.color}
                          </p>
                        )}
                        <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                          ৳{item.price.toLocaleString()}.00 × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs text-gray-900">
                        ৳{(item.price * item.quantity).toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Courier Tracking Status Bar - Matches User Screenshot */}
              <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">
                        {currentOrder.courierName || 'In-House Express Logistics'}
                      </span>
                      <span className="font-mono text-[10.5px] bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded shadow-2xs font-bold">
                        {currentOrder.trackingNumber || `EXP-${currentOrder.id.replace('#', '')}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Shipping: {currentOrder.cityDivision} (৳{currentOrder.deliveryCharge})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const newTrack = prompt('Enter consignment/tracking number:', currentOrder.trackingNumber || '');
                      if (newTrack !== null && newTrack.trim()) {
                        const upd = { ...currentOrder, trackingNumber: newTrack.trim() };
                        setCurrentOrder(upd);
                        if (onUpdateOrder) onUpdateOrder(upd);
                        showToast(`Tracking updated: ${newTrack.trim()}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    Edit tracking
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFulfillment}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      isFulfilled
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isFulfilled ? 'Mark as unfulfilled' : 'Fulfill items'}
                  </button>
                </div>
              </div>

              {/* Delivery Status & Action Panel */}
              {!isDelivered ? (
                <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      <PackageCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-emerald-950">Fulfillment & Delivery</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {isFulfilled ? 'In Transit / Dispatched' : 'Awaiting Dispatch'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
                        Once courier hands over items to {currentOrder.customerName}, click to mark delivered, reconcile COD cash collection, and notify customer.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenDeliverModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer hover:shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as delivered</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-emerald-950">Package Delivered</h4>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                          Completed
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        Successfully delivered to recipient • Courier: {currentOrder.courierName || 'Courier'} • {isPaid ? 'Payment reconciled (Paid)' : 'Payment status: Unpaid'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevertDelivery}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    <span>Undo delivery</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. PAYMENT BREAKDOWN CARD (1:1 PDF MATCH) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    {isPaid ? 'Paid' : 'Payment pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMoneyReceipt(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                    title="মানি রিসিট ও ক্যাশ মেমো"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Receipt</span>
                  </button>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {currentOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span className="text-gray-500">
                    {currentOrder.items.reduce((s, it) => s + it.quantity, 0)} item
                    {currentOrder.items.reduce((s, it) => s + it.quantity, 0) > 1 ? 's' : ''}
                  </span>
                  <span className="font-mono text-gray-900">
                    ৳{currentOrder.subtotal.toLocaleString()}.00
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <div>
                    <span>Shipping</span>
                    <span className="block text-[10.5px] text-gray-400">
                      {currentOrder.cityDivision} (0.0 kg: Items 0.0 kg, Package 0.0 kg)
                    </span>
                  </div>
                  <span className="font-mono text-gray-900 self-center">
                    ৳{currentOrder.deliveryCharge.toLocaleString()}.00
                  </span>
                </div>

                {currentOrder.discount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700">
                    <span>Discount {currentOrder.couponCode ? `(${currentOrder.couponCode})` : ''}</span>
                    <span className="font-mono font-bold">-৳{currentOrder.discount.toLocaleString()}.00</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total</span>
                  <span className="font-mono">৳{currentOrder.total.toLocaleString()}.00</span>
                </div>

                <div className="flex justify-between py-1 text-xs font-semibold text-gray-900">
                  <span>Paid</span>
                  <span className="font-mono">
                    {isPaid ? `৳${currentOrder.total.toLocaleString()}.00` : '৳0.00'}
                  </span>
                </div>

                {!isPaid && (
                  <div className="flex justify-between py-1 text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <span>Balance Due</span>
                    <span className="font-mono">৳{currentOrder.total.toLocaleString()}.00</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. TIMELINE CARD (1:1 PDF MATCH) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900">Timeline</h3>
                <span className="text-[11px] text-gray-400">
                  Only you and other staff can see comments
                </span>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment..."
                  className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-gray-900 bg-gray-50/50"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>

              {/* Grouped Timeline Events */}
              <div className="pt-2 space-y-5">
                {/* Most recent date header */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-2.5">
                    {formattedOrderDate.split(' at ')[0] || 'Today'}
                  </h4>

                  <div className="space-y-2.5 pl-1">
                    {currentOrder.timeline.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 text-xs leading-relaxed"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={event.completed}
                            readOnly
                            className="w-3.5 h-3.5 mt-0.5 text-gray-800 rounded border-gray-300 pointer-events-none"
                          />
                          <div className="text-gray-700">
                            <span className="font-normal">{event.description}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-gray-400 shrink-0">
                          {event.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 COLS (Customer Details, Shipping Address, Billing Address) */}
          <div className="lg:col-span-4 space-y-4">
            {/* CUSTOMER CARD (1:1 PDF MATCH) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
              {/* Card Title */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900">Customer</h3>
                <span className="text-xs text-gray-400">1 order</span>
              </div>

              {/* Customer Name */}
              <div>
                <a
                  href={`#customer-${currentOrder.phone}`}
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(`গ্রাহক: ${currentOrder.customerName}`);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline block"
                >
                  {currentOrder.customerName}
                </a>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Contact information</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentOrder.customerEmail || 'customer@gmail.com');
                      showToast('ইমেইল কপি হয়েছে!');
                    }}
                    className="text-gray-400 hover:text-gray-700 p-1"
                    title="Copy email"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-blue-600 hover:underline cursor-pointer truncate">
                  {currentOrder.customerEmail || `${currentOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`}
                </p>
                <p className="font-mono text-gray-700">{currentOrder.phone}</p>
                {currentOrder.altPhone && (
                  <p className="font-mono text-gray-400 text-[11px]">Alt: {currentOrder.altPhone}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">Shipping address</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(currentOrder.address + ', Bangladesh')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-[11px] flex items-center gap-0.5"
                  >
                    <span>Map</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <p className="font-medium text-gray-900">{currentOrder.customerName}</p>
                <p className="text-gray-600 leading-snug">{currentOrder.address}</p>
                {currentOrder.thanaZone && (
                  <p className="text-gray-600">{currentOrder.thanaZone}</p>
                )}
                <p className="text-gray-600">{currentOrder.district || currentOrder.cityDivision}</p>
                <p className="text-gray-600">Bangladesh</p>
                <p className="font-mono text-gray-700 pt-0.5">{currentOrder.phone}</p>
              </div>

              {/* Billing Address */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-xs">
                <span className="font-bold text-gray-900 block mb-1">Billing address</span>
                <p className="text-gray-500">Same as shipping address</p>
              </div>
            </div>

            {/* QUICK ACTIONS & COURIER CARD */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-3 text-xs">
              <h4 className="font-bold text-gray-900">Courier Operations (Bangladesh)</h4>

              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-blue-800 font-semibold">
                    Steadfast Express API
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded font-bold">
                    Connected
                  </span>
                </div>
                <p className="font-mono text-xs font-bold text-gray-900">
                  Consignment ID: {currentOrder.trackingNumber || 'EXP-400920'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${currentOrder.phone}`}
                    className="flex-1 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-900 rounded-md font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span>কল দিন</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`এসএমএস পাঠানো হয়েছে ${currentOrder.phone} নম্বরে!`);
                    }}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>SMS পাঠান</span>
                  </button>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Update Fulfillment Status:
                </label>
                <select
                  value={currentOrder.status}
                  onChange={(e) => {
                    const st = e.target.value as OrderStatus;
                    onUpdateOrderStatus(currentOrder.id, st);
                    setCurrentOrder({ ...currentOrder, status: st });
                    showToast(`অর্ডার স্ট্যাটাস '${st}' করা হয়েছে!`);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 outline-none focus:border-gray-900 cursor-pointer"
                >
                  <option value="pending">Pending (অপেক্ষমান)</option>
                  <option value="confirmed">Confirmed (নিশ্চিত)</option>
                  <option value="processing">Processing (প্যাকিং)</option>
                  <option value="shipped">Shipped (কুরিয়ারে)</option>
                  <option value="delivered">Delivered (ডেলিভার্ড)</option>
                  <option value="cancelled">Cancelled (বাতিল)</option>
                </select>
              </div>

              {/* Money Receipt Quick Action */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMoneyReceipt(true)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs group"
                >
                  <Receipt className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                  <span>মানি রিসিট ও চালান ওপেন করুন</span>
                </button>
              </div>

              {/* Archive Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleToggleArchived}
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{isArchived ? 'Unarchive order' : 'Archive order'}</span>
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  ← Return to orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MARK AS DELIVERED MODAL DIALOG */}
      {showDeliverModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Mark as Delivered</h3>
                  <p className="text-[11px] text-gray-500">
                    Order #{currentOrder.id.replace('#', '')} • {currentOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeliverModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmDelivery} className="p-5 space-y-4">
              {/* Order Quick Summary */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-medium text-gray-500">Recipient:</span>
                  <span className="font-bold text-gray-900">{currentOrder.customerName} ({currentOrder.phone})</span>
                </div>
                <div className="flex justify-between items-start text-gray-700">
                  <span className="font-medium text-gray-500 shrink-0">Address:</span>
                  <span className="text-right text-gray-800 line-clamp-1">{currentOrder.address}, {currentOrder.cityDivision}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-gray-200 text-gray-900 font-semibold">
                  <span>Order Total:</span>
                  <span className="font-mono font-bold text-rose-600">৳{currentOrder.total.toLocaleString()}.00 BDT</span>
                </div>
              </div>

              {/* Courier & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Delivered by (Courier / Carrier):
                  </label>
                  <select
                    value={deliveryCourier}
                    onChange={(e) => setDeliveryCourier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="RedX Logistics">RedX Logistics</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="eCourier">eCourier</option>
                    <option value="Sundarban Courier">Sundarban Courier</option>
                    <option value="In-House Store Rider">In-House Store Rider</option>
                    <option value="Express Handover">Express Handover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Consignment / Tracking ID:
                  </label>
                  <input
                    type="text"
                    value={deliveryTrackingNumber}
                    onChange={(e) => setDeliveryTrackingNumber(e.target.value)}
                    placeholder="e.g. SF-928124"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Delivery Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>Delivery Date:</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Delivery Time:</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="e.g. 02:45 PM"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Payment Settlement for COD */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectPaymentOnDelivery}
                    onChange={(e) => setCollectPaymentOnDelivery(e.target.checked)}
                    disabled={isPaid}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      {isPaid ? 'Payment already collected (Paid)' : `Collect COD Cash Payment (৳${currentOrder.total.toLocaleString()}.00 BDT)`}
                    </span>
                    <span className="text-[11px] text-gray-600 block leading-relaxed">
                      {isPaid
                        ? 'This order has already been marked as Paid in full.'
                        : 'Customer paid cash on delivery to the courier rider. Automatically mark payment status as Paid.'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Customer Delivery Confirmation Notification */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyCustomerOnDelivery}
                    onChange={(e) => setNotifyCustomerOnDelivery(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Send delivery notification to customer
                    </span>
                    <span className="text-[11px] text-gray-500 block leading-relaxed">
                      Notify {currentOrder.phone} via automated SMS & WhatsApp with delivery receipt and feedback link.
                    </span>
                  </div>
                </label>
              </div>

              {/* Optional Staff / Delivery Note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Notes / Rider Remarks (Optional):
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Handed over directly to customer. Signed acknowledgment received."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Mark as delivered</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL MONEY RECEIPT & CASH MEMO MODAL */}
      {showMoneyReceipt && (
        <OrderConfirmationModal
          order={currentOrder}
          onClose={() => setShowMoneyReceipt(false)}
          onTrackOrder={(ordId) => {
            setShowMoneyReceipt(false);
            showToast(`পার্সেল ট্র্যাকিং কোড: ${currentOrder.trackingNumber || ordId}`);
          }}
          isMerchantReceipt={true}
          title={`Order #${currentOrder.id.replace('#', '')} Money Receipt & Cash Memo`}
        />
      )}
    </div>
  );
};
