import React, { useState, useEffect } from 'react';
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
  Store,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  AppIntegrationSetting,
  getStoredIntegrationApps,
  saveIntegrationApps,
  APPS_SETTINGS_UPDATED_EVENT
} from '../../../utils/appIntegrations';

interface ShopifyAppsViewProps {
  showToast?: (message: string) => void;
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
  const [apps, setApps] = useState<AppIntegrationSetting[]>(() => getStoredIntegrationApps());
  const [selectedApp, setSelectedApp] = useState<AppIntegrationSetting | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // App Configuration Modal State
  const [configApiKey, setConfigApiKey] = useState('');
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [configLive, setConfigLive] = useState(true);
  const [configEnabled, setConfigEnabled] = useState(true);

  // Sync when apps change in another window/tab
  useEffect(() => {
    const handleUpdate = () => {
      setApps(getStoredIntegrationApps());
    };
    window.addEventListener(APPS_SETTINGS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(APPS_SETTINGS_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleToggleApp = (appId: string) => {
    const updated = apps.map((a) => {
      if (a.id === appId) {
        const nextEnabled = !a.enabled;
        return {
          ...a,
          enabled: nextEnabled,
          status: (nextEnabled ? 'Connected' : 'Disabled') as 'Connected' | 'Configuring' | 'Disabled'
        };
      }
      return a;
    });
    setApps(updated);
    saveIntegrationApps(updated);

    const toggled = updated.find((a) => a.id === appId);
    if (toggled) {
      showToast(
        toggled.enabled
          ? `✅ '${toggled.name}' এনাবল করা হয়েছে (Fast Checkout-এ সচল)`
          : `⚠️ '${toggled.name}' ডিজেবল করা হয়েছে (Fast Checkout থেকে লুকানো হয়েছে)`
      );
    }
  };

  const handleOpenConfig = (app: AppIntegrationSetting) => {
    setSelectedApp(app);
    setConfigApiKey(app.apiKey);
    setConfigEndpoint(app.endpoint);
    setConfigLive(app.live);
    setConfigEnabled(app.enabled ?? true);
    setTestResult(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const updated = apps.map((a) =>
      a.id === selectedApp.id
        ? {
            ...a,
            apiKey: configApiKey,
            endpoint: configEndpoint,
            live: configLive,
            enabled: configEnabled,
            status: (configEnabled ? 'Connected' : 'Disabled') as 'Connected' | 'Configuring' | 'Disabled'
          }
        : a
    );

    setApps(updated);
    saveIntegrationApps(updated);

    showToast(`${selectedApp.name} কনফিগারেশন ও স্ট্যাটাস সফলভাবে সেভ করা হয়েছে!`);
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
    const newInstalled: AppIntegrationSetting = {
      id: app.id,
      name: app.name,
      category: app.category,
      description: app.description,
      status: 'Connected',
      iconBg: app.iconBg,
      iconText: app.iconText,
      apiKey: `key_${Date.now()}`,
      endpoint: `https://api.partner.com/v1`,
      live: true,
      enabled: true
    };
    const updated = [newInstalled, ...apps];
    setApps(updated);
    saveIntegrationApps(updated);
    showToast(`${app.name} সফলভাবে ইনস্টল ও Fast Checkout-এ যুক্ত করা হয়েছে!`);
    setIsStoreModalOpen(false);
  };

  const handleUninstallApp = (appId: string, appName: string) => {
    if (confirm(`Uninstall ${appName}?`)) {
      const updated = apps.filter((a) => a.id !== appId);
      setApps(updated);
      saveIntegrationApps(updated);
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

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-mono">
                  {app.live ? '● Live Mode' : '○ Sandbox'}
                </span>
                <span className="text-gray-300">|</span>
                <span className={`text-[10.5px] font-semibold flex items-center gap-1 ${app.enabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {app.enabled ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                  {app.enabled ? 'Fast Checkout: Active' : 'Fast Checkout: Hidden'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 1-Click Enable / Disable Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleApp(app.id)}
                  title={app.enabled ? 'Click to Disable from Fast Express Checkout' : 'Click to Enable in Fast Express Checkout'}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    app.enabled
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
                  }`}
                >
                  {app.enabled ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-white" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-gray-500" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>

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

            <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
              <div>
                <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fast Express Checkout Visibility</span>
                </span>
                <span className="text-[11px] text-gray-600">
                  Enable or disable this integration in customer Fast Express Checkout modal
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configEnabled}
                  onChange={(e) => setConfigEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
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
