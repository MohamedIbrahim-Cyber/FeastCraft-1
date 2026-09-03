import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Flame,
  Truck,
  Printer,
  FileText,
  AlertCircle,
  Package,
  Layers,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface KitchenPrepSheetProps {
  isDark: boolean;
  isArabic: boolean;
}

export const KitchenPrepSheet: React.FC<KitchenPrepSheetProps> = ({ isDark, isArabic }) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [completedTasks, setCompletedTasks] = useState<string[]>(['task-1', 'task-2']);

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Aggregated Prep Data for 2026-09-18 (2 Events: 160 + 80 = 240 Heads)
  const totalGuestsForDay = 240;

  const ingredientScaling = [
    {
      item: 'Slow-Roasted Carvery Lamb Leg',
      itemAr: 'فخذ لحم ضأن روستو للتقطيع الحي',
      qty: '72 kg',
      notes: 'Marinated in rosemary, garlic & smoked sea salt (12-hr slow cook)',
      category: 'Proteins',
    },
    {
      item: '12-Hour Smoked Wagyu Brisket',
      itemAr: 'بريسكت واجيو مدخن ١٢ ساعة',
      qty: '45 kg',
      notes: 'Mesquite oak wood smoke, sliced live on-site',
      category: 'Proteins',
    },
    {
      item: 'Charcoal Kofta & Shish Tawook Skewers',
      itemAr: 'أسياخ كفتة وشيش طاووق على الفحم',
      qty: '480 Skewers',
      notes: 'Skewered and vacuum packed in refrigerated cambros',
      category: 'Proteins',
    },
    {
      item: 'Truffle Hummus & Smoked Mutabbal',
      itemAr: 'حمص بالكمأة ومتبل مدخن بالرمان',
      qty: '30 kg',
      notes: 'Piped into crystal sharing bowls with 24k olive oil',
      category: 'Mezze',
    },
    {
      item: 'Heirloom Tomato & Burrata Salad',
      itemAr: 'سلطة طماطم عضوية وجبن بوراتا',
      qty: '60 Platters',
      notes: 'Balsamic reduction and fresh basil leaves',
      category: 'Salads',
    },
    {
      item: 'Artisanal Zaatar & Sesame Flatbreads',
      itemAr: 'مخبوزات صاج وسمسم طازجة',
      qty: '350 Pieces',
      notes: 'Baked fresh in stone oven at 14:00',
      category: 'Breads',
    },
    {
      item: 'Chef Omar Signature Pistachio Kunafa',
      itemAr: 'كنافة بالفستق الحلبي والتكريك الحي',
      qty: '24 Trays',
      notes: 'Unbaked base ready for on-site butane torching',
      category: 'Desserts',
    },
    {
      item: 'Royal Om Ali with Clotted Buffalo Cream',
      itemAr: 'أم علي ملكية بالقشطة البلدي',
      qty: '18 Large Chafers',
      notes: 'Warm buffalo milk reduction ready in thermal urns',
      category: 'Desserts',
    },
  ];

  const prepTimeline = [
    {
      id: 'task-1',
      time: '08:00 AM (T - 8h)',
      title: 'Smoke & Roast Ignition',
      titleAr: 'إشعال مدخنات اللحوم والأفران',
      desc: 'Load 72kg lamb legs into slow-roasting combi ovens. Ignite hickory wood smoker for wagyu brisket.',
      status: 'Done',
    },
    {
      id: 'task-2',
      time: '11:00 AM (T - 5h)',
      title: 'Mezze & Cold Larder Batching',
      titleAr: 'تجهيز مقبلات الكمأة والسلطات الباردة',
      desc: 'Blend truffle hummus, assemble burrata platters, bottle fresh hibiscus elixir syrups.',
      status: 'Done',
    },
    {
      id: 'task-3',
      time: '01:30 PM (T - 3.5h)',
      title: 'Hardware & Chafing Inspection',
      titleAr: 'فحص معدات السخانات والشعلات والبوفيه',
      desc: 'Load 14 royal chafers, 12 butane blowtorches, mangal charcoal bags, and tableware sets into Vans 1 & 2.',
      status: 'Pending',
    },
    {
      id: 'task-4',
      time: '03:30 PM (T - 2.5h)',
      title: 'Van Dispatch & Staff Departure',
      titleAr: 'انطلاق سيارات الضيافة وطاقم الشيفات',
      desc: 'Van 1 departs for Katameya Dunes (Chef Omar + 6 staff). Van 2 departs for Allegria Zayed (Chef Tarek + 4 staff).',
      status: 'Pending',
    },
    {
      id: 'task-5',
      time: '04:00 PM (T - 2h)',
      title: 'On-Site Station Assembly',
      titleAr: 'تجهيز المحطات والسخانات في الموقع',
      desc: 'Assemble chafing tables, ignite mangal charcoal, setup Live Kunafa torching station.',
      status: 'Pending',
    },
    {
      id: 'task-6',
      time: '07:00 PM (T - 0h)',
      title: 'Banquet Food Service Starts',
      titleAr: 'بدء خدمة الطعام وتقديم الوليمة للضيوف',
      desc: 'Carvery master begins lamb carving; Mangal grill master dispenses hot skewers.',
      status: 'Pending',
    },
  ];

  const equipmentChecklist = [
    { name: 'Royal Gold Chafing Units (Full Size)', qty: '14 Units', loaded: true },
    { name: 'Charcoal Mangal Grill Rig (Double Bay)', qty: '2 Rigs', loaded: true },
    { name: 'High-Output Butane Blowtorches (Kunafa)', qty: '6 Units', loaded: false },
    { name: 'Insulated Thermal Food Cambros', qty: '12 Boxes', loaded: true },
    { name: 'Porcelain Dinner Plates & Cutlery Sets', qty: '280 Sets', loaded: true },
    { name: 'Crystal Water & Mocktail Stemware', qty: '300 Glasses', loaded: false },
    { name: 'Chef Omar Embroidered Aprons & Gloves', qty: '12 Sets', loaded: true },
    { name: 'Organic Citrus & Rose Garnish Kits', qty: '4 Kits', loaded: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-start">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-lantern-red/10 text-lantern-red mb-1">
            <ChefHat className="w-3.5 h-3.5" />
            <span>{isArabic ? 'ورقة تجهيز المطبخ التشغيلية' : 'Executive Kitchen Production Sheet'}</span>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-black font-display ${
              isDark ? 'text-evening-cream' : 'text-temple-brown'
            }`}
          >
            {isArabic ? 'جدول الطهي وتجهيز المكونات لشيف عمر' : 'Chef Omar’s Catering Kitchen Prep Sheet'}
          </h2>
          <p className="text-xs text-stone-gray mt-0.5">
            Target Service Date: <strong className="text-evening-cream">{selectedDate}</strong> • Combined Daily Headcount:{' '}
            <strong className="text-lantern-red">{totalGuestsForDay} Guests</strong> (2 Active Events)
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-2xl bg-lantern-red text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:opacity-95 transition-all self-start sm:self-auto"
          style={{ backgroundColor: '#A13D2D' }}
        >
          <Printer className="w-4 h-4" />
          <span>{isArabic ? 'طباعة ورقة المطبخ' : 'Print Kitchen Sheet'}</span>
        </button>
      </div>

      {/* Grid: Ingredient Batch Scaling (Left) + Timeline & Equipment (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scaled Ingredients Roster */}
        <div
          className={`lg:col-span-7 p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-white border-[#E8D4C5]'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-gray/20">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-lantern-red" />
              <h3 className="font-extrabold text-sm sm:text-base font-display">
                {isArabic ? 'حساب كميات المكونات المجمعة لليوم' : 'Daily Scaled Batch Ingredients'}
              </h3>
            </div>
            <span className="text-xs font-bold text-lantern-red bg-lantern-red/10 px-2.5 py-0.5 rounded-full">
              {ingredientScaling.length} Items Scaled
            </span>
          </div>

          <div className="space-y-3">
            {ingredientScaling.map((ing, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                  isDark ? 'bg-dark-bg/60 border-dark-border' : 'bg-[#FAF5F0] border-[#E8D4C5]/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{isArabic ? ing.itemAr : ing.item}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-stone-gray/20 text-stone-gray">
                      {ing.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-gray">{ing.notes}</p>
                </div>

                <div className="text-end shrink-0">
                  <span className="font-mono text-xs font-black text-lantern-red px-2.5 py-1 rounded-xl bg-lantern-red/10 block">
                    {ing.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Prep Timeline & Equipment */}
        <div className="lg:col-span-5 space-y-6">
          {/* Timeline */}
          <div
            className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-white border-[#E8D4C5]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-gray/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-lantern-red" />
                <h3 className="font-extrabold text-sm sm:text-base font-display">
                  {isArabic ? 'جدول مراحل التجهيز والتحميل' : 'Production & Dispatch Timeline'}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {prepTimeline.map((task) => {
                const isDone = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isDone
                        ? 'border-emerald-500/30 bg-emerald-500/5 opacity-85'
                        : isDark
                        ? 'border-dark-border bg-dark-bg hover:border-lantern-red/30'
                        : 'border-[#E8D4C5] bg-[#FAF5F0] hover:border-lantern-red/30'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                        isDone ? 'bg-emerald-500 text-white' : 'border border-stone-gray/40'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isDone ? 'line-through text-stone-gray' : ''}`}>
                          {isArabic ? task.titleAr : task.title}
                        </span>
                        <span className="text-[10px] font-mono text-lantern-red font-semibold">{task.time}</span>
                      </div>
                      <p className="text-[11px] text-stone-gray leading-snug">{task.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipment Checklist */}
          <div
            className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDark ? 'bg-dark-surface border-dark-border text-evening-cream' : 'bg-white border-[#E8D4C5]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-gray/20">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-lantern-red" />
                <h3 className="font-extrabold text-sm sm:text-base font-display">
                  {isArabic ? 'قائمة فحص المعدات والأطقم' : 'Hardware & Rig Checklist'}
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {equipmentChecklist.map((eq, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b border-dashed border-stone-gray/20"
                >
                  <span className="text-stone-gray">{eq.name}</span>
                  <span className="font-bold text-evening-cream font-mono">{eq.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenPrepSheet;
