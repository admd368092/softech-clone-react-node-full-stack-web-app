# نظام إدارة الأعمال الذكي - سوفتك (Arabic Softech Smart Business)

نظام إدارة أعمال ذكي شامل مبني بتقنيات حديثة مع دعم كامل للغة العربية واجهة من اليمين لليسار (RTL).

## المميزات

### 📊 لوحة التحكم
- إحصائيات المبيعات والإيرادات
- رسم بياني للمبيعات خلال الأسبوع
- توزيع حالة المبيعات
- آخر المبيعات والمنتجات الأكثر مبيعاً
- تنبيهات المنتجات منخفضة المخزون

### 📦 إدارة المنتجات
- إضافة وتعديل وحذف المنتجات
- تتبع المخزون والكميات
- تصنيف المنتجات حسب الفئات
- تنبيهات المخزون المنخفض
- البحث والفلترة المتقدمة

### 👥 إدارة العملاء
- إضافة وتعديل وحذف العملاء
- تصنيف العملاء (فرد/شركة)
- تتبع الأرصدة والمستحقات
- معلومات الاتصال والعناوين
- حدود الائتمان

### 🛒 إدارة المبيعات
- إنشاء فواتير مبيعات جديدة
- اختيار العملاء والمنتجات
- حساب الخصومات والضرائب
- طرق الدفع المتعددة (نقداً، بطاقة، تحويل، آجل)
- طباعة الفواتير

### 📈 التقارير والتحليلات
- تقارير المبيعات اليومية والشهرية والسنوية
- تحليل المبيعات حسب الفئات
- أفضل العملاء والمنتجات
- توزيع طرق الدفع
- تصدير التقارير

### 🔐 نظام الأمان
- تسجيل الدخول والتسجيل
- المصادقة باستخدام JWT
- إدارة الصلاحيات (مدير، مسؤول، موظف)
- حماية APIs

## التقنيات المستخدمة

### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار العمل
- **MongoDB** - قاعدة البيانات
- **Mongoose** - ODM
- **JWT** - المصادقة
- **bcryptjs** - تشفير كلمات المرور

### Frontend
- **React.js** - مكتبة الواجهات
- **React Router** - التوجيه
- **Axios** - طلبات HTTP
- **Chart.js** - الرسوم البيانية
- **React Icons** - الأيقونات
- **React Toastify** - الإشعارات

## التثبيت والتشغيل

### المتطلبات
- Node.js (v14 أو أحدث)
- MongoDB (v4.4 أو أحدث)
- npm أو yarn

### الخطوات

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd softech-clone-react-node-full-stack-web-app
```

2. **تثبيت الاعتماديات**
```bash
# تثبيت اعتميات الخادم
npm install

# تثبيت اعتميات العميل
cd client
npm install
cd ..
```

3. **إعداد قاعدة البيانات**
- تأكد من تشغيل MongoDB
- إنشاء قاعدة بيانات باسم `softech_business_arabic`

4. **إعداد متغيرات البيئة**
- تعديل ملف `.env` إذا لزم الأمر

5. **تشغيل التطبيق**
```bash
# تشغيل الخادم والعميل معاً
npm run dev

# أو تشغيلهما منفصلين
# الخادم
npm run server

# العميل (في terminal آخر)
npm run client
```

6. **فتح التطبيق**
- افتح المتصفح على `http://localhost:3000`

## هيكل المشروع

```
softech-clone-react-node-full-stack-web-app/
├── server/
│   ├── index.js          # نقطة الدخول للخادم
│   ├── models/           # نماذج قاعدة البيانات
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Customer.js
│   │   └── Sale.js
│   ├── routes/           # مسارات API
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── customers.js
│   │   ├── sales.js
│   │   └── dashboard.js
│   └── middleware/       # الوسطاء
│       └── auth.js
├── client/
│   ├── public/
│   │   └── index.html    # الصفحة الرئيسية
│   ├── src/
│   │   ├── App.js        # المكون الرئيسي
│   │   ├── App.css       # الأنماط
│   │   ├── index.js      # نقطة الدخول
│   │   ├── context/      # سياق التطبيق
│   │   │   └── AuthContext.js
│   │   ├── components/   # المكونات
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.js
│   │   │   │   └── Header.js
│   │   │   └── routing/
│   │   │       └── PrivateRoute.js
│   │   └── pages/        # الصفحات
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Customers.js
│   │       ├── Sales.js
│   │       ├── NewSale.js
│   │       ├── Reports.js
│   │       ├── Login.js
│   │       └── Register.js
│   └── package.json
├── package.json
├── .env
└── README.md
```

## API Endpoints

### المصادقة
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - الحصول على بيانات المستخدم الحالي
- `PUT /api/auth/updatedetails` - تحديث بيانات المستخدم
- `PUT /api/auth/updatepassword` - تحديث كلمة المرور

### المنتجات
- `GET /api/products` - الحصول على جميع المنتجات
- `GET /api/products/:id` - الحصول على منتج محدد
- `POST /api/products` - إضافة منتج جديد
- `PUT /api/products/:id` - تحديث منتج
- `DELETE /api/products/:id` - حذف منتج
- `GET /api/products/low-stock` - المنتجات منخفضة المخزون
- `PUT /api/products/:id/stock` - تحديث المخزون

### العملاء
- `GET /api/customers` - الحصول على جميع العملاء
- `GET /api/customers/:id` - الحصول على عميل محدد
- `POST /api/customers` - إضافة عميل جديد
- `PUT /api/customers/:id` - تحديث عميل
- `DELETE /api/customers/:id` - حذف عميل
- `PUT /api/customers/:id/balance` - تحديث الرصيد
- `GET /api/customers/stats/overview` - إحصائيات العملاء

### المبيعات
- `GET /api/sales` - الحصول على جميع المبيعات
- `GET /api/sales/:id` - الحصول على فاتورة محددة
- `POST /api/sales` - إنشاء فاتورة جديدة
- `PUT /api/sales/:id` - تحديث فاتورة
- `PUT /api/sales/:id/payment` - تحديث حالة الدفع
- `DELETE /api/sales/:id` - حذف فاتورة
- `GET /api/sales/stats/overview` - إحصائيات المبيعات

### لوحة التحكم
- `GET /api/dashboard/stats` - إحصائيات عامة
- `GET /api/dashboard/recent-sales` - آخر المبيعات
- `GET /api/dashboard/top-products` - أفضل المنتجات
- `GET /api/dashboard/top-customers` - أفضل العملاء
- `GET /api/dashboard/sales-chart` - بيانات الرسم البياني
- `GET /api/dashboard/category-sales` - المبيعات حسب الفئة

## الدعم والمساعدة

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

**نظام إدارة الأعمال الذكي - سوفتك** © 2024
