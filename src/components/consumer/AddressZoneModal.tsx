import React, { useState } from 'react';
import { X, MapPin, Store, Check, Clock, Bike, Building2 } from 'lucide-react';
import { DeliveryZone, FulfillmentType } from '../../types';

interface AddressZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  fulfillmentType: FulfillmentType;
  onChangeFulfillment?: (type: FulfillmentType) => void;
  onSelectFulfillmentType?: (type: FulfillmentType) => void;
  selectedZone: DeliveryZone | null;
  onSelectZone: (zone: DeliveryZone) => void;
  availableZones?: DeliveryZone[];
  zones?: DeliveryZone[];
  addressDetails?: any;
  onUpdateAddressDetails?: (details: any) => void;
  isArabic: boolean;
  isDark: boolean;
}

export const AddressZoneModal: React.FC<AddressZoneModalProps> = ({
  isOpen,
  onClose,
  fulfillmentType,
  onChangeFulfillment,
  onSelectFulfillmentType,
  selectedZone,
  onSelectZone,
  availableZones = [],
  zones = [],
  addressDetails,
  onUpdateAddressDetails,
  isArabic,
  isDark,
}) => {
  if (!isOpen) return null;

  const effectiveZones = zones && zones.length > 0 ? zones : availableZones || [];

  const handleFulfillmentChange = (type: FulfillmentType) => {
    if (onChangeFulfillment) {
      onChangeFulfillment(type);
    } else if (onSelectFulfillmentType) {
      onSelectFulfillmentType(type);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border transition-all ${
          isDark
            ? 'bg-dark-surface-elevated border-dark-border text-evening-cream'
            : 'bg-white border-[#E5D2C3] text-temple-brown'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF4EF] border-[#E8D4C5]'
          }`}
        >
          <div>
            <h3 className="text-base sm:text-lg font-black">
              {isArabic ? 'طريقة الاستلام والمنطقة' : 'Fulfillment & Location'}
            </h3>
            <p className="text-xs text-stone-gray">
              {isArabic
                ? 'اختر بين التوصيل السريع إلى باب منزلك أو الاستلام من الفرع'
                : 'Choose fast doorstep delivery or pickup from our downtown branch'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-gray hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Fulfillment Toggle (Delivery vs Pickup) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-stone-gray/20">
            <button
              type="button"
              onClick={() => handleFulfillmentChange('DELIVERY')}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                fulfillmentType === 'DELIVERY'
                  ? 'bg-lantern-red text-white shadow-md'
                  : 'text-stone-gray hover:text-black dark:hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>{isArabic ? '🛵 توصيل للمنزل' : '🛵 Doorstep Delivery'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFulfillmentChange('PICKUP')}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                fulfillmentType === 'PICKUP'
                  ? 'bg-lantern-red text-white shadow-md'
                  : 'text-stone-gray hover:text-black dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{isArabic ? '🛍️ استلام من الفرع' : '🛍️ Store Pickup'}</span>
            </button>
          </div>

          {/* If Delivery: Show Zones List */}
          {fulfillmentType === 'DELIVERY' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider block">
                  {isArabic ? 'اختر منطقة التوصيل' : 'Select Cairo Delivery Zone'}
                </label>
                <span className="text-[11px] text-stone-gray">
                  {isArabic ? 'تحدد سرعة التوصيل والرسوم' : 'Sets ETA & delivery fee'}
                </span>
              </div>

              <div className="space-y-2">
                {effectiveZones.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => {
                        onSelectZone(zone);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-lantern-red bg-lantern-red/10 shadow-xs'
                          : isDark
                          ? 'border-dark-border bg-dark-surface hover:border-lantern-red/40'
                          : 'border-[#E7D6C9] bg-[#FAF4EF] hover:bg-[#F2E5DB]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-lantern-red border-lantern-red text-white'
                              : 'border-stone-gray/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black">
                            {isArabic ? zone.zoneNameAr : zone.zoneName}
                          </h4>
                          <span className="text-[11px] text-stone-gray flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {zone.estimatedMinutes || 35} {isArabic ? 'دقيقة تقديرية' : 'mins ETA'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-black text-lantern-red">
                        {zone.deliveryFee} {isArabic ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* If Pickup: Show Branch Location Details */
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-dark-surface border-dark-border' : 'bg-[#FAF4EF] border-[#E7D6C9]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-lantern-red/10 text-lantern-red flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black">
                    {isArabic
                      ? 'فرع فيست كرافت الرئيسي - وسط البلد'
                      : 'FeastCraft Flagship - Downtown Cairo'}
                  </h4>
                  <p className="text-xs text-stone-gray mt-0.5">
                    {isArabic
                      ? '١٢ شارع قصر النيل، ميدان التحرير، القاهرة'
                      : '12 Kasr El Nil Street, Tahrir Sq., Downtown Cairo'}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {isArabic ? 'جاهز للاستلام خلال: ١٥-٢٠ دقيقة' : 'Ready in: 15–20 mins'}
                    </span>
                    <span>• {isArabic ? 'بدون رسوم توصيل' : 'No delivery fee'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-lantern-red text-white text-xs font-black hover:bg-[#8B3426] transition-colors"
              >
                {isArabic ? 'تأكيد فرع الاستلام' : 'Confirm Pickup Location'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
