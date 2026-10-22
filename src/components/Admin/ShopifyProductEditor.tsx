import React, { useState, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  UploadCloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  Sliders,
  DollarSign,
  Package,
  Truck,
  Globe,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Copy,
  ExternalLink,
  Layers,
  ShieldCheck,
  BarChart2,
  Box,
  Eye,
  FileText,
  FolderPlus,
  Folder,
  X,
  Upload,
  Award,
  Zap,
  RefreshCw,
  Info,
  GripVertical,
  Database,
  Palette
} from 'lucide-react';
import { Product, Category, ThemeConfig, DropshipPlatform, ProductOption, ProductVariant } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { DEFAULT_THEME_CONFIG } from '../../data/defaultThemeConfig';
import {
  fetchCJProductData,
  CJ_WINNING_CATALOG_DATABASE,
  getStoredCJConfig
} from '../../utils/cjDropshippingApi';
import {
  parseDropshipUrl,
  DROPSHIP_PLATFORMS,
  getStoredPricingRule
} from '../../utils/dropshipImporter';
import { getColorHex, detectColorName, getDisplayNameForColor, getColorSummaryStatement } from '../../utils/colorUtils';

interface ShopifyProductEditorProps {
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  allProducts?: Product[];
  themeConfig?: ThemeConfig;
  onSaveTheme?: (updatedTheme: ThemeConfig) => void;
  showToast?: (message: string) => void;
}

export const ShopifyProductEditor: React.FC<ShopifyProductEditorProps> = ({
  initialProduct,
  onSave,
  onCancel,
  allProducts = [],
  themeConfig,
  onSaveTheme,
  showToast = (_msg: string) => {}
}) => {
  const isEditing = Boolean(initialProduct);

  // 1. MAIN TITLE & STATUS
  const [name, setName] = useState(
    initialProduct?.name ||
      'Multi-Function Foldable Laptop & Tablet Stand – Portable Adjustable Desk Stand'
  );
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>(
    initialProduct?.status || 'active'
  );

  // 2. DESCRIPTION (WITH RICH TEXT TOOLBAR)
  const defaultDescription =
    initialProduct?.description ||
    `Create a comfortable and organized workspace with this Multi-Function Laptop & Tablet Stand. Designed for modern users, this adjustable stand supports laptops, tablets, and smartphones while providing flexible viewing angles for better comfort during work, study, meetings, and entertainment.

The foldable and lightweight design allows you to carry it easily, while its durable aluminum construction ensures stable support for everyday use.

Key Features:
🔄 Multi-Device Compatibility
Compatible with laptops, tablets, and smartphones, making it a versatile stand for different devices.

📐 Adjustable Viewing Angle
Adjust the stand according to your preferred height and angle for a more comfortable viewing experience.

🎒 Foldable & Portable Design
Easy to fold, store, and carry — ideal for office, home, classroom, and travel use.`;

  const [description, setDescription] = useState(defaultDescription);
  const [textFormat, setTextFormat] = useState('paragraph');

  // 3. MEDIA (IMAGES)
  const defaultImages = initialProduct?.images?.length
    ? initialProduct.images
    : [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
      ];
  const [images, setImages] = useState<string[]>(defaultImages);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. CATEGORY & TAXONOMY
  const [category, setCategory] = useState(
    initialProduct?.category || 'Laptop Stands in Computer Risers & Stands'
  );

  // Store Categories Pool & Persistence
  const [storeCategories, setStoreCategories] = useState<Category[]>(() => {
    try {
      if (themeConfig?.categoriesSection?.items?.length) {
        return themeConfig.categoriesSection.items;
      }
      const savedTheme = localStorage.getItem('bx_theme_config');
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        if (parsed?.categoriesSection?.items?.length) {
          return parsed.categoriesSection.items;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return CATEGORIES;
  });

  // Helper to persist newly created category into the store
  const persistNewCategoryToStore = (newCat: Category) => {
    try {
      const savedTheme = localStorage.getItem('bx_theme_config');
      const baseTheme = savedTheme ? JSON.parse(savedTheme) : (themeConfig || DEFAULT_THEME_CONFIG);
      const existingItems = baseTheme?.categoriesSection?.items || storeCategories;
      const updatedCategories = [
        newCat,
        ...existingItems.filter((c: Category) => c.name.toLowerCase() !== newCat.name.toLowerCase())
      ];
      const updatedTheme: ThemeConfig = {
        ...baseTheme,
        categoriesSection: {
          ...(baseTheme?.categoriesSection || DEFAULT_THEME_CONFIG.categoriesSection),
          items: updatedCategories
        }
      };
      localStorage.setItem('bx_theme_config', JSON.stringify(updatedTheme));
      if (onSaveTheme) {
        onSaveTheme(updatedTheme);
      }
      setStoreCategories(updatedCategories);
    } catch (e) {
      console.error('Failed to persist new category to store:', e);
    }
  };

  // 5. PRODUCT ORGANIZATION (RIGHT SIDEBAR)
  const [productType, setProductType] = useState(
    initialProduct?.productType || 'Laptop & Tablet Stand'
  );
  const [brand, setBrand] = useState(
    initialProduct?.brand || initialProduct?.vendor || 'Merrono'
  );
  const [vendor, setVendor] = useState(initialProduct?.vendor || 'Merrono');

  // Custom Brands & Dropdown State
  const [customBrands, setCustomBrands] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('banglaxpress_custom_brands');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isNewBrandModalOpen, setIsNewBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Custom Types & Dropdown State
  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('banglaxpress_custom_types');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');

  // Custom Vendors & Dropdown State
  const [customVendors, setCustomVendors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('banglaxpress_custom_vendors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isNewVendorModalOpen, setIsNewVendorModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');

  // Quick Tags & Bulk Modal State
  const [isQuickTagsModalOpen, setIsQuickTagsModalOpen] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');

  // Available Types List (Aggregated from mock, all products & custom)
  const availableTypesList = useMemo(() => {
    const set = new Set<string>();
    const standards = [
      'Laptop & Tablet Stand',
      'Audio & Headphone',
      'Smartwatch & Band',
      'Fast Charger & Adapter',
      'Power Bank',
      'Computer & IT Accessories',
      'Mobile Accessories',
      'Smart Home & Gadgets',
      'Gaming Gear',
      'Cables & Hubs',
      'Camera & Gimbal',
      'Car Accessories'
    ];
    standards.forEach((s) => set.add(s));
    customTypes.forEach((c) => set.add(c));
    allProducts.forEach((p) => {
      if (p.productType?.trim()) set.add(p.productType.trim());
      if (p.subcategory?.trim()) set.add(p.subcategory.trim());
    });
    return Array.from(set);
  }, [customTypes, allProducts]);

  // Available Brands List (Aggregated from mock, all products & custom brands)
  const availableBrandsList = useMemo(() => {
    const set = new Set<string>();
    const standards = [
      'Merrono',
      'Apple',
      'Samsung',
      'Xiaomi',
      'Anker',
      'Baseus',
      'Remax',
      'Hoco',
      'Lenovo',
      'OnePlus',
      'Sony',
      'Ugreen',
      'Realme',
      'Joyroom',
      'Boat',
      'A4Tech',
      'Logitech',
      'Haylou',
      'QCY',
      'Oraimo',
      'No Brand / Non-Brand'
    ];
    standards.forEach((s) => set.add(s));
    customBrands.forEach((c) => set.add(c));
    allProducts.forEach((p) => {
      if (p.brand?.trim()) set.add(p.brand.trim());
      if (p.vendor?.trim()) set.add(p.vendor.trim());
    });
    return Array.from(set);
  }, [customBrands, allProducts]);

  // Available Vendors List (Aggregated from mock, all products & custom)
  const availableVendorsList = useMemo(() => {
    const set = new Set<string>();
    const standards = [
      'Merrono',
      'Apple',
      'Samsung',
      'Xiaomi',
      'Anker',
      'Baseus',
      'Remax',
      'Hoco',
      'Lenovo',
      'OnePlus',
      'Sony',
      'Ugreen',
      'Realme',
      'Joyroom'
    ];
    standards.forEach((s) => set.add(s));
    customVendors.forEach((c) => set.add(c));
    allProducts.forEach((p) => {
      if (p.vendor?.trim()) set.add(p.vendor.trim());
      if (p.brand?.trim()) set.add(p.brand.trim());
    });
    return Array.from(set);
  }, [customVendors, allProducts]);

  // Recommended & Popular Tags
  const recommendedTagsList = useMemo(() => {
    const set = new Set<string>();
    const presets = [
      'Best Seller',
      'Trending',
      'Hot Deal',
      'New Arrival',
      'Free Delivery',
      'Premium Quality',
      'Wireless',
      'Fast Charging',
      'Portable',
      'Waterproof',
      'Gaming',
      'Official Warranty',
      'Discount Offer',
      'Top Rated'
    ];
    presets.forEach((p) => set.add(p));
    allProducts.forEach((p) => {
      p.tags?.forEach((t) => {
        if (t?.trim()) set.add(t.trim());
      });
    });
    return Array.from(set);
  }, [allProducts]);
  const [collections, setCollections] = useState<string[]>(
    initialProduct?.collections?.length
      ? initialProduct.collections
      : ['Computer & IT Accessories']
  );
  const [collectionInput, setCollectionInput] = useState('');
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBanglaName, setNewCategoryBanglaName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState(
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80'
  );
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  // Consolidated list of available categories and collections
  const availableCategoriesList = useMemo(() => {
    const list: { name: string; banglaName?: string; count?: number; isStoreCategory: boolean }[] = [];
    const seen = new Set<string>();

    // 1. Store categories
    storeCategories.forEach((cat) => {
      const key = cat.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          name: cat.name,
          banglaName: cat.banglaName,
          count: cat.itemCount,
          isStoreCategory: true
        });
      }
    });

    // 2. Default collections
    const defaultCols = [
      'Computer & IT Accessories',
      'Gadgets & Electric Accessories',
      'Electronics',
      'Best Sellers',
      'Health & Fitness',
      'Home Appliances',
      'Caps'
    ];
    defaultCols.forEach((col) => {
      const key = col.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          name: col,
          isStoreCategory: false
        });
      }
    });

    // 3. Any collections from other products
    allProducts.forEach((p) => {
      p.collections?.forEach((c) => {
        const key = c.trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({
            name: c,
            isStoreCategory: false
          });
        }
      });
      if (p.category) {
        const key = p.category.trim().toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({
            name: p.category,
            isStoreCategory: true
          });
        }
      }
    });

    return list;
  }, [storeCategories, allProducts]);

  // Filtered suggestions based on user input
  const filteredSuggestions = useMemo(() => {
    const query = collectionInput.trim().toLowerCase();
    if (!query) return availableCategoriesList;
    return availableCategoriesList.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.banglaName && c.banglaName.toLowerCase().includes(query))
    );
  }, [availableCategoriesList, collectionInput]);

  const [tags, setTags] = useState<string[]>(
    initialProduct?.tags?.length ? initialProduct.tags : ['Laptop & Tablet Stand']
  );
  const [tagInput, setTagInput] = useState('');
  const [themeTemplate, setThemeTemplate] = useState(
    initialProduct?.themeTemplate || 'Default product'
  );

  // 6. PRICING
  const [price, setPrice] = useState<number>(initialProduct?.price ?? 899);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(
    initialProduct?.originalPrice ?? 1450
  );
  const [costPerItem, setCostPerItem] = useState<number>(
    initialProduct?.costPerItem ?? 560
  );
  const [chargeTax, setChargeTax] = useState<boolean>(
    initialProduct?.chargeTax ?? false
  );

  // Profit & Margin calculations
  const profit = price - costPerItem;
  const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

  // 7. INVENTORY
  const [inventoryTracked, setInventoryTracked] = useState<boolean>(
    initialProduct?.inventoryTracked ?? true
  );
  const [availableQty, setAvailableQty] = useState<number>(
    initialProduct?.stockCount ?? 5
  );
  const [committedQty, setCommittedQty] = useState<number>(0);
  const [unavailableQty, setUnavailableQty] = useState<number>(0);
  const [sku, setSku] = useState(initialProduct?.sku || 'BX-STAND-881');
  const [barcode, setBarcode] = useState(
    initialProduct?.barcode || '8811531075778'
  );
  const [continueSelling, setContinueSelling] = useState<boolean>(
    initialProduct?.continueSellingWhenOutOfStock ?? false
  );

  // 8. SHIPPING
  const [isPhysicalProduct, setIsPhysicalProduct] = useState<boolean>(
    initialProduct?.isPhysicalProduct ?? true
  );
  const [packageType, setPackageType] = useState(
    initialProduct?.packageType || 'Store default • Sample box - 22'
  );
  const [weight, setWeight] = useState<number>(initialProduct?.weight ?? 0.35);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g' | 'lb' | 'oz'>(
    initialProduct?.weightUnit || 'kg'
  );
  const [showCustoms, setShowCustoms] = useState(false);
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    initialProduct?.countryOfOrigin || 'China'
  );
  const [hsCode, setHsCode] = useState(initialProduct?.hsCode || '8473.30.00');

  // 9. VARIANTS & OPTIONS (SHOPIFY POLARIS 1:1 REPLICA)
  const initialOptions: (ProductOption & { isEditing?: boolean })[] = useMemo(() => {
    if (initialProduct?.options && initialProduct.options.length > 0) {
      return initialProduct.options.map((opt) => ({
        ...opt,
        isEditing: false
      }));
    }
    const derived: (ProductOption & { isEditing?: boolean })[] = [];
    if (initialProduct?.sizes && initialProduct.sizes.length > 0) {
      derived.push({
        id: 'opt-size',
        name: 'Size',
        values: [...initialProduct.sizes],
        isEditing: false
      });
    }
    if (initialProduct?.colors && initialProduct.colors.length > 0) {
      derived.push({
        id: 'opt-color',
        name: 'Color',
        values: initialProduct.colors.map((c) => c.name),
        isEditing: false
      });
    }
    if (derived.length === 0) {
      derived.push({
        id: 'opt-size',
        name: 'Size',
        values: ['S', 'M', 'L', 'XL'],
        isEditing: false
      });
      derived.push({
        id: 'opt-color',
        name: 'Color',
        values: ['Black', 'Silver', 'Navy Blue'],
        isEditing: false
      });
    }
    return derived;
  }, [initialProduct]);

  const [options, setOptions] = useState<(ProductOption & { isEditing?: boolean })[]>(initialOptions);
  const [hasVariants, setHasVariants] = useState<boolean>(initialOptions.length > 0);
  const [showOptionPicker, setShowOptionPicker] = useState(false);
  const [optionSearchQuery, setOptionSearchQuery] = useState('');
  const [editingOptionValues, setEditingOptionValues] = useState<Record<string, string>>({});
  const [customOptionName, setCustomOptionName] = useState('');

  const [variantColors, setVariantColors] = useState<string[]>(
    initialProduct?.categoryMetafields?.color || ['Orange', 'Silver', 'Black']
  );
  const [newColorInput, setNewColorInput] = useState('');

  // Variants list for customized pricing/inventory/sku per variant
  const [variantsList, setVariantsList] = useState<ProductVariant[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants;
    }
    return [];
  });

  // Recommended options list (matching Shopify Polaris exactly from screenshot)
  const RECOMMENDED_OPTIONS = [
    'Color',
    'Size',
    'Fabric',
    'Features',
    'Clothing features',
    'Material',
    'Style',
    'Neckline',
    'Sleeve length type',
    'Sleeve style',
    'Top length type',
    'Age group',
    'Care instructions',
    'Decoration technique',
    'Size type',
    'Storage capacity'
  ];

  // Quick category recommendation chips (from top right in screenshot)
  const CATEGORY_SUGGESTIONS = [
    'Neckline',
    'Top length type',
    'Decoration technique',
    'Sleeve style',
    'Fabric'
  ];

  // Helper to add an option from picker or chips
  const handleAddOptionByName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = options.find((o) => o.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setOptions(options.map((o) => (o.id === exists.id ? { ...o, isEditing: true } : o)));
      setShowOptionPicker(false);
      return;
    }

    const defaultVals =
      trimmed.toLowerCase() === 'size'
        ? ['S', 'M', 'L', 'XL']
        : trimmed.toLowerCase() === 'color'
        ? ['Black', 'White', 'Blue']
        : trimmed.toLowerCase() === 'fabric'
        ? ['Cotton', 'Polyester']
        : trimmed.toLowerCase() === 'neckline'
        ? ['Crewneck', 'V-Neck', 'Collared']
        : trimmed.toLowerCase().includes('feature')
        ? ['Foldable', 'Lightweight', 'Portable', 'Waterproof']
        : trimmed.toLowerCase() === 'material'
        ? ['Aluminum Alloy', 'Silicone', 'Plastic']
        : [];

    const newOpt: ProductOption & { isEditing?: boolean } = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      values: defaultVals,
      isEditing: true
    };

    setOptions([...options, newOpt]);
    setHasVariants(true);
    setShowOptionPicker(false);
    setOptionSearchQuery('');
    setCustomOptionName('');
    notifyChange();
  };

  const handleUpdateOptionName = (optId: string, newName: string) => {
    setOptions(options.map((o) => (o.id === optId ? { ...o, name: newName } : o)));
    notifyChange();
  };

  const handleAddOptionValue = (optId: string) => {
    const rawVal = editingOptionValues[optId]?.trim();
    if (!rawVal) return;

    const targetOpt = options.find((o) => o.id === optId);
    const isColor = targetOpt && targetOpt.name.toLowerCase() === 'color';

    // Support comma separated values e.g. "S, M, L, XL"
    const splitVals = rawVal.split(',').map((v) => v.trim()).filter((v) => v.length > 0);

    setOptions(
      options.map((o) => {
        if (o.id !== optId) return o;
        const newVals = [...o.values];
        splitVals.forEach((val) => {
          let finalVal = val;
          // If option is Color and user typed a raw hex code, auto-detect name with hex
          if (isColor && (/^#([A-Fa-f0-9]{3}){1,2}$/.test(val) || /^([A-Fa-f0-9]{6})$/.test(val))) {
            const detected = detectColorName(val);
            finalVal = `${detected.name} (${detected.hex})`;
          }
          if (!newVals.includes(finalVal)) {
            newVals.push(finalVal);
          }
        });
        return { ...o, values: newVals };
      })
    );

    setEditingOptionValues({ ...editingOptionValues, [optId]: '' });
    notifyChange();
  };

  const handleAddSpecificValue = (optId: string, val: string) => {
    const clean = val.trim();
    if (!clean) return;
    setOptions(
      options.map((o) => {
        if (o.id !== optId) return o;
        if (o.values.includes(clean)) return o;
        return { ...o, values: [...o.values, clean] };
      })
    );
    setEditingOptionValues({ ...editingOptionValues, [optId]: '' });
    notifyChange();
  };

  const handleRemoveOptionValue = (optId: string, valToRemove: string) => {
    setOptions(
      options.map((o) => (o.id === optId ? { ...o, values: o.values.filter((v) => v !== valToRemove) } : o))
    );
    notifyChange();
  };

  const handleDeleteOption = (optId: string) => {
    const updated = options.filter((o) => o.id !== optId);
    setOptions(updated);
    if (updated.length === 0) {
      setHasVariants(false);
    }
    notifyChange();
  };

  const handleDoneOption = (optId: string) => {
    if (editingOptionValues[optId]?.trim()) {
      handleAddOptionValue(optId);
    }
    setOptions(options.map((o) => (o.id === optId ? { ...o, isEditing: false } : o)));
    notifyChange();
  };

  const handleEditOption = (optId: string) => {
    setOptions(options.map((o) => (o.id === optId ? { ...o, isEditing: true } : o)));
  };

  // Generate Cartesian combinations for Variants Table
  const generatedVariantCombinations = useMemo(() => {
    const activeOptions = options.filter((o) => o.values.length > 0);
    if (activeOptions.length === 0) return [];

    let combinations: Record<string, string>[] = [{}];
    activeOptions.forEach((opt) => {
      const nextCombos: Record<string, string>[] = [];
      combinations.forEach((prev) => {
        opt.values.forEach((val) => {
          nextCombos.push({ ...prev, [opt.name]: val });
        });
      });
      combinations = nextCombos;
    });

    return combinations.map((combo, idx) => {
      const title = Object.values(combo).join(' / ');
      const existing = variantsList.find((v) => v.title === title || v.id === `var-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
      const skuSuffix = Object.values(combo)
        .map((v) => v.slice(0, 3).toUpperCase())
        .join('-');
      return {
        id: existing?.id || `var-${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || idx}`,
        title,
        price: existing?.price !== undefined ? existing.price : price,
        compareAtPrice: existing?.compareAtPrice !== undefined ? existing.compareAtPrice : compareAtPrice,
        sku: existing?.sku || `${sku}-${skuSuffix}`,
        inventory: existing?.inventory !== undefined ? existing.inventory : (availableQty || 100),
        image: existing?.image || (images.length > 0 ? images[0] : undefined),
        options: combo
      };
    });
  }, [options, price, compareAtPrice, sku, variantsList, images, availableQty]);

  const handleUpdateVariantPrice = (comboId: string, newPrice: number) => {
    setVariantsList((prev) => {
      const idx = prev.findIndex((v) => v.id === comboId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], price: newPrice };
        return updated;
      }
      const combo = generatedVariantCombinations.find((c) => c.id === comboId);
      if (combo) {
        return [...prev, { ...combo, price: newPrice }];
      }
      return prev;
    });
    notifyChange();
  };

  const handleUpdateVariantInventory = (comboId: string, newInventory: number) => {
    setVariantsList((prev) => {
      const idx = prev.findIndex((v) => v.id === comboId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], inventory: newInventory };
        return updated;
      }
      const combo = generatedVariantCombinations.find((c) => c.id === comboId);
      if (combo) {
        return [...prev, { ...combo, inventory: newInventory }];
      }
      return prev;
    });
    notifyChange();
  };

  const handleUpdateVariantSku = (comboId: string, newSku: string) => {
    setVariantsList((prev) => {
      const idx = prev.findIndex((v) => v.id === comboId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], sku: newSku };
        return updated;
      }
      const combo = generatedVariantCombinations.find((c) => c.id === comboId);
      if (combo) {
        return [...prev, { ...combo, sku: newSku }];
      }
      return prev;
    });
    notifyChange();
  };

  const handleApplyBasePriceToAllVariants = () => {
    setVariantsList(
      generatedVariantCombinations.map((c) => ({
        ...c,
        price: price
      }))
    );
    notifyChange();
  };

  const handleApplyBaseInventoryToAllVariants = () => {
    setVariantsList(
      generatedVariantCombinations.map((c) => ({
        ...c,
        inventory: availableQty
      }))
    );
    notifyChange();
  };

  // 10. CATEGORY METAFIELDS (EXACT FROM SHOPIFY PDF PAGE 2 & 3)
  const [material, setMaterial] = useState(
    initialProduct?.categoryMetafields?.material || 'Aluminum'
  );
  const [anglesSupported, setAnglesSupported] = useState(
    initialProduct?.categoryMetafields?.anglesSupported || 'Adjustable'
  );
  const [compatibleDevices, setCompatibleDevices] = useState<string[]>(
    initialProduct?.categoryMetafields?.compatibleDevice || [
      'Tablet',
      'Smartphone',
      'Laptop'
    ]
  );
  const [newDeviceInput, setNewDeviceInput] = useState('');
  const [categoryFeatures, setCategoryFeatures] = useState<string[]>(
    initialProduct?.categoryMetafields?.features || [
      'Foldable',
      'Lightweight',
      'Portable',
      'Adjustable'
    ]
  );
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [powerSource, setPowerSource] = useState(
    initialProduct?.categoryMetafields?.powerSource || 'Manual / No Power'
  );

  // Optional expandable metafields
  const [connectorGender, setConnectorGender] = useState('');
  const [showConnector, setShowConnector] = useState(false);
  const [wirelessStandard, setWirelessStandard] = useState('');
  const [showWireless, setShowWireless] = useState(false);
  const [vesaPattern, setVesaPattern] = useState('');
  const [showVesa, setShowVesa] = useState(false);

  // 11. PRODUCT METAFIELDS (PAGE 3)
  const [specificationText, setSpecificationText] = useState(
    initialProduct?.productMetafields?.specification ||
      'Product Type: Multi-Function Device Stand | Material: Aluminum Alloy | Compatibility: Laptops up to 15.6", Tablets, Phones | Finish: Matte Anodized'
  );
  const [warrantyText, setWarrantyText] = useState(
    initialProduct?.productMetafields?.warranty ||
      initialProduct?.warranty ||
      'There is no warranty provided with this product.'
  );

  // 12. VARIANT METAFIELDS / GOOGLE SHOPPING (PAGE 3)
  const [googleAgeGroup, setGoogleAgeGroup] = useState(
    initialProduct?.variantMetafields?.googleAgeGroup || 'All Ages'
  );
  const [googleCondition, setGoogleCondition] = useState(
    initialProduct?.variantMetafields?.googleCondition || 'New'
  );
  const [googleGender, setGoogleGender] = useState(
    initialProduct?.variantMetafields?.googleGender || 'Unisex'
  );
  const [googleMpn, setGoogleMpn] = useState(
    initialProduct?.variantMetafields?.googleMpn || 'BX-STAND-881'
  );

  // 13. SEARCH ENGINE LISTING (SEO PREVIEW & EDIT)
  const [seoTitle, setSeoTitle] = useState(
    initialProduct?.seo?.title ||
      'Multi-Function Foldable Laptop & Tablet Stand – Portable Adjustable Desk Stand'
  );
  const [seoDescription, setSeoDescription] = useState(
    initialProduct?.seo?.description ||
      'Create a comfortable and organized workspace with this Multi-Function Laptop & Tablet Stand. Designed for modern users, this adjustable stand supports laptops, tablets, and smartphones...'
  );
  const [seoHandle, setSeoHandle] = useState(
    initialProduct?.seo?.handle ||
      'multi-function-foldable-laptop-tablet-stand-portable-adjustable-desk-stand'
  );
  const [isEditingSeo, setIsEditingSeo] = useState(false);

  // DROPSHIP 1-CLICK IMPORTER STATE (CJ, ALIEXPRESS, 1688, ALIBABA, TAOBAO)
  const [isDropshipQuickImportOpen, setIsDropshipQuickImportOpen] = useState(false);
  const [dropshipUrlInput, setDropshipUrlInput] = useState('');
  const [isDropshipFetching, setIsDropshipFetching] = useState(false);
  const [dropshipExtractedData, setDropshipExtractedData] = useState<Product | null>(null);
  const [dropshipSourcePriceText, setDropshipSourcePriceText] = useState('');
  const [dropshipActiveImgIdx, setDropshipActiveImgIdx] = useState(0);

  const handleFetchDropshipForEditor = async () => {
    if (!dropshipUrlInput.trim()) {
      showToast('অনুগ্রহ করে পণ্যের লিঙ্ক বা Product ID দিন');
      return;
    }
    setIsDropshipFetching(true);
    setDropshipExtractedData(null);
    try {
      const clean = dropshipUrlInput.trim();
      const isCJ = clean.toLowerCase().includes('cjdropshipping') || clean.toLowerCase().includes('cjdropship') || /^\d{8,16}$/.test(clean);
      const rule = getStoredPricingRule();
      
      if (isCJ) {
        const cjConfig = getStoredCJConfig();
        const res = await fetchCJProductData(clean, cjConfig, rule);
        setDropshipExtractedData(res.product);
        setDropshipSourcePriceText(`$${res.rawData.sourcePriceUSD} USD`);
        setDropshipActiveImgIdx(0);
        showToast('CJ Dropshipping পণ্য সফলভাবে ফেচ হয়েছে!');
      } else {
        const parsed = parseDropshipUrl(clean, undefined, rule);
        setDropshipExtractedData(parsed.product);
        setDropshipSourcePriceText(parsed.sourcePriceFormatted);
        setDropshipActiveImgIdx(0);
        showToast('ড্রপশিপ পণ্য সফলভাবে এক্সট্রাক্ট হয়েছে!');
      }
    } catch {
      showToast('পণ্য ফেচ করতে সমস্যা হয়েছে। লিঙ্কটি পুনরায় চেক করুন।');
    } finally {
      setIsDropshipFetching(false);
    }
  };

  const handleApplyDropshipProductToForm = (prod: Product) => {
    setName(prod.name);
    if (prod.category) {
      setCategory(prod.category);
    }
    if (prod.brand) {
      setBrand(prod.brand);
      if (!customBrands.includes(prod.brand)) {
        const updated = [...customBrands, prod.brand];
        setCustomBrands(updated);
        try {
          localStorage.setItem('banglaxpress_custom_brands', JSON.stringify(updated));
        } catch {}
      }
    }
    if (prod.vendor) {
      setVendor(prod.vendor);
      if (!customVendors.includes(prod.vendor)) {
        const updated = [...customVendors, prod.vendor];
        setCustomVendors(updated);
        try {
          localStorage.setItem('banglaxpress_custom_vendors', JSON.stringify(updated));
        } catch {}
      }
    }
    if (prod.productType) {
      setProductType(prod.productType);
    }
    if (prod.description) {
      setDescription(prod.description);
    }
    if (prod.images && prod.images.length > 0) {
      setImages(prod.images);
    }
    if (prod.price) {
      setPrice(prod.price);
    }
    if (prod.originalPrice) {
      setCompareAtPrice(prod.originalPrice);
    }
    if (prod.costPerItem) {
      setCostPerItem(prod.costPerItem);
    }
    if (prod.stockCount) {
      setAvailableQty(prod.stockCount);
    }
    if (prod.sku) {
      setSku(prod.sku);
    }
    if (prod.features && prod.features.length > 0) {
      setCategoryFeatures(prod.features);
    }
    if (prod.specifications) {
      const specsStr = Object.entries(prod.specifications).map(([k, v]) => `${k}: ${v}`).join(' | ');
      setSpecificationText(specsStr);
    }
    if (prod.warranty) {
      setWarrantyText(prod.warranty);
    }
    if (prod.colors && prod.colors.length > 0) {
      setVariantColors(prod.colors.map(c => c.name));
    }
    if (prod.weight) {
      setWeight(prod.weight);
    }
    if (prod.countryOfOrigin) {
      setCountryOfOrigin(prod.countryOfOrigin);
    }
    if (prod.seo) {
      if (prod.seo.title) setSeoTitle(prod.seo.title);
      if (prod.seo.description) setSeoDescription(prod.seo.description);
      if (prod.seo.handle) setSeoHandle(prod.seo.handle);
    }
    setIsDropshipQuickImportOpen(false);
    notifyChange();
    showToast(`'${prod.name}' এর সব তথ্য ও ${prod.images?.length || 0}টি ছবি সফলভাবে এডিটরে লোড হয়েছে!`);
  };

  // SAVE BAR / NOTIFICATION
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mark changes
  const notifyChange = () => setHasChanges(true);

  // Toolbar formatting helper
  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    setDescription((prev) => prev + `\n${prefix} ` + suffix);
    notifyChange();
  };

  // Type & Vendor helpers
  const handleAddCustomType = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (!customTypes.includes(trimmed)) {
      const updated = [...customTypes, trimmed];
      setCustomTypes(updated);
      try {
        localStorage.setItem('banglaxpress_custom_types', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setProductType(trimmed);
    setIsNewTypeModalOpen(false);
    setIsTypeDropdownOpen(false);
    setNewTypeName('');
    showToast(`নতুন প্রোডাক্ট টাইপ '${trimmed}' সফলভাবে নির্ধারণ করা হয়েছে!`);
    notifyChange();
  };

  const handleAddCustomBrand = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (!customBrands.includes(trimmed)) {
      const updated = [...customBrands, trimmed];
      setCustomBrands(updated);
      try {
        localStorage.setItem('banglaxpress_custom_brands', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setBrand(trimmed);
    setIsNewBrandModalOpen(false);
    setIsBrandDropdownOpen(false);
    setNewBrandName('');
    showToast(`নতুন ব্র্যান্ড '${trimmed}' সফলভাবে নির্ধারণ করা হয়েছে!`);
    notifyChange();
  };

  const handleAddCustomVendor = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (!customVendors.includes(trimmed)) {
      const updated = [...customVendors, trimmed];
      setCustomVendors(updated);
      try {
        localStorage.setItem('banglaxpress_custom_vendors', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setVendor(trimmed);
    setIsNewVendorModalOpen(false);
    setIsVendorDropdownOpen(false);
    setNewVendorName('');
    showToast(`নতুন ভেন্ডর '${trimmed}' সফলভাবে নির্ধারণ করা হয়েছে!`);
    notifyChange();
  };

  // Tag helper
  const handleAddTag = (tagToAdd?: string) => {
    const rawVal = (tagToAdd !== undefined ? tagToAdd : tagInput).trim();
    if (!rawVal) return;

    // Support comma or newline separated tags
    const items = rawVal.split(/[,,\n]+/).map((s) => s.trim()).filter(Boolean);
    const newTags = [...tags];
    let addedCount = 0;
    items.forEach((item) => {
      if (!newTags.includes(item)) {
        newTags.push(item);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setTags(newTags);
      if (tagToAdd === undefined) setTagInput('');
      notifyChange();
    }
  };

  const handleToggleTag = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTags(tags.filter((item) => item !== trimmed));
    } else {
      setTags([...tags, trimmed]);
    }
    notifyChange();
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
    notifyChange();
  };

  // Collection & Category helpers
  const handleAddCollection = (nameToAdd?: string) => {
    const targetName = (nameToAdd || collectionInput).trim();
    if (!targetName) return;

    if (!collections.includes(targetName)) {
      setCollections((prev) => [...prev, targetName]);

      // If category is default or empty, set this as primary category
      if (!category || category === 'Laptop Stands in Computer Risers & Stands') {
        setCategory(targetName);
      }

      // Check if this exists in storeCategories; if not, automatically register it as a store category!
      const existsInStore = storeCategories.some(
        (c) => c.name.toLowerCase() === targetName.toLowerCase()
      );
      if (!existsInStore) {
        const slug = targetName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: targetName,
          banglaName: targetName,
          slug: slug || `cat-${Date.now()}`,
          iconName: 'Tag',
          image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
          itemCount: 1,
          subcategories: []
        };
        persistNewCategoryToStore(newCat);
      }

      showToast(`'${targetName}' ক্যাটাগরি প্রোডাক্টে যুক্ত করা হয়েছে!`);
      notifyChange();
    }
    setCollectionInput('');
    setIsCollectionDropdownOpen(false);
  };

  const handleToggleCollection = (colName: string) => {
    const trimmed = colName.trim();
    if (collections.includes(trimmed)) {
      setCollections(collections.filter((c) => c !== trimmed));
      notifyChange();
    } else {
      handleAddCollection(trimmed);
    }
  };

  const handleCreateNewCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = newCategoryName.trim();
    if (!nameTrimmed) return;

    const slug = nameTrimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: nameTrimmed,
      banglaName: newCategoryBanglaName.trim() || nameTrimmed,
      slug: slug || `cat-${Date.now()}`,
      iconName: 'Tag',
      image:
        newCategoryImage.trim() ||
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
      itemCount: 1,
      subcategories: []
    };

    persistNewCategoryToStore(newCat);

    if (!collections.includes(nameTrimmed)) {
      setCollections((prev) => [...prev, nameTrimmed]);
    }
    setCategory(nameTrimmed);

    showToast(`নতুন ক্যাটাগরি '${nameTrimmed}' সফলভাবে তৈরি ও প্রোডাক্টে যুক্ত করা হয়েছে!`);
    setIsNewCategoryModalOpen(false);
    setNewCategoryName('');
    setNewCategoryBanglaName('');
    setIsCollectionDropdownOpen(false);
    notifyChange();
  };

  // Color Variant helper
  const handleAddColor = () => {
    if (newColorInput.trim() && !variantColors.includes(newColorInput.trim())) {
      setVariantColors([...variantColors, newColorInput.trim()]);
      setNewColorInput('');
      notifyChange();
    }
  };

  // Image Upload Handlers
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      notifyChange();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus('ছবি আপলোড হচ্ছে...');
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (res) {
          setImages((prev) => [...prev, res]);
          setUploadStatus('সফলভাবে আপলোড হয়েছে!');
          setTimeout(() => setUploadStatus(null), 2500);
          notifyChange();
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Load exact PDF preset
  const handleLoadExactShopifyPDFPreset = () => {
    setName(
      'Multi-Function Foldable Laptop & Tablet Stand – Portable Adjustable Desk Stand'
    );
    setStatus('active');
    setCategory('Laptop Stands in Computer Risers & Stands');
    setProductType('Laptop & Tablet Stand');
    setBrand('Merrono');
    setVendor('Merrono');
    setCollections(['Computer & IT Accessories']);
    setTags(['Laptop & Tablet Stand']);
    setThemeTemplate('Default product');
    setPrice(899);
    setCompareAtPrice(1450);
    setCostPerItem(560);
    setChargeTax(false);
    setInventoryTracked(true);
    setAvailableQty(5);
    setSku('BX-STAND-881');
    setBarcode('8811531075778');
    setIsPhysicalProduct(true);
    setPackageType('Store default • Sample box - 22');
    setWeight(0.35);
    setWeightUnit('kg');
    setVariantColors(['Orange', 'Silver', 'Black']);
    setMaterial('Aluminum');
    setAnglesSupported('Adjustable');
    setCompatibleDevices(['Tablet', 'Smartphone', 'Laptop']);
    setCategoryFeatures([
      'Foldable',
      'Lightweight',
      'Portable',
      'Adjustable'
    ]);
    setPowerSource('Manual / No Power');
    setSpecificationText(
      'Product Type: Multi-Function Device Stand | Material: Aluminum Alloy | Compatibility: Laptops 10-15.6", Tablets, Phones | Angles: Multi-Level Tilt'
    );
    setWarrantyText('There is no warranty provided with this product.');
    setGoogleAgeGroup('Adult');
    setGoogleCondition('New');
    setGoogleGender('Unisex');
    setGoogleMpn('BX-STAND-881');
    setSeoTitle(
      'Multi-Function Foldable Laptop & Tablet Stand – Portable Adjustable Desk Stand'
    );
    setSeoDescription(
      'Create a comfortable and organized workspace with this Multi-Function Laptop & Tablet Stand. Designed for modern users, this adjustable stand supports laptops, tablets, and smartphones...'
    );
    setSeoHandle(
      'multi-function-foldable-laptop-tablet-stand-portable-adjustable-desk-stand'
    );
    setHasChanges(true);
  };

  // Final Save Handler
  const handleSaveProduct = () => {
    if (!name.trim()) {
      alert('অনুগ্রহ করে প্রোডাক্টের শিরোনাম (Title) প্রদান করুন!');
      return;
    }

    // Build specs record from category metafields + specification text
    const specsRecord: Record<string, string> = {};
    if (material) specsRecord['Material'] = material;
    if (anglesSupported) specsRecord['Angles Supported'] = anglesSupported;
    if (compatibleDevices.length)
      specsRecord['Compatible Device'] = compatibleDevices.join(', ');
    if (categoryFeatures.length)
      specsRecord['Features'] = categoryFeatures.join(', ');
    if (powerSource) specsRecord['Power Source'] = powerSource;

    // Parse additional specs lines
    specificationText.split('|').forEach((chunk) => {
      const [k, v] = chunk.split(':');
      if (k && v) specsRecord[k.trim()] = v.trim();
    });

    const discount =
      compareAtPrice > price
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

    const savedProduct: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      banglaName:
        initialProduct?.banglaName ||
        'মাল্টি-ফাংশন ফোল্ডেবল ল্যাপটপ ও ট্যাবলেট স্ট্যান্ড',
      slug:
        seoHandle ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      category: category,
      subcategory: productType,
      price: Number(price) || 899,
      originalPrice: Number(compareAtPrice) || Number(price),
      discountPercent: discount,
      rating: initialProduct?.rating || 4.9,
      reviewCount: initialProduct?.reviewCount || 18,
      images: images.length
        ? images
        : [
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'
          ],
      inStock: availableQty > 0,
      stockCount: Number(availableQty) || 0,
      soldCount: initialProduct?.soldCount || 34,
      isFlashDeal: initialProduct?.isFlashDeal ?? true,
      isFeatured: initialProduct?.isFeatured ?? true,
      brand: brand.trim() || 'Merrono',
      sku: sku,
      shortDescription: description.slice(0, 160) + '...',
      description: description,
      banglaDescription:
        initialProduct?.banglaDescription ||
        'আপনার কাজ ও পড়াশোনাকে আরও আরামদায়ক ও নিখুঁত করতে ফোল্ডেবল ও অ্যাডজাস্টেবল অ্যালুমিনিয়াম স্ট্যান্ড।',
      features: categoryFeatures,
      specifications: specsRecord,
      warranty: warrantyText,
      colors: (options.find((o) => o.name.toLowerCase() === 'color')?.values || variantColors).map((c) => ({
        name: getDisplayNameForColor(c),
        hex: getColorHex(c)
      })),
      sizes: options.find((o) => o.name.toLowerCase() === 'size')?.values || initialProduct?.sizes,
      options: options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        values: opt.values
      })),
      variants: generatedVariantCombinations,
      tags: tags,

      // Specific Shopify PDF Fields
      status: status,
      publishing: ['All channels', 'Online Store'],
      productType: productType,
      vendor: vendor,
      collections: collections,
      themeTemplate: themeTemplate,
      costPerItem: costPerItem,
      chargeTax: chargeTax,
      inventoryTracked: inventoryTracked,
      continueSellingWhenOutOfStock: continueSelling,
      barcode: barcode,
      isPhysicalProduct: isPhysicalProduct,
      packageType: packageType,
      weight: weight,
      weightUnit: weightUnit,
      countryOfOrigin: countryOfOrigin,
      hsCode: hsCode,
      categoryMetafields: {
        color: options.find((o) => o.name.toLowerCase() === 'color')?.values || variantColors,
        material: options.find((o) => o.name.toLowerCase() === 'fabric' || o.name.toLowerCase() === 'material')?.values.join(', ') || material,
        anglesSupported: anglesSupported,
        compatibleDevice: compatibleDevices,
        features: categoryFeatures,
        powerSource: powerSource,
        connectorGender: connectorGender,
        wirelessChargingStandard: wirelessStandard,
        vesaMountingPattern: vesaPattern,
        neckline: options.find((o) => o.name.toLowerCase() === 'neckline')?.values.join(', '),
        sleeveStyle: options.find((o) => o.name.toLowerCase().includes('sleeve'))?.values.join(', '),
        decorationTechnique: options.find((o) => o.name.toLowerCase().includes('decoration'))?.values.join(', ')
      },
      productMetafields: {
        specification: specificationText,
        warranty: warrantyText
      },
      variantMetafields: {
        googleAgeGroup: googleAgeGroup,
        googleCondition: googleCondition,
        googleGender: googleGender,
        googleMpn: googleMpn
      },
      seo: {
        title: seoTitle,
        description: seoDescription,
        handle: seoHandle
      }
    };

    onSave(savedProduct);
    setSaveSuccess(true);
    setHasChanges(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-[#f1f1f1] text-[#202223] min-h-screen flex flex-col font-sans pb-16">
      {/* TOP STICKY BAR (SHOPIFY POLARIS STYLE - PAGE 1 & PAGE 4) */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="text-gray-400">Products</span>
            <span className="text-gray-300">›</span>
            <h1 className="font-bold text-gray-900 truncate max-w-sm sm:max-w-lg">
              {name || 'Untitled product'}
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDropshipQuickImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="সিজে ড্রপশিপিং বা যেকোনো লিংক থেকে ১-ক্লিকে সব তথ্য ও ছবি লোড করুন"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>⚡ ড্রপশিপ ১-ক্লিক ইম্পোর্ট</span>
          </button>

          <button
            type="button"
            onClick={handleLoadExactShopifyPDFPreset}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all shadow-xs"
            title="পিডিএফের স্ট্যান্ড প্রডাক্টের সম্পূর্ণ ডাটা লোড করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>পিডিএফ ডেমো লোড করুন</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
          >
            বাতিল
          </button>

          <button
            type="button"
            onClick={handleSaveProduct}
            className="px-4 py-1.5 rounded-lg bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <Check className="w-4 h-4" />
          <span>প্রোডাক্ট সফলভাবে শপিফাই ব্যাকএন্ডে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN CONTAINER (EXACT SHOPIFY DESKTOP LAYOUT) */}
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: TITLE, DESC, MEDIA, PRICING, INVENTORY, META */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. TITLE CARD (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                notifyChange();
              }}
              placeholder="e.g. Multi-Function Foldable Laptop & Tablet Stand"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] transition-all"
            />
          </div>

          {/* 2. DESCRIPTION CARD WITH RICH TEXT TOOLBAR (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Description
            </label>

            {/* Shopify-like Rich Text Toolbar */}
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#008060]">
              <div className="bg-gray-50 border-b border-gray-200 p-1.5 flex flex-wrap items-center gap-1 text-xs text-gray-700 select-none">
                <select
                  value={textFormat}
                  onChange={(e) => setTextFormat(e.target.value)}
                  className="bg-transparent px-2 py-1 border border-gray-300 rounded text-xs outline-none cursor-pointer hover:bg-white"
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>

                <div className="h-4 w-px bg-gray-300 mx-1" />

                <button
                  type="button"
                  onClick={() => handleInsertFormat('**', '**')}
                  className="px-2 py-1 rounded hover:bg-gray-200 font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('*', '*')}
                  className="px-2 py-1 rounded hover:bg-gray-200 italic"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('<u>', '</u>')}
                  className="px-2 py-1 rounded hover:bg-gray-200 underline"
                  title="Underline"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('✨', '')}
                  className="px-2 py-1 rounded hover:bg-gray-200 text-rose-600 font-bold"
                  title="Color"
                >
                  A▾
                </button>

                <div className="h-4 w-px bg-gray-300 mx-1" />

                <button
                  type="button"
                  onClick={() => handleInsertFormat('•', '')}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                  title="Bullet List"
                >
                  ☰
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('1.', '')}
                  className="px-2 py-1 rounded hover:bg-gray-200 font-mono"
                  title="Numbered List"
                >
                  1.
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat('🔗 [Link](https://banglaxpress.store)', '')}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                  title="Insert Link"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                  title="Insert Image"
                >
                  🖼️
                </button>
              </div>

              <textarea
                rows={10}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  notifyChange();
                }}
                placeholder="Write product overview, highlights, and features..."
                className="w-full p-3 text-xs leading-relaxed text-gray-800 outline-none resize-y min-h-[160px]"
              />
            </div>
          </div>

          {/* 3. MEDIA CARD (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                Media
              </label>
              <span className="text-[11px] text-gray-400">
                {images.length} টি ছবি আপলোড করা হয়েছে
              </span>
            </div>

            {/* Upload status message */}
            {uploadStatus && (
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">
                {uploadStatus}
              </p>
            )}

            {/* Media Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50 shadow-xs ${
                    idx === 0 ? 'ring-2 ring-[#008060]' : ''
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#008060] text-white shadow-xs">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Move to cover
                        const next = [img, ...images.filter((_, i) => i !== idx)];
                        setImages(next);
                        notifyChange();
                      }}
                      className="p-1.5 rounded-full bg-white text-gray-700 hover:text-[#008060] shadow-xs"
                      title="Set as Cover"
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== idx));
                        notifyChange();
                      }}
                      className="p-1.5 rounded-full bg-white text-rose-600 hover:bg-rose-50 shadow-xs"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Media Tile with plus */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border-2 border-dashed border-gray-300 hover:border-[#008060] aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/20"
              >
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#008060]" />
                <span className="text-[11px] font-semibold text-gray-500 mt-1">
                  Add files
                </span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Or add from URL */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="অথবা সরাসরি ছবির ওয়েব লিঙ্ক দিন (https://...)"
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* 4. CATEGORY CARD (PAGE 1 & PAGE 2) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <span>Category</span>
                <span className="text-[10px] font-normal text-gray-400 font-sans">(ক্যাটাগরি)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="text-[11px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                <Plus className="w-3 h-3" />
                <span>+ নতুন ক্যাটাগরি</span>
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                if (val && !collections.includes(val)) {
                  setCollections((prev) => [...prev, val]);
                }
                notifyChange();
              }}
              className="w-full px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg bg-white outline-none focus:border-[#008060]"
            >
              {category && !availableCategoriesList.some((c) => c.name.toLowerCase() === category.toLowerCase()) && (
                <option value={category}>{category}</option>
              )}
              {availableCategoriesList.map((catItem, idx) => (
                <option key={idx} value={catItem.name}>
                  {catItem.name} {catItem.banglaName ? `(${catItem.banglaName})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400">
              Determines tax rates and adds metafields to improve search, filters, and cross-channel sales
            </p>
          </div>

          {/* 5. PRICING CARD (PAGE 2) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900">Pricing</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(Number(e.target.value));
                      notifyChange();
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Compare-at price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => {
                      setCompareAtPrice(Number(e.target.value));
                      notifyChange();
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>
              </div>
            </div>

            {/* Cost per item & Profit Calculator */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Cost per item
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={costPerItem}
                    onChange={(e) => {
                      setCostPerItem(Number(e.target.value));
                      notifyChange();
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-gray-500 mb-1">Profit</span>
                <p className="text-xs font-mono font-bold text-gray-900 py-2">
                  ৳{profit.toFixed(2)}
                </p>
              </div>

              <div>
                <span className="block text-[11px] text-gray-500 mb-1">Margin</span>
                <p className="text-xs font-mono font-bold text-emerald-600 py-2">
                  {margin}%
                </p>
              </div>
            </div>

            {/* Tax Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
              <input
                type="checkbox"
                checked={chargeTax}
                onChange={(e) => {
                  setChargeTax(e.target.checked);
                  notifyChange();
                }}
                className="w-4 h-4 text-[#008060] rounded"
              />
              <span className="text-xs text-gray-700">
                Charge tax on this product
              </span>
            </label>
          </div>

          {/* 6. INVENTORY CARD (PAGE 2) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">Inventory</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                <span>Inventory tracked</span>
                <input
                  type="checkbox"
                  checked={inventoryTracked}
                  onChange={(e) => {
                    setInventoryTracked(e.target.checked);
                    notifyChange();
                  }}
                  className="w-4 h-4 text-[#008060] rounded"
                />
              </label>
            </div>

            {/* Locations Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-[10.5px] uppercase font-bold text-gray-500">
                  <tr>
                    <th className="p-2.5">Locations</th>
                    <th className="p-2.5 text-center">Unavailable</th>
                    <th className="p-2.5 text-center">Committed</th>
                    <th className="p-2.5 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr>
                    <td className="p-2.5 text-gray-800">Shop location</td>
                    <td className="p-2.5 text-center text-gray-400">{unavailableQty}</td>
                    <td className="p-2.5 text-center text-gray-400">{committedQty}</td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        value={availableQty}
                        onChange={(e) => {
                          setAvailableQty(Number(e.target.value));
                          notifyChange();
                        }}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold border border-gray-300 rounded outline-none focus:border-[#008060]"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    notifyChange();
                  }}
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Barcode (ISBN, UPC, GTIN, etc.)
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => {
                    setBarcode(e.target.value);
                    notifyChange();
                  }}
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={continueSelling}
                onChange={(e) => {
                  setContinueSelling(e.target.checked);
                  notifyChange();
                }}
                className="w-4 h-4 text-[#008060] rounded"
              />
              <span className="text-xs text-gray-700">
                Continue selling when out of stock
              </span>
            </label>
          </div>

          {/* 7. SHIPPING CARD (PAGE 2) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">Shipping</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                <span>Physical product</span>
                <input
                  type="checkbox"
                  checked={isPhysicalProduct}
                  onChange={(e) => {
                    setIsPhysicalProduct(e.target.checked);
                    notifyChange();
                  }}
                  className="w-4 h-4 text-[#008060] rounded"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Package
                </label>
                <select
                  value={packageType}
                  onChange={(e) => {
                    setPackageType(e.target.value);
                    notifyChange();
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:border-[#008060]"
                >
                  <option value="Store default • Sample box - 22">
                    Store default • Sample box - 22
                  </option>
                  <option value="Small Pouch (Flyer)">Small Pouch (Flyer)</option>
                  <option value="Standard Carton">Standard Carton</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Product weight
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => {
                      setWeight(Number(e.target.value));
                      notifyChange();
                    }}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => {
                      setWeightUnit(e.target.value as any);
                      notifyChange();
                    }}
                    className="w-20 px-2 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:border-[#008060]"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customs Information Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCustoms(!showCustoms)}
                className="text-xs text-[#008060] font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Country of origin & HS Code</span>
                {showCustoms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCustoms && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Country/Region of origin
                    </label>
                    <input
                      type="text"
                      value={countryOfOrigin}
                      onChange={(e) => {
                        setCountryOfOrigin(e.target.value);
                        notifyChange();
                      }}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      HS (Harmonized System) code
                    </label>
                    <input
                      type="text"
                      value={hsCode}
                      onChange={(e) => {
                        setHsCode(e.target.value);
                        notifyChange();
                      }}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 8. VARIANTS CARD (EXACT SHOPIFY POLARIS REPLICA MATCHING IMAGES 1 & 2) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Variants</h3>
                <p className="text-xs text-gray-500">
                  Add options like size or color to manage multi-attribute variants.
                </p>
              </div>

              {/* Category Breadcrumb & Quick Recommendation Chips (from Image 1) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {productType || 'T-Shirts'} <span className="text-gray-400 font-normal">in</span> {category || 'Clothing Tops'}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CATEGORY_SUGGESTIONS.map((sug) => {
                    const alreadyAdded = options.some((o) => o.name.toLowerCase() === sug.toLowerCase());
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddOptionByName(sug)}
                        className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-gray-200 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{sug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Helper to render the option picker popover right where it was triggered */}
            {(() => {
              const renderOptionPickerPopover = () => {
                if (!showOptionPicker) return null;
                const filtered = RECOMMENDED_OPTIONS.filter((opt) =>
                  opt.toLowerCase().includes(optionSearchQuery.toLowerCase())
                );
                return (
                  <div className="absolute z-50 left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-2.5 space-y-2 animate-in fade-in zoom-in-95">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={optionSearchQuery}
                        onChange={(e) => setOptionSearchQuery(e.target.value)}
                        placeholder="Search"
                        autoFocus
                        className="w-full pl-8 pr-7 py-1.5 text-xs border border-blue-600 rounded-lg outline-none ring-2 ring-blue-100 font-medium"
                      />
                      {optionSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setOptionSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Recommended Header */}
                    <div className="text-[11px] font-bold text-gray-500 px-2 pt-1 uppercase tracking-wider">
                      Recommended
                    </div>

                    {/* Recommended List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
                      {filtered.map((optName) => {
                        const isAdded = options.some((o) => o.name.toLowerCase() === optName.toLowerCase());
                        return (
                          <button
                            key={optName}
                            type="button"
                            onClick={() => handleAddOptionByName(optName)}
                            disabled={isAdded}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                              isAdded
                                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                : 'text-gray-800 hover:bg-gray-100 font-medium'
                            }`}
                          >
                            <span>{optName}</span>
                            {isAdded && <span className="text-[10px] text-gray-400">Added</span>}
                          </button>
                        );
                      })}
                      {filtered.length === 0 && (
                        <p className="text-xs text-gray-400 px-2 py-1">No options match "{optionSearchQuery}"</p>
                      )}
                    </div>

                    {/* Create Custom Option */}
                    <div className="pt-2 border-t border-gray-100">
                      {optionSearchQuery.trim() ? (
                        <button
                          type="button"
                          onClick={() => handleAddOptionByName(optionSearchQuery.trim())}
                          className="w-full text-left px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create custom option "{optionSearchQuery.trim()}"</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-1">
                          <input
                            type="text"
                            value={customOptionName}
                            onChange={(e) => setCustomOptionName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOptionByName(customOptionName);
                              }
                            }}
                            placeholder="Custom option name..."
                            className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddOptionByName(customOptionName)}
                            disabled={!customOptionName.trim()}
                            className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {/* If no options yet, show + Add options like size or color button */}
                  {options.length === 0 && (
                    <div className="relative pt-2 inline-block">
                      <button
                        type="button"
                        onClick={() => setShowOptionPicker(!showOptionPicker)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add options like size or color</span>
                      </button>
                      {renderOptionPickerPopover()}
                    </div>
                  )}

                  {/* LIST OF OPTIONS (EXACT TO SHOPIFY SCREENSHOT) */}
                  {options.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {options.map((opt) => (
                        <div key={opt.id}>
                          {opt.isEditing ? (
                            /* ACTIVE OPTION EDITING CARD (EXACT AS IMAGE 2) */
                            <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3.5 shadow-2xs">
                              {/* Top Row with Drag Handle, Label, and Pill Badge */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                  <label className="text-xs font-bold text-gray-800">Option name</label>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5">
                                  <Database className="w-3 h-3 text-sky-600" />
                                  <span>{opt.name}</span>
                                </span>
                              </div>

                              {/* Option Name Input */}
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) => handleUpdateOptionName(opt.id, e.target.value)}
                                className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 font-medium bg-white"
                                placeholder="Option name (e.g. Size)"
                              />

                              {/* Value Input and Tags */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-800">Option values</label>
                                  {opt.name.toLowerCase() === 'color' && (
                                    <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      <span>HEX Auto-detect Active</span>
                                    </span>
                                  )}
                                </div>

                                {/* Existing Values Badges */}
                                {opt.values.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50/80 rounded-xl border border-gray-200">
                                    {opt.values.map((val, vIdx) => {
                                      const isColor = opt.name.toLowerCase() === 'color';
                                      const colorHex = isColor ? getColorHex(val) : '';
                                      const analysis = isColor ? detectColorName(val) : null;
                                      const displayName = isColor ? getDisplayNameForColor(val) : val;

                                      return (
                                        <span
                                          key={vIdx}
                                          className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-2 shadow-2xs group relative"
                                          title={
                                            analysis
                                              ? `${analysis.name} (${analysis.hex}): ${analysis.description}`
                                              : val
                                          }
                                        >
                                          {isColor && (
                                            <span
                                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                              style={{ backgroundColor: colorHex }}
                                            />
                                          )}
                                          <span>{displayName}</span>
                                          {isColor && (
                                            <span className="font-mono text-[10px] text-gray-500 font-bold uppercase bg-gray-50 px-1 py-0.2 rounded border border-gray-200">
                                              {colorHex}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveOptionValue(opt.id, val)}
                                            className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer text-base leading-none font-bold ml-0.5"
                                            title="Remove value"
                                          >
                                            ×
                                          </button>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Input to Add Values */}
                                {(() => {
                                  const isColor = opt.name.toLowerCase() === 'color';
                                  const currentVal = editingOptionValues[opt.id]?.trim() || '';
                                  const analysis = isColor && currentVal ? detectColorName(currentVal) : null;

                                  return (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        {/* Color Palette / Picker Trigger */}
                                        {isColor && (
                                          <div
                                            className="relative shrink-0 flex items-center"
                                            title="Click to pick a color or enter HEX code"
                                          >
                                            <input
                                              type="color"
                                              value={analysis ? analysis.hex : '#F54927'}
                                              onChange={(e) => {
                                                const hexVal = e.target.value.toUpperCase();
                                                setEditingOptionValues({
                                                  ...editingOptionValues,
                                                  [opt.id]: hexVal
                                                });
                                              }}
                                              className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 bg-white shadow-2xs cursor-pointer hover:border-gray-400 transition-all"
                                            />
                                          </div>
                                        )}

                                        <input
                                          type="text"
                                          value={editingOptionValues[opt.id] || ''}
                                          onChange={(e) =>
                                            setEditingOptionValues({
                                              ...editingOptionValues,
                                              [opt.id]: e.target.value
                                            })
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                              e.preventDefault();
                                              handleAddOptionValue(opt.id);
                                            }
                                          }}
                                          placeholder={
                                            isColor
                                              ? 'Enter color name or HEX (e.g. #F54927, Red, Navy Blue)'
                                              : `Add ${opt.name.toLowerCase()}`
                                          }
                                          className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 bg-white"
                                        />

                                        <button
                                          type="button"
                                          onClick={() => handleAddOptionValue(opt.id)}
                                          disabled={!editingOptionValues[opt.id]?.trim()}
                                          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold border border-gray-300 disabled:opacity-40 transition-colors cursor-pointer"
                                        >
                                          Add
                                        </button>
                                      </div>

                                      {/* Live Color HEX Auto-Detection Card */}
                                      {isColor && analysis && currentVal && (
                                        <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50/70 to-rose-50/70 rounded-xl border border-amber-300 shadow-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                                          <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2.5">
                                              <div
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 ring-2 ring-black/15"
                                                style={{ backgroundColor: analysis.hex }}
                                              />
                                              <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="text-xs font-black text-gray-900">
                                                    {analysis.name}
                                                  </span>
                                                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-800 shadow-2xs">
                                                    {analysis.hex}
                                                  </span>
                                                  {analysis.alias && (
                                                    <span className="text-[10px] text-gray-500 font-semibold">
                                                      (or {analysis.alias})
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-[11px] text-amber-950 font-semibold leading-tight mt-0.5">
                                                  {getColorSummaryStatement(currentVal)}
                                                </p>
                                                {analysis.banglaName && (
                                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                                    {analysis.banglaName}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                                              <Sparkles className="w-3 h-3 text-amber-600" />
                                              Auto-detected
                                            </span>
                                          </div>

                                          {/* 1-Click Action Add Buttons */}
                                          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                              Add as:
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleAddSpecificValue(opt.id, analysis.name)}
                                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-gray-800 shadow-2xs cursor-pointer transition-colors"
                                            >
                                              "{analysis.name}"
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleAddSpecificValue(opt.id, `${analysis.name} (${analysis.hex})`)
                                              }
                                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                                            >
                                              "{analysis.name} ({analysis.hex})"
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleAddSpecificValue(opt.id, analysis.hex)}
                                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-mono font-bold text-gray-800 shadow-2xs cursor-pointer transition-colors"
                                            >
                                              "{analysis.hex}"
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Quick HEX Palette Suggestions */}
                                      {isColor && (
                                        <div className="pt-0.5 space-y-1">
                                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                            HEX Palette Suggestions (Auto-detect):
                                          </span>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            {[
                                              { hex: '#F54927', name: 'Bright Red-Orange (Vermilion)' },
                                              { hex: '#EA580C', name: 'Orange' },
                                              { hex: '#1E293B', name: 'Midnight Black' },
                                              { hex: '#94A3B8', name: 'Silver' },
                                              { hex: '#2563EB', name: 'Royal Blue' },
                                              { hex: '#10B981', name: 'Emerald Green' },
                                              { hex: '#E0A99E', name: 'Rose Gold' },
                                              { hex: '#7FD1B9', name: 'Mint Paste' },
                                              { hex: '#FFFFFF', name: 'White' },
                                              { hex: '#BE123C', name: 'Ruby Red' }
                                            ].map((sw) => (
                                              <button
                                                key={sw.hex}
                                                type="button"
                                                onClick={() => {
                                                  setEditingOptionValues({
                                                    ...editingOptionValues,
                                                    [opt.id]: sw.hex
                                                  });
                                                }}
                                                title={`${sw.name} (${sw.hex})`}
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-medium shadow-2xs cursor-pointer transition-all hover:scale-105 ${
                                                  currentVal.toUpperCase() === sw.hex
                                                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold ring-1 ring-amber-300'
                                                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                                                }`}
                                              >
                                                <span
                                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                                  style={{ backgroundColor: sw.hex }}
                                                />
                                                <span className="font-mono text-[10px]">{sw.hex}</span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <p className="text-[11px] text-gray-400">
                                        Type value and press Enter or comma (e.g.{' '}
                                        {opt.name.toLowerCase() === 'size'
                                          ? 'S, M, L, XL'
                                          : opt.name.toLowerCase() === 'color'
                                          ? '#F54927, Black, Navy Blue, Silver'
                                          : opt.name.toLowerCase().includes('feature')
                                          ? 'Foldable, Waterproof, Lightweight'
                                          : 'Option 1, Option 2'}
                                        )
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Action Buttons: Delete (left) and Done (right) - Exactly as Image 2 */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOption(opt.id)}
                                  className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDoneOption(opt.id)}
                                  className="px-6 py-1.5 bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* COLLAPSED OPTION SUMMARY VIEW */
                            <div className="border border-gray-200 rounded-xl p-3.5 bg-white flex items-center justify-between shadow-2xs hover:border-gray-300 transition-all">
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                <div>
                                  <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                                    <span>{opt.name}</span>
                                    <span className="text-[10px] text-gray-400 font-normal">
                                      ({opt.values.length} values)
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {opt.values.map((v, i) => (
                                      <span
                                        key={i}
                                        className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-[11px] font-semibold text-gray-800"
                                      >
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleEditOption(opt.id)}
                                className="px-3.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* + Add another option button below (Image 2) */}
                      <div className="pt-2 relative inline-block">
                        <button
                          type="button"
                          onClick={() => setShowOptionPicker(!showOptionPicker)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add another option</span>
                        </button>
                        {renderOptionPickerPopover()}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* GENERATED VARIANTS MATRIX TABLE */}
            {generatedVariantCombinations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Generated Variants ({generatedVariantCombinations.length} combinations)
                      </span>
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      Individual prices and inventory tracking per variant combination
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyBasePriceToAllVariants}
                      className="text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg border border-gray-300 transition-colors cursor-pointer"
                    >
                      Apply price (৳{price}) to all
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyBaseInventoryToAllVariants}
                      className="text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg border border-gray-300 transition-colors cursor-pointer"
                    >
                      Apply stock ({availableQty}) to all
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Variant</th>
                        <th className="py-2.5 px-3">Price (৳)</th>
                        <th className="py-2.5 px-3">Available</th>
                        <th className="py-2.5 px-3">SKU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {generatedVariantCombinations.map((combo) => (
                        <tr key={combo.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-2 px-3 font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-700 font-bold border border-gray-200 shrink-0">
                                {combo.title.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="text-xs">{combo.title}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-gray-400 text-xs">৳</span>
                              <input
                                type="number"
                                value={combo.price}
                                onChange={(e) => handleUpdateVariantPrice(combo.id, Number(e.target.value))}
                                className="w-24 px-2 py-1 text-xs font-bold font-mono border border-gray-300 rounded-lg outline-none focus:border-blue-600 text-emerald-700 bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono">
                            <input
                              type="number"
                              value={combo.inventory}
                              onChange={(e) => handleUpdateVariantInventory(combo.id, Number(e.target.value))}
                              className="w-20 px-2 py-1 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-blue-600 text-gray-800 bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono">
                            <input
                              type="text"
                              value={combo.sku}
                              onChange={(e) => handleUpdateVariantSku(combo.id, e.target.value)}
                              className="w-32 px-2 py-1 text-xs font-mono border border-gray-300 rounded-lg outline-none focus:border-blue-600 text-gray-600 bg-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {generatedVariantCombinations.length > 25 && (
                    <div className="p-2 text-center bg-gray-50 text-[11px] text-gray-500 border-t border-gray-100 font-medium">
                      Showing all {generatedVariantCombinations.length} total variants.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 9. CATEGORY METAFIELDS (PAGE 2 & PAGE 3) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">
                Category metafields
              </h3>
              <span className="text-[11px] text-gray-400">
                Laptop Stands in Computer Risers & Stands
              </span>
            </div>

            <div className="space-y-3">
              {/* Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="text-xs font-medium text-gray-600">Color</label>
                <div className="sm:col-span-2 flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-200 bg-gray-50/50">
                  {variantColors.map((col, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-white border border-gray-300 font-medium text-gray-800"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: getColorHex(col) }}
                      />
                      <span>{col}</span>
                      <span className="font-mono text-[9px] text-gray-500 uppercase">{getColorHex(col)}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="text-xs font-medium text-gray-600">Material</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => {
                      setMaterial(e.target.value);
                      notifyChange();
                    }}
                    placeholder="e.g. Aluminum"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              {/* Angles Supported */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="text-xs font-medium text-gray-600">Angles supported</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={anglesSupported}
                    onChange={(e) => {
                      setAnglesSupported(e.target.value);
                      notifyChange();
                    }}
                    placeholder="e.g. Adjustable"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              {/* Compatible Device (Page 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="text-xs font-medium text-gray-600">Compatible device</label>
                <div className="sm:col-span-2 flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-200 bg-gray-50/50">
                  {compatibleDevices.map((dev, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-white border border-gray-300 font-medium flex items-center gap-1"
                    >
                      <span>{dev}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCompatibleDevices(compatibleDevices.filter((d) => d !== dev))
                        }
                        className="text-gray-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newDeviceInput}
                      onChange={(e) => setNewDeviceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDeviceInput.trim()) {
                          e.preventDefault();
                          setCompatibleDevices([...compatibleDevices, newDeviceInput.trim()]);
                          setNewDeviceInput('');
                        }
                      }}
                      placeholder="+ Device..."
                      className="w-20 px-1.5 py-0.5 text-[11px] border border-gray-300 rounded outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Features (Page 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <div>
                  <label className="text-xs font-bold text-gray-700">Features</label>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">Key product highlights</p>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 min-h-[42px] items-center">
                    {categoryFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white border border-gray-300 font-semibold text-gray-800 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCategoryFeatures(categoryFeatures.filter((f) => f !== feat))
                          }
                          className="text-gray-400 hover:text-rose-600 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newFeatureInput.trim()) {
                            e.preventDefault();
                            if (!categoryFeatures.includes(newFeatureInput.trim())) {
                              setCategoryFeatures([...categoryFeatures, newFeatureInput.trim()]);
                            }
                            setNewFeatureInput('');
                          }
                        }}
                        placeholder="+ Add custom feature..."
                        className="w-36 px-2 py-1 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-600 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFeatureInput.trim() && !categoryFeatures.includes(newFeatureInput.trim())) {
                            setCategoryFeatures([...categoryFeatures, newFeatureInput.trim()]);
                            setNewFeatureInput('');
                          }
                        }}
                        disabled={!newFeatureInput.trim()}
                        className="px-2.5 py-1 text-xs font-bold bg-gray-900 text-white rounded-lg disabled:opacity-40 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Feature Quick Recommendation Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Quick Suggestions:</span>
                    {[
                      'Multi-Device Compatibility',
                      'Foldable & Portable',
                      'Adjustable Viewing Angle',
                      'Premium Aluminum Alloy',
                      'Lightweight',
                      'Anti-Slip Silicone Pads',
                      'Fast Heat Dissipation'
                    ].map((sug) => {
                      if (categoryFeatures.includes(sug)) return null;
                      return (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setCategoryFeatures([...categoryFeatures, sug])}
                          className="text-[11px] font-medium text-gray-600 hover:text-blue-700 bg-white hover:bg-blue-50 px-2 py-0.5 rounded-md border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>{sug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Power source */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <label className="text-xs font-medium text-gray-600">Power source</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={powerSource}
                    onChange={(e) => {
                      setPowerSource(e.target.value);
                      notifyChange();
                    }}
                    placeholder="e.g. None / USB Powered"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              {/* Expandable Metafields from Page 3 */}
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-[#008060] font-semibold">
                <button
                  type="button"
                  onClick={() => setShowConnector(!showConnector)}
                  className="hover:underline"
                >
                  + Connector gender
                </button>
                <button
                  type="button"
                  onClick={() => setShowWireless(!showWireless)}
                  className="hover:underline"
                >
                  + Wireless charging standard
                </button>
                <button
                  type="button"
                  onClick={() => setShowVesa(!showVesa)}
                  className="hover:underline"
                >
                  + VESA mounting pattern
                </button>
              </div>

              {showConnector && (
                <div className="pt-2">
                  <label className="block text-[11px] text-gray-600 mb-1">Connector gender</label>
                  <input
                    type="text"
                    value={connectorGender}
                    onChange={(e) => setConnectorGender(e.target.value)}
                    placeholder="Male / Female"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {showWireless && (
                <div className="pt-2">
                  <label className="block text-[11px] text-gray-600 mb-1">Wireless charging standard</label>
                  <input
                    type="text"
                    value={wirelessStandard}
                    onChange={(e) => setWirelessStandard(e.target.value)}
                    placeholder="Qi Standard"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {showVesa && (
                <div className="pt-2">
                  <label className="block text-[11px] text-gray-600 mb-1">VESA mounting pattern</label>
                  <input
                    type="text"
                    value={vesaPattern}
                    onChange={(e) => setVesaPattern(e.target.value)}
                    placeholder="75x75, 100x100"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 10. PRODUCT METAFIELDS (PAGE 3) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900">
              Product metafields
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specification
                </label>
                <textarea
                  rows={2}
                  value={specificationText}
                  onChange={(e) => {
                    setSpecificationText(e.target.value);
                    notifyChange();
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Warranty
                </label>
                <input
                  type="text"
                  value={warrantyText}
                  onChange={(e) => {
                    setWarrantyText(e.target.value);
                    notifyChange();
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                />
              </div>

              <button
                type="button"
                className="text-xs text-[#008060] font-semibold hover:underline"
              >
                + Disclosures
              </button>
            </div>
          </div>

          {/* 11. VARIANT METAFIELDS / GOOGLE (PAGE 3) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900">
              Variant metafields (Google Shopping)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Google: Age Group
                </label>
                <select
                  value={googleAgeGroup}
                  onChange={(e) => setGoogleAgeGroup(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  <option value="All Ages">All Ages</option>
                  <option value="Adult">Adult</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Google: Condition
                </label>
                <select
                  value={googleCondition}
                  onChange={(e) => setGoogleCondition(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  <option value="New">New</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Google: Gender
                </label>
                <select
                  value={googleGender}
                  onChange={(e) => setGoogleGender(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Google: MPN
                </label>
                <input
                  type="text"
                  value={googleMpn}
                  onChange={(e) => setGoogleMpn(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 12. SEARCH ENGINE LISTING CARD (EXACT FROM PAGE 3) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">
                Search engine listing
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingSeo(!isEditingSeo)}
                className="text-xs text-[#008060] font-semibold hover:underline"
              >
                {isEditingSeo ? 'Close SEO editor' : 'Edit website SEO'}
              </button>
            </div>

            {/* Live Google Search Preview Box */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
              <span className="text-[11px] text-gray-600 block">BanglaXpress</span>
              <p className="text-[11px] text-emerald-800 font-mono truncate">
                https://www.banglaxpress.store › products › {seoHandle}
              </p>
              <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                {seoTitle}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {seoDescription}
              </p>
              <span className="text-xs font-mono font-bold text-gray-800 block pt-1">
                ৳{price.toFixed(2)} BDT
              </span>
            </div>

            {/* SEO Inputs Editor */}
            {isEditingSeo && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                    <label className="font-bold">Page title</label>
                    <span>{seoTitle.length} of 70 characters used</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      notifyChange();
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                    <label className="font-bold">Description</label>
                    <span>{seoDescription.length} of 320 characters used</span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      notifyChange();
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    URL handle
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-1.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-[11px] text-gray-500 font-mono">
                      https://www.banglaxpress.store/products/
                    </span>
                    <input
                      type="text"
                      value={seoHandle}
                      onChange={(e) => {
                        setSeoHandle(e.target.value);
                        notifyChange();
                      }}
                      className="flex-1 px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-r-lg outline-none focus:border-[#008060]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: STATUS, PUBLISHING, ORGANIZATION, THEME     */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* 1. STATUS CARD (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                notifyChange();
              }}
              className="w-full px-3 py-2 text-xs font-bold border border-gray-300 rounded-lg bg-white outline-none focus:border-[#008060] cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* 2. PUBLISHING CARD (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-gray-700">
              Publishing
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">All channels</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Online Store, Point of Sale, Facebook, Google Shop
            </p>
          </div>

          {/* 3. PRODUCT ORGANIZATION CARD (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">
              Product organization
            </h4>

            {/* Type */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-[#008060]" />
                  <span>Type</span>
                  <span className="text-[10px] font-normal text-gray-400 font-sans">(প্রোডাক্ট টাইপ)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewTypeName('');
                    setIsNewTypeModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>নতুন টাইপ</span>
                </button>
              </div>

              <div className="relative">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={productType}
                    onChange={(e) => {
                      setProductType(e.target.value);
                      notifyChange();
                    }}
                    placeholder="e.g. Laptop & Tablet Stand"
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsTypeDropdownOpen((prev) => !prev);
                      setTypeSearchQuery('');
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-xs flex items-center gap-1"
                    title="তালিকা থেকে টাইপ বেছে নিন"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Type Dropdown */}
                {isTypeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsTypeDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={typeSearchQuery}
                            onChange={(e) => setTypeSearchQuery(e.target.value)}
                            placeholder="টাইপ খুঁজুন..."
                            className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-500 bg-white"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 py-1">
                        {availableTypesList
                          .filter((t) =>
                            t.toLowerCase().includes(typeSearchQuery.toLowerCase())
                          )
                          .map((t, idx) => {
                            const isSelected = productType === t;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setProductType(t);
                                  setIsTypeDropdownOpen(false);
                                  notifyChange();
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50/70 transition-colors ${
                                  isSelected ? 'font-bold text-blue-700 bg-blue-50/40' : 'text-gray-700'
                                }`}
                              >
                                <span className="truncate">{t}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              </button>
                            );
                          })}

                        {availableTypesList.filter((t) =>
                          t.toLowerCase().includes(typeSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">
                            কোনো টাইপ পাওয়া যায়নি
                          </div>
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">মোট {availableTypesList.length} টি টাইপ</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsTypeDropdownOpen(false);
                            setNewTypeName(typeSearchQuery || '');
                            setIsNewTypeModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ নতুন টাইপ তৈরি করুন</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Type suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {availableTypesList.slice(0, 5).map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProductType(t);
                      notifyChange();
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                      productType === t
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand (Dedicated Option) */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-[#008060]" />
                  <span>Brand</span>
                  <span className="text-[10px] font-normal text-gray-400 font-sans">(ব্র্যান্ড)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewBrandName('');
                    setIsNewBrandModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>নতুন ব্র্যান্ড</span>
                </button>
              </div>

              <div className="relative">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      notifyChange();
                    }}
                    placeholder="যেমন: Merrono, Apple, Samsung..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsBrandDropdownOpen((prev) => !prev);
                      setBrandSearchQuery('');
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="তালিকা থেকে ব্র্যান্ড বেছে নিন"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Brand Dropdown */}
                {isBrandDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsBrandDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={brandSearchQuery}
                            onChange={(e) => setBrandSearchQuery(e.target.value)}
                            placeholder="ব্র্যান্ড খুঁজুন..."
                            className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-[#008060] bg-white"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 py-1">
                        {availableBrandsList
                          .filter((b) =>
                            b.toLowerCase().includes(brandSearchQuery.toLowerCase())
                          )
                          .map((b, idx) => {
                            const isSelected = brand.toLowerCase() === b.toLowerCase();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setBrand(b);
                                  setIsBrandDropdownOpen(false);
                                  notifyChange();
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50/70 transition-colors ${
                                  isSelected ? 'font-bold text-[#008060] bg-emerald-50/40' : 'text-gray-700'
                                }`}
                              >
                                <span className="truncate">{b}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#008060] shrink-0" />}
                              </button>
                            );
                          })}

                        {availableBrandsList.filter((b) =>
                          b.toLowerCase().includes(brandSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">
                            কোনো ব্র্যান্ড পাওয়া যায়নি
                          </div>
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">মোট {availableBrandsList.length} টি ব্র্যান্ড</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsBrandDropdownOpen(false);
                            setNewBrandName(brandSearchQuery || '');
                            setIsNewBrandModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ নতুন ব্র্যান্ড তৈরি করুন</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Brand suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {availableBrandsList.slice(0, 5).map((b, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBrand(b);
                      notifyChange();
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      brand === b
                        ? 'bg-emerald-50 text-[#008060] border-emerald-300 font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-[#008060]" />
                  <span>Vendor</span>
                  <span className="text-[10px] font-normal text-gray-400 font-sans">(সাপ্লায়ার / ভেন্ডর)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewVendorName('');
                    setIsNewVendorModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>নতুন ভেন্ডর</span>
                </button>
              </div>

              <div className="relative">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => {
                      setVendor(e.target.value);
                      notifyChange();
                    }}
                    placeholder="e.g. Merrono"
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsVendorDropdownOpen((prev) => !prev);
                      setVendorSearchQuery('');
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-xs flex items-center gap-1"
                    title="তালিকা থেকে ভেন্ডর বেছে নিন"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vendor Dropdown */}
                {isVendorDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsVendorDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={vendorSearchQuery}
                            onChange={(e) => setVendorSearchQuery(e.target.value)}
                            placeholder="ভেন্ডর খুঁজুন..."
                            className="w-full pl-8 pr-2.5 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-purple-500 bg-white"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 py-1">
                        {availableVendorsList
                          .filter((v) =>
                            v.toLowerCase().includes(vendorSearchQuery.toLowerCase())
                          )
                          .map((v, idx) => {
                            const isSelected = vendor === v;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setVendor(v);
                                  setIsVendorDropdownOpen(false);
                                  notifyChange();
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-purple-50/70 transition-colors ${
                                  isSelected ? 'font-bold text-purple-700 bg-purple-50/40' : 'text-gray-700'
                                }`}
                              >
                                <span className="truncate">{v}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                              </button>
                            );
                          })}

                        {availableVendorsList.filter((v) =>
                          v.toLowerCase().includes(vendorSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">
                            কোনো ভেন্ডর পাওয়া যায়নি
                          </div>
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">মোট {availableVendorsList.length} টি ভেন্ডর</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsVendorDropdownOpen(false);
                            setNewVendorName(vendorSearchQuery || '');
                            setIsNewVendorModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ নতুন ভেন্ডর তৈরি করুন</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Vendor suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {availableVendorsList.slice(0, 5).map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVendor(v);
                      notifyChange();
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                      vendor === v
                        ? 'bg-purple-50 text-purple-700 border-purple-300 font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Collections & Categories */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[#008060]" />
                  <span>Collections & Categories</span>
                  <span className="text-[10px] font-normal text-gray-400 font-sans">(ক্যাটাগরি)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="text-[10px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>নতুন ক্যাটাগরি</span>
                </button>
              </div>

              <div className="space-y-2">
                {/* Active Collections / Categories Badges */}
                <div className="flex flex-wrap gap-1.5 min-h-[28px] p-1.5 bg-gray-50/70 rounded-lg border border-gray-100">
                  {collections.length === 0 ? (
                    <span className="text-[11px] text-gray-400 italic px-1 py-0.5">কোনো ক্যাটাগরি বা কালেকশন যুক্ত নেই</span>
                  ) : (
                    collections.map((col, idx) => {
                      const isPrimary = col.trim().toLowerCase() === category.trim().toLowerCase();
                      return (
                        <span
                          key={idx}
                          className={`group px-2 py-1 rounded-md text-[11px] flex items-center gap-1.5 border transition-all ${
                            isPrimary
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold shadow-2xs'
                              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate max-w-[140px]">{col}</span>
                          {isPrimary ? (
                            <span className="text-[9px] bg-emerald-600 text-white px-1 py-0.2 rounded font-bold uppercase tracking-tight">
                              Primary
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCategory(col);
                                notifyChange();
                                showToast(`'${col}' কে প্রাইমারি ক্যাটাগরি নির্ধারণ করা হয়েছে`);
                              }}
                              className="text-[9px] text-gray-400 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity underline cursor-pointer"
                              title="Set as primary store category"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCollections(collections.filter((c) => c !== col));
                              notifyChange();
                            }}
                            className="text-gray-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Input with Autocomplete Dropdown & Quick Add */}
                <div className="relative">
                  <div className="flex gap-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={collectionInput}
                        onChange={(e) => {
                          setCollectionInput(e.target.value);
                          setIsCollectionDropdownOpen(true);
                        }}
                        onFocus={() => setIsCollectionDropdownOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCollection();
                          }
                        }}
                        placeholder="+ ক্যাটাগরি বা কালেকশন লিখুন বা ড্রপডাউন থেকে বাছুন..."
                        className="w-full pl-2.5 pr-7 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCollectionDropdownOpen(!isCollectionDropdownOpen)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCollectionDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddCollection()}
                      className="px-3 py-1.5 bg-[#008060] hover:bg-[#004e3a] text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      title="Add category"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>যোগ করুন</span>
                    </button>
                  </div>

                  {/* Dropdown Menu of Available Store Categories */}
                  {isCollectionDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsCollectionDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-64 overflow-y-auto p-1.5 text-xs">
                        <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-gray-100 mb-1">
                          <span>সকল স্টোর ক্যাটাগরি</span>
                          <span className="text-[9px] text-[#008060] font-semibold">ক্লিক করে সিলেক্ট করুন</span>
                        </div>

                        {/* If user typed something that is not in the list, offer quick-create option */}
                        {collectionInput.trim() &&
                          !availableCategoriesList.some(
                            (c) => c.name.toLowerCase() === collectionInput.trim().toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={() => handleAddCollection()}
                              className="w-full text-left px-2.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center justify-between mb-1.5 transition-colors border border-emerald-200 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <Plus className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span className="truncate">নতুন তৈরি করুন: "{collectionInput.trim()}"</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded shadow-2xs font-semibold shrink-0">
                                Create & Add
                              </span>
                            </button>
                          )}

                        {/* Filtered list of categories */}
                        <div className="space-y-0.5">
                          {filteredSuggestions.length === 0 ? (
                            <div className="p-3 text-center text-gray-500 text-[11px]">
                              কোনো ম্যাচিং ক্যাটাগরি পাওয়া যায়নি।
                            </div>
                          ) : (
                            filteredSuggestions.map((catItem, idx) => {
                              const isSelected = collections.includes(catItem.name);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleToggleCollection(catItem.name)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-emerald-50 text-emerald-900 font-medium'
                                      : 'hover:bg-gray-50 text-gray-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Tag className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                                    <div className="truncate">
                                      <span className="font-medium">{catItem.name}</span>
                                      {catItem.banglaName && (
                                        <span className="text-[10px] text-gray-400 ml-1.5">
                                          ({catItem.banglaName})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isSelected ? (
                                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                        <Check className="w-3 h-3" />
                                      </span>
                                    ) : (
                                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:text-emerald-700 flex items-center justify-center">
                                        <Plus className="w-3 h-3" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Bottom action: open detailed new category modal */}
                        <div className="pt-1.5 mt-1 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCollectionDropdownOpen(false);
                              setIsNewCategoryModalOpen(true);
                            }}
                            className="w-full text-center py-1.5 text-[11px] font-bold text-[#008060] hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>+ বিস্তারিত নতুন ক্যাটাগরি তৈরি করুন</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[#008060]" />
                  <span>Tags</span>
                  <span className="text-[10px] font-normal text-gray-400 font-sans">({tags.length} টি যুক্ত)</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsQuickTagsModalOpen(true)}
                    className="text-[10px] font-bold text-[#008060] hover:text-[#004e3a] flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>নতুন ট্যাগ</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {/* Active tags badges */}
                <div className="flex flex-wrap gap-1 min-h-[30px] p-1.5 bg-gray-50/70 rounded-lg border border-gray-200">
                  {tags.length === 0 ? (
                    <span className="text-[11px] text-gray-400 italic px-1 py-0.5">কোনো ট্যাগ যুক্ত নেই</span>
                  ) : (
                    tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-white text-gray-800 flex items-center gap-1 border border-gray-200 shadow-2xs font-medium"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-gray-400 hover:text-rose-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add tag input */}
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="+ ট্যাগ লিখুন (কমা দিয়ে একাধিক লেখা যাবে)..."
                    className="flex-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-3 py-1.5 bg-[#008060] hover:bg-[#006e52] text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick 1-click recommended tags */}
                <div className="pt-1">
                  <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center justify-between">
                    <span>প্রস্তাবিত ট্যাগ (ক্লিক করে যোগ/বাতিল করুন):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recommendedTagsList.slice(0, 8).map((t, idx) => {
                      const isSelected = tags.includes(t);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleTag(t)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-2.5 h-2.5 text-amber-700" />
                          ) : (
                            <Plus className="w-2.5 h-2.5 text-gray-400" />
                          )}
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. THEME TEMPLATE CARD (PAGE 1) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Theme template
            </label>
            <select
              value={themeTemplate}
              onChange={(e) => {
                setThemeTemplate(e.target.value);
                notifyChange();
              }}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:border-[#008060]"
            >
              <option value="Default product">Default product</option>
              <option value="Landing Page Product">Landing Page Product</option>
              <option value="Flash Sale Exclusive">Flash Sale Exclusive</option>
            </select>
          </div>

          {/* Live Storefront Mini Card Preview */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>স্টোরফ্রন্ট লাইভ কার্ড প্রিভিউ</span>
              <span className="text-[10px] text-emerald-600">Active</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={images[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {compareAtPrice > price && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                    -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  {vendor}
                </span>
                <h5 className="text-xs font-bold text-gray-900 truncate">
                  {name}
                </h5>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-black font-mono text-rose-600">
                    ৳{price.toLocaleString()}
                  </span>
                  {compareAtPrice > price && (
                    <span className="text-[11px] font-mono text-gray-400 line-through">
                      ৳{compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FLOATING SAVE BAR (PAGE 4) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3 shadow-lg z-20 flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs">
          {hasChanges ? (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          ) : (
            <span className="text-gray-400">All changes saved</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSaveProduct}
            className="px-6 py-2 rounded-lg bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
          >
            Save
          </button>
        </div>
      </div>

      {/* NEW CATEGORY / COLLECTION MODAL */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">নতুন ক্যাটাগরি তৈরি করুন</h3>
                  <p className="text-[11px] text-gray-500">Create new store category and assign to product</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCategorySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ক্যাটাগরির নাম (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Computer Accessories, Gaming Gear"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  বাংলা নাম (Bangla Name)
                </label>
                <input
                  type="text"
                  value={newCategoryBanglaName}
                  onChange={(e) => setNewCategoryBanglaName(e.target.value)}
                  placeholder="যেমন: কম্পিউটার ও গেমিং এক্সেসরিজ"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ক্যাটাগরি ছবি (Image / Thumbnail)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategoryImage}
                    onChange={(e) => setNewCategoryImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060]"
                  />
                  <button
                    type="button"
                    onClick={() => categoryFileInputRef.current?.click()}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    title="Upload image from device"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>আপলোড</span>
                  </button>
                  <input
                    type="file"
                    ref={categoryFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setNewCategoryImage(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {/* Thumbnail Preview */}
                {newCategoryImage && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={newCategoryImage}
                      alt="Category preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-md border border-gray-200"
                    />
                    <div className="text-[11px] text-gray-500 truncate">
                      <span className="font-semibold text-gray-700 block">প্রিভিউ ছবি</span>
                      <span>স্টোরের ক্যাটাগরি মেনু ও গ্রিডে প্রদর্শিত হবে</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>তৈরি ও প্রোডাক্টে যুক্ত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TYPE MODAL */}
      {isNewTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">নতুন প্রোডাক্ট টাইপ যোগ করুন</h3>
                  <p className="text-[11px] text-gray-500">Add custom product type for store categorization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTypeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomType(newTypeName);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  প্রোডাক্ট টাইপের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g. Wireless Charger, Mechanical Keyboard, Smart Ring"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                  বা নিচের যেকোনো একটিতে ক্লিক করে বেছে নিন:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-100">
                  {availableTypesList.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewTypeName(t)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        newTypeName === t
                          ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewTypeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newTypeName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>টাইপ যুক্ত ও সিলেক্ট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW BRAND MODAL */}
      {isNewBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">নতুন ব্র্যান্ড যোগ করুন</h3>
                  <p className="text-[11px] text-gray-500">Add custom product brand name</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewBrandModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomBrand(newBrandName);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ব্র্যান্ডের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="যেমন: Merrono, Apple, Samsung, Anker, Sony, No Brand"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                  জনপ্রিয় ব্র্যান্ড তালিকা থেকে বেছে নিন:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-100">
                  {availableBrandsList.map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewBrandName(b)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                        newBrandName === b
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewBrandModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newBrandName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ব্র্যান্ড যুক্ত ও সিলেক্ট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW VENDOR MODAL */}
      {isNewVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">নতুন ভেন্ডর / ব্র্যান্ড যোগ করুন</h3>
                  <p className="text-[11px] text-gray-500">Add custom vendor, supplier or manufacturer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewVendorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCustomVendor(newVendorName);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ভেন্ডর বা ব্র্যান্ডের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. Merrono, Apple, Baseus, Anker, Joyroom"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                  জনপ্রিয় ভেন্ডর তালিকা থেকে বেছে নিন:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-100">
                  {availableVendorsList.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewVendorName(v)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                        newVendorName === v
                          ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewVendorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={!newVendorName.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ভেন্ডর যুক্ত ও সিলেক্ট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK & BULK TAGS MODAL */}
      {isQuickTagsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">প্রস্তাবিত ও বাল্ক ট্যাগ ম্যানেজার</h3>
                  <p className="text-[11px] text-gray-500">Quick select recommended tags or add multiple tags at once</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickTagsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Currently Selected Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>বর্তমানে যুক্ত ট্যাগসমূহ ({tags.length} টি)</span>
                  {tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTags([]);
                        notifyChange();
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-normal"
                    >
                      সব মুছুন
                    </button>
                  )}
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 min-h-[40px] max-h-28 overflow-y-auto">
                  {tags.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">কোনো ট্যাগ যুক্ত নেই</span>
                  ) : (
                    tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white text-gray-800 border border-gray-200 flex items-center gap-1.5 shadow-2xs font-medium"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-gray-400 hover:text-rose-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Recommended Click-to-toggle tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  প্রস্তাবিত জনপ্রিয় ট্যাগ (ক্লিক করে টগল করুন):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-amber-50/30 rounded-xl border border-amber-100">
                  {recommendedTagsList.map((t, idx) => {
                    const isSelected = tags.includes(t);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleTag(t)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs scale-102'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-amber-700" />
                        ) : (
                          <Plus className="w-3 h-3 text-gray-400" />
                        )}
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bulk Add Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  একাধিক নতুন ট্যাগ একসাথে লিখুন (কমা দিয়ে আলাদা করুন):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bulkTagInput}
                    onChange={(e) => setBulkTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (bulkTagInput.trim()) {
                          handleAddTag(bulkTagInput);
                          setBulkTagInput('');
                        }
                      }
                    }}
                    placeholder="যেমন: Hot Deal, Fast Charging, Premium, Summer Offer"
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (bulkTagInput.trim()) {
                        handleAddTag(bulkTagInput);
                        setBulkTagInput('');
                      }
                    }}
                    disabled={!bulkTagInput.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuickTagsModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#008060] hover:bg-[#006e52] rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  সম্পন্ন করুন ({tags.length} টি ট্যাগ)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DROPSHIP 1-CLICK IMPORTER MODAL */}
      {isDropshipQuickImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-gray-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-amber-300">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ড্রপশিপ ১-ক্লিক প্রোডাক্ট ইম্পোর্টার</span>
                    <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full font-semibold">
                      CJ & All Platforms
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    CJ Dropshipping, AliExpress, Alibaba, 1688 বা Taobao থেকে সব তথ্য ও ছবি এক ক্লিকে এডিটরে নিয়ে আসুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDropshipQuickImportOpen(false)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs bg-gray-50/50">
              {/* URL / PID Input */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2.5">
                <label className="block text-xs font-bold text-gray-800">
                  প্রোডাক্ট লিঙ্ক বা CJ Product ID / SKU দিন:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dropshipUrlInput}
                    onChange={(e) => setDropshipUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFetchDropshipForEditor();
                      }
                    }}
                    placeholder="যেমন: https://cjdropshipping.com/product/item-p-162948102948.html অথবা 162948102948"
                    className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleFetchDropshipForEditor}
                    disabled={isDropshipFetching || !dropshipUrlInput.trim()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {isDropshipFetching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ফেচ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>ফেচ করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Sample Links */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    দ্রুত টেস্ট করার জন্য সিজে উইনার্স:
                  </span>
                  {CJ_WINNING_CATALOG_DATABASE.slice(0, 4).map((item) => (
                    <button
                      key={item.pid}
                      type="button"
                      onClick={() => {
                        setDropshipUrlInput(item.pid);
                        setTimeout(() => {
                          const rule = getStoredPricingRule();
                          const cjConfig = getStoredCJConfig();
                          fetchCJProductData(item.pid, cjConfig, rule).then((res) => {
                            setDropshipExtractedData(res.product);
                            setDropshipSourcePriceText(`$${res.rawData.sourcePriceUSD} USD`);
                            setDropshipActiveImgIdx(0);
                            showToast('সিজে উইনার ফেচ সম্পন্ন!');
                          });
                        }, 50);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10.5px] font-medium border border-blue-200/60 cursor-pointer"
                    >
                      {item.productName.split(' ')[0]} {item.productName.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extraction Result Preview */}
              {dropshipExtractedData && (
                <div className="bg-white rounded-2xl border-2 border-blue-500/40 p-4.5 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        সব তথ্য ও ছবি ফেচ সম্পন্ন
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-100 text-blue-800">
                        {dropshipExtractedData.dropship?.platform?.toUpperCase() || 'DROPSHIP'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      মূল উৎস খরচ: <strong className="text-gray-800 font-bold">{dropshipSourcePriceText}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Images Column */}
                    <div className="sm:col-span-4 space-y-2">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                        <img
                          src={dropshipExtractedData.images[dropshipActiveImgIdx] || dropshipExtractedData.images[0]}
                          alt={dropshipExtractedData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                          ক্যাপচার্ড ফটো ({dropshipExtractedData.images.length}টি ছবি):
                        </span>
                        <div className="grid grid-cols-4 gap-1">
                          {dropshipExtractedData.images.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setDropshipActiveImgIdx(i)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                dropshipActiveImgIdx === i ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 opacity-70'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Information Column */}
                    <div className="sm:col-span-8 space-y-2 text-xs">
                      <div>
                        <span className="text-[10.5px] text-blue-600 font-bold block">{dropshipExtractedData.category}</span>
                        <h4 className="font-bold text-gray-900 line-clamp-2 mt-0.5">
                          {dropshipExtractedData.name}
                        </h4>
                        {dropshipExtractedData.banglaName && (
                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                            {dropshipExtractedData.banglaName}
                          </p>
                        )}
                      </div>

                      {/* Pricing Pills */}
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div>
                          <span className="text-gray-500 block text-[9.5px]">বিক্রয় মূল্য</span>
                          <strong className="text-emerald-700 font-mono font-bold text-sm">৳{dropshipExtractedData.price}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9.5px]">ফ্যাক্টরি খরচ</span>
                          <strong className="text-gray-700 font-mono">৳{dropshipExtractedData.costPerItem || 0}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[9.5px]">পূর্বের মূল্য</span>
                          <strong className="text-gray-400 font-mono line-through">৳{dropshipExtractedData.originalPrice}</strong>
                        </div>
                      </div>

                      {/* Specs and Features Badges */}
                      <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>⚙️ টেকনিক্যাল স্পেসিফিকেশন:</span>
                          <strong className="text-gray-800">{Object.keys(dropshipExtractedData.specifications || {}).length}টি প্রোপার্টি</strong>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>✨ মূল ফিচার ও সুবিধা:</span>
                          <strong className="text-gray-800">{dropshipExtractedData.features?.length || 0}টি পয়েন্ট</strong>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>🎨 কালার ও ভ্যারিয়েন্ট:</span>
                          <strong className="text-gray-800">{dropshipExtractedData.colors?.length || 0}টি অপশন</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary 1-Click Load Button */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setDropshipExtractedData(null)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800"
                    >
                      ক্লিয়ার করুন
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyDropshipProductToForm(dropshipExtractedData)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ ১-ক্লিকে সব তথ্য ও {dropshipExtractedData.images.length}টি ছবি এডিটরে লোড করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                টিপস: প্রোডাক্ট ফেচ করার পর নিচের বাটনে চাপ দিলে ফর্মের সব ফিল্ড ও ইমেজ গ্যালারি অটোমেটিক পূরণ হবে।
              </span>
              <button
                type="button"
                onClick={() => setIsDropshipQuickImportOpen(false)}
                className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
