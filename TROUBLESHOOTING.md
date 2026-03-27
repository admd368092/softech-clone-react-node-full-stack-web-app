# استكشاف الأخطاء وإصلاحها

## مشكلة: خطأ 500 عند الوصول إلى /api/sales

### السبب المحتمل:
MongoDB غير مشغل أو لا يمكن الاتصال به.

### الحل:

1. **تأكد من تشغيل MongoDB:**

   **على Windows:**
   ```bash
   # تحقق من حالة خدمة MongoDB
   net start MongoDB
   
   # إذا لم تكن تعمل، قم بتشغيلها
   net start MongoDB
   ```

   **على macOS:**
   ```bash
   # تحقق من حالة MongoDB
   brew services list | grep mongodb
   
   # تشغيل MongoDB
   brew services start mongodb-community
   ```

   **على Linux:**
   ```bash
   # تحقق من حالة MongoDB
   sudo systemctl status mongod
   
   # تشغيل MongoDB
   sudo systemctl start mongod
   ```

2. **تأكد من تثبيت MongoDB:**

   إذا لم يكن MongoDB مثبتاً، قم بتثبيته:
   
   - **Windows:** حمل من [mongodb.com](https://www.mongodb.com/try/download/community)
   - **macOS:** `brew install mongodb-community`
   - **Linux:** اتبع التعليمات في [docs.mongodb.com](https://docs.mongodb.com/manual/administration/install-on-linux/)

3. **تحقق من الاتصال:**

   ```bash
   # محاولة الاتصال بـ MongoDB
   mongosh
   ```

4. **تحقق من ملف .env:**

   تأكد من أن ملف `.env` يحتوي على:
   ```
   MONGODB_URI=mongodb://localhost:27017/softech_business_arabic
   ```

5. **إعادة تشغيل الخادم:**

   ```bash
   # أوقف الخادم (Ctrl+C) ثم أعد تشغيله
   npm run server
   ```

## مشكلة: خطأ "Cannot find module"

### الحل:
```bash
# تثبيت الاعتماديات
npm install

# تثبيت اعتميات العميل
cd client
npm install
cd ..
```

## مشكلة: المنفذ 5000 مشغول

### الحل:
```bash
 # تغيير المنفذ في ملف .env
 PORT=5001
 ```

 أو قتل العملية التي تستخدم المنفذ 5000:
 ```bash
 # على Windows
 netstat -ano | findstr :5000
 taskkill /PID <PID> /F

 # على macOS/Linux
 lsof -ti:5000 | xargs kill -9
 ```

## مشكلة: الصفحة لا تظهر

### الحل:
1. تأكد من تشغيل الخادم: `npm run server`
2. تأكد من تشغيل العميل: `npm run client`
3. أو تشغيلهما معاً: `npm run dev`
4. افتح المتصفح على: `http://localhost:3000`

## مشكلة: قاعدة البيانات فارغة

### الحل:
قم بتعبئة قاعدة البيانات بالمنتجات الصيدلانية:
```bash
npm run seed
```

## للتحقق من أن كل شيء يعمل:

1. **تشغيل الخادم:**
   ```bash
   npm run server
   ```
   يجب أن ترى: "Server running on port 5000" و "MongoDB Connected Successfully"

2. **تشغيل العميل:**
   ```bash
   npm run client
   ```
   يجب أن يفتح المتصفح تلقائياً على `http://localhost:3000`

3. **تسجيل الدخول:**
   - البريد الإلكتروني: `admin@softech.com`
   - كلمة المرور: `123456`

4. **تعبئة المنتجات:**
   ```bash
   npm run seed
   ```

إذا استمرت المشاكل، تحقق من رسائل الخطأ في وحدة التحكم (Console) في المتصفح وفي terminal الخادم.
