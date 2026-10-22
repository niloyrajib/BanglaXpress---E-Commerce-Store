import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  CreditCard,
  Truck,
  Bell,
  Lock,
  Globe,
  Store,
  CheckCircle2,
  Save,
  DollarSign,
  Key,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  Sliders,
  Send,
  Zap,
  HelpCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Code,
  Sparkles,
  X,
  ChevronRight,
  ShieldAlert,
  Server,
  Search,
  Building2,
  Users,
  ShoppingCart,
  UserCheck,
  FileText,
  MapPin,
  Layers,
  Activity,
  Mail,
  FileCode,
  Folder,
  ScrollText,
  Receipt,
  Percent,
  Smartphone,
  Share2,
  Clock,
  ArrowRight,
  Download,
  Shield,
  MessageCircle
} from 'lucide-react';
import { CustomPaymentGateway, Product } from '../../../types';
import { ShopifyVendorPaymentsView } from './ShopifyVendorPaymentsView';
import { ShopifyBillingView } from './ShopifyBillingView';

interface ShopifySettingsViewProps {
  showToast?: (message: string) => void;
  products?: Product[];
}

interface PaymentPreset {
  id: string;
  name: string;
  provider: string;
  category: 'mfs' | 'card' | 'net_banking' | 'international' | 'custom';
  iconBg: string;
  iconText: string;
  endpointUrl: string;
  currency: string;
  checkoutInstructions: string;
  sampleKey: string;
  sampleSecret: string;
  description: string;
}

const PAYMENT_PRESETS: PaymentPreset[] = [
  {
    id: 'preset-upay',
    name: 'Upay Merchant Checkout API',
    provider: 'Upay (UCB)',
    category: 'mfs',
    iconBg: '#0057B8',
    iconText: 'Up',
    endpointUrl: 'https://pg.api.upay.systems/payment/v1/initiate-payment',
    currency: 'BDT (৳)',
    checkoutInstructions: 'আপনার Upay অ্যাপ অথবা *২৬৮# ডায়াল করে মোট টাকা পেমেন্ট সম্পন্ন করে প্রাপ্ত TrxID প্রদান করুন।',
    sampleKey: 'upay_live_client_8492019482',
    sampleSecret: 'upay_sec_99381029482910482',
    description: 'UCB-এর ডিজিটাল ওয়ালেট Upay ডিরেক্ট চেকআউট এপিআই ইন্টিগ্রেশন।'
  },
  {
    id: 'preset-rocket',
    name: 'Rocket Merchant Direct Gateway',
    provider: 'DBBL Rocket',
    category: 'mfs',
    iconBg: '#8C1D82',
    iconText: 'Rk',
    endpointUrl: 'https://rocket.dutchbanglabank.com/api/v2/payment/direct',
    currency: 'BDT (৳)',
    checkoutInstructions: 'ডাচ-বাংলা রকেট একাউন্ট থেকে Merchant Pay অপশনে গিয়ে পেমেন্ট করুন এবং প্রাপ্ত ট্রানজেকশন আইডি (TrxID) দিন।',
    sampleKey: 'dbbl_rocket_live_992014820',
    sampleSecret: 'dbbl_sec_88492019482019',
    description: 'ডাচ-বাংলা ব্যাংকের রকেট মোবাইল ওয়ালেটের অফিসিয়াল মার্চেন্ট এপিআই।'
  },
  {
    id: 'preset-aamarpay',
    name: 'AamarPay Unified Payment Gateway',
    provider: 'AamarPay',
    category: 'card',
    iconBg: '#0E4378',
    iconText: 'AP',
    endpointUrl: 'https://secure.aamarpay.com/request.php',
    currency: 'BDT (৳)',
    checkoutInstructions: 'আমারপে নিরাপদ গেটওয়ে দিয়ে ভিসা, মাস্টারকার্ড ও ইন্টারনেট ব্যাংকিং পেমেন্ট।',
    sampleKey: 'aamar_live_store_9938102',
    sampleSecret: 'aamar_sec_44920194820',
    description: 'লোকাল ও ইন্টারন্যাশনাল কার্ড, নেট ব্যাংকিং এবং এমএফএস সমন্বিত এপিআই।'
  },
  {
    id: 'preset-shurjopay',
    name: 'Shurjopay Merchant Gateway',
    provider: 'Shurjopay',
    category: 'net_banking',
    iconBg: '#EA1D24',
    iconText: 'Sp',
    endpointUrl: 'https://engine.shurjopay.com/api/get_token',
    currency: 'BDT (৳)',
    checkoutInstructions: 'সূর্যপে সিকিউর পেমেন্ট গেটওয়ের মাধ্যমে সরাসরি পরিশোধ করুন।',
    sampleKey: 'sp_live_key_993810294827',
    sampleSecret: 'sp_token_482910482910',
    description: 'বাংলাদেশ ব্যাংকের লাইসেন্সপ্রাপ্ত পিএসও সূর্যপে চেকআউট ইঞ্জিন।'
  },
  {
    id: 'preset-stripe',
    name: 'Stripe Global Card Payments',
    provider: 'Stripe',
    category: 'international',
    iconBg: '#635BFF',
    iconText: 'St',
    endpointUrl: 'https://api.stripe.com/v1/payment_intents',
    currency: 'USD ($)',
    checkoutInstructions: 'Accept all global Visa, MasterCard, and Amex credit/debit cards.',
    sampleKey: 'pk_live_51N2xXXXXXXXXXXXXXXX',
    sampleSecret: 'sk_live_51N2xXXXXXXXXXXXXXXX',
    description: 'গ্লোবাল ক্রস-বর্ডার পেমেন্ট প্রসেসিং ও আন্তর্জাতিক কার্ড ইন্টিগ্রেশন।'
  },
  {
    id: 'preset-custom',
    name: 'Custom REST Payment Gateway',
    provider: 'Custom Bank / FinTech API',
    category: 'custom',
    iconBg: '#0F172A',
    iconText: 'API',
    endpointUrl: 'https://api.yourbank-gateway.com/v1/checkout/initialize',
    currency: 'BDT (৳)',
    checkoutInstructions: 'কাস্টম ফিনটেক গেটওয়ে বা মার্চেন্ট এপিআই এর মাধ্যমে পরিশোধ।',
    sampleKey: 'custom_live_client_key_001',
    sampleSecret: 'custom_live_secret_token_001',
    description: 'যেকোনো কাস্টম ব্যাংক বা ফিনটেক কোম্পানির নিজস্ব REST / JSON API ইন্টিগ্রেশন।'
  }
];

const DEFAULT_CUSTOM_GATEWAYS: CustomPaymentGateway[] = [
  {
    id: 'gw-upay',
    name: 'Upay Merchant Payment API',
    category: 'mfs',
    provider: 'Upay (UCB)',
    description: 'UCB Upay Direct merchant checkout API for instant auto payment reconciliation.',
    enabled: true,
    mode: 'live',
    iconBg: '#0057B8',
    iconText: 'Up',
    merchantId: 'UPAY_MCH_88201',
    apiKey: 'upay_live_client_8492019482',
    apiSecret: 'upay_sec_99381029482910482',
    endpointUrl: 'https://pg.api.upay.systems/payment/v1/initiate-payment',
    webhookUrl: 'https://api.banglaxpress.store/v1/payments/upay/callback',
    currency: 'BDT (৳)',
    checkoutInstructions: 'আপনার Upay অ্যাপ থেকে টাকা পাঠিয়ে প্রাপ্ত TrxID প্রদান করুন।',
    testStatus: 'Verified (Latency: 110ms • 200 OK)',
    createdAt: '2025-01-15'
  },
  {
    id: 'gw-rocket',
    name: 'Rocket Merchant Direct Gateway',
    category: 'mfs',
    provider: 'DBBL Rocket',
    description: 'Dutch-Bangla Bank Rocket mobile banking direct API.',
    enabled: true,
    mode: 'live',
    iconBg: '#8C1D82',
    iconText: 'Rk',
    merchantId: '018123456789',
    apiKey: 'dbbl_rocket_live_992014820',
    apiSecret: 'dbbl_sec_88492019482019',
    endpointUrl: 'https://rocket.dutchbanglabank.com/api/v2/payment/direct',
    webhookUrl: 'https://api.banglaxpress.store/v1/payments/rocket/callback',
    currency: 'BDT (৳)',
    checkoutInstructions: 'ডাচ-বাংলা রকেট একাউন্ট থেকে পেমেন্ট করে TrxID প্রদান করুন।',
    testStatus: 'Verified (Latency: 135ms • 200 OK)',
    createdAt: '2025-02-01'
  }
];

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Operations Manager' | 'Customer Support' | 'Fulfillment Lead';
  status: 'Active' | 'Invited';
  permissions: string[];
}

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  isDefault: boolean;
  fulfillmentActive: boolean;
}

export type SettingsNavTab =
  | 'general'
  | 'plan'
  | 'billing'
  | 'users'
  | 'payments'
  | 'vendor_payments'
  | 'checkout'
  | 'customer_accounts'
  | 'shipping'
  | 'courier'
  | 'taxes'
  | 'locations'
  | 'markets'
  | 'apps'
  | 'domains'
  | 'pixels'
  | 'sms'
  | 'notifications'
  | 'custom_data'
  | 'files'
  | 'policies'
  | 'security'
  | 'api_tokens';

export const ShopifySettingsView: React.FC<ShopifySettingsViewProps> = ({
  showToast = (msg: string) => alert(msg),
  products = []
}) => {
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<SettingsNavTab>('general');
  const [navSearchQuery, setNavSearchQuery] = useState('');

  // 1. General Store Details
  const [storeName, setStoreName] = useState('BanglaXpress');
  const [storeLegalName, setStoreLegalName] = useState('BanglaXpress E-Commerce Ltd.');
  const [storeEmail, setStoreEmail] = useState('support@banglaxpress.com.bd');
  const [phone, setPhone] = useState('+880 1800-000000');
  const [address, setAddress] = useState('House 42, Road 11, Banani, Dhaka-1213, Bangladesh');
  const [city, setCity] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('1213');
  const [country, setCountry] = useState('Bangladesh');
  const [currency, setCurrency] = useState('BDT (৳)');
  const [timezone, setTimezone] = useState('Asia/Dhaka (GMT+6)');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [orderPrefix, setOrderPrefix] = useState('#BX-');
  const [orderSuffix, setOrderSuffix] = useState('');

  // 2. Plan & Billing
  const [billingPlan, setBillingPlan] = useState('Shopify Plus Enterprise');
  const [billingCycle, setBillingCycle] = useState('Yearly (Renews 2026-12-31)');
  const [billingCard, setBillingCard] = useState('Visa ending in 4829 (Exp: 08/28)');
  const [businessTin, setBusinessTin] = useState('003928194-0103');

  // 3. Users & Permissions
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 'staff-1',
      name: 'Niloy Rajib',
      email: 'niloyrajib@gmail.com',
      role: 'Owner',
      status: 'Active',
      permissions: ['All Permissions', 'Financials', 'Apps', 'Settings']
    },
    {
      id: 'staff-2',
      name: 'Tanvir Ahmed',
      email: 'tanvir.ops@banglaxpress.com',
      role: 'Operations Manager',
      status: 'Active',
      permissions: ['Orders', 'Products', 'Inventory', 'Customers']
    },
    {
      id: 'staff-3',
      name: 'Nusrat Jahan',
      email: 'nusrat.support@banglaxpress.com',
      role: 'Customer Support',
      status: 'Active',
      permissions: ['Orders', 'Messages', 'Reviews']
    },
    {
      id: 'staff-4',
      name: 'Arif Hossain',
      email: 'arif.warehouse@banglaxpress.com',
      role: 'Fulfillment Lead',
      status: 'Active',
      permissions: ['Fulfillment', 'Transfers', 'Inventory']
    }
  ]);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffMember['role']>('Operations Manager');
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(true);

  // 4. Payment Gateways
  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [bkashMode, setBkashMode] = useState<'sandbox' | 'live'>('live');
  const [bkashAppKey, setBkashAppKey] = useState('bK_live_app_key_88391047291');
  const [bkashAppSecret, setBkashAppSecret] = useState('••••••••••••••••••••••••••••');
  const [bkashUsername, setBkashUsername] = useState('banglaxpress_live');
  const [bkashPassword, setBkashPassword] = useState('••••••••••••');
  const [bkashTesting, setBkashTesting] = useState(false);
  const [bkashStatusText, setBkashStatusText] = useState<string | null>('Connected & Active');

  const [nagadEnabled, setNagadEnabled] = useState(true);
  const [nagadMode, setNagadMode] = useState<'sandbox' | 'live'>('live');
  const [nagadMerchantId, setNagadMerchantId] = useState('68291048291');
  const [nagadPublicKey, setNagadPublicKey] = useState('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...');
  const [nagadPrivateKey, setNagadPrivateKey] = useState('••••••••••••••••••••••••••••••••••••••••••••••••');
  const [nagadTesting, setNagadTesting] = useState(false);
  const [nagadStatusText, setNagadStatusText] = useState<string | null>('Connected & Active');

  const [sslEnabled, setSslEnabled] = useState(false);
  const [sslStoreId, setSslStoreId] = useState('banglaxpresslive');
  const [sslStorePass, setSslStorePass] = useState('••••••••••••••••');
  const [sslMode, setSslMode] = useState<'sandbox' | 'live'>('sandbox');
  const [sslTesting, setSslTesting] = useState(false);

  const [codEnabled, setCodEnabled] = useState(true);

  // Custom Gateways List
  const [customGateways, setCustomGateways] = useState<CustomPaymentGateway[]>(() => {
    try {
      const saved = localStorage.getItem('banglaxpress_custom_gateways');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CUSTOM_GATEWAYS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('banglaxpress_custom_gateways', JSON.stringify(customGateways));
      window.dispatchEvent(new CustomEvent('payment_gateways_updated'));
    } catch (e) {
      console.error(e);
    }
  }, [customGateways]);

  // Modal State for Custom Gateways
  const [isCreateMethodModalOpen, setIsCreateMethodModalOpen] = useState(false);
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('Custom API');
  const [formCategory, setFormCategory] = useState<CustomPaymentGateway['category']>('mfs');
  const [formMode, setFormMode] = useState<'sandbox' | 'live'>('live');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formIconBg, setFormIconBg] = useState('#0057B8');
  const [formIconText, setFormIconText] = useState('API');
  const [formMerchantId, setFormMerchantId] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiSecret, setFormApiSecret] = useState('');
  const [formEndpointUrl, setFormEndpointUrl] = useState('');
  const [formWebhookUrl, setFormWebhookUrl] = useState('');
  const [formCurrency, setFormCurrency] = useState('BDT (৳)');
  const [formDescription, setFormDescription] = useState('');
  const [formCheckoutInstructions, setFormCheckoutInstructions] = useState('');
  const [showSecretInModal, setShowSecretInModal] = useState(false);
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [gatewayTestResult, setGatewayTestResult] = useState<{
    success: boolean;
    message: string;
    latency: string;
    timestamp: string;
  } | null>(null);

  // 5. Checkout & Fast Order
  const [fastCheckoutEnabled, setFastCheckoutEnabled] = useState(true);
  const [contactMethod, setContactMethod] = useState<'phone' | 'email_or_phone'>('phone');
  const [requireFullAddress, setRequireFullAddress] = useState(true);
  const [autoFulfillDigital, setAutoFulfillDigital] = useState(false);
  const [autoArchiveOrders, setAutoArchiveOrders] = useState(true);
  const [abandonedRecoveryHours, setAbandonedRecoveryHours] = useState('1');

  // 6. Customer Accounts
  const [accountsMode, setAccountsMode] = useState<'optional' | 'disabled' | 'required'>('optional');
  const [mobileOtpLogin, setMobileOtpLogin] = useState(true);
  const [googleOneTap, setGoogleOneTap] = useState(true);

  // 7. Shipping Rates
  const [dhakaRate, setDhakaRate] = useState(60);
  const [suburbRate, setSuburbRate] = useState(100);
  const [outsideDhakaRate, setOutsideDhakaRate] = useState(120);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
  const [dhakaDeliveryDays, setDhakaDeliveryDays] = useState('1-2 Days');
  const [outsideDeliveryDays, setOutsideDeliveryDays] = useState('3-5 Days');

  // 8. Courier APIs
  const [steadfastEnabled, setSteadfastEnabled] = useState(true);
  const [steadfastApiKey, setSteadfastApiKey] = useState('sf_live_key_99381029482710');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState('••••••••••••••••••••••••••••••••');
  const [steadfastAutoDispatch, setSteadfastAutoDispatch] = useState(true);
  const [steadfastTesting, setSteadfastTesting] = useState(false);
  const [steadfastStatusText, setSteadfastStatusText] = useState<string | null>('Connected (Balance: ৳14,580)');

  const [pathaoEnabled, setPathaoEnabled] = useState(true);
  const [pathaoClientId, setPathaoClientId] = useState('pt_client_8492019482');
  const [pathaoClientSecret, setPathaoClientSecret] = useState('••••••••••••••••••••••••');
  const [pathaoStoreId, setPathaoStoreId] = useState('14920');
  const [pathaoTesting, setPathaoTesting] = useState(false);
  const [pathaoStatusText, setPathaoStatusText] = useState<string | null>('Connected & Active');

  const [redxEnabled, setRedxEnabled] = useState(false);
  const [redxApiToken, setRedxApiToken] = useState('redx_token_991823719482');

  // 9. Taxes & Duties (VAT)
  const [vatRate, setVatRate] = useState(5);
  const [pricesIncludeVat, setPricesIncludeVat] = useState(true);
  const [chargeVatOnShipping, setChargeVatOnShipping] = useState(false);
  const [vatRegistrationNumber, setVatRegistrationNumber] = useState('BIN-003928194-0103');

  // 10. Locations & Warehouses
  const [locations, setLocations] = useState<LocationItem[]>([
    {
      id: 'loc-1',
      name: 'Banani Central Hub (Primary Warehouse)',
      address: 'House 42, Road 11, Banani',
      city: 'Dhaka',
      phone: '+880 1800-000000',
      isDefault: true,
      fulfillmentActive: true
    },
    {
      id: 'loc-2',
      name: 'Chittagong Port Distribution Center',
      address: 'Plot 18, Agrabad Commercial Area',
      city: 'Chittagong',
      phone: '+880 1800-000001',
      isDefault: false,
      fulfillmentActive: true
    },
    {
      id: 'loc-3',
      name: 'Uttara Express Delivery Depot',
      address: 'Sector 3, Jashimuddin Avenue',
      city: 'Dhaka',
      phone: '+880 1800-000002',
      isDefault: false,
      fulfillmentActive: true
    }
  ]);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocCity, setNewLocCity] = useState('Dhaka');
  const [newLocPhone, setNewLocPhone] = useState('+880 1800-000000');

  // 11. Markets & Currencies
  const [primaryMarket, setPrimaryMarket] = useState('Bangladesh (BDT ৳)');
  const [internationalMarketActive, setInternationalMarketActive] = useState(true);
  const [exchangeRateUsd, setExchangeRateUsd] = useState(122.5);

  // 12. Apps & Sales Channels
  const [facebookChannelActive, setFacebookChannelActive] = useState(true);
  const [tiktokChannelActive, setTiktokChannelActive] = useState(true);
  const [dropshipImporterActive, setDropshipImporterActive] = useState(true);
  const [posActive, setPosActive] = useState(true);

  // 13. Domains & SSL
  const [primaryDomain, setPrimaryDomain] = useState('banglaxpress.com.bd');
  const [myshopifyDomain, setMyshopifyDomain] = useState('banglaxpress.myshopify.com');
  const [sslStatus, setSslStatus] = useState('Active (Auto-Renewed TLS 1.3)');

  // 14. Pixels & Customer Events
  const [metaPixelId, setMetaPixelId] = useState('984201948291048');
  const [metaCapiToken, setMetaCapiToken] = useState('EAAG...capi_token_9918420');
  const [ga4MeasurementId, setGa4MeasurementId] = useState('G-BX98421094');
  const [tiktokPixelId, setTiktokPixelId] = useState('C984201948291048');
  const [gtmContainerId, setGtmContainerId] = useState('GTM-BX84920');

  // 15. SMS & WhatsApp Gateway
  const [smsProvider, setSmsProvider] = useState<'greenweb' | 'bulksmsbd' | 'alphanet'>('greenweb');
  const [smsApiToken, setSmsApiToken] = useState('gw_token_9918237194829104');
  const [smsSenderId, setSmsSenderId] = useState('BANGLAXPRESS');
  const [smsOrderPlaced, setSmsOrderPlaced] = useState(true);
  const [smsDispatched, setSmsDispatched] = useState(true);
  const [smsDelivered, setSmsDelivered] = useState(true);
  const [testPhoneNumber, setTestPhoneNumber] = useState('01812345678');
  const [smsTesting, setSmsTesting] = useState(false);
  const [whatsAppApiActive, setWhatsAppApiActive] = useState(true);
  const [whatsAppNumberId, setWhatsAppNumberId] = useState('109482019482019');

  // 16. Notifications & Templates
  const [orderConfirmTemplate, setOrderConfirmTemplate] = useState(
    'প্রিয় {customer_name}, BanglaXpress-এ আপনার অর্ডার {order_id} সফলভাবে সম্পন্ন হয়েছে। মোট মূল্য: ৳{total_amount}। শীঘ্রই আপনার পার্সেল ডেলিভারিতে পাঠানো হবে।'
  );
  const [dispatchTemplate, setDispatchTemplate] = useState(
    'প্রিয় {customer_name}, আপনার অর্ডার {order_id} কুরিয়ারে হস্তান্তর করা হয়েছে। ট্র্যাকিং কোড: {tracking_code}। ট্র্যাকিং লিঙ্ক: {tracking_link}'
  );

  // 17. Custom Data & Metafields
  const [metafieldWarranty, setMetafieldWarranty] = useState(true);
  const [metafieldOrigin, setMetafieldOrigin] = useState(true);
  const [metafieldVideoDemo, setMetafieldVideoDemo] = useState(true);

  // 18. Files
  const [cdnStorageUsed, setCdnStorageUsed] = useState('2.4 GB');
  const [cdnStorageTotal, setCdnStorageTotal] = useState('50 GB');

  // 19. Policies & Legal
  const [refundPolicy, setRefundPolicy] = useState(
    'BanglaXpress এ পণ্য পাওয়ার পর কোনো সমস্যা বা ত্রুটি থাকলে ৭ দিনের মধ্যে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট পাবেন। ইনভয়েস এবং অরিজিনাল প্যাকেজিং সহ আমাদের হটলাইনে যোগাযোগ করুন।'
  );
  const [privacyPolicy, setPrivacyPolicy] = useState(
    'আমরা আপনার ব্যক্তিগত তথ্য (নাম, ঠিকানা, ফোন নম্বর) সম্পূর্ণ সুরক্ষিত রাখি এবং শুধুমাত্র অর্ডার ডেলিভারির প্রয়োজনে ব্যবহার করি।'
  );
  const [termsOfService, setTermsOfService] = useState(
    'BanglaXpress-এ অর্ডার প্রদান করার মাধ্যমে আপনি আমাদের ডেলিভারি ও রিটার্ন সংক্রান্ত সকল নীতিমালার সাথে একমত প্রকাশ করছেন।'
  );
  const [shippingPolicy, setShippingPolicy] = useState(
    'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারের মাধ্যমে ডেলিভারি সম্পন্ন করা হয়।'
  );

  // 20. Security & Fraud Protection
  const [requireOtpCod, setRequireOtpCod] = useState(true);
  const [requireAdvanceDeliveryCharge, setRequireAdvanceDeliveryCharge] = useState(false);
  const [advanceFeeAmount, setAdvanceFeeAmount] = useState(100);
  const [minOrderValue, setMinOrderValue] = useState(200);
  const [blacklistNumbers, setBlacklistNumbers] = useState<string[]>([
    '01999999999',
    '01888888888',
    '01777777777'
  ]);
  const [newBlacklistInput, setNewBlacklistInput] = useState('');

  // 21. API Tokens
  const [storefrontToken, setStorefrontToken] = useState('shpat_3910f48b89c72e90147a59e8832a0f');
  const [adminApiKey, setAdminApiKey] = useState('shpca_99201a4e58b1940e729a8f2c31048b');
  const [webhookSecret, setWebhookSecret] = useState('whsec_83910c8f92104ea71b9c20148e');
  const [showTokens, setShowTokens] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helpers
  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showToast(`${keyName} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestBkash = () => {
    setBkashTesting(true);
    setTimeout(() => {
      setBkashTesting(false);
      setBkashStatusText('Connection Verified (Latency: 128ms)');
      showToast('bKash API Handshake Verified! Payment Token Generated.');
    }, 1200);
  };

  const handleTestNagad = () => {
    setNagadTesting(true);
    setTimeout(() => {
      setNagadTesting(false);
      setNagadStatusText('Connection Verified (Latency: 142ms)');
      showToast('Nagad API Handshake Verified! Public Key Authenticated.');
    }, 1200);
  };

  const handleTestSteadfast = () => {
    setSteadfastTesting(true);
    setTimeout(() => {
      setSteadfastTesting(false);
      setSteadfastStatusText('Connected (Balance: ৳14,580 • Latency: 95ms)');
      showToast('Steadfast Courier API Sync Verified! Balance: ৳14,580');
    }, 1000);
  };

  const handleTestPathao = () => {
    setPathaoTesting(true);
    setTimeout(() => {
      setPathaoTesting(false);
      setPathaoStatusText('Connected & Active (OAuth 2.0 Token Valid)');
      showToast('Pathao Courier API Verified! Store ID Synced.');
    }, 1000);
  };

  const handleTestSms = () => {
    if (!testPhoneNumber.trim()) {
      showToast('অনুগ্রহ করে টেস্ট ফোন নম্বর লিখুন');
      return;
    }
    setSmsTesting(true);
    setTimeout(() => {
      setSmsTesting(false);
      showToast(`টেস্ট SMS সফলভাবে পাঠানো হয়েছে: ${testPhoneNumber}`);
    }, 1100);
  };

  const handleTestCustomGatewayInModal = () => {
    if (!formEndpointUrl.trim()) {
      showToast('অনুগ্রহ করে API Endpoint URL প্রদান করুন');
      return;
    }
    setIsTestingGateway(true);
    setGatewayTestResult(null);
    setTimeout(() => {
      setIsTestingGateway(false);
      setGatewayTestResult({
        success: true,
        message: 'API Handshake Successful (200 OK)',
        latency: `${Math.floor(90 + Math.random() * 60)}ms`,
        timestamp: new Date().toLocaleTimeString()
      });
      showToast('API সংযোগ সফল! রেসপন্স কোড 200 OK পাওয়া গিয়েছে।');
    }, 1100);
  };

  const handleOpenCreateModal = () => {
    setEditingGatewayId(null);
    setFormName('');
    setFormProvider('Custom API');
    setFormCategory('mfs');
    setFormMode('live');
    setFormEnabled(true);
    setFormIconBg('#0057B8');
    setFormIconText('API');
    setFormMerchantId('');
    setFormApiKey('');
    setFormApiSecret('');
    setFormEndpointUrl('');
    setFormWebhookUrl(`https://api.banglaxpress.store/v1/payments/gw-${Date.now()}/callback`);
    setFormCurrency('BDT (৳)');
    setFormDescription('');
    setFormCheckoutInstructions('');
    setShowSecretInModal(false);
    setGatewayTestResult(null);
    setIsCreateMethodModalOpen(true);
  };

  const handleOpenEditModal = (gw: CustomPaymentGateway) => {
    setEditingGatewayId(gw.id);
    setFormName(gw.name);
    setFormProvider(gw.provider || 'Custom API');
    setFormCategory(gw.category);
    setFormMode(gw.mode);
    setFormEnabled(gw.enabled);
    setFormIconBg(gw.iconBg);
    setFormIconText(gw.iconText);
    setFormMerchantId(gw.merchantId);
    setFormApiKey(gw.apiKey);
    setFormApiSecret(gw.apiSecret || '');
    setFormEndpointUrl(gw.endpointUrl);
    setFormWebhookUrl(gw.webhookUrl);
    setFormCurrency(gw.currency);
    setFormDescription(gw.description || '');
    setFormCheckoutInstructions(gw.checkoutInstructions || '');
    setShowSecretInModal(false);
    setGatewayTestResult(null);
    setIsCreateMethodModalOpen(true);
  };

  const handleSelectPreset = (preset: PaymentPreset) => {
    setFormName(preset.name);
    setFormProvider(preset.provider);
    setFormCategory(preset.category);
    setFormIconBg(preset.iconBg);
    setFormIconText(preset.iconText);
    setFormEndpointUrl(preset.endpointUrl);
    setFormCurrency(preset.currency);
    setFormCheckoutInstructions(preset.checkoutInstructions);
    setFormApiKey(preset.sampleKey);
    setFormApiSecret(preset.sampleSecret);
    setFormDescription(preset.description);
    setFormWebhookUrl(`https://api.banglaxpress.store/v1/payments/${preset.id}/callback`);
    showToast(`প্রিসেট "${preset.name}" লোড করা হয়েছে!`);
  };

  const handleSaveCustomGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('অনুগ্রহ করে পেমেন্ট মেথডের নাম লিখুন');
      return;
    }
    if (!formEndpointUrl.trim()) {
      showToast('অনুগ্রহ করে API Endpoint URL লিখুন');
      return;
    }
    if (!formApiKey.trim()) {
      showToast('অনুগ্রহ করে API Key / Client ID লিখুন');
      return;
    }

    if (editingGatewayId) {
      setCustomGateways((prev) =>
        prev.map((g) =>
          g.id === editingGatewayId
            ? {
                ...g,
                name: formName.trim(),
                provider: formProvider.trim() || 'Custom API',
                category: formCategory,
                mode: formMode,
                enabled: formEnabled,
                iconBg: formIconBg,
                iconText: formIconText.trim() || 'API',
                merchantId: formMerchantId.trim(),
                apiKey: formApiKey.trim(),
                apiSecret: formApiSecret.trim(),
                endpointUrl: formEndpointUrl.trim(),
                webhookUrl: formWebhookUrl.trim(),
                currency: formCurrency,
                description: formDescription.trim(),
                checkoutInstructions: formCheckoutInstructions.trim(),
                testStatus: gatewayTestResult?.success
                  ? `Verified (Latency: ${gatewayTestResult.latency} • 200 OK)`
                  : g.testStatus
              }
            : g
        )
      );
      showToast(`"${formName}" পেমেন্ট এপিআই কনফিগারেশন আপডেট করা হয়েছে!`);
    } else {
      const newGateway: CustomPaymentGateway = {
        id: `gw-${Date.now()}`,
        name: formName.trim(),
        provider: formProvider.trim() || 'Custom API',
        category: formCategory,
        mode: formMode,
        enabled: formEnabled,
        iconBg: formIconBg,
        iconText: formIconText.trim() || 'API',
        merchantId: formMerchantId.trim(),
        apiKey: formApiKey.trim(),
        apiSecret: formApiSecret.trim(),
        endpointUrl: formEndpointUrl.trim(),
        webhookUrl: formWebhookUrl.trim() || `https://api.banglaxpress.store/v1/payments/gw-${Date.now()}/callback`,
        currency: formCurrency,
        description: formDescription.trim() || `${formProvider} payment integration.`,
        checkoutInstructions: formCheckoutInstructions.trim(),
        testStatus: gatewayTestResult?.success
          ? `Verified (Latency: ${gatewayTestResult.latency} • 200 OK)`
          : 'Ready & Connected',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCustomGateways((prev) => [newGateway, ...prev]);
      showToast(`নতুন পেমেন্ট মেথড "${formName}" সফলভাবে তৈরি ও সক্রিয় করা হয়েছে!`);
    }

    setIsCreateMethodModalOpen(false);
  };

  const handleDeleteCustomGateway = (gwId: string, gwName: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${gwName}" পেমেন্ট মেথডটি ডিলিট করতে চান?`)) {
      setCustomGateways((prev) => prev.filter((g) => g.id !== gwId));
      showToast(`"${gwName}" পেমেন্ট মেথডটি ডিলিট করা হয়েছে`);
    }
  };

  const handleToggleGatewayStatus = (gwId: string) => {
    setCustomGateways((prev) =>
      prev.map((g) => (g.id === gwId ? { ...g, enabled: !g.enabled } : g))
    );
    const target = customGateways.find((g) => g.id === gwId);
    if (target) {
      showToast(`${target.name} ${!target.enabled ? 'Enabled' : 'Disabled'}`);
    }
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    showToast('সবগুলো সেটিংস এবং ব্যাকএন্ড ফিচার সফলভাবে সেভ করা হয়েছে!');
  };

  // Blacklist Management
  const handleAddBlacklist = () => {
    if (!newBlacklistInput.trim()) return;
    if (blacklistNumbers.includes(newBlacklistInput.trim())) {
      showToast('এই নম্বরটি ইতিমধ্যে ব্ল্যাকলিস্টে রয়েছে');
      return;
    }
    setBlacklistNumbers([...blacklistNumbers, newBlacklistInput.trim()]);
    setNewBlacklistInput('');
    showToast('নম্বরটি সফলভাবে ব্ল্যাকলিস্টে যোগ করা হয়েছে');
  };

  const handleRemoveBlacklist = (num: string) => {
    setBlacklistNumbers(blacklistNumbers.filter((n) => n !== num));
    showToast(`${num} ব্ল্যাকলিস্ট থেকে মুছে ফেলা হয়েছে`);
  };

  // Add Staff Member
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      showToast('স্টাফের নাম এবং ইমেইল প্রদান করুন');
      return;
    }
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      status: 'Active',
      permissions: ['Orders', 'Products', 'Inventory']
    };
    setStaffMembers([...staffMembers, newStaff]);
    setIsAddStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    showToast(`নতুন স্টাফ "${newStaff.name}" যুক্ত করা হয়েছে!`);
  };

  // Add Location
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocAddress.trim()) {
      showToast('লোকেশন নাম ও ঠিকানা প্রদান করুন');
      return;
    }
    const newLoc: LocationItem = {
      id: `loc-${Date.now()}`,
      name: newLocName.trim(),
      address: newLocAddress.trim(),
      city: newLocCity,
      phone: newLocPhone,
      isDefault: false,
      fulfillmentActive: true
    };
    setLocations([...locations, newLoc]);
    setIsAddLocationModalOpen(false);
    setNewLocName('');
    setNewLocAddress('');
    showToast(`নতুন ওয়্যারহাউজ "${newLoc.name}" তৈরি হয়েছে!`);
  };

  // Navigation Items Definition
  const NAV_ITEMS = [
    { id: 'general', label: 'Store details', icon: Store, group: 'General', desc: 'Basic info, address, currency & formats' },
    { id: 'plan', label: 'Billing', icon: Receipt, group: 'General', desc: 'Upcoming bills, payment methods, past bills, billing profile' },
    { id: 'users', label: 'Users & permissions', icon: Users, group: 'General', desc: 'Staff members, roles, 2-step verification' },
    { id: 'payments', label: 'Payments', icon: CreditCard, group: 'Sales & Checkout', desc: 'bKash, Nagad, SSLCommerz, Custom APIs', badge: `${(bkashEnabled?1:0)+(nagadEnabled?1:0)+(sslEnabled?1:0)+(codEnabled?1:0)+customGateways.filter(g=>g.enabled).length} Active` },
    { id: 'vendor_payments', label: 'Vendor Payment Rules', icon: Sliders, group: 'Sales & Checkout', desc: 'Vendor-wise MFS restriction & advance rules', highlight: true },
    { id: 'checkout', label: 'Checkout', icon: ShoppingCart, group: 'Sales & Checkout', desc: '1-Click Fast order, phone required, abandoned recovery' },
    { id: 'customer_accounts', label: 'Customer accounts', icon: UserCheck, group: 'Sales & Checkout', desc: 'OTP mobile login, guest checkout' },
    { id: 'shipping', label: 'Shipping & delivery', icon: Globe, group: 'Logistics', desc: 'Dhaka ৳60, Suburbs ৳100, Outside ৳120, Free shipping' },
    { id: 'courier', label: 'Courier APIs (BD)', icon: Truck, group: 'Logistics', desc: 'Steadfast & Pathao live API integration' },
    { id: 'taxes', label: 'Taxes & duties', icon: Percent, group: 'Compliance', desc: 'National VAT 5%/7.5%/15%, BIN tax registration' },
    { id: 'locations', label: 'Locations & Warehouses', icon: MapPin, group: 'Logistics', desc: 'Banani Central, Chittagong, Uttara fulfillment centers' },
    { id: 'markets', label: 'Markets & Currencies', icon: Globe, group: 'Sales & Checkout', desc: 'Primary Bangladesh BDT & International USD' },
    { id: 'apps', label: 'Apps & sales channels', icon: Layers, group: 'Sales & Checkout', desc: 'Dropship Importer, Facebook, POS, TikTok' },
    { id: 'domains', label: 'Domains & SSL', icon: Globe, group: 'General', desc: 'banglaxpress.com.bd, DNS records, SSL TLS 1.3' },
    { id: 'pixels', label: 'Customer events (Pixels)', icon: Activity, group: 'Marketing', desc: 'Meta Pixel, GA4, TikTok Pixel, GTM' },
    { id: 'sms', label: 'SMS & WhatsApp Gateway', icon: Bell, group: 'Marketing', desc: 'Greenweb SMS, BulkSMSBD, WhatsApp Cloud API' },
    { id: 'notifications', label: 'Notifications & Templates', icon: Mail, group: 'Marketing', desc: 'Order confirmation SMS/Email templates' },
    { id: 'custom_data', label: 'Custom data (Metafields)', icon: FileCode, group: 'General', desc: 'Product specs, warranty, fabric specifications' },
    { id: 'files', label: 'Files & Media Assets', icon: Folder, group: 'General', desc: 'Media library CDN storage & asset links' },
    { id: 'policies', label: 'Policies', icon: ScrollText, group: 'Compliance', desc: '7-day replacement, Privacy, Terms, Shipping' },
    { id: 'security', label: 'Security & Fraud Protection', icon: ShieldCheck, group: 'Compliance', desc: 'Blacklisted numbers, COD OTP, advance payment' },
    { id: 'api_tokens', label: 'API tokens & Webhooks', icon: Key, group: 'Developer', desc: 'Storefront token, Admin API key, IPN endpoints' }
  ];

  // Filtered navigation
  const filteredNavItems = useMemo(() => {
    if (!navSearchQuery.trim()) return NAV_ITEMS;
    const q = navSearchQuery.toLowerCase();
    return NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [navSearchQuery]);

  const currentNav = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="bg-[#f1f2f4] min-h-[85vh] rounded-2xl border border-gray-200 overflow-hidden flex flex-col font-sans">
      {/* Top Header Bar (Shopify Polaris Style) */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">Settings</h1>
              <span className="text-gray-400 font-medium">/</span>
              <span className="text-sm font-semibold text-gray-700">{currentNav.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live & Synced
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage store configuration, Bangladeshi payment gateways, courier APIs, and fulfillment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#303030] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Settings Sidebar */}
        <aside className="w-full md:w-72 lg:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Search Settings Input */}
          <div className="p-3.5 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-hidden focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
              {navSearchQuery && (
                <button
                  type="button"
                  onClick={() => setNavSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-[calc(100vh-210px)]">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as SettingsNavTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gray-900 text-white font-semibold shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-emerald-400'
                        : item.highlight
                        ? 'text-rose-600'
                        : 'text-gray-500'
                    }`}
                  />
                  <div className="flex-1 truncate">
                    <span className="block truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-rose-900 text-rose-200'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      Rules
                    </span>
                  )}
                </button>
              );
            })}

            {filteredNavItems.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>কোনো সেটিংস পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-[#f8f9fa] max-h-[calc(100vh-140px)]">
          {/* VIEW 1: GENERAL / STORE DETAILS */}
          {activeTab === 'general' && (
            <div className="space-y-5 max-w-4xl">
              {/* Card 1: Basic Store Details */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-700" />
                      <span>Store Profile & Official Branding</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Store name and contact details visible to customers on storefront and invoices.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                    ID: BX-84920
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Store Name</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Legal Business Name</label>
                    <input
                      type="text"
                      value={storeLegalName}
                      onChange={(e) => setStoreLegalName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Customer Support Email</label>
                    <input
                      type="email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Official Helpline Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Billing & Physical Address */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-700" />
                    <span>Registered Business Address</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Physical office address for billing and courier pickup hub.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">City / Division</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Standards & Formats */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-700" />
                    <span>Standards and Formats</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Currency, timezone, weight units, and order ID prefixes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Store Currency</label>
                    <input
                      type="text"
                      disabled
                      value={currency}
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg font-mono text-gray-700"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Primary settlement currency in Bangladesh</span>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Timezone</label>
                    <input
                      type="text"
                      disabled
                      value={timezone}
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg font-mono text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Unit System</label>
                    <select
                      value={unitSystem}
                      onChange={(e) => setUnitSystem(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    >
                      <option value="metric">Metric System (Kilogram, Centimeter)</option>
                      <option value="imperial">Imperial System (Pound, Inch)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Order ID Prefix</label>
                    <input
                      type="text"
                      value={orderPrefix}
                      onChange={(e) => setOrderPrefix(e.target.value)}
                      placeholder="#BX-"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono focus:border-gray-900 bg-white"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Your order numbers will appear as: #BX-1001</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PLAN & BILLING (Matches User Billing & Billing Profile Screenshot) */}
          {activeTab === 'plan' && (
            <ShopifyBillingView
              showToast={showToast}
              onNavigatePlan={() => {
                showToast(`Current Plan: ${billingPlan} (${billingCycle})`);
              }}
            />
          )}

          {/* VIEW 3: USERS & PERMISSIONS */}
          {activeTab === 'users' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-700" />
                    <span>Staff Accounts & Roles</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage team access, role-based security, and warehouse fulfillment rights.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Staff Member</span>
                </button>
              </div>

              {/* Staff Members Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Permissions</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50/50">
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-[11px]">
                            {staff.name.charAt(0)}
                          </div>
                          <span>{staff.name}</span>
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">{staff.email}</td>
                        <td className="p-3.5 font-semibold text-gray-800">{staff.role}</td>
                        <td className="p-3.5 text-gray-500">
                          <span className="truncate max-w-[200px] inline-block">{staff.permissions.join(', ')}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            {staff.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Two Factor Security Toggle */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Enforce Two-Step Verification (2FA) for All Staff</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Require staff members to authenticate with SMS OTP or Authenticator App on login.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceTwoFactor}
                  onChange={(e) => setEnforceTwoFactor(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* VIEW 4: PAYMENT GATEWAYS (bKash, Nagad, SSL, COD, Custom APIs) */}
          {activeTab === 'payments' && (
            <div className="space-y-4 max-w-4xl">
              {/* Top Banner for Vendor Payment Rules */}
              <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">ভেন্ডর ভিত্তিক পেমেন্ট কাস্টমাইজেশন (Vendor-wise Payment Rules)</h4>
                    <p className="text-[11px] text-gray-600">নির্দিষ্ট ব্র্যান্ড বা ভেন্ডরের জন্য COD বন্ধ করা, অগ্রিম পেমেন্ট বাধ্যতামূলক করা কিংবা বিকাশ/নগদ কাস্টমাইজ করুন।</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('vendor_payments')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>ভেন্ডর রুলস পরিচালনা করুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Payment Gateways Header */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-800" />
                    <h2 className="text-sm font-bold text-gray-900">Payment Gateways & API Integrations</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {(bkashEnabled ? 1 : 0) + (nagadEnabled ? 1 : 0) + (sslEnabled ? 1 : 0) + (codEnabled ? 1 : 0) + customGateways.filter(g => g.enabled).length} Methods Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    অফিসিয়াল বাংলাদেশি MFS (বিকাশ, নগদ) ছাড়াও যেকোনো নতুন পেমেন্ট মেথড বা ব্যাংক API সরাসরি ইন্টিগ্রেট করুন।
                  </p>
                </div>

                <button
                  type="button"
                  id="create-payment-method-header-btn"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Payment Method with API</span>
                </button>
              </div>

              {/* bKash Merchant Checkout API */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D12053] text-white flex items-center justify-center font-black text-sm">
                      bK
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">bKash Merchant Checkout API (Direct Tokenized)</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {bkashStatusText || 'Connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Official bKash Payment Gateway for instant verification & automated payment callback.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setBkashMode('sandbox')}
                        className={`px-2 py-1 rounded font-semibold ${
                          bkashMode === 'sandbox' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        Sandbox
                      </button>
                      <button
                        type="button"
                        onClick={() => setBkashMode('live')}
                        className={`px-2 py-1 rounded font-semibold ${
                          bkashMode === 'live' ? 'bg-[#D12053] text-white shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        Live Production
                      </button>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={bkashEnabled}
                        onChange={(e) => setBkashEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#D12053] rounded"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">bKash App Key</label>
                    <input
                      type="text"
                      value={bkashAppKey}
                      onChange={(e) => setBkashAppKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">bKash App Secret</label>
                    <input
                      type="password"
                      value={bkashAppSecret}
                      onChange={(e) => setBkashAppSecret(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">API Username</label>
                    <input
                      type="text"
                      value={bkashUsername}
                      onChange={(e) => setBkashUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">API Password</label>
                    <input
                      type="password"
                      value={bkashPassword}
                      onChange={(e) => setBkashPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500">
                    Webhook IPN URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">https://api.banglaxpress.store/v1/payments/bkash/callback</code>
                  </span>
                  <button
                    type="button"
                    onClick={handleTestBkash}
                    disabled={bkashTesting}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#D12053] ${bkashTesting ? 'animate-spin' : ''}`} />
                    <span>{bkashTesting ? 'Testing Handshake...' : 'Test bKash API Handshake'}</span>
                  </button>
                </div>
              </div>

              {/* Nagad Direct Merchant API */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EA1D24] text-white flex items-center justify-center font-black text-sm">
                      Ng
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">Nagad Direct Payment Gateway API</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {nagadStatusText || 'Connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Official Postal Department Nagad MFS direct checkout integration with RSA encryption.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setNagadMode('sandbox')}
                        className={`px-2 py-1 rounded font-semibold ${
                          nagadMode === 'sandbox' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        Sandbox
                      </button>
                      <button
                        type="button"
                        onClick={() => setNagadMode('live')}
                        className={`px-2 py-1 rounded font-semibold ${
                          nagadMode === 'live' ? 'bg-[#EA1D24] text-white shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        Live Production
                      </button>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        type="checkbox"
                        checked={nagadEnabled}
                        onChange={(e) => setNagadEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#EA1D24] rounded"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nagad Merchant ID</label>
                    <input
                      type="text"
                      value={nagadMerchantId}
                      onChange={(e) => setNagadMerchantId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Merchant Public Key</label>
                    <input
                      type="text"
                      value={nagadPublicKey}
                      onChange={(e) => setNagadPublicKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">Merchant Private Key (RSA 2048)</label>
                    <input
                      type="password"
                      value={nagadPrivateKey}
                      onChange={(e) => setNagadPrivateKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500">
                    Callback URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">https://api.banglaxpress.store/v1/payments/nagad/verify</code>
                  </span>
                  <button
                    type="button"
                    onClick={handleTestNagad}
                    disabled={nagadTesting}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#EA1D24] ${nagadTesting ? 'animate-spin' : ''}`} />
                    <span>{nagadTesting ? 'Testing Handshake...' : 'Test Nagad API Handshake'}</span>
                  </button>
                </div>
              </div>

              {/* Cash On Delivery (COD) Switch */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    COD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Cash on Delivery (ক্যাশ অন ডেলিভারি)</h3>
                    <p className="text-xs text-gray-500">
                      Enable cash on delivery for nationwide customers with phone verification.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <span>{codEnabled ? 'Active' : 'Disabled'}</span>
                </label>
              </div>

              {/* Custom Integrated Gateways List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কাস্টম ইন্টিগ্রেটেড পেমেন্ট মেথড (Integrated Custom Gateways)</span>
                  </h4>
                  <span className="text-xs text-gray-500 font-semibold">
                    {customGateways.length} টি অতিরিক্ত গেটওয়ে কনফিগার করা আছে
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {customGateways.map((gw) => (
                    <div
                      key={gw.id}
                      className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs"
                          style={{ backgroundColor: gw.iconBg }}
                        >
                          {gw.iconText || 'API'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{gw.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                gw.mode === 'live'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {gw.mode}
                            </span>
                            {gw.enabled ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Provider: <span className="font-semibold text-gray-700">{gw.provider}</span> • Currency:{' '}
                            <span className="font-mono">{gw.currency}</span>
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate max-w-md">
                            Endpoint: {gw.endpointUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleGatewayStatus(gw.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            gw.enabled
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {gw.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(gw)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Gateway"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomGateway(gw.id, gw.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Gateway"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: VENDOR PAYMENT RULES */}
          {activeTab === 'vendor_payments' && (
            <div className="max-w-4xl">
              <ShopifyVendorPaymentsView
                products={products}
                showToast={showToast}
              />
            </div>
          )}

          {/* VIEW 6: CHECKOUT & 1-CLICK FAST ORDER */}
          {activeTab === 'checkout' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>Customer Contact & Express Checkout</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Streamlined checkout configuration designed for high conversion in Bangladesh.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Fast Checkout Switch */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-emerald-950 text-xs block">
                        Enable 1-Click Fast Express Checkout (১-ক্লিক ফাস্ট চেকআউট)
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        পণ্য পেজে সরাসরি &apos;অর্ডার করুন&apos; বাটনে ক্লিক করলে নিমিষেই মোবাইল পপআপে অর্ডার সম্পন্ন হবে।
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={fastCheckoutEnabled}
                      onChange={(e) => setFastCheckoutEnabled(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Customer Contact Method</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="phone"
                          checked={contactMethod === 'phone'}
                          onChange={() => setContactMethod('phone')}
                          className="accent-gray-900"
                        />
                        <span>Phone number only (Mandatory for Bangladeshi Courier Logistics)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="email_or_phone"
                          checked={contactMethod === 'email_or_phone'}
                          onChange={() => setContactMethod('email_or_phone')}
                          className="accent-gray-900"
                        />
                        <span>Phone number or email address</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-gray-800 font-medium">Require Full Shipping Address</span>
                      <input
                        type="checkbox"
                        checked={requireFullAddress}
                        onChange={(e) => setRequireFullAddress(e.target.checked)}
                        className="w-4 h-4 accent-gray-900 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-gray-800 font-medium">Auto-Archive Completed Orders</span>
                      <input
                        type="checkbox"
                        checked={autoArchiveOrders}
                        onChange={(e) => setAutoArchiveOrders(e.target.checked)}
                        className="w-4 h-4 accent-gray-900 rounded"
                      />
                    </div>
                  </div>

                  {/* Abandoned Recovery Timing */}
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Automated Abandoned Checkout Reminders Schedule
                    </label>
                    <select
                      value={abandonedRecoveryHours}
                      onChange={(e) => setAbandonedRecoveryHours(e.target.value)}
                      className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    >
                      <option value="1">Send SMS/WhatsApp after 1 hour (Recommended)</option>
                      <option value="6">Send reminder after 6 hours</option>
                      <option value="24">Send reminder after 24 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: CUSTOMER ACCOUNTS */}
          {activeTab === 'customer_accounts' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-gray-700" />
                    <span>Customer Accounts & Sign-in Options</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Control how customers log in and access order history.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Customer Account Login Mode</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accMode"
                          value="optional"
                          checked={accountsMode === 'optional'}
                          onChange={() => setAccountsMode('optional')}
                          className="accent-gray-900"
                        />
                        <span>Accounts are optional (Customers can checkout as guests or create account)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accMode"
                          value="required"
                          checked={accountsMode === 'required'}
                          onChange={() => setAccountsMode('required')}
                          className="accent-gray-900"
                        />
                        <span>Accounts are required (Must log in before placing order)</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-blue-950 text-xs block">
                        Mobile Phone OTP Login (পাসওয়ার্ড ছাড়া SMS কোড দিয়ে লগইন)
                      </span>
                      <span className="text-[11px] text-blue-800">
                        কাস্টমাররা তাদের মোবাইল নম্বরে আসা ৪-সংখ্যার OTP কোড দিয়ে নিমিষেই লগইন করতে পারবেন।
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={mobileOtpLogin}
                      onChange={(e) => setMobileOtpLogin(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-gray-900 text-xs block">Google 1-Tap Sign-In</span>
                      <span className="text-[11px] text-gray-500">Allow customers to log in using their Google account in 1 tap.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={googleOneTap}
                      onChange={(e) => setGoogleOneTap(e.target.checked)}
                      className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 8: SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Nationwide Shipping Rates (সারাদেশে ডেলিভারি চার্জ)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure standard shipping rates for Inside Dhaka, Suburbs, Outside Dhaka, and Free Shipping thresholds.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">ঢাকার ভেতরে (Inside Dhaka)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">{dhakaDeliveryDays}</span>
                    </div>
                    <div>
                      <label className="text-gray-500 block text-[11px] mb-1">ডেলিভারি চার্জ (BDT)</label>
                      <input
                        type="number"
                        value={dhakaRate}
                        onChange={(e) => setDhakaRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-bold text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">ঢাকা উপশহর (Suburbs)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">2-3 Days</span>
                    </div>
                    <div>
                      <label className="text-gray-500 block text-[11px] mb-1">ডেলিভারি চার্জ (BDT)</label>
                      <input
                        type="number"
                        value={suburbRate}
                        onChange={(e) => setSuburbRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-bold text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">ঢাকার বাইরে (All Districts)</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">{outsideDeliveryDays}</span>
                    </div>
                    <div>
                      <label className="text-gray-500 block text-[11px] mb-1">ডেলিভারি চার্জ (BDT)</label>
                      <input
                        type="number"
                        value={outsideDhakaRate}
                        onChange={(e) => setOutsideDhakaRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-bold text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Free Shipping Threshold */}
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-emerald-950 block text-xs">
                      ফ্রি ডেলিভারি অফার থ্রেশহোল্ড (Free Shipping Threshold)
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      এই পরিমাণের সমপরিমাণ বা বেশি টাকার অর্ডারে কাস্টমার স্বয়ংক্রিয়ভাবে ফ্রি ডেলিভারি পাবেন।
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-900">৳</span>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      className="w-28 px-3 py-1.5 border border-emerald-300 rounded-lg font-bold text-emerald-950 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 9: COURIER & LOGISTICS APIs (Steadfast & Pathao) */}
          {activeTab === 'courier' && (
            <div className="space-y-4 max-w-4xl text-xs">
              {/* Steadfast Courier API */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                      St
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">Steadfast Courier API Integration</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {steadfastStatusText || 'Connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Auto-creates consignment orders, downloads courier invoice barcodes, and retrieves live tracking.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={steadfastEnabled}
                      onChange={(e) => setSteadfastEnabled(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Steadfast API Key</label>
                    <input
                      type="text"
                      value={steadfastApiKey}
                      onChange={(e) => setSteadfastApiKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Steadfast Secret Key</label>
                    <input
                      type="password"
                      value={steadfastSecretKey}
                      onChange={(e) => setSteadfastSecretKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="steadfast-auto"
                      checked={steadfastAutoDispatch}
                      onChange={(e) => setSteadfastAutoDispatch(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="steadfast-auto" className="font-semibold text-gray-800 cursor-pointer">
                      অর্ডার কনফার্ম হলেই স্বয়ংক্রিয়ভাবে Steadfast পার্সেল তৈরি হবে (Auto-Consignment)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSteadfast}
                    disabled={steadfastTesting}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${steadfastTesting ? 'animate-spin' : ''}`} />
                    <span>{steadfastTesting ? 'Checking Balance...' : 'Check Balance & Sync API'}</span>
                  </button>
                </div>
              </div>

              {/* Pathao Courier API */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                      Pt
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">Pathao Courier Merchant API</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {pathaoStatusText || 'Connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Official Pathao Courier OAuth 2.0 integration for parcel delivery & COD cash collection.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={pathaoEnabled}
                      onChange={(e) => setPathaoEnabled(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Client ID</label>
                    <input
                      type="text"
                      value={pathaoClientId}
                      onChange={(e) => setPathaoClientId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Client Secret</label>
                    <input
                      type="password"
                      value={pathaoClientSecret}
                      onChange={(e) => setPathaoClientSecret(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Store / Hub ID</label>
                    <input
                      type="text"
                      value={pathaoStoreId}
                      onChange={(e) => setPathaoStoreId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleTestPathao}
                    disabled={pathaoTesting}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${pathaoTesting ? 'animate-spin' : ''}`} />
                    <span>{pathaoTesting ? 'Testing...' : 'Test Pathao OAuth Handshake'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 10: TAXES & DUTIES (VAT) */}
          {activeTab === 'taxes' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span>National VAT & Tax Calculation (ভ্যাট ও কর সেটিংস)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Bangladesh standard VAT rules and tax invoices compliance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">National Standard VAT Rate (%)</label>
                    <select
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    >
                      <option value="5">5% (Standard Retail Goods)</option>
                      <option value="7.5">7.5% (Consumer Electronics)</option>
                      <option value="15">15% (Full Commercial VAT)</option>
                      <option value="0">0% (Zero Tax / Exempted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Business BIN / VAT Registration No.</label>
                    <input
                      type="text"
                      value={vatRegistrationNumber}
                      onChange={(e) => setVatRegistrationNumber(e.target.value)}
                      placeholder="BIN-003928194-0103"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={pricesIncludeVat}
                      onChange={(e) => setPricesIncludeVat(e.target.checked)}
                      className="w-4 h-4 accent-gray-900 rounded"
                    />
                    <span>All product prices include VAT (পণ্য মূল্যের ভেতরেই ভ্যাট অন্তর্ভুক্ত রয়েছে)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={chargeVatOnShipping}
                      onChange={(e) => setChargeVatOnShipping(e.target.checked)}
                      className="w-4 h-4 accent-gray-900 rounded"
                    />
                    <span>Charge VAT on shipping rates</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 11: LOCATIONS & WAREHOUSES */}
          {activeTab === 'locations' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Fulfillment Locations & Warehouses</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage warehouses and inventory stock points across Bangladesh.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Warehouse Hub</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {locations.map((loc) => (
                  <div key={loc.id} className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-xs">{loc.name}</h4>
                          {loc.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                              Primary Default
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            Fulfillment Active
                          </span>
                        </div>
                        <p className="text-gray-500 mt-0.5">{loc.address}, {loc.city}</p>
                        <p className="text-gray-400 font-mono mt-0.5">{loc.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 12: MARKETS & CURRENCIES */}
          {activeTab === 'markets' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Markets & Multi-Currency Settings</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Control domestic and cross-border international selling markets.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Primary Market: Bangladesh</span>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]">Primary</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">Currency: BDT (৳) • 100% of store sales</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">International Market (Global)</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">Active</span>
                    </div>
                    <p className="text-[11px] text-gray-600">Currencies: USD ($), EUR (€) • Exchange Rate: 1 USD = ৳{exchangeRateUsd}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 13: APPS & SALES CHANNELS */}
          {activeTab === 'apps' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Connected Apps & Sales Channels</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage connected marketplaces, Facebook Shop, TikTok, and Dropshipping.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">AliExpress & 1688 Direct Dropship Importer</h4>
                      <p className="text-gray-500 text-[11px] mt-0.5">1-click product import with automated image translation and markup pricing.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Installed</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Facebook & Instagram Shop Sync</h4>
                      <p className="text-gray-500 text-[11px] mt-0.5">Real-time catalog sync with Meta Commerce Manager.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Point of Sale (POS) Banani Outlet</h4>
                      <p className="text-gray-500 text-[11px] mt-0.5">Physical showroom retail barcode scanner & receipt printer.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 14: DOMAINS & SSL */}
          {activeTab === 'domains' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Custom Domains & SSL Encryption</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">DNS settings and primary domain configuration.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-950 font-mono text-sm">{primaryDomain}</span>
                        <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]">Primary Domain</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">SSL Certificate: {sslStatus}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 font-mono">{myshopifyDomain}</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">Default Shopify managed domain (Redirects to primary)</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-bold text-[10px]">Connected</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900 text-xs">Required DNS Records</h4>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-gray-600">
                    <div className="p-2 bg-white rounded border border-gray-200">Type: A • Host: @ • Value: 23.227.38.65</div>
                    <div className="p-2 bg-white rounded border border-gray-200 sm:col-span-2">Type: CNAME • Host: www • Value: shops.myshopify.com</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 15: CUSTOMER EVENTS (PIXELS) */}
          {activeTab === 'pixels' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Tracking Pixels & Analytics (Customer Events)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Configure Meta Pixel, Google Analytics 4, TikTok Pixel, and Conversions API.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Meta Pixel ID (Facebook)</label>
                    <input
                      type="text"
                      value={metaPixelId}
                      onChange={(e) => setMetaPixelId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Google Analytics 4 (GA4 ID)</label>
                    <input
                      type="text"
                      value={ga4MeasurementId}
                      onChange={(e) => setGa4MeasurementId(e.target.value)}
                      placeholder="G-BX98421094"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">TikTok Pixel ID</label>
                    <input
                      type="text"
                      value={tiktokPixelId}
                      onChange={(e) => setTiktokPixelId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Google Tag Manager Container ID</label>
                    <input
                      type="text"
                      value={gtmContainerId}
                      onChange={(e) => setGtmContainerId(e.target.value)}
                      placeholder="GTM-BX84920"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500">Events track: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase</span>
                  <button
                    type="button"
                    onClick={() => showToast('Test Pixel Purchase Event Dispatched!')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold cursor-pointer"
                  >
                    Test Pixel Event Firing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 16: SMS & WHATSAPP GATEWAY */}
          {activeTab === 'sms' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>Bangladeshi SMS Gateway API & WhatsApp</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Send instant order confirmation and tracking SMS to customers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">SMS API Provider</label>
                    <select
                      value={smsProvider}
                      onChange={(e) => setSmsProvider(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    >
                      <option value="greenweb">Greenweb SMS (Recommended)</option>
                      <option value="bulksmsbd">BulkSMSBD</option>
                      <option value="alphanet">Alpha Net SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">SMS API Token</label>
                    <input
                      type="text"
                      value={smsApiToken}
                      onChange={(e) => setSmsApiToken(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Masking Sender ID</label>
                    <input
                      type="text"
                      value={smsSenderId}
                      onChange={(e) => setSmsSenderId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs uppercase focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>

                {/* SMS Triggers */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={smsOrderPlaced}
                      onChange={(e) => setSmsOrderPlaced(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>নতুন অর্ডার প্লেস হলে কাস্টমারকে স্বয়ংক্রিয় SMS পাঠান (Order Confirmation SMS)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={smsDispatched}
                      onChange={(e) => setSmsDispatched(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>কুরিয়ারে পার্সেল ডিসপ্যাচ ও ট্র্যাকিং লিঙ্ক সহ SMS পাঠান (Courier Tracking SMS)</span>
                  </label>
                </div>

                {/* Test SMS Sender */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">টেস্ট SMS পাঠানোর নম্বর</label>
                    <input
                      type="text"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="01812345678"
                      className="w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSms}
                    disabled={smsTesting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{smsTesting ? 'Sending SMS...' : 'Send Test SMS'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 17: NOTIFICATIONS & TEMPLATES */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Customer Notifications & SMS Templates</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Customize message templates sent to customers.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">অর্ডার নিশ্চিতকরণ বার্তা (Order Confirmation Template)</label>
                    <textarea
                      rows={3}
                      value={orderConfirmTemplate}
                      onChange={(e) => setOrderConfirmTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">কুরিয়ার ডিসপ্যাচ ও ট্র্যাকিং বার্তা (Courier Dispatch Template)</label>
                    <textarea
                      rows={3}
                      value={dispatchTemplate}
                      onChange={(e) => setDispatchTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 18: CUSTOM DATA (METAFIELDS) */}
          {activeTab === 'custom_data' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-600" />
                    <span>Product Metafield Definitions (Custom Data)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Extend product features with custom attributes, warranty, and specifications.</p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Warranty Period (`custom.warranty_period`)</span>
                      <p className="text-[11px] text-gray-500">Official brand replacement warranty description.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Country of Origin (`custom.country_of_origin`)</span>
                      <p className="text-[11px] text-gray-500">Manufacturing country for dropship products.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Product Video Demo URL (`custom.video_demo`)</span>
                      <p className="text-[11px] text-gray-500">Bangla YouTube/Facebook product review video embed.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 19: FILES */}
          {activeTab === 'files' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-600" />
                    <span>Media Library & Cloud Storage</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">CDN file storage for product images, banners, and documents.</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800">Storage Usage</span>
                    <p className="text-xs text-gray-500 mt-0.5">{cdnStorageUsed} of {cdnStorageTotal} used (Cloud CDN Accelerated)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Media file upload dialog opened')}
                    className="px-3.5 py-2 bg-gray-900 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Files</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 20: POLICIES */}
          {activeTab === 'policies' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-emerald-600" />
                    <span>Legal Policies & Customer Terms (নীতিমালা)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Standard legal policies for Bangladeshi e-commerce consumer protection.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">রিটার্ন ও রিফান্ড পলিসি (Refund & Replacement Policy)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setRefundPolicy('BanglaXpress এ পণ্য পাওয়ার পর কোনো সমস্যা বা ত্রুটি থাকলে ৭ দিনের মধ্যে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট পাবেন। ইনভয়েস এবং অরিজিনাল প্যাকেজিং সহ আমাদের হটলাইনে যোগাযোগ করুন।');
                          showToast('রিটার্ন পলিসি টেমপ্লেট থেকে তৈরি করা হয়েছে!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                      >
                        Generate from template
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={refundPolicy}
                      onChange={(e) => setRefundPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">প্রাইভেসি পলিসি (Privacy Policy)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setPrivacyPolicy('আমরা আপনার ব্যক্তিগত তথ্য (নাম, ঠিকানা, ফোন নম্বর) সম্পূর্ণ সুরক্ষিত রাখি এবং শুধুমাত্র অর্ডার ডেলিভারির প্রয়োজনে ব্যবহার করি।');
                          showToast('প্রাইভেসি পলিসি তৈরি হয়েছে!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                      >
                        Generate from template
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={privacyPolicy}
                      onChange={(e) => setPrivacyPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-800">ডেলিভারি নীতিমালা (Shipping Policy)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShippingPolicy('ঢাকার ভেতরে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারের মাধ্যমে ডেলিভারি সম্পন্ন করা হয়।');
                          showToast('ডেলিভারি পলিসি তৈরি হয়েছে!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                      >
                        Generate from template
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={shippingPolicy}
                      onChange={(e) => setShippingPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 21: SECURITY & FRAUD PROTECTION */}
          {activeTab === 'security' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>COD Protection & Fraud Detection (জাল অর্ডার প্রতিরোধ)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Protect from fake orders and scam callers with advance fee and blacklist filtering.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 block">Require OTP Verification on High-Risk COD Orders</span>
                      <span className="text-[11px] text-gray-500">Send instant SMS 4-digit code to confirm real customer.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireOtpCod}
                      onChange={(e) => setRequireOtpCod(e.target.checked)}
                      className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 block">Require Advance Delivery Charge on Suspicious Orders</span>
                      <span className="text-[11px] text-gray-500">Ask for ৳{advanceFeeAmount} via bKash/Nagad before shipping.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireAdvanceDeliveryCharge}
                      onChange={(e) => setRequireAdvanceDeliveryCharge(e.target.checked)}
                      className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Blacklisted Numbers Management */}
                <div className="pt-2 space-y-3">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Blacklisted Customer Phone Numbers (ব্ল্যাকলিস্ট নম্বর)</span>
                  </h4>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBlacklistInput}
                      onChange={(e) => setNewBlacklistInput(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlacklist}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold cursor-pointer"
                    >
                      Add to Blacklist
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {blacklistNumbers.map((num) => (
                      <span
                        key={num}
                        className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-mono font-semibold text-xs flex items-center gap-1.5"
                      >
                        <span>{num}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlacklist(num)}
                          className="hover:text-red-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 22: API ACCESS TOKENS */}
          {activeTab === 'api_tokens' && (
            <div className="space-y-5 max-w-4xl text-xs">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-600" />
                      <span>Storefront & Admin API Access Tokens</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Use these credentials to connect custom apps and headless storefronts.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTokens(!showTokens)}
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showTokens ? 'Hide Tokens' : 'Reveal Tokens'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Storefront API Access Token</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showTokens ? 'text' : 'password'}
                        readOnly
                        value={storefrontToken}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(storefrontToken, 'Storefront Token')}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'Storefront Token' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Admin REST API Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showTokens ? 'text' : 'password'}
                        readOnly
                        value={adminApiKey}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(adminApiKey, 'Admin API Key')}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'Admin API Key' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Webhook Signature Secret</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showTokens ? 'text' : 'password'}
                        readOnly
                        value={webhookSecret}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(webhookSecret, 'Webhook Secret')}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'Webhook Secret' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add Staff Member */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Add New Staff Member</h3>
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Mahfuzur Rahman"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="mahfuz@banglaxpress.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Assigned Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Operations Manager">Operations Manager (Full Store Operations)</option>
                  <option value="Customer Support">Customer Support (Orders & Chat)</option>
                  <option value="Fulfillment Lead">Fulfillment Lead (Warehouse & Courier)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Warehouse Location */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Add Warehouse Hub Location</h3>
              <button
                type="button"
                onClick={() => setIsAddLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="e.g. Mirpur Express Depot"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  placeholder="Plot 10, Section 6, Mirpur"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={newLocCity}
                    onChange={(e) => setNewLocCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Helpline Phone</label>
                  <input
                    type="text"
                    value={newLocPhone}
                    onChange={(e) => setNewLocPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Custom Payment Method */}
      {isCreateMethodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs transition-colors"
                  style={{ backgroundColor: formIconBg }}
                >
                  {formIconText || 'API'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingGatewayId ? 'Edit Payment Gateway API' : 'Create New Payment Method with API'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    ইন্টিগ্রেট করুন নতুন পেমেন্ট গেটওয়ে, REST API এন্ডপয়েন্ট ও অটোমেটিক ওয়েবহুক কলব্যাক।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateMethodModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200/70 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="p-4 bg-slate-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>দ্রুত সেটআপের জন্য প্রিসেট সিলেক্ট করুন (Quick Presets)</span>
                </span>
                <span className="text-[11px] text-slate-500">ক্লিক করলেই ফিল্ড পূরণ হবে</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PAYMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-100/80 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: preset.iconBg }}
                    />
                    <span>{preset.provider}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveCustomGateway} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">পেমেন্ট মেথডের নাম (Gateway Name) *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="যেমন: Upay Direct Checkout API"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">প্রোভাইডার বা কোম্পানি (Provider Brand)</label>
                  <input
                    type="text"
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    placeholder="যেমন: Upay (UCB), Rocket, AamarPay"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">মেথড টাইপ (Category)</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="mfs">Mobile Financial Services (MFS)</option>
                    <option value="card">Cards & Internet Banking</option>
                    <option value="net_banking">Net Banking / Direct Pay</option>
                    <option value="international">International Payment</option>
                    <option value="custom">Custom REST API</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">মোড (Mode)</label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as 'sandbox' | 'live')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="live">Live Production</option>
                    <option value="sandbox">Sandbox / Test</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">কারেন্সি (Currency)</label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    placeholder="BDT (৳)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">API Base Endpoint / Gateway URL *</label>
                <input
                  type="url"
                  required
                  value={formEndpointUrl}
                  onChange={(e) => setFormEndpointUrl(e.target.value)}
                  placeholder="https://api.gateway.com/v1/checkout/initialize"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs focus:border-blue-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-800 block mb-1">মার্চেন্ট আইডি (Merchant ID)</label>
                  <input
                    type="text"
                    value={formMerchantId}
                    onChange={(e) => setFormMerchantId(e.target.value)}
                    placeholder="UPAY_MERCHANT_99812"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-800 block mb-1">এপিআই কী (API Key / Client ID) *</label>
                  <input
                    type="text"
                    required
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="live_api_key_8492019482"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">সিক্রেট কী (API Secret / Private Key)</label>
                <input
                  type="password"
                  value={formApiSecret}
                  onChange={(e) => setFormApiSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-hidden font-mono text-xs bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-gray-800 block">এপিআই সংযোগ টেস্ট করুন (Connection Handshake)</span>
                  {gatewayTestResult && (
                    <div className="mt-1 flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{gatewayTestResult.message} ({gatewayTestResult.latency})</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTestCustomGatewayInModal}
                  disabled={isTestingGateway}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isTestingGateway ? 'animate-spin' : ''}`} />
                  <span>{isTestingGateway ? 'Testing...' : 'Test Handshake'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-enabled-checkbox"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="modal-enabled-checkbox" className="font-bold text-gray-800 cursor-pointer">
                  এই পেমেন্ট মেথডটি অবিলম্বে স্টোর চেকআউটে সক্রিয় (Enable) রাখুন
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateMethodModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingGatewayId ? 'Save & Update API' : 'Save & Integrate Gateway'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
