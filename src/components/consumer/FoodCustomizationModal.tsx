import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Minus, Check, Flame, AlertCircle, ShoppingBag } from 'lucide-react';
import { MenuItem, SelectedOptionChoice, CartItem } from '../../types';

interface FoodCustomizationModalProps {
  item: MenuItem | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const FoodCustomizationModal: React.FC<FoodCustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  isArabic,
  isDark,
}) => {
  if (isOpen !== undefined && !isOpen) return null;
  if (!item) return null;

  const buildInitialOptions = (menuItem: MenuItem) => {
    const initial: { [groupId: string]: string[] } = {};
    if (menuItem.optionGroups && Array.isArray(menuItem.optionGroups)) {
      menuItem.optionGroups.forEach((group) => {
        const options = group.options || [];
        const defaultOpt =
          options.find((o) => o.isDefault && o.isAvailable) ||
          (group.isRequired ? options.find((o) => o.isAvailable) : undefined);
        if (defaultOpt) {
          initial[group.id] = [defaultOpt.id];
        } else {
          initial[group.id] = [];
        }
      });
    }
    return initial;
  };

  // Selected options state map: optionGroupId -> string[] (option IDs)
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<{ [groupId: string]: string[] }>(() =>
    buildInitialOptions(item)
  );

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setSelectedOptionsMap(buildInitialOptions(item));
      setQuantity(1);
      setSpecialInstructions('');
      setValidationError(null);
    }
  }, [item?.id]);

  // Handle Radio Selection (Single Choice)
  const handleSelectRadio = (groupId: string, optionId: string) => {
    setSelectedOptionsMap((prev) => ({
      ...prev,
      [groupId]: [optionId],
    }));
    setValidationError(null);
  };

  // Handle Multi-Checkbox Selection
  const handleToggleCheckbox = (groupId: string, optionId: string, maxSelect: number) => {
    setSelectedOptionsMap((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return {
          ...prev,
          [groupId]: current.filter((id) => id !== optionId),
        };
      } else {
        if (current.length >= maxSelect) {
          // Replace or prevent
          return prev;
        }
        return {
          ...prev,
          [groupId]: [...current, optionId],
        };
      }
    });
    setValidationError(null);
  };

  // Calculate Unit Price & Flatten Selected Choices
  const { unitPrice, selectedChoices } = useMemo(() => {
    let price = Number(item.basePrice);
    const choices: SelectedOptionChoice[] = [];

    if (item.optionGroups && Array.isArray(item.optionGroups)) {
      item.optionGroups.forEach((group) => {
        const options = group.options || [];
        const selectedIds = selectedOptionsMap[group.id] || [];
        selectedIds.forEach((optId) => {
          const opt = options.find((o) => o.id === optId);
          if (opt) {
            price += Number(opt.priceDelta || 0);
            choices.push({
              groupId: group.id,
              groupName: group.name,
              groupNameAr: group.nameAr,
              optionId: opt.id,
              optionName: opt.name,
              optionNameAr: opt.nameAr,
              priceDelta: Number(opt.priceDelta || 0),
            });
          }
        });
      });
    }

    return { unitPrice: price, selectedChoices: choices };
  }, [item, selectedOptionsMap]);

  const totalPrice = unitPrice * quantity;

  // Handle Add to Cart submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required option groups
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        const selected = selectedOptionsMap[group.id] || [];
        if (group.isRequired && selected.length === 0) {
          setValidationError(
            isArabic
              ? `يرجى اختيار عنصر من "${group.nameAr}" للمتابعة`
              : `Please select an option for "${group.name}" to continue`
          );
          return;
        }
        if (group.minSelect > 0 && selected.length < group.minSelect) {
          setValidationError(
            isArabic
              ? `يرجى اختيار ما لا يقل عن ${group.minSelect} من "${group.nameAr}"`
              : `Please select at least ${group.minSelect} from "${group.name}"`
          );
          return;
        }
      }
    }

    // Build unique cart item id (item ID + sorted options + special notes)
    const optionsKey = selectedChoices
      .map((c) => c.optionId)
      .sort()
      .join('-');
    const cartItemId = `${item.id}-${optionsKey}-${specialInstructions.trim() ? 'notes' : 'standard'}`;

    const cartItem: CartItem = {
      id: cartItemId,
      menuItemId: item.id,
      name: item.name,
      nameAr: item.nameAr,
      imageUrl: item.imageUrl,
      basePrice: item.basePrice,
      selectedOptions: selectedChoices,
      specialInstructions: specialInstructions.trim() || undefined,
      quantity,
      unitPrice,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div
      id="food-customization-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn"
    >
      <div
        className={`relative w-full max-w-xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border transition-all max-h-[92vh] sm:max-h-[90vh] flex flex-col ${
          isDark
            ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
            : 'bg-white border-[#E5D2C3] text-temple-brown'
        }`}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden absolute top-2 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="w-12 h-1.5 rounded-full bg-white/60 shadow-sm" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-44 sm:h-64 w-full shrink-0 overflow-hidden bg-black/10">
          <img
            src={item.imageUrl}
            alt={isArabic ? item.nameAr : item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Title & Price on Image */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-4 sm:right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              {item.isPopular && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                  {isArabic ? 'الأكثر طلباً' : 'Popular'}
                </span>
              )}
              {item.isSpicy && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow-xs">
                  <Flame className="w-2.5 h-2.5" />
                  {isArabic ? 'حار' : 'Spicy'}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black">{isArabic ? item.nameAr : item.name}</h2>
            <p className="text-xs sm:text-sm text-white/80 line-clamp-1 sm:line-clamp-2 mt-0.5">
              {isArabic ? item.descriptionAr : item.description}
            </p>
          </div>
        </div>

        {/* Customization Options Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto overscroll-contain">
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Option Groups */}
          {item.optionGroups && item.optionGroups.length > 0 ? (
            item.optionGroups.map((group) => {
              const selected = selectedOptionsMap[group.id] || [];
              const isSingleChoice = group.maxSelect === 1;

              return (
                <div key={group.id} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black flex items-center gap-1.5">
                        <span>{isArabic ? group.nameAr : group.name}</span>
                        {group.isRequired && (
                          <span className="text-[11px] font-bold text-lantern-red">
                            {isArabic ? '(مطلوب)' : '(Required)'}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-stone-gray">
                        {isSingleChoice
                          ? (isArabic ? 'اختر خياراً واحداً' : 'Choose 1 option')
                          : (isArabic ? `اختر حتى ${group.maxSelect} خيارات` : `Choose up to ${group.maxSelect} options`)}
                      </p>
                    </div>

                    {isSingleChoice ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-gray/10 text-stone-gray">
                        {isArabic ? 'اختيار إلزامي' : 'Single Choice'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-gray/10 text-stone-gray">
                        {selected.length} / {group.maxSelect}
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options
                      .filter((opt) => opt.isAvailable)
                      .map((opt) => {
                        const isSelected = selected.includes(opt.id);

                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              if (isSingleChoice) {
                                handleSelectRadio(group.id, opt.id);
                              } else {
                                handleToggleCheckbox(group.id, opt.id, group.maxSelect);
                              }
                            }}
                            className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-200 ${
                              isSelected
                                ? 'border-lantern-red bg-lantern-red/10 shadow-xs'
                                : isDark
                                ? 'border-dark-border bg-dark-surface hover:border-lantern-red/40'
                                : 'border-[#E7D6C9] bg-[#FAF4EF] hover:bg-[#F2E5DB]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-${
                                  isSingleChoice ? 'full' : 'md'
                                } border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-lantern-red border-lantern-red text-white'
                                    : 'border-stone-gray/40 bg-white dark:bg-black/30'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-bold">
                                {isArabic ? opt.nameAr : opt.name}
                              </span>
                            </div>

                            {Number(opt.priceDelta) > 0 ? (
                              <span className="text-xs font-mono font-black text-lantern-red">
                                +{Number(opt.priceDelta)} {isArabic ? 'ج.م' : 'EGP'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-stone-gray">
                                {isArabic ? 'مجاناً' : 'Free'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-stone-gray/20 text-xs font-semibold text-stone-gray">
              {isArabic
                ? 'هذا الصنف جاهز للتحضير الفوري بمواصفات الشيف الخاصة.'
                : 'This item is prepared fresh to order using Chef Omar’s artisanal standard recipe.'}
            </div>
          )}

          {/* Special Cooking Notes */}
          <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
            <label className="text-xs font-black block">
              {isArabic ? 'ملاحظات خاصة للشيف والمطبخ (اختياري)' : 'Special Instructions for Kitchen (Optional)'}
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder={
                isArabic
                  ? 'مثال: بدون بصل، صوص إضافي على جنب، خبز مقرمش جيداً...'
                  : 'e.g. No onions, sauce on the side, extra crispy crust...'
              }
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors focus:outline-none focus:border-lantern-red ${
                isDark
                  ? 'bg-dark-surface border-dark-border text-evening-cream placeholder-stone-gray/60'
                  : 'bg-white border-[#DAC3B2] text-temple-brown placeholder-stone-gray/60'
              }`}
            />
          </div>
        </form>

        {/* Footer / CTA Bar */}
        <div
          className={`p-4 sm:p-5 pb-6 sm:pb-5 border-t flex items-center justify-between gap-3 sm:gap-4 shrink-0 ${
            isDark ? 'bg-dark-surface/95 border-dark-border' : 'bg-[#FAF4EF] border-[#E8D6C9]'
          }`}
        >
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1 sm:gap-2 rounded-2xl p-1 bg-black/5 dark:bg-white/5 border border-stone-gray/20 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-stone-gray" />
            </button>
            <span className="w-7 text-center font-black text-sm font-mono">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-stone-gray" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            id="modal-add-to-cart-btn"
            data-testid="modal-add-to-cart-btn"
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3.5 sm:py-3 px-4 sm:px-5 rounded-2xl font-black text-xs sm:text-sm bg-lantern-red hover:bg-[#8B3426] text-white shadow-lg shadow-lantern-red/25 active:scale-98 transition-all flex items-center justify-between cursor-pointer min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{isArabic ? 'إضافة للطلب' : 'Add to Order'}</span>
            </div>
            <span className="font-mono text-sm sm:text-base font-black">
              {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{' '}
              <span className="text-[11px] sm:text-xs font-normal">{isArabic ? 'ج.م' : 'EGP'}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
