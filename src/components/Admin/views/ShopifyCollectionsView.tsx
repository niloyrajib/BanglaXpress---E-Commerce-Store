import React, { useState, useMemo, useEffect } from 'react';
import {
  Tag,
  Search,
  ArrowUpDown,
  Columns,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Edit2,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Product, ThemeConfig, Category } from '../../../types';
import { CollectionItem, INITIAL_COLLECTIONS } from '../../../data/mockData';
import { ShopifyAddCollectionView } from './ShopifyAddCollectionView';

export type { CollectionItem };

interface ShopifyCollectionsViewProps {
  products: Product[];
  onOpenStorefrontCategory?: (category: string) => void;
  showToast?: (message: string) => void;
  themeConfig?: ThemeConfig;
  onSaveTheme?: (updatedTheme: ThemeConfig) => void;
}

export const ShopifyCollectionsView: React.FC<ShopifyCollectionsViewProps> = ({
  products,
  onOpenStorefrontCategory,
  showToast = (_msg: string) => {},
  themeConfig,
  onSaveTheme
}) => {
  // Load persistent collections from localStorage or fallback to INITIAL_COLLECTIONS
  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    try {
      const saved = localStorage.getItem('bx_collections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse bx_collections:', e);
    }
    return INITIAL_COLLECTIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  // Sync collections to theme on first mount if theme doesn't yet contain them
  useEffect(() => {
    if (!themeConfig || !onSaveTheme) return;

    const currentItems = themeConfig.categoriesSection?.items || [];
    let hasChanges = false;
    const updatedItems = [...currentItems];

    collections.forEach((col) => {
      const exists = updatedItems.some(
        (it) =>
          it.id === col.id ||
          it.id === `cat-${col.id}` ||
          it.name.toLowerCase() === col.title.toLowerCase()
      );
      if (!exists) {
        hasChanges = true;
        const slug = col.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        updatedItems.push({
          id: col.id.startsWith('cat-') ? col.id : `cat-${col.id}`,
          name: col.title,
          banglaName: col.title,
          slug,
          iconName: 'Sparkles',
          image: col.image,
          itemCount: col.productsCount || 0
        });
      }
    });

    if (hasChanges) {
      onSaveTheme({
        ...themeConfig,
        categoriesSection: {
          ...themeConfig.categoriesSection,
          enabled: true,
          items: updatedItems
        }
      });
    }
  }, [collections, themeConfig, onSaveTheme]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCollections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCollections.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredCollections = useMemo(() => {
    return collections.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);

  // Handle Save (both Add and Edit) with immediate Home Page reflection
  const handleSaveCollection = (savedCol: CollectionItem, isEdit: boolean) => {
    let nextCollections: CollectionItem[];
    if (isEdit) {
      nextCollections = collections.map((c) => (c.id === savedCol.id ? savedCol : c));
    } else {
      nextCollections = [savedCol, ...collections];
    }
    setCollections(nextCollections);

    // Save to localStorage
    try {
      localStorage.setItem('bx_collections', JSON.stringify(nextCollections));
    } catch (e) {
      console.error(e);
    }

    // Immediately reflect in themeConfig.categoriesSection.items for the Home Page
    if (themeConfig && onSaveTheme) {
      const currentItems = themeConfig.categoriesSection?.items || [];
      const oldTitle = editingCollection?.title.toLowerCase();

      let updatedItems: Category[];
      if (isEdit) {
        let matched = false;
        updatedItems = currentItems.map((item) => {
          if (
            item.id === savedCol.id ||
            item.id === `cat-${savedCol.id}` ||
            (oldTitle && item.name.toLowerCase() === oldTitle) ||
            item.name.toLowerCase() === savedCol.title.toLowerCase()
          ) {
            matched = true;
            return {
              ...item,
              name: savedCol.title,
              banglaName: savedCol.title,
              image: savedCol.image,
              itemCount: savedCol.productsCount || item.itemCount
            };
          }
          return item;
        });

        if (!matched) {
          const slug = savedCol.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

          updatedItems.push({
            id: savedCol.id.startsWith('cat-') ? savedCol.id : `cat-${savedCol.id}`,
            name: savedCol.title,
            banglaName: savedCol.title,
            slug,
            iconName: 'Sparkles',
            image: savedCol.image,
            itemCount: savedCol.productsCount || 0
          });
        }
      } else {
        // Add new category item at top of Home Page categories
        const slug = savedCol.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const newCat: Category = {
          id: savedCol.id.startsWith('cat-') ? savedCol.id : `cat-${savedCol.id}`,
          name: savedCol.title,
          banglaName: savedCol.title,
          slug,
          iconName: 'Sparkles',
          image: savedCol.image,
          itemCount: savedCol.productsCount || 0
        };

        updatedItems = [
          newCat,
          ...currentItems.filter((c) => c.name.toLowerCase() !== savedCol.title.toLowerCase())
        ];
      }

      onSaveTheme({
        ...themeConfig,
        categoriesSection: {
          ...themeConfig.categoriesSection,
          enabled: true,
          items: updatedItems
        }
      });
    }

    showToast(
      isEdit
        ? `"${savedCol.title}" কালেকশন সফলভাবে আপডেট হয়েছে এবং হোম পেজে রিফ্লেক্ট হয়েছে!`
        : `"${savedCol.title}" কালেকশন সফলভাবে তৈরি হয়েছে এবং সাথে সাথে হোম পেজে যুক্ত হয়েছে!`
    );
  };

  // Handle single deletion from inside edit view
  const handleDeleteSingle = (colId: string) => {
    handleDeleteCollections([colId]);
  };

  // Handle bulk or single deletion
  const handleDeleteCollections = (idsToDelete: string[]) => {
    const nextCollections = collections.filter((c) => !idsToDelete.includes(c.id));
    setCollections(nextCollections);
    setSelectedIds([]);

    try {
      localStorage.setItem('bx_collections', JSON.stringify(nextCollections));
    } catch (e) {
      console.error(e);
    }

    // Reflect deletion on Home Page
    if (themeConfig && onSaveTheme) {
      const deletedTitles = collections
        .filter((c) => idsToDelete.includes(c.id))
        .map((c) => c.title.toLowerCase());

      const currentItems = themeConfig.categoriesSection?.items || [];
      const updatedItems = currentItems.filter(
        (item) =>
          !idsToDelete.includes(item.id) &&
          !idsToDelete.includes(item.id.replace('cat-', '')) &&
          !deletedTitles.includes(item.name.toLowerCase())
      );

      onSaveTheme({
        ...themeConfig,
        categoriesSection: {
          ...themeConfig.categoriesSection,
          items: updatedItems
        }
      });
    }

    showToast(`${idsToDelete.length} টি কালেকশন মুছে ফেলা হয়েছে`);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedIds.length} collection(s)?`)) {
      handleDeleteCollections(selectedIds);
    }
  };

  // If in 'add' or 'edit' mode, render the full Collection Form page
  if (currentView === 'add' || (currentView === 'edit' && editingCollection)) {
    return (
      <ShopifyAddCollectionView
        products={products}
        initialCollection={currentView === 'edit' ? editingCollection : null}
        isEditing={currentView === 'edit'}
        onBack={() => {
          setEditingCollection(null);
          setCurrentView('list');
        }}
        onSave={(savedCol) => {
          handleSaveCollection(savedCol, currentView === 'edit');
          setEditingCollection(null);
          setCurrentView('list');
        }}
        onDelete={(colId) => {
          handleDeleteSingle(colId);
          setEditingCollection(null);
          setCurrentView('list');
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header matching screenshot */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-gray-700 stroke-[2.2]" />
          <h1 className="text-xl font-bold text-[#202223] tracking-tight">Collections</h1>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono font-medium">
            {collections.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingCollection(null);
              setCurrentView('add');
            }}
            className="px-3.5 py-1.5 bg-[#303030] hover:bg-[#202020] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add collection</span>
          </button>
        </div>
      </div>

      {/* Main Table Card matching screenshot */}
      <div className="bg-white border border-[#d2d5d8] rounded-xl shadow-2xs overflow-hidden">
        {/* Search and filter toolbar */}
        <div className="px-3 py-2 border-b border-[#e1e3e5] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            {/* "All" dropdown filter button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] font-medium text-xs bg-white transition-colors"
            >
              <span>All</span>
              <div className="flex flex-col -space-y-1 text-gray-500">
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </button>

            {/* Search Input with magnifying glass */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search and filter"
                className="w-full bg-white text-xs text-[#202223] pl-8 pr-3 py-1.5 rounded-lg border border-[#c9cccf] focus:border-[#303030] focus:ring-1 focus:ring-[#303030] outline-hidden placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Right tool buttons */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}

            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-[#f6f6f7] rounded-lg transition-colors"
              title="Columns"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table matching screenshot with clickable & editable rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e3e5] bg-white text-[#5c5f62] font-medium select-none">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCollections.length > 0 &&
                      selectedIds.length === filteredCollections.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#202223] focus:ring-0 focus:outline-hidden cursor-pointer accent-[#202223]"
                  />
                </th>
                <th className="py-2.5 px-3 text-[#5c5f62] font-normal text-xs">Title</th>
                <th className="py-2.5 px-6 text-right font-normal text-[#5c5f62] text-xs w-28">Products</th>
                <th className="py-2.5 px-6 text-left font-normal text-[#5c5f62] text-xs w-44">Conditions</th>
                <th className="py-2.5 px-4 text-center font-normal text-[#5c5f62] text-xs w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e5] bg-white">
              {filteredCollections.map((col) => {
                const isSelected = selectedIds.includes(col.id);

                return (
                  <tr
                    key={col.id}
                    className={`hover:bg-[#f6f6f7] transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#f1f2f4]' : ''
                    }`}
                    onClick={() => {
                      setEditingCollection(col);
                      setCurrentView('edit');
                    }}
                    title="ক্লিক করে এই কালেকশনটি এডিট করুন"
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-3 text-center w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(col.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#202223] focus:ring-0 focus:outline-hidden cursor-pointer accent-[#202223]"
                      />
                    </td>

                    {/* Title with circular Badge/Logo Thumbnail */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {/* Circular Brand Stamp / Thumbnail matching image */}
                        <div className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center p-0.5 relative group-hover:scale-105 transition-transform">
                          <img
                            src={col.image}
                            alt={col.title}
                            className="w-full h-full object-cover rounded-full"
                          />
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-600/40 pointer-events-none" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#202223] group-hover:text-blue-700 hover:underline">
                              {col.title}
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 font-medium transition-opacity">
                              এডিট করতে ক্লিক করুন
                            </span>
                          </div>
                          {col.badgeLogoText && (
                            <p className="text-[10px] text-gray-400 font-mono tracking-tight uppercase">
                              {col.badgeLogoText}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Products count */}
                    <td className="py-3 px-6 text-right font-normal text-[#202223] text-xs">
                      {col.productsCount}
                    </td>

                    {/* Conditions */}
                    <td className="py-3 px-6 text-left text-gray-500 text-xs font-mono">
                      {col.conditions || 'Manual'}
                    </td>

                    {/* Actions column */}
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCollection(col);
                            setCurrentView('edit');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-[#202223] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Edit collection"
                        >
                          <Edit2 className="w-3 h-3 text-blue-600" />
                          <span>Edit</span>
                        </button>

                        {onOpenStorefrontCategory && (
                          <button
                            type="button"
                            onClick={() => onOpenStorefrontCategory(col.title)}
                            className="p-1 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            title="হোম পেজে দেখুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-gray-800" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCollections.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                    No collections found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer helper note matching screenshot: "Learn more about collections" */}
      <div className="text-center pt-2 pb-6">
        <a
          href="#learn-more"
          onClick={(e) => {
            e.preventDefault();
            alert('Collections allow you to group products for easy browsing and promotional marketing campaigns.');
          }}
          className="text-xs text-[#5c5f62] hover:text-[#202223] hover:underline"
        >
          Learn more about collections
        </a>
      </div>
    </div>
  );
};
