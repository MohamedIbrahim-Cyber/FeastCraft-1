import React, { useState, useRef } from 'react';
import {
  Menu,
  Plus,
  Search,
  Filter,
  Check,
  Ban,
  DollarSign,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  X,
  UploadCloud,
  ChevronRight,
  FolderPlus,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Tag,
  Info,
} from 'lucide-react';
import { MenuItem, Category, ItemOptionGroup, ItemOption } from '../../types';
import { createMenuItemSchema, createCategorySchema } from '../../lib/menuSchemas';

interface AdminMenuCMSProps {
  menuItems: MenuItem[];
  categories: Category[];
  onToggleItemAvailability: (itemId: string) => void;
  onUpdateItemPrice: (itemId: string, newPrice: number) => void;
  onCreateMenuItem?: (item: MenuItem) => void;
  onUpdateMenuItem?: (itemId: string, updated: Partial<MenuItem>) => void;
  onDeleteMenuItem?: (itemId: string) => void;
  onCreateCategory?: (category: Category) => void;
  onUpdateCategory?: (categoryId: string, updated: Partial<Category>) => void;
  onDeleteCategory?: (categoryId: string) => void;
  isArabic: boolean;
  isDark: boolean;
}

// Preset food photography for quick CDN selection
const PRESET_FOOD_PHOTOS = [
  {
    name: 'Artisanal Truffle Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    category: 'pizzas',
  },
  {
    name: 'Smash Double Cheeseburger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category: 'burgers',
  },
  {
    name: 'Crispy Buffalo Wings',
    url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    category: 'sides',
  },
  {
    name: 'Pistachio Kunafa Crunch',
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    category: 'desserts',
  },
  {
    name: 'Lotus Biscoff Shake',
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    category: 'drinks',
  },
  {
    name: 'Loaded Truffle Fries',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    category: 'sides',
  },
];

export const AdminMenuCMS: React.FC<AdminMenuCMSProps> = ({
  menuItems,
  categories,
  onToggleItemAvailability,
  onUpdateItemPrice,
  onCreateMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isArabic,
  isDark,
}) => {
  // Navigation & Filter states
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'SOLD_OUT'>('ALL');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'POPULAR' | 'SPICY' | 'VEG'>('ALL');

  // Inline Price Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');

  // Modals state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [archiveTargetItem, setArchiveTargetItem] = useState<MenuItem | null>(null);

  // Form State for Dish Modal
  const [activeTab, setActiveTab] = useState<'general' | 'photo' | 'options'>('general');
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    categoryId: categories[0]?.id || '',
    basePrice: 150,
    prepTimeMinutes: 15,
    calories: 450,
    imageUrl: PRESET_FOOD_PHOTOS[0].url,
    isAvailable: true,
    isPopular: false,
    isSpicy: false,
    isVegetarian: false,
    optionGroups: [],
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({
    name: '',
    nameAr: '',
    slug: '',
    icon: 'Utensils',
    isActive: true,
  });
  const [categoryErrors, setCategoryErrors] = useState<{ [key: string]: string }>({});

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Items Calculation
  const filteredItems = menuItems.filter((item) => {
    if (item.isArchived) return false;
    if (selectedCatId !== 'ALL' && item.categoryId !== selectedCatId) return false;

    if (stockFilter === 'IN_STOCK' && !item.isAvailable) return false;
    if (stockFilter === 'SOLD_OUT' && item.isAvailable) return false;

    if (tagFilter === 'POPULAR' && !item.isPopular) return false;
    if (tagFilter === 'SPICY' && !item.isSpicy) return false;
    if (tagFilter === 'VEG' && !item.isVegetarian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = item.name.toLowerCase().includes(q);
      const matchAr = item.nameAr.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      if (!matchEn && !matchAr && !matchDesc) return false;
    }
    return true;
  });

  // Handle Quick Inline Price Save
  const handleSavePrice = (itemId: string) => {
    const num = parseFloat(priceInput);
    if (!isNaN(num) && num > 0) {
      onUpdateItemPrice(itemId, num);
    }
    setEditingPriceId(null);
  };

  // Open Dish Modal (Create or Edit)
  const openCreateDishModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      categoryId: selectedCatId !== 'ALL' ? selectedCatId : categories[0]?.id || '',
      basePrice: 150,
      prepTimeMinutes: 15,
      calories: 500,
      imageUrl: PRESET_FOOD_PHOTOS[0].url,
      isAvailable: true,
      isPopular: false,
      isSpicy: false,
      isVegetarian: false,
      optionGroups: [
        {
          id: `grp-${Date.now()}-1`,
          name: 'Select Size',
          nameAr: 'اختر الحجم',
          minSelect: 1,
          maxSelect: 1,
          isRequired: true,
          options: [
            {
              id: `opt-${Date.now()}-1`,
              optionGroupId: '',
              name: 'Regular / Medium',
              nameAr: 'وسط / عادي',
              priceDelta: 0,
              isDefault: true,
              isAvailable: true,
            },
            {
              id: `opt-${Date.now()}-2`,
              optionGroupId: '',
              name: 'Large / Feast (+45 EGP)',
              nameAr: 'كبير / فيست (+45 ج.م)',
              priceDelta: 45,
              isDefault: false,
              isAvailable: true,
            },
          ],
        },
      ],
    });
    setFormErrors({});
    setActiveTab('general');
    setIsDishModalOpen(true);
  };

  const openEditDishModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      optionGroups: item.optionGroups ? JSON.parse(JSON.stringify(item.optionGroups)) : [],
    });
    setFormErrors({});
    setActiveTab('general');
    setIsDishModalOpen(true);
  };

  // Dish Form Save with Zod Validation
  const handleSaveDish = () => {
    try {
      const parsed = createMenuItemSchema.parse({
        categoryId: formData.categoryId,
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        imageUrl: formData.imageUrl,
        basePrice: Number(formData.basePrice),
        prepTimeMinutes: Number(formData.prepTimeMinutes || 15),
        calories: formData.calories ? Number(formData.calories) : undefined,
        isAvailable: formData.isAvailable ?? true,
        isPopular: formData.isPopular ?? false,
        isSpicy: formData.isSpicy ?? false,
        isVegetarian: formData.isVegetarian ?? false,
        optionGroups: formData.optionGroups || [],
      });

      if (editingItem) {
        if (onUpdateMenuItem) {
          onUpdateMenuItem(editingItem.id, parsed as any);
        }
      } else {
        const newItem: MenuItem = {
          id: `dish-${Date.now()}`,
          ...parsed,
          isArchived: false,
        } as MenuItem;
        if (onCreateMenuItem) {
          onCreateMenuItem(newItem);
        }
      }

      setIsDishModalOpen(false);
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const errMap: { [key: string]: string } = {};
        err.errors.forEach((e: any) => {
          const path = e.path.join('.');
          errMap[path] = e.message;
        });
        setFormErrors(errMap);
      }
    }
  };

  // Option Group Actions inside Dish Modal
  const addOptionGroup = () => {
    const newGroup: ItemOptionGroup = {
      id: `grp-${Date.now()}`,
      name: 'Extra Customizations',
      nameAr: 'إضافات وتعديلات',
      minSelect: 0,
      maxSelect: 5,
      isRequired: false,
      options: [
        {
          id: `opt-${Date.now()}-1`,
          optionGroupId: '',
          name: 'Extra Cheddar Melt',
          nameAr: 'إكسترا شيدر صوص',
          priceDelta: 25,
          isDefault: false,
          isAvailable: true,
        },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      optionGroups: [...(prev.optionGroups || []), newGroup],
    }));
  };

  const removeOptionGroup = (groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups?.filter((_, idx) => idx !== groupIndex),
    }));
  };

  const addOptionChoice = (groupIndex: number) => {
    setFormData((prev) => {
      const groups = [...(prev.optionGroups || [])];
      if (!groups[groupIndex]) return prev;
      groups[groupIndex].options.push({
        id: `opt-${Date.now()}`,
        optionGroupId: groups[groupIndex].id,
        name: 'New Option',
        nameAr: 'خيار جديد',
        priceDelta: 15,
        isDefault: false,
        isAvailable: true,
      });
      return { ...prev, optionGroups: groups };
    });
  };

  const removeOptionChoice = (groupIndex: number, choiceIndex: number) => {
    setFormData((prev) => {
      const groups = [...(prev.optionGroups || [])];
      if (!groups[groupIndex]) return prev;
      groups[groupIndex].options = groups[groupIndex].options.filter((_, idx) => idx !== choiceIndex);
      return { ...prev, optionGroups: groups };
    });
  };

  // Handle Local Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Category Handler
  const handleSaveCategory = () => {
    try {
      const parsed = createCategorySchema.parse({
        name: categoryFormData.name,
        nameAr: categoryFormData.nameAr,
        slug:
          categoryFormData.slug ||
          categoryFormData.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
          'category',
        icon: categoryFormData.icon || 'Utensils',
        sortOrder: categories.length + 1,
        isActive: true,
      });

      const newCat: Category = {
        id: `cat-${Date.now()}`,
        ...parsed,
      };

      if (onCreateCategory) {
        onCreateCategory(newCat);
      }
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: '', nameAr: '', slug: '', icon: 'Utensils', isActive: true });
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        const errMap: { [key: string]: string } = {};
        err.errors.forEach((e: any) => {
          const path = e.path.join('.');
          errMap[path] = e.message;
        });
        setCategoryErrors(errMap);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-lantern-red text-white shadow-md shadow-lantern-red/20">
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                {isArabic ? 'إدارة المنيو وتوافر الأصناف (Menu CMS & 86)' : 'Menu Catalog & 86 Inventory CMS'}
              </h1>
              <p className="text-xs text-stone-gray mt-0.5">
                {isArabic
                  ? 'التحكم الفوري في توفر الوجبات، تعديل الأسعار بالجنيه المصري، وإدارة الخيارات والتعديلات'
                  : 'Manage dishes, instant 86 sold-out switches, base pricing in EGP, and customization options'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Add Category Button */}
          <button
            id="admin-add-category-button"
            type="button"
            onClick={() => {
              setCategoryFormData({ name: '', nameAr: '', slug: '', icon: 'Utensils', isActive: true });
              setCategoryErrors({});
              setIsCategoryModalOpen(true);
            }}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 border transition-all ${
              isDark
                ? 'bg-dark-surface-elevated border-dark-border text-evening-cream hover:bg-white/10'
                : 'bg-white border-[#DEC7B7] text-temple-brown hover:bg-amber-50'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-amber-500" />
            <span>{isArabic ? 'إضافة قسم +' : 'Add Category +'}</span>
          </button>

          {/* Add Dish CTA Button */}
          <button
            id="admin-add-dish-button"
            type="button"
            onClick={openCreateDishModal}
            className="px-4 py-2.5 rounded-2xl text-xs font-black bg-lantern-red hover:bg-[#8B3426] text-white flex items-center gap-2 shadow-md shadow-lantern-red/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة صنف جديد' : 'Add New Dish'}</span>
          </button>
        </div>
      </div>

      {/* 2. Category Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCatId('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedCatId === 'ALL'
              ? 'bg-lantern-red text-white shadow-sm'
              : isDark
              ? 'bg-dark-surface-elevated text-stone-gray hover:text-white border border-dark-border'
              : 'bg-white text-temple-brown hover:bg-amber-50 border border-[#EADAD0]'
          }`}
        >
          <span>{isArabic ? '🌟 جميع الأقسام' : '🌟 All Categories'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              selectedCatId === 'ALL' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-stone-gray'
            }`}
          >
            {menuItems.filter((m) => !m.isArchived).length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = menuItems.filter((m) => !m.isArchived && m.categoryId === cat.id).length;
          const isSelected = selectedCatId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-lantern-red text-white shadow-sm'
                  : isDark
                  ? 'bg-dark-surface-elevated text-stone-gray hover:text-white border border-dark-border'
                  : 'bg-white text-temple-brown hover:bg-amber-50 border border-[#EADAD0]'
              }`}
            >
              <span>{isArabic ? cat.nameAr : cat.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-stone-gray'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Stock Status Filters */}
      <div
        className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
        }`}
      >
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-gray pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث بالاسم بالإنجليزية أو العربية...' : 'Search dishes by name (EN / AR)...'}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border outline-none transition-colors ${
              isDark
                ? 'bg-dark-surface border-dark-border text-evening-cream focus:border-lantern-red'
                : 'bg-[#F9F1EB] border-[#DEC7B7] text-temple-brown focus:border-lantern-red'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-gray hover:text-black dark:hover:text-white text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Stock Status Selector */}
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'ALL'
                ? 'bg-white dark:bg-dark-surface-elevated shadow-xs text-lantern-red font-black'
                : 'text-stone-gray hover:text-black dark:hover:text-white'
            }`}
          >
            {isArabic ? 'الكل' : 'All Stock'}
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('IN_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              stockFilter === 'IN_STOCK'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'متوفر' : 'In Stock'}</span>
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('SOLD_OUT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              stockFilter === 'SOLD_OUT'
                ? 'bg-red-600 text-white shadow-xs font-black'
                : 'text-red-600 hover:text-red-700'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{isArabic ? 'نفذ (86)' : 'Sold Out (86)'}</span>
          </button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTagFilter(tagFilter === 'POPULAR' ? 'ALL' : 'POPULAR')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              tagFilter === 'POPULAR'
                ? 'bg-amber-500 text-white border-amber-600'
                : 'border-black/10 dark:border-white/10 text-stone-gray hover:text-amber-500'
            }`}
          >
            🔥 {isArabic ? 'الأكثر طلباً' : 'Popular'}
          </button>
          <button
            type="button"
            onClick={() => setTagFilter(tagFilter === 'SPICY' ? 'ALL' : 'SPICY')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              tagFilter === 'SPICY'
                ? 'bg-red-600 text-white border-red-700'
                : 'border-black/10 dark:border-white/10 text-stone-gray hover:text-red-600'
            }`}
          >
            🌶️ {isArabic ? 'حار' : 'Spicy'}
          </button>
          <button
            type="button"
            onClick={() => setTagFilter(tagFilter === 'VEG' ? 'ALL' : 'VEG')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              tagFilter === 'VEG'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'border-black/10 dark:border-white/10 text-stone-gray hover:text-emerald-600'
            }`}
          >
            🌱 {isArabic ? 'نباتي' : 'Veg'}
          </button>
        </div>
      </div>

      {/* 4. Interactive Dish Cards Grid */}
      {filteredItems.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isDark ? 'bg-dark-surface-elevated border-dark-border' : 'bg-white border-[#EADAD0]'
          }`}
        >
          <Menu className="w-12 h-12 mx-auto text-stone-gray/40 mb-3" />
          <h3 className="text-base font-black">{isArabic ? 'لم يتم العثور على أطباق' : 'No Dishes Found'}</h3>
          <p className="text-xs text-stone-gray mt-1">
            {isArabic ? 'جرب تغيير فلاتر البحث أو إضافة صنف جديد' : 'Try adjusting your search filters or create a new dish.'}
          </p>
          <button
            type="button"
            onClick={openCreateDishModal}
            className="mt-4 px-4 py-2 rounded-xl bg-lantern-red text-white text-xs font-black inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة صنف الآن' : 'Add Dish Now'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isSoldOut = !item.isAvailable;
            const isEditing = editingPriceId === item.id;
            const categoryObj = categories.find((c) => c.id === item.categoryId);
            const optionsCount = item.optionGroups?.length || 0;

            return (
              <div
                key={item.id}
                id={`admin-dish-card-${item.id}`}
                className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between group ${
                  isSoldOut
                    ? 'border-red-500/40 bg-red-500/5 dark:bg-red-950/10'
                    : isDark
                    ? 'bg-dark-surface-elevated border-dark-border hover:border-lantern-red/40'
                    : 'bg-white border-[#EADAD0] hover:border-lantern-red/40 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Header: Image & Badges */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/10 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-red-900/75 flex items-center justify-center text-white text-[10px] font-black uppercase text-center px-1">
                          86 / OUT
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-stone-gray truncate">
                          {categoryObj ? (isArabic ? categoryObj.nameAr : categoryObj.name) : 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditDishModal(item)}
                            className="p-1.5 rounded-lg text-stone-gray hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title={isArabic ? 'تعديل الصنف' : 'Edit dish details'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchiveTargetItem(item)}
                            className="p-1.5 rounded-lg text-red-500/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title={isArabic ? 'أرشفة الصنف' : 'Archive dish'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-black truncate mt-1">{item.name}</h3>
                      <p className="text-[11px] text-stone-gray truncate">{item.nameAr}</p>

                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {item.isPopular && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600">
                            🔥 Pop
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-600">
                            🌶️ Spicy
                          </span>
                        )}
                        {item.isVegetarian && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600">
                            🌱 Veg
                          </span>
                        )}
                        {item.prepTimeMinutes && (
                          <span className="text-[9px] font-bold text-stone-gray flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.prepTimeMinutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description preview */}
                  <p className="text-[11px] text-stone-gray line-clamp-2 leading-relaxed mb-3">
                    {isArabic ? item.descriptionAr : item.description}
                  </p>

                  {/* Option Groups Count Badge */}
                  <div className="flex items-center justify-between text-[11px] text-stone-gray py-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 mb-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <Sliders className="w-3 h-3 text-lantern-red" />
                      {isArabic ? 'الخيارات والتعديلات:' : 'Custom Options:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        openEditDishModal(item);
                        setActiveTab('options');
                      }}
                      className="text-lantern-red font-bold hover:underline"
                    >
                      {optionsCount > 0
                        ? `${optionsCount} ${isArabic ? 'مجموعات' : 'groups'}`
                        : isArabic
                        ? '+ إضافة خيارات'
                        : '+ Add options'}
                    </button>
                  </div>

                  {/* Base Price Editor Row */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs mb-3">
                    <span className="text-stone-gray font-semibold">
                      {isArabic ? 'السعر الأساسي:' : 'Base Price (EGP):'}
                    </span>

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-dark-surface border border-lantern-red outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSavePrice(item.id);
                            if (e.key === 'Escape') setEditingPriceId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePrice(item.id)}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-lantern-red text-sm">
                          {item.basePrice.toLocaleString()} EGP
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(item.id);
                            setPriceInput(item.basePrice.toString());
                          }}
                          className="p-1 rounded-md text-stone-gray hover:text-black dark:hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Quick-Action "In Stock / 86 Sold Out" Toggle Button */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    id={`toggle-86-${item.id}`}
                    type="button"
                    onClick={() => onToggleItemAvailability(item.id)}
                    className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      item.isAvailable
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/25'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isArabic ? 'متوفر للطلب (In Stock)' : 'Active (In Stock)'}</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>{isArabic ? 'غير متوفر / نفذ (86 Sold Out)' : 'Sold Out 86 (Click to Re-enable)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. Comprehensive Multi-Tab "Add / Edit Dish" Modal */}
      {/* ========================================================================= */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
              isDark ? 'bg-dark-surface-elevated border-dark-border text-evening-cream' : 'bg-white border-[#EADAD0] text-temple-brown'
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-lantern-red text-white">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingItem
                      ? isArabic
                        ? `تعديل الصنف: ${editingItem.name}`
                        : `Edit Dish: ${editingItem.name}`
                      : isArabic
                      ? 'إضافة طبق جديد للمنيو'
                      : 'Create New Dish in Menu'}
                  </h3>
                  <p className="text-xs text-stone-gray">
                    {isArabic ? 'أدخل البيانات والتسعير بالجنيه والخيارات' : 'Configure details, pricing in EGP, and option groups'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDishModalOpen(false)}
                className="p-2 rounded-xl text-stone-gray hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'general'
                    ? 'border-lantern-red text-lantern-red'
                    : 'border-transparent text-stone-gray hover:text-black dark:hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{isArabic ? '1. البيانات الأساسية' : '1. General Details'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'photo'
                    ? 'border-lantern-red text-lantern-red'
                    : 'border-transparent text-stone-gray hover:text-black dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isArabic ? '2. الصورة والأصول' : '2. Photo & Assets'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('options')}
                className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'options'
                    ? 'border-lantern-red text-lantern-red'
                    : 'border-transparent text-stone-gray hover:text-black dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isArabic ? '3. خيارات التخصيص والمقاسات' : '3. Customization Options'}</span>
                {formData.optionGroups && formData.optionGroups.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-lantern-red text-white">
                    {formData.optionGroups.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Tab 1: General Details */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  {/* Category Assignment */}
                  <div>
                    <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                      {isArabic ? 'القسم (Category)' : 'Category Assignment'} *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none ${
                        isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                      }`}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.nameAr})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Names (EN & AR) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'اسم الصنف بالإنجليزية' : 'Dish Name (English)'} *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Artisanal Truffle Pizza"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                          formErrors['name'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                      {formErrors['name'] && <p className="text-[10px] text-red-500 mt-1">{formErrors['name']}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'اسم الصنف بالعربية' : 'Dish Name (Arabic)'} *
                      </label>
                      <input
                        type="text"
                        value={formData.nameAr || ''}
                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                        placeholder="مثال: بيتزا ترافل كرافت"
                        dir="rtl"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                          formErrors['nameAr'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                      {formErrors['nameAr'] && <p className="text-[10px] text-red-500 mt-1">{formErrors['nameAr']}</p>}
                    </div>
                  </div>

                  {/* Descriptions (EN & AR) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'الوصف بالإنجليزية' : 'Description (English)'} *
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Wood-fired sourdough, black truffle oil, fior di latte mozzarella..."
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border outline-none ${
                          formErrors['description'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'الوصف بالعربية' : 'Description (Arabic)'} *
                      </label>
                      <textarea
                        rows={3}
                        value={formData.descriptionAr || ''}
                        onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                        placeholder="مثال: عجينة مخمرة على الحطب، زيت ترافل أسود، جبنة موزاريلا طازجة..."
                        dir="rtl"
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border outline-none ${
                          formErrors['descriptionAr'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Pricing, Prep Time & Calories */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'السعر الأساسي (ج.م)' : 'Base Price (EGP)'} *
                      </label>
                      <input
                        type="number"
                        value={formData.basePrice || ''}
                        onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-black border outline-none ${
                          formErrors['basePrice'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'وقت التحضير (دقيقة)' : 'Prep Time (Minutes)'}
                      </label>
                      <input
                        type="number"
                        value={formData.prepTimeMinutes || 15}
                        onChange={(e) => setFormData({ ...formData, prepTimeMinutes: parseInt(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border outline-none ${
                          isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                        {isArabic ? 'السعرات الحرارية' : 'Calories (Kcal)'}
                      </label>
                      <input
                        type="number"
                        value={formData.calories || 500}
                        onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border outline-none ${
                          isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Attributes & Badges checkboxes */}
                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 flex flex-wrap items-center gap-6 text-xs font-bold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPopular || false}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="rounded text-amber-500 focus:ring-0"
                      />
                      <span>🔥 {isArabic ? 'الأكثر طلباً (Popular)' : 'Mark as Popular'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSpicy || false}
                        onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                        className="rounded text-red-600 focus:ring-0"
                      />
                      <span>🌶️ {isArabic ? 'حار (Spicy 🔥)' : 'Spicy Dish'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVegetarian || false}
                        onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span>🌱 {isArabic ? 'نباتي (Vegetarian)' : 'Vegetarian'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable ?? true}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-0"
                      />
                      <span>✅ {isArabic ? 'متوفر حالياً (In Stock)' : 'Currently In Stock'}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Photo & CDN Assets */}
              {activeTab === 'photo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                      {isArabic ? 'رابط الصورة (Image URL / CDN)' : 'Direct Image CDN URL'} *
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold border outline-none ${
                        isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                      }`}
                    />
                  </div>

                  {/* Drag & Drop File Upload Simulator */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-lantern-red/40 hover:border-lantern-red rounded-3xl text-center cursor-pointer transition-all bg-black/5 dark:bg-white/5"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 mx-auto text-lantern-red mb-2" />
                    <h4 className="text-xs font-black">
                      {isArabic ? 'اسحب صورة الطبق هنا أو اضغط للرفع' : 'Click to Upload Dish Photo or Drag & Drop'}
                    </h4>
                    <p className="text-[10px] text-stone-gray mt-0.5">JPG, PNG, WebP (Max 5MB)</p>
                  </div>

                  {/* Preset Food Photography Library */}
                  <div>
                    <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-2">
                      {isArabic ? 'أو اختر من مكتبة الصور الجاهزة فائقة الجودة:' : 'Or Select From High-Resolution Presets:'}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {PRESET_FOOD_PHOTOS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                          className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-square ${
                            formData.imageUrl === preset.url
                              ? 'border-lantern-red scale-95 shadow-md'
                              : 'border-transparent hover:opacity-80'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          {formData.imageUrl === preset.url && (
                            <div className="absolute inset-0 bg-lantern-red/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Photo Preview */}
                  {formData.imageUrl && (
                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center gap-4">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-24 h-24 rounded-2xl object-cover bg-black/10"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Live Preview</span>
                        <h4 className="text-xs font-black">{formData.name || 'Dish Name'}</h4>
                        <p className="text-[11px] text-stone-gray mt-0.5 font-mono">{formData.basePrice} EGP</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Customization Options & Modifiers */}
              {activeTab === 'options' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black">
                        {isArabic ? 'مجموعات الخيارات والتعديلات' : 'Customization Option Groups'}
                      </h4>
                      <p className="text-[11px] text-stone-gray">
                        {isArabic
                          ? 'مثل المقاسات، نوع العجينة، الإضافات الإضافية، والصلصات'
                          : 'e.g. Size Selection (Radio), Crust Type, Extra Toppings (Checkboxes)'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addOptionGroup}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'إضافة مجموعة +' : 'Add Group +'}</span>
                    </button>
                  </div>

                  {/* Groups List */}
                  {formData.optionGroups && formData.optionGroups.length > 0 ? (
                    <div className="space-y-4">
                      {formData.optionGroups.map((grp, gIdx) => (
                        <div
                          key={grp.id || gIdx}
                          className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-3"
                        >
                          {/* Group Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                              <input
                                type="text"
                                value={grp.name}
                                onChange={(e) => {
                                  const updated = [...(formData.optionGroups || [])];
                                  updated[gIdx].name = e.target.value;
                                  setFormData({ ...formData, optionGroups: updated });
                                }}
                                placeholder="Group Name (EN) e.g. Select Size"
                                className={`px-2 py-1 rounded-lg text-xs font-bold border outline-none ${
                                  isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'
                                }`}
                              />
                              <input
                                type="text"
                                value={grp.nameAr}
                                onChange={(e) => {
                                  const updated = [...(formData.optionGroups || [])];
                                  updated[gIdx].nameAr = e.target.value;
                                  setFormData({ ...formData, optionGroups: updated });
                                }}
                                placeholder="الاسم بالعربية (مثال: اختر الحجم)"
                                dir="rtl"
                                className={`px-2 py-1 rounded-lg text-xs font-bold border outline-none ${
                                  isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'
                                }`}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={grp.isRequired}
                                  onChange={(e) => {
                                    const updated = [...(formData.optionGroups || [])];
                                    updated[gIdx].isRequired = e.target.checked;
                                    setFormData({ ...formData, optionGroups: updated });
                                  }}
                                  className="rounded text-lantern-red"
                                />
                                <span>{isArabic ? 'إجباري' : 'Required'}</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => removeOptionGroup(gIdx)}
                                className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Choices Inside Group */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-stone-gray uppercase block">
                              {isArabic ? 'الخيارات المتاحة:' : 'Option Choices:'}
                            </span>
                            {grp.options.map((opt, oIdx) => (
                              <div key={opt.id || oIdx} className="flex items-center gap-2 text-xs">
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const updated = [...(formData.optionGroups || [])];
                                    updated[gIdx].options[oIdx].name = e.target.value;
                                    setFormData({ ...formData, optionGroups: updated });
                                  }}
                                  placeholder="Option (EN)"
                                  className={`flex-1 px-2 py-1 rounded-lg border outline-none ${
                                    isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'
                                  }`}
                                />
                                <input
                                  type="text"
                                  value={opt.nameAr}
                                  onChange={(e) => {
                                    const updated = [...(formData.optionGroups || [])];
                                    updated[gIdx].options[oIdx].nameAr = e.target.value;
                                    setFormData({ ...formData, optionGroups: updated });
                                  }}
                                  placeholder="الخيار (AR)"
                                  dir="rtl"
                                  className={`flex-1 px-2 py-1 rounded-lg border outline-none ${
                                    isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'
                                  }`}
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-stone-gray font-mono">+</span>
                                  <input
                                    type="number"
                                    value={opt.priceDelta}
                                    onChange={(e) => {
                                      const updated = [...(formData.optionGroups || [])];
                                      updated[gIdx].options[oIdx].priceDelta = parseFloat(e.target.value) || 0;
                                      setFormData({ ...formData, optionGroups: updated });
                                    }}
                                    placeholder="0"
                                    className={`w-16 px-2 py-1 rounded-lg font-mono font-bold border outline-none text-right ${
                                      isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-[#DEC7B7]'
                                    }`}
                                  />
                                  <span className="text-[10px] text-stone-gray font-bold">EGP</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeOptionChoice(gIdx, oIdx)}
                                  className="p-1 text-stone-gray hover:text-red-500"
                                >
                                  ×
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addOptionChoice(gIdx)}
                              className="text-[11px] font-bold text-amber-600 hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isArabic ? '+ إضافة خيار فرعي' : '+ Add choice'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-stone-gray/30">
                      <Sliders className="w-8 h-8 mx-auto text-stone-gray/40 mb-2" />
                      <p className="text-xs text-stone-gray">
                        {isArabic ? 'لا توجد خيارات مخصصة لهذا الطبق بعد' : 'No option groups defined for this dish yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={addOptionGroup}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold"
                      >
                        {isArabic ? '+ إنشاء أول مجموعة خيارات' : '+ Create First Option Group'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDishModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-gray hover:text-black dark:hover:text-white"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <div className="flex items-center gap-2">
                {activeTab !== 'general' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'options' ? 'photo' : 'general')}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-black/10 dark:border-white/10"
                  >
                    ← {isArabic ? 'السابق' : 'Previous'}
                  </button>
                )}

                {activeTab !== 'options' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'general' ? 'photo' : 'options')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white flex items-center gap-1"
                  >
                    <span>{isArabic ? 'التالي' : 'Next'}</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveDish}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-lantern-red hover:bg-[#8B3426] text-white shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isArabic ? 'حفظ الصنف ونشره' : 'Save Dish to Menu'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. Category Creation & Management Modal */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
              isDark ? 'bg-dark-surface-elevated border-dark-border text-evening-cream' : 'bg-white border-[#EADAD0] text-temple-brown'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black">{isArabic ? 'إضافة قسم جديد للمنيو' : 'Add New Category'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-stone-gray hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-gray mb-1">
                  {isArabic ? 'اسم القسم بالإنجليزية' : 'Category Name (English)'} *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g. 🌯 Artisanal Shawarma & Bowls"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                    categoryErrors['name'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                  }`}
                />
                {categoryErrors['name'] && <p className="text-[10px] text-red-500 mt-1">{categoryErrors['name']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-gray mb-1">
                  {isArabic ? 'اسم القسم بالعربية' : 'Category Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={categoryFormData.nameAr || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameAr: e.target.value })}
                  placeholder="مثال: 🌯 شاورما كرافت وبولز"
                  dir="rtl"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                    categoryErrors['nameAr'] ? 'border-red-500' : isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-gray mb-1">
                  {isArabic ? 'الرابط التعريفي (Slug)' : 'URL Slug'}
                </label>
                <input
                  type="text"
                  value={categoryFormData.slug || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  placeholder="e.g. shawarma-bowls"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#F9F1EB] border-[#DEC7B7]'
                  }`}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-gray"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isArabic ? 'إنشاء القسم' : 'Create Category'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. Soft-Delete / Archive Dish Confirmation Dialog */}
      {/* ========================================================================= */}
      {archiveTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
              isDark ? 'bg-dark-surface-elevated border-dark-border text-evening-cream' : 'bg-white border-[#EADAD0] text-temple-brown'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">
                  {isArabic ? 'أرشفة الصنف من المنيو' : 'Archive Menu Item'}
                </h3>
                <p className="text-xs text-stone-gray">{archiveTargetItem.name}</p>
              </div>
            </div>

            <p className="text-xs text-stone-gray leading-relaxed mb-6">
              {isArabic
                ? 'سيتم إخفاء هذا الصنف فورياً من منيو العملاء وأرشفته مع الحفاظ على سجل الطلبات التاريخية والتقارير المالية.'
                : 'This will remove the item from the live customer menu while safely retaining past order histories and accounting data integrity.'}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setArchiveTargetItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-gray"
              >
                {isArabic ? 'تراجع' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onDeleteMenuItem) {
                    onDeleteMenuItem(archiveTargetItem.id);
                  }
                  setArchiveTargetItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isArabic ? 'تأكيد الأرشفة' : 'Confirm Archive'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
