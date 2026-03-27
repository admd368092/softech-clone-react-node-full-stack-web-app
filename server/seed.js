const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/softech_business_arabic', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = [
  // أدوية الألم والحمى
  {
    name: 'باراسيتامول 500 مجم',
    sku: 'PARA-500',
    category: 'أدوية الألم والحمى',
    price: 15,
    costPrice: 10,
    quantity: 500,
    minQuantity: 50,
    unit: 'علبة',
    description: 'مسكن للألم وخافض للحرارة'
  },
  {
    name: 'إيبوبروفين 400 مجم',
    sku: 'IBU-400',
    category: 'أدوية الألم والحمى',
    price: 25,
    costPrice: 18,
    quantity: 300,
    minQuantity: 30,
    unit: 'علبة',
    description: 'مسكن للألم والالتهابات'
  },
  {
    name: 'أسبرين 500 مجم',
    sku: 'ASP-500',
    category: 'أدوية الألم والحمى',
    price: 12,
    costPrice: 8,
    quantity: 400,
    minQuantity: 40,
    unit: 'علبة',
    description: 'مسكن للألم وخافض للحرارة'
  },

  // أدوية الجهاز الهضمي
  {
    name: 'أوميبرازول 20 مجم',
    sku: 'OMP-20',
    category: 'أدوية الجهاز الهضمي',
    price: 35,
    costPrice: 25,
    quantity: 200,
    minQuantity: 20,
    unit: 'علبة',
    description: 'مثبط مضخة البروتون لعلاج حموضة المعدة'
  },
  {
    name: 'دومبيريدون 10 مجم',
    sku: 'DOM-10',
    category: 'أدوية الجهاز الهضمي',
    price: 28,
    costPrice: 20,
    quantity: 150,
    minQuantity: 15,
    unit: 'علبة',
    description: 'مضاد للغثيان والقيء'
  },
  {
    name: 'لوراتادين 10 مجم',
    sku: 'LOR-10',
    category: 'أدوية الجهاز الهضمي',
    price: 22,
    costPrice: 15,
    quantity: 180,
    minQuantity: 18,
    unit: 'علبة',
    description: 'مضاد للהיסטامين لعلاج الحساسية'
  },

  // أدوية الضغط والقلب
  {
    name: 'أملوديبين 5 مجم',
    sku: 'AML-5',
    category: 'أدوية الضغط والقلب',
    price: 45,
    costPrice: 32,
    quantity: 120,
    minQuantity: 12,
    unit: 'علبة',
    description: 'مثبط قنوات الكالسيوم لعلاج ضغط الدم'
  },
  {
    name: 'أتينولول 50 مجم',
    sku: 'ATN-50',
    category: 'أدوية الضغط والقلب',
    price: 38,
    costPrice: 28,
    quantity: 100,
    minQuantity: 10,
    unit: 'علبة',
    description: 'حاصر بيتا لعلاج ضغط الدم وأمراض القلب'
  },
  {
    name: 'كابتوبريل 25 مجم',
    sku: 'CAP-25',
    category: 'أدوية الضغط والقلب',
    price: 32,
    costPrice: 22,
    quantity: 90,
    minQuantity: 9,
    unit: 'علبة',
    description: 'مثبط الإنزيم المحول للأنجيوتنسين'
  },

  // أدوية السكري
  {
    name: 'ميتفورمين 500 مجم',
    sku: 'MET-500',
    category: 'أدوية السكري',
    price: 42,
    costPrice: 30,
    quantity: 250,
    minQuantity: 25,
    unit: 'علبة',
    description: 'دواء أولي لعلاج السكري من النوع الثاني'
  },
  {
    name: 'غليبنكلاميد 5 مجم',
    sku: 'GLB-5',
    category: 'أدوية السكري',
    price: 35,
    costPrice: 25,
    quantity: 180,
    minQuantity: 18,
    unit: 'علبة',
    description: 'محفز لإفراز الأنسولين'
  },

  // أدوية العيون
  {
    name: 'قطرة كلورامفينيكول',
    sku: 'CHL-EYE',
    category: 'أدوية العيون',
    price: 18,
    costPrice: 12,
    quantity: 200,
    minQuantity: 20,
    unit: 'زجاجة',
    description: 'قطرة عيون مضادة حيوية'
  },
  {
    name: 'قطرة لوبروستون',
    sku: 'LUP-EYE',
    category: 'أدوية العيون',
    price: 85,
    costPrice: 65,
    quantity: 50,
    minQuantity: 5,
    unit: 'زجاجة',
    description: 'قطرة لعلاج الجلوكوما'
  },

  // أدوية الجلد
  {
    name: 'كريم هيدروكورتيزون 1%',
    sku: 'HYD-CRM',
    category: 'أدوية الجلد',
    price: 25,
    costPrice: 18,
    quantity: 150,
    minQuantity: 15,
    unit: 'أنبوب',
    description: 'كريم مضاد للالتهابات الجلدية'
  },
  {
    name: 'مرهم موبيروسين',
    sku: 'MUP-OIN',
    category: 'أدوية الجلد',
    price: 32,
    costPrice: 22,
    quantity: 100,
    minQuantity: 10,
    unit: 'أنبوب',
    description: 'مرهم مضاد حيوي للجلد'
  },

  // أدوية الجهاز التنفسي
  {
    name: 'سالبيوتامول 100 ميكروغرام',
    sku: 'SAL-100',
    category: 'أدوية الجهاز التنفسي',
    price: 55,
    costPrice: 40,
    quantity: 80,
    minQuantity: 8,
    unit: 'بخاخ',
    description: 'موسع للشعب الهوائية'
  },
  {
    name: 'أموكسيسيلين 500 مجم',
    sku: 'AMX-500',
    category: 'أدوية الجهاز التنفسي',
    price: 28,
    costPrice: 20,
    quantity: 300,
    minQuantity: 30,
    unit: 'علبة',
    description: 'مضاد حيوي واسع الطيف'
  },

  // أدوية العظام والمفاصل
  {
    name: 'كالسيوم + فيتامين د',
    sku: 'CAL-VITD',
    category: 'أدوية العظام والمفاصل',
    price: 45,
    costPrice: 32,
    quantity: 200,
    minQuantity: 20,
    unit: 'علبة',
    description: 'مكمل غذائي لتقوية العظام'
  },
  {
    name: 'جلوكوزامين 500 مجم',
    sku: 'GLU-500',
    category: 'أدوية العظام والمفاصل',
    price: 65,
    costPrice: 48,
    quantity: 120,
    minQuantity: 12,
    unit: 'علبة',
    description: 'مكمل لصحة المفاصل'
  },

  // أدوية فيتامينات
  {
    name: 'فيتامين سي 1000 مجم',
    sku: 'VIT-C1000',
    category: 'أدوية فيتامينات',
    price: 35,
    costPrice: 25,
    quantity: 250,
    minQuantity: 25,
    unit: 'علبة',
    description: 'مكمل غذائي لتعزيز المناعة'
  },
  {
    name: 'فيتامين ب المركب',
    sku: 'VIT-BCOM',
    category: 'أدوية فيتامينات',
    price: 40,
    costPrice: 28,
    quantity: 180,
    minQuantity: 18,
    unit: 'علبة',
    description: 'مكمل غذائي لفيتامينات ب'
  },
  {
    name: 'حديد + حمض الفوليك',
    sku: 'IRON-FA',
    category: 'أدوية فيتامينات',
    price: 30,
    costPrice: 22,
    quantity: 200,
    minQuantity: 20,
    unit: 'علبة',
    description: 'مكمل لعلاج فقر الدم'
  },

  // مستلزمات طبية
  {
    name: 'شاش طبي معقم',
    sku: 'GAUZE-STR',
    category: 'مستلزمات طبية',
    price: 8,
    costPrice: 5,
    quantity: 500,
    minQuantity: 50,
    unit: 'لفة',
    description: 'شاش طبي معقم للجروح'
  },
  {
    name: 'ضمادة لاصقة',
    sku: 'BAND-AID',
    category: 'مستلزمات طبية',
    price: 12,
    costPrice: 8,
    quantity: 400,
    minQuantity: 40,
    unit: 'علبة',
    description: 'ضمادات لاصقة للجروح الصغيرة'
  },
  {
    name: 'كحول طبي 70%',
    sku: 'ALC-70',
    category: 'مستلزمات طبية',
    price: 15,
    costPrice: 10,
    quantity: 300,
    minQuantity: 30,
    unit: 'زجاجة',
    description: 'كحول طبي للتعقيم'
  },
  {
    name: 'ميزان حرارة رقمي',
    sku: 'THERM-DIG',
    category: 'مستلزمات طبية',
    price: 45,
    costPrice: 32,
    quantity: 60,
    minQuantity: 6,
    unit: 'قطعة',
    description: 'ميزان حرارة رقمي للجسم'
  }
];

const customers = [
  {
    name: 'محمد أحمد علي',
    phone: '01012345678',
    email: 'mohamed.ahmed@email.com',
    customerType: 'individual',
    address: {
      street: 'شارع النيل',
      city: 'القاهرة',
      governorate: 'القاهرة'
    }
  },
  {
    name: 'شركة النيل للأدوية',
    phone: '0223456789',
    email: 'info@nile-pharma.com',
    customerType: 'company',
    address: {
      street: 'شارع الهرم',
      city: 'الجيزة',
      governorate: 'الجيزة'
    },
    taxNumber: '123456789'
  },
  {
    name: 'فاطمة محمد حسن',
    phone: '01123456789',
    email: 'fatma.mohamed@email.com',
    customerType: 'individual',
    address: {
      street: 'شارع المعادي',
      city: 'المعادي',
      governorate: 'القاهرة'
    }
  },
  {
    name: 'صيدليات الشفاء',
    phone: '0234567890',
    email: 'info@alshifa-pharmacy.com',
    customerType: 'company',
    address: {
      street: 'شارع الجمهورية',
      city: 'الإسكندرية',
      governorate: 'الإسكندرية'
    },
    taxNumber: '987654321'
  },
  {
    name: 'أحمد محمود إبراهيم',
    phone: '01234567890',
    email: 'ahmed.mahmoud@email.com',
    customerType: 'individual',
    address: {
      street: 'شارع الهرم',
      city: 'الجيزة',
      governorate: 'الجيزة'
    }
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Customer.deleteMany({});

    console.log('تم مسح البيانات القديمة');

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`تم إضافة ${createdProducts.length} منتج`);

    // Insert customers
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`تم إضافة ${createdCustomers.length} عميل`);

    console.log('تم تعبئة قاعدة البيانات بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('خطأ في تعبئة قاعدة البيانات:', error);
    process.exit(1);
  }
};

seedDatabase();
