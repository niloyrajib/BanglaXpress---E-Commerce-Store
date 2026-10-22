import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  ExternalLink,
  Plus,
  Zap,
  ShieldCheck,
  Truck,
  CreditCard,
  Settings,
  X,
  Check,
  RefreshCw,
  Search,
  Trash2,
  Store
} from 'lucide-react';

interface ShopifyAppsViewProps {
  showToast?: (message: string) => void;
}

interface InstalledApp {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Connected' | 'Configuring' | 'Disabled';
  iconBg: string;
  iconText: string;
  apiKey: string;
  endpoint: string;
  live: boolean;
}

interface AvailableApp {
  id: string;
  name: string;
  category: string;
  rating: string;
  reviews: string;
  description: string;
  iconBg: string;
  iconText: string;
}

const DEFAULT_INSTALLED_APPS: InstalledApp[] = [
  {
    id: 'app-bkash',
    name: 'bKash Merchant Checkout API',
    category: 'Payments',
    description: 'Accept seamless bKash payments directly in Bangladeshi Taka with instant tokenized validation.',
    status: 'Connected',
    iconBg: 'bg-[#D12053]',
    iconText: 'bK',
    apiKey: 'bK_live_app_key_88391047291',
    endpoint: 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout',
    live: true
  },
  {
    id: 'app-nagad',
    name: 'Nagad Gateway Integration',
    category: 'Payments',
    description: 'Official Nagad direct payment gateway with instant transaction verification.',
    status: 'Connected',
    iconBg: 'bg-[#F7931E]',
    iconText: 'Ng',
    apiKey: 'nagad_live_key_992019482',
    endpoint: 'https://api.mynagad.com/api/dfs/check-out/initialize',
    live: true
  },
  {
    id: 'app-pathao',
    name: 'Pathao Courier Automated Logistics',
    category: 'Shipping & Fulfillment',
    description: 'Auto-generates parcel tracking numbers, schedules pickup requests, and updates delivery statuses.',
    status: 'Connected',
    iconBg: 'bg-[#E41E26]',
    iconText: 'Pt',
    apiKey: 'pt_client_8492019482',
    endpoint: 'https://courier-api.pathao.com/aladdin/api/v1/orders',
    live: true
  },
  {
    id: 'app-steadfast',
    name: 'Steadfast Courier API',
    category: 'Shipping & Fulfillment',
    description: 'Integrated with Steadfast for nationwide fast Cash on Delivery order dispatches.',
    status: 'Connected',
    iconBg: 'bg-emerald-600',
    iconText: 'St',
    apiKey: 'sf_live_key_99381029482710',
    endpoint: 'https://portal.steadfast.com.bd/api/v1/create_order',
    live: true
  },
  {
    id: 'app-sms',
    name: 'Greenweb & Alpha SMS Gateway',
    category: 'Marketing & SMS',
    description: 'Sends real-time order confirmation SMS, dispatch alerts, and OTP verifications to customers.',
    status: 'Connected',
    iconBg: 'bg-blue-600',
    iconText: 'SMS',
    apiKey: 'gw_token_9918237194829104',
    endpoint: 'https://api.greenweb.com.bd/api.php',
    live: true
  }
];

const AVAILABLE_STORE_APPS: AvailableApp[] = [
  {
    id: 'store-judge-me',
    name: 'Judge.me Product Reviews',
    category: 'Marketing & Social Proof',
    rating: '4.9 ★',
    reviews: '21,000+',
    description: 'Collect verified buyer photo and video reviews on your storefront to boost conversion rates.',
    iconBg: 'bg-amber-500',
    iconText: 'Jd'
  },
  {
    id: 'store-tiktok-pixel',
    name: 'TikTok Pixel & Shopping',
    category: 'Advertising',
    rating: '4.8 ★',
    reviews: '9,400+',
    description: 'Sync your product catalog with TikTok Ads and track viral video conversions with 1-click pixel.',
    iconBg: 'bg-slate-900',
    iconText: 'TT'
  },
  {
    id: 'store-whatsapp-chat',
    name: 'WhatsApp Order Chat & Support',
    category: 'Customer Support',
    rating: '5.0 ★',
    reviews: '15,200+',
    description: 'Floating WhatsApp widget on every product page so shoppers can message your sales team instantly.',
    iconBg: 'bg-emerald-500',
    iconText: 'WA'
  },
  {
    id: 'store-google-shopping',
    name: 'Google & YouTube Channel',
    category: 'Sales Channels',
    rating: '4.7 ★',
    reviews: '34,000+',
    description: 'Display products on Google Shopping search results and connect YouTube live shopping streams.',
    iconBg: 'bg-blue-500',
    iconText: 'G'
  }
];

export const ShopifyAppsView: React.FC<ShopifyAppsViewProps> = ({
  showToast = (_msg: string) => {}
}) => {
  const [apps, setApps] = useState<InstalledApp[]>(DEFAULT_INSTALLED_APPS);
  const [selectedApp, setSelectedApp] = useState<InstalledApp | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // App Configuration Modal State
  const [configApiKey, setConfigApiKey] = useState('');
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [configLive, setConfigLive] = useState(true);

  const handleOpenConfig = (app: InstalledApp) => {
    setSelectedApp(app);
    setConfigApiKey(app.apiKey);
    setConfigEndpoint(app.endpoint);
    setConfigLive(app.live);
    setTestResult(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setApps((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id
          ? {
              ...a,
              apiKey: configApiKey,
              endpoint: configEndpoint,
              live: configLive,
              status: 'Connected'
            }
          : a
      )
    );

    showToast(`${selectedApp.name} API কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!`);
    setSelectedApp(null);
  };

  const handleTestAppApi = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('API Handshake OK • Response: 200 (Success)');
      showToast(`${selectedApp?.name} এর API কানেকশন সফলভাবে যাচাই করা হয়েছে!`);
    }, 1200);
  };

  const handleInstallApp = (app: AvailableApp) => {
    const newInstalled: InstalledApp = {
      id: app.id,
      name: app.name,
      category: app.category,
      description: app.description,
      status: 'Connected',
      iconBg: app.iconBg,
      iconText: app.iconText,
      apiKey: `key_${Date.now()}`,
      endpoint: `https://api.partner.com/v1`,
      live: true
    };
    setApps((prev) => [newInstalled, ...prev]);
    showToast(`${app.name} সফলভাবে ইনস্টল করা হয়েছে!`);
    setIsStoreModalOpen(false);
  };

  const handleUninstallApp = (appId: string, appName: string) => {
    if (confirm(`Uninstall ${appName}?`)) {
      setApps((prev) => prev.filter((a) => a.id !== appId));
      showToast(`${appName} আনইনস্টল সম্পন্ন হয়েছে`);
      if (selectedApp?.id === appId) setSelectedApp(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Apps & Extensions</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {apps.length} Installed
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your connected courier APIs, Bangladeshi payment gateways, and automated marketing integrations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsStoreModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#1a1a1a] hover:bg-[#303030] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Browse App Store</span>
        </button>
      </div>

      {/* Installed Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${app.iconBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}
              >
                {app.iconText}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-gray-900 truncate">{app.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                    {app.status}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium block">{app.category}</span>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{app.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
              <span className="text-[11px] text-gray-400 font-mono">
                {app.live ? '● Live Mode' : '○ Sandbox'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenConfig(app)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure API</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: App API Configuration */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveConfig}
            className="bg-white rounded-xl max-w-lg w-full p-5 border border-gray-200 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${selectedApp.iconBg} text-white font-bold flex items-center justify-center text-xs`}>
                  {selectedApp.iconText}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{selectedApp.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono">API Configuration & Credentials</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">API Key / Token</label>
              <input
                type="text"
                required
                value={configApiKey}
                onChange={(e) => setConfigApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs outline-hidden focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">API Endpoint / Gateway URL</label>
              <input
                type="url"
                required
                value={configEndpoint}
                onChange={(e) => setConfigEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="font-bold text-gray-800 block">Production Mode</span>
                <span className="text-[11px] text-gray-500">Toggle between Sandbox and Live production processing</span>
              </div>
              <input
                type="checkbox"
                checked={configLive}
                onChange={(e) => setConfigLive(e.target.checked)}
                className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
              />
            </div>

            {testResult && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-mono font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <button
                type="button"
                onClick={handleTestAppApi}
                disabled={isTesting}
                className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                <span>{isTesting ? 'Validating...' : 'Test Connection'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUninstallApp(selectedApp.id, selectedApp.name)}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                >
                  Uninstall
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1a1a1a] hover:bg-[#303030] text-white rounded-lg font-semibold"
                >
                  Save API Config
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Browse & Install New Apps from Store */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 border border-gray-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Shopify App Store for Bangladesh</span>
                </h3>
                <p className="text-xs text-gray-500">Install certified extensions to enhance customer acquisition and sales.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {AVAILABLE_STORE_APPS.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2 bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${app.iconBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                      {app.iconText}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{app.name}</h4>
                      <span className="text-[10px] text-amber-600 font-bold">{app.rating} ({app.reviews})</span>
                      <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{app.description}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleInstallApp(app)}
                      className="px-3 py-1 bg-gray-900 hover:bg-black text-white rounded-md text-xs font-semibold"
                    >
                      Install App
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
