import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  MapPin,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Info,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface BillingInvoice {
  billNumber: string;
  dateIssued: string;
  billReason: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Failed' | 'Pending';
}

interface ShopifyBillingViewProps {
  showToast?: (msg: string) => void;
  onNavigatePlan?: () => void;
}

export const ShopifyBillingView: React.FC<ShopifyBillingViewProps> = ({
  showToast = (_msg: string) => {},
  onNavigatePlan
}) => {
  // Navigation mode: 'overview' (Page 1) or 'profile' (Page 2)
  const [activeScreen, setActiveScreen] = useState<'overview' | 'profile'>('overview');

  // Filter & Search states for Past Bills
  const [filterTab, setFilterTab] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm-1',
      brand: 'Visa',
      last4: '8133',
      isPrimary: true,
      expMonth: 12,
      expYear: 2028
    }
  ]);

  // Billing address state
  const [billingAddress, setBillingAddress] = useState(
    'banglaxpress, H-18, R-03, B-E, East Rampura, Dhaka 1219, Bangladesh'
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(billingAddress);

  // Billing currency state
  const [billingCurrency, setBillingCurrency] = useState('USD (US Dollar)');
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);

  // Add payment method modal
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Past bills list (1:1 with user's image)
  const [bills, setBills] = useState<BillingInvoice[]>([
    {
      billNumber: '600323436',
      dateIssued: 'Oct 6, 2026',
      billReason: 'Billing cycle ended',
      amount: 7.0,
      currency: 'USD',
      status: 'Failed'
    },
    {
      billNumber: '584686037',
      dateIssued: 'Sep 6, 2026',
      billReason: 'Billing cycle ended',
      amount: 0.0,
      currency: 'USD',
      status: 'Paid'
    },
    {
      billNumber: '569696188',
      dateIssued: 'Aug 7, 2026',
      billReason: 'Billing cycle ended',
      amount: 0.0,
      currency: 'USD',
      status: 'Paid'
    },
    {
      billNumber: '555316130',
      dateIssued: 'Jul 8, 2026',
      billReason: 'Billing cycle ended',
      amount: 1.0,
      currency: 'USD',
      status: 'Paid'
    }
  ]);

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const matchesFilter =
      filterTab === 'all' ||
      (filterTab === 'paid' && bill.status === 'Paid') ||
      (filterTab === 'unpaid' && (bill.status === 'Failed' || bill.status === 'Pending'));

    const matchesSearch =
      searchQuery === '' ||
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.billReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.dateIssued.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(filteredBills.map((b) => b.billNumber));
    } else {
      setSelectedBills([]);
    }
  };

  const handleToggleSelect = (num: string) => {
    setSelectedBills((prev) =>
      prev.includes(num) ? prev.filter((id) => id !== num) : [...prev, num]
    );
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 4) {
      showToast('Please enter a valid card number');
      return;
    }
    const last4 = cardNumber.slice(-4);
    const newPm = {
      id: `pm-${Date.now()}`,
      brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      last4,
      isPrimary: paymentMethods.length === 0,
      expMonth: 11,
      expYear: 2029
    };
    setPaymentMethods([...paymentMethods, newPm]);
    setShowAddCardModal(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    showToast(`Payment method ${newPm.brand} •••• ${last4} added successfully!`);
  };

  const handleSetPrimary = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isPrimary: pm.id === id
      }))
    );
    showToast('Primary payment method updated');
  };

  const handleDeleteCard = (id: string) => {
    if (paymentMethods.length <= 1) {
      showToast('At least one payment method is required for billing.');
      return;
    }
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
    showToast('Payment method removed');
  };

  const handleRetryFailedBill = (billNumber: string) => {
    setBills(
      bills.map((b) => (b.billNumber === billNumber ? { ...b, status: 'Paid' } : b))
    );
    showToast(`Payment for Bill #${billNumber} processed successfully!`);
  };

  return (
    <div className="w-full space-y-6 text-gray-900 font-sans pb-12">
      {/* ========================================================= */}
      {/* PAGE 1: BILLING OVERVIEW */}
      {/* ========================================================= */}
      {activeScreen === 'overview' && (
        <div className="space-y-6 max-w-4xl">
          {/* Page Title & Navigation pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing</h1>

            {/* Link to Billing Profile */}
            <button
              type="button"
              onClick={() => setActiveScreen('profile')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Billing profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Banner: Subscription Credits Notification */}
          <div className="bg-[#eef3fb] border border-[#d2e0f8] rounded-xl p-4 flex items-start gap-3 text-xs text-[#202223] shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-[#1b58bf] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
              i
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">
                You're earning 0.5% on all sales as subscription credits
              </p>
              <p className="text-gray-600 leading-relaxed">
                Credits will be applied when you reach $1,000 USD or more in sales. You'll earn credits until January 3, 2027 or until $3,500 USD.{' '}
                <button
                  type="button"
                  onClick={() => showToast('Subscription credit terms: 0.5% credited automatically')}
                  className="text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                >
                  View terms
                </button>
              </p>
            </div>
          </div>

          {/* Card: Upcoming Bill */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Upcoming bill</h2>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">$0.00</span>
                <span className="text-xs font-bold text-gray-500 uppercase">USD</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Next bill in 27 days or when your $200 USD threshold is reached. You have $200 remaining.
              </p>
            </div>

            {/* Payment Method in Upcoming Bill */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-7 rounded bg-[#1434cb] text-white font-black italic flex items-center justify-center text-[11px] tracking-wider shadow-2xs select-none">
                  VISA
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900">
                    Visa •••• {paymentMethods[0]?.last4 || '8133'}
                  </span>
                  <span className="text-[11px] text-gray-500 block">Default billing card</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveScreen('profile')}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-md transition-colors cursor-pointer"
                title="Edit payment method in Billing Profile"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Plan Settings Link */}
            <div className="pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-600">To make changes to your plan, </span>
              <button
                type="button"
                onClick={() => {
                  if (onNavigatePlan) onNavigatePlan();
                  else showToast('Redirecting to Shopify Plan settings...');
                }}
                className="text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
              >
                visit plan settings
              </button>
            </div>
          </div>

          {/* Section: Past Bills */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Past bills</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  View and download invoices for subscription and app charges
                </p>
              </div>

              {/* Action utilities: Search, filter, download */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bills..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg outline-none focus:bg-white focus:border-gray-900 w-36 sm:w-48"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Sorting bills by date...')}
                  className="p-1.5 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer"
                  title="Sort"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs: All, Paid, Unpaid */}
            <div className="px-5 pt-3 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    filterTab === 'all'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({bills.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('paid')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    filterTab === 'paid'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Paid ({bills.filter((b) => b.status === 'Paid').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('unpaid')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    filterTab === 'unpaid'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Unpaid ({bills.filter((b) => b.status !== 'Paid').length})
                </button>
              </div>

              {selectedBills.length > 0 && (
                <div className="text-xs text-gray-600 pb-2.5 flex items-center gap-2">
                  <span>{selectedBills.length} selected</span>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Exporting ${selectedBills.length} invoices to CSV...`);
                      setSelectedBills([]);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Export selected
                  </button>
                </div>
              )}
            </div>

            {/* Table: 1:1 Matching User Screenshot */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredBills.length > 0 &&
                          selectedBills.length === filteredBills.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Bill number</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Date issued</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Bill reason</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-center">Status</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No billing records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => {
                      const isSelected = selectedBills.includes(bill.billNumber);
                      return (
                        <tr
                          key={bill.billNumber}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(bill.billNumber)}
                              className="rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-gray-900">
                            <button
                              type="button"
                              onClick={() =>
                                showToast(`Opening invoice #${bill.billNumber} details...`)
                              }
                              className="hover:underline hover:text-blue-600 text-left cursor-pointer"
                            >
                              {bill.billNumber}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                            {bill.dateIssued}
                          </td>
                          <td className="py-3.5 px-4 text-gray-800">{bill.billReason}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-right whitespace-nowrap">
                            ${bill.amount.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {bill.status === 'Paid' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                Paid
                              </span>
                            ) : bill.status === 'Failed' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {bill.status === 'Failed' ? (
                              <button
                                type="button"
                                onClick={() => handleRetryFailedBill(bill.billNumber)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                Retry payment
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  showToast(`Downloading PDF for Bill #${bill.billNumber}`)
                                }
                                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 font-medium text-[11px] p-1 rounded hover:bg-gray-100 transition-colors"
                                title="Download PDF Invoice"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredBills.length} of {bills.length} bills</span>
              <span className="font-mono">Account currency: USD ($)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE 2: BILLING PROFILE (1:1 with Screenshot 2) */}
      {/* ========================================================= */}
      {activeScreen === 'profile' && (
        <div className="space-y-6 max-w-4xl">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveScreen('overview')}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
              title="Back to Billing"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => setActiveScreen('overview')}
                className="hover:underline text-gray-600"
              >
                Billing
              </button>
              <span>/</span>
              <span className="font-medium text-gray-900">Billing profile</span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Billing profile</h1>
            <p className="text-xs text-gray-500 mt-1">
              Your payment methods, billing currency and store address
            </p>
          </div>

          {/* Card: Payment methods */}
          <div className="space-y-2">
            <div className="text-xs">
              <h2 className="text-sm font-bold text-gray-900">Payment methods</h2>
              <p className="text-gray-500">For purchases and bills in Shopify</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-7 rounded bg-[#1434cb] text-white font-black italic flex items-center justify-center text-[11px] tracking-wider shadow-2xs select-none shrink-0">
                      VISA
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900">
                        {pm.brand} •••• {pm.last4}
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        Expires {pm.expMonth}/{pm.expYear}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {pm.isPrimary ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold text-cyan-800 bg-[#d9f5fb] border border-[#b2ecf7]">
                        Primary
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(pm.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          Make primary
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(pm.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Remove card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Payment Method Button */}
              <div className="p-4 bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(true)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                  <span>Add payment method</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Address and currency (1:1 with Screenshot 2) */}
          <div className="space-y-2 pt-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Address and currency</h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
              {/* Billing Address Row */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 max-w-xl">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Billing address</h3>
                    {isEditingAddress ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={tempAddress}
                          onChange={(e) => setTempAddress(e.target.value)}
                          className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-900"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBillingAddress(tempAddress);
                              setIsEditingAddress(false);
                              showToast('Billing address updated successfully!');
                            }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTempAddress(billingAddress);
                              setIsEditingAddress(false);
                            }}
                            className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {billingAddress}
                      </p>
                    )}
                  </div>
                </div>

                {!isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempAddress(billingAddress);
                      setIsEditingAddress(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors self-end sm:self-center cursor-pointer"
                  >
                    Manage
                  </button>
                )}
              </div>

              {/* Currency Row */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Currency</h3>
                    {isEditingCurrency ? (
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={billingCurrency}
                          onChange={(e) => {
                            setBillingCurrency(e.target.value);
                            setIsEditingCurrency(false);
                            showToast(`Billing currency updated to ${e.target.value}`);
                          }}
                          className="text-xs p-2 border border-gray-300 rounded-lg outline-none bg-white font-medium"
                        >
                          <option value="USD (US Dollar)">USD (US Dollar)</option>
                          <option value="BDT (Bangladeshi Taka)">BDT (Bangladeshi Taka)</option>
                          <option value="EUR (Euro)">EUR (Euro)</option>
                          <option value="GBP (British Pound)">GBP (British Pound)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsEditingCurrency(false)}
                          className="text-xs text-gray-500 hover:text-gray-900 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 mt-0.5">{billingCurrency}</p>
                    )}
                  </div>
                </div>

                {!isEditingCurrency && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCurrency(true)}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors self-end sm:self-center cursor-pointer"
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD PAYMENT METHOD */}
      {/* ========================================================= */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Add payment method</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Card number</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 8133"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiration date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Security code (CVC)</label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.slice(0, 4))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-500">
                🔒 Your card details are securely vaulted with PCI-DSS Level 1 compliance for automated billing.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
