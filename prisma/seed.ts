import { PrismaClient, Role, FulfillmentType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FeastCraft Fast-Casual Restaurant database seeding...');

  // 1. Clean existing tables
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.itemOption.deleteMany();
  await prisma.itemOptionGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Purged existing tables.');

  // 2. Hash default passwords
  const adminPasswordHash = await bcrypt.hash('ChefOmar@2026!', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@FeastCraft2026!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@2026!', 10);

  // 3. Upsert / Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cyberdev.me' },
    update: {
      name: 'Chef Omar',
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
      phone: '+20 100 000 0001',
    },
    create: {
      email: 'admin@cyberdev.me',
      name: 'Chef Omar',
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
      phone: '+20 100 000 0001',
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@cyberdev.me' },
    update: {
      name: 'Kitchen Lead / Expediter',
      role: Role.STAFF,
      passwordHash: staffPasswordHash,
      phone: '+20 100 000 0002',
    },
    create: {
      email: 'staff@cyberdev.me',
      name: 'Kitchen Lead / Expediter',
      role: Role.STAFF,
      passwordHash: staffPasswordHash,
      phone: '+20 100 000 0002',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'karim@mansour.com' },
    update: {
      name: 'Karim Mansour',
      role: Role.CUSTOMER,
      passwordHash: customerPasswordHash,
      phone: '+20 100 293 8472',
    },
    create: {
      email: 'karim@mansour.com',
      name: 'Karim Mansour',
      role: Role.CUSTOMER,
      passwordHash: customerPasswordHash,
      phone: '+20 100 293 8472',
    },
  });

  console.log(`👤 Seeded users (Admin: ${adminUser.email}, Staff: ${staffUser.email}, Customer: ${customerUser.email})`);

  // 3. Seed Delivery Zones
  const zoneTagamoa = await prisma.deliveryZone.create({
    data: {
      zoneName: 'New Cairo & 5th Settlement (Tagamoa)',
      zoneNameAr: 'القاهرة الجديدة والتجمع الخامس',
      deliveryFee: 35.00,
      estimatedMinutes: 35,
      isActive: true,
    },
  });

  const zoneZayed = await prisma.deliveryZone.create({
    data: {
      zoneName: 'Sheikh Zayed & 6th of October',
      zoneNameAr: 'الشيخ زايد والسادس من أكتوبر',
      deliveryFee: 40.00,
      estimatedMinutes: 45,
      isActive: true,
    },
  });

  const zoneZamalek = await prisma.deliveryZone.create({
    data: {
      zoneName: 'Zamalek & Downtown',
      zoneNameAr: 'الزمالك ووسط البلد',
      deliveryFee: 25.00,
      estimatedMinutes: 30,
      isActive: true,
    },
  });

  console.log(`🚚 Seeded 3 delivery zones.`);

  // 4. Seed Categories
  const catDeals = await prisma.category.create({
    data: {
      name: '🔥 Deals & Combos',
      nameAr: '🔥 العروض والكومبو',
      slug: 'deals',
      icon: 'Flame',
      sortOrder: 1,
      isActive: true,
    },
  });

  const catPizzas = await prisma.category.create({
    data: {
      name: '🍕 Artisanal Pizzas',
      nameAr: '🍕 بيتزا كرافت وحطب',
      slug: 'pizzas',
      icon: 'Pizza',
      sortOrder: 2,
      isActive: true,
    },
  });

  const catBurgers = await prisma.category.create({
    data: {
      name: '🍔 Smash Burgers',
      nameAr: '🍔 برجر سماش وساندوتشات',
      slug: 'burgers',
      icon: 'Beef',
      sortOrder: 3,
      isActive: true,
    },
  });

  const catSides = await prisma.category.create({
    data: {
      name: '🍟 Starters & Wings',
      nameAr: '🍟 مقبلات وأجنحة دجاج',
      slug: 'sides',
      icon: 'Utensils',
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log(`📂 Seeded 4 menu categories.`);

  // 5. Seed Menu Items & Customization Option Groups
  const itemPepperoni = await prisma.menuItem.create({
    data: {
      categoryId: catPizzas.id,
      name: 'Spicy Pepperoni & Hot Honey Pizza',
      nameAr: 'بيتزا بيبروني حار مع العسل الحار',
      description: 'San Marzano tomato base, artisanal fior di latte mozzarella, double beef pepperoni, fresh chili flakes, and hot habanero honey drizzle.',
      descriptionAr: 'صلصة طماطم سان مارزانو، موزاريلا إيطالية طازجة، دبل بيبروني بقري، رقائق فلفل حار، مع رشة عسل جبلي حار بالهابانيرو.',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
      basePrice: 195.00,
      isAvailable: true,
      isPopular: true,
      isSpicy: true,
      prepTimeMinutes: 15,
      calories: 920,
      optionGroups: {
        create: [
          {
            name: 'Select Size',
            nameAr: 'اختر الحجم',
            minSelect: 1,
            maxSelect: 1,
            isRequired: true,
            options: {
              create: [
                { name: 'Medium 10" (6 Slices)', nameAr: 'وسط ١٠ بوصة', priceDelta: 0.00, isDefault: true, isAvailable: true },
                { name: 'Large 13" (8 Slices) (+55 EGP)', nameAr: 'كبير ١٣ بوصة (+٥٥ ج.م)', priceDelta: 55.00, isAvailable: true },
                { name: 'Party XL 16" (12 Slices) (+95 EGP)', nameAr: 'حفلات ١٦ بوصة (+٩٥ ج.م)', priceDelta: 95.00, isAvailable: true },
              ],
            },
          },
          {
            name: 'Crust Style',
            nameAr: 'نوع العجينة والأطراف',
            minSelect: 1,
            maxSelect: 1,
            isRequired: true,
            options: {
              create: [
                { name: 'Crispy Neapolitan Thin Crust', nameAr: 'عجينة رقيقة ومقرمشة', priceDelta: 0.00, isDefault: true, isAvailable: true },
                { name: 'Mozzarella & Cheddar Stuffed Crust (+35 EGP)', nameAr: 'أطراف محشوة جبن (+٣٥ ج.م)', priceDelta: 35.00, isAvailable: true },
              ],
            },
          },
        ],
      },
    },
  });

  const itemSmash = await prisma.menuItem.create({
    data: {
      categoryId: catBurgers.id,
      name: 'Double Truffle Beef Smash Burger',
      nameAr: 'برجر دبل سماش بالترفل والجبن الأمريكي',
      description: 'Two crispy-edged Angus beef patties, double American cheese, caramelized balsamic onions, black truffle aioli on toasted butter brioche bun.',
      descriptionAr: 'شريحتان من لحم الأنجوس مع أطراف كرانشي، دبل جبنة أمريكية، بصل مكرمل بالبلسميك، صوص مايونيز الترفل الأسود على خبز بريوش.',
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      basePrice: 185.00,
      isAvailable: true,
      isPopular: true,
      prepTimeMinutes: 12,
      calories: 820,
    },
  });

  const itemFries = await prisma.menuItem.create({
    data: {
      categoryId: catSides.id,
      name: 'Parmesan Truffle Crinkle Fries',
      nameAr: 'بطاطس كرانشي بالترفل والبارميزان',
      description: 'Golden crispy crinkle-cut fries tossed in white truffle oil, freshly grated 24-month Parmigiano-Reggiano, and chopped parsley.',
      descriptionAr: 'بطاطس مقلية ذهبية مقرمشة ممزوجة بزيت الترفل الأبيض وجبن بارميزان إيطالي مبشور وبقدونس مع صوص ترفل مايونيز.',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
      basePrice: 85.00,
      isAvailable: true,
      isPopular: true,
      isVegetarian: true,
      prepTimeMinutes: 8,
      calories: 420,
    },
  });

  console.log(`🍕 Seeded menu items with customization options.`);

  // 6. Seed Coupons
  await prisma.coupon.create({
    data: {
      code: 'FEAST20',
      discountPercentage: 20.00,
      maxDiscount: 100.00,
      minOrderAmount: 200.00,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'WELCOME50',
      discountPercentage: 15.00,
      maxDiscount: 75.00,
      minOrderAmount: 150.00,
      isActive: true,
    },
  });

  console.log(`🏷️ Seeded active promo coupons.`);

  // 7. Seed Sample Restaurant Orders
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: '#FC-8921',
      userId: customerUser.id,
      fulfillmentType: FulfillmentType.DELIVERY,
      status: OrderStatus.KITCHEN_PREPARING,
      customerName: 'Karim Mansour',
      customerPhone: '+20 100 293 8472',
      customerEmail: 'karim@mansour.com',
      deliveryZoneId: zoneTagamoa.id,
      deliveryAddress: 'Villa 14, Street 18, 5th Settlement, New Cairo',
      building: 'Villa 14',
      floor: 'Ground',
      apartment: 'Private Entrance',
      deliveryNotes: 'Please ring bell upon arrival',
      subtotal: 370.00,
      deliveryFee: 35.00,
      taxAmount: 51.80,
      discountAmount: 0.00,
      totalAmount: 456.80,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.UNPAID,
      estimatedMinutes: 35,
      items: {
        create: [
          {
            menuItemId: itemPepperoni.id,
            quantity: 1,
            unitPrice: 285.00, // large + stuffed crust
            totalPrice: 285.00,
            selectedOptionsSummary: 'Large 13", Stuffed Cheesy Crust',
          },
          {
            menuItemId: itemFries.id,
            quantity: 1,
            unitPrice: 85.00,
            totalPrice: 85.00,
            selectedOptionsSummary: 'Standard Truffle & Parmesan',
          },
        ],
      },
    },
  });

  console.log(`🛵 Seeded sample restaurant order: ${sampleOrder.orderNumber}`);
  console.log('✅ FeastCraft Fast-Casual database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
