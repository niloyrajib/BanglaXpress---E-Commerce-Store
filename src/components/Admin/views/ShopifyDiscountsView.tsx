import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Tag,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Trash2
} from 'lucide-react';

interface DiscountCoupon {
  id: string;
  code: string;
  title: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minSpend?: number;
  usageCount: number;
  status: 'active' | 'scheduled' | 'expired';
  expiryDate: string;
}

interface ShopifyDiscountsViewProps {
  showToast?: (message: string) => void;
}

export const ShopifyDiscountsView: React.FC<ShopifyDiscountsViewProps> = ({
  showToast = (_msg: string) => {}
}) => {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([
    {
      id: 'd-1',
      code: 'WELCOME50',
      title: '৳50 off for first-time website orders',
      type: 'fixed',
      value: 50,
      minSpend: 500,
      usageCount: 142,
      status: 'active',
      expiryDate: '2026-12-31'
    },
    {
      id: 'd-2',
      code: 'EID2026',
      title: '15% off Ramadan & Eid Mega Shopping Festival',
      type: 'percentage',
      value: 15,
      minSpend: 1500,
      usageCount: 89,
      status: 'active',
      expiryDate: '2026-04-15'
    },
    {
      id: 'd-3',
      code: 'FREESHIP',
      title: 'Free Express Delivery across Dhaka Metro',
      type: 'free_shipping',
      value: 60,
      minSpend: 2000,
      usageCount: 64,
      status: 'active',
      expiryDate: '2026-06-30'
    },
    {
      id: 'd-4',
      code: 'FLASH20',
      title: 'Flash Deal 20% Off Weekend Voucher',
      type: 'percentage',
      value: 20,
      minSpend: 1000,
      usageCount: 215,
      status: 'expired',
      expiryDate: '2026-02-28'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('fixed');
  const [newValue, setNewValue] = useState('100');
  const [newMinSpend, setNewMinSpend] = useState('1000');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newCoupon: DiscountCoupon = {
      id: `d-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim() || `${newCode} Special Promotion`,
      type: newType,
      value: Number(newValue) || 50,
      minSpend: Number(newMinSpend) || 0,
      usageCount: 0,
      status: 'active',
      expiryDate: '2026-12-31'
    };

    setCoupons([newCoupon, ...coupons]);
    setIsModalOpen(false);
    setNewCode('');
    setNewTitle('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Discounts & Coupon Codes</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {coupons.filter((c) => c.status === 'active').length} Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Create coupon codes, automatic checkout discounts, and free shipping vouchers for shoppers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-[#303030] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create discount</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 uppercase text-[10.5px]">
            <tr>
              <th className="p-3.5">Code & Promotion</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Discount value</th>
              <th className="p-3.5">Requirement</th>
              <th className="p-3.5">Redemptions</th>
              <th className="p-3.5">Expiry date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded border border-gray-300">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(c.code, c.id)}
                      className="text-gray-400 hover:text-gray-700 p-0.5"
                      title="Copy code"
                    >
                      {copiedId === c.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">{c.title}</span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3.5 font-bold font-mono text-gray-900">
                  {c.type === 'percentage'
                    ? `${c.value}% Off`
                    : c.type === 'free_shipping'
                    ? 'Free Delivery'
                    : `৳${c.value} Off`}
                </td>
                <td className="p-3.5 text-gray-600">
                  {c.minSpend ? `Min. ৳${c.minSpend}` : 'No minimum'}
                </td>
                <td className="p-3.5 font-bold text-gray-900 font-mono">
                  {c.usageCount} used
                </td>
                <td className="p-3.5 text-gray-500 text-[11px]">
                  {c.expiryDate}
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = c.status === 'active' ? 'expired' : 'active';
                        setCoupons(
                          coupons.map((item) =>
                            item.id === c.id
                              ? { ...item, status: nextStatus }
                              : item
                          )
                        );
                        showToast(`ডিসকাউন্ট কোড ${c.code} ${nextStatus === 'active' ? 'অ্যাক্টিভ' : 'নিষ্ক্রিয়'} করা হয়েছে`);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {c.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete coupon "${c.code}"?`)) {
                          setCoupons(coupons.filter((item) => item.id !== c.id));
                          showToast(`কুপন ${c.code} মুছে ফেলা হয়েছে`);
                        }
                      }}
                      className="text-gray-400 hover:text-rose-600 p-1"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Discount */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDiscount}
            className="bg-white rounded-xl max-w-md w-full p-5 border border-gray-200 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-gray-900">Create new discount code</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Discount Code</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono font-bold focus:border-gray-900"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description / Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Special Summer Gadget Offer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:border-gray-900"
                  >
                    <option value="fixed">Fixed Amount (৳)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Value ({newType === 'fixed' ? '৳' : '%'})
                  </label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Minimum Order Amount (৳)</label>
                <input
                  type="number"
                  value={newMinSpend}
                  onChange={(e) => setNewMinSpend(e.target.value)}
                  placeholder="0 for no minimum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none font-mono focus:border-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
              >
                Save discount
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
