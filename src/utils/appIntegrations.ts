export interface AppIntegrationSetting {
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
  enabled: boolean; // Enable/Disable toggle controlling presence in Fast Express Checkout
}

export const APPS_SETTINGS_STORAGE_KEY = 'banglaxpress_installed_apps';
export const APPS_SETTINGS_UPDATED_EVENT = 'bx_apps_settings_updated';

export const DEFAULT_INTEGRATION_APPS: AppIntegrationSetting[] = [
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
    live: true,
    enabled: true
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
    live: true,
    enabled: true
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
    live: true,
    enabled: true
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
    live: true,
    enabled: true
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
    live: true,
    enabled: true
  }
];

export function getStoredIntegrationApps(): AppIntegrationSetting[] {
  try {
    const raw = localStorage.getItem(APPS_SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every item has enabled property
        return parsed.map((item) => ({
          ...item,
          enabled: item.enabled !== undefined ? item.enabled : item.status !== 'Disabled'
        }));
      }
    }
  } catch (e) {
    console.error('Failed to parse integration apps from storage:', e);
  }
  return DEFAULT_INTEGRATION_APPS;
}

export function saveIntegrationApps(apps: AppIntegrationSetting[]): void {
  try {
    localStorage.setItem(APPS_SETTINGS_STORAGE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new Event(APPS_SETTINGS_UPDATED_EVENT));
  } catch (e) {
    console.error('Failed to save integration apps:', e);
  }
}
