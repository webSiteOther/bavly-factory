# دليل التشغيل والإعداد المحلي (Local Setup Guide)

## المتطلبات الأساسية
- متصفح ويب حديث (Google Chrome, Microsoft Edge, Firefox, Safari).
- لا يلزم تثبيت أي برامج أو خوادم معقدة لتشغيل الواجهة لأنها مبنية بـ HTML5 / JavaScript / TailwindCSS المستقل، وتعمل مباشرة حتى بدون اتصال إنترنت مع ميزة التخزين المحلي (LocalStorage Cache).

---

## تشغيل المشروع محلياً

### الطريقة 1: الفتح المباشر في المتصفح (الأسهل)
1. انقر نقراً مزدوجاً على ملف `index.html`.
2. سيفتح الموقع فوراً في متصفحك وسيقوم تلقائياً بمزامنة البيانات من Google Sheets.

### الطريقة 2: استخدام خادم محلي خفيف (Recommended)
باستخدام Node.js:
```bash
npx serve .
# أو
npx http-server -p 8080
```
باستخدام Python:
```bash
python -m http.server 8000
```
ثم افتح: `http://localhost:8000`

---

## اختبار وتشغيل الفحوصات الآلية
المشروع مزود بأدوات فحص واختبار متكاملة:

1. **فحص الروابط والملفات الداخلية:**
```powershell
powershell -ExecutionPolicy Bypass -File .\tests\check_links.ps1
```

2. **تشغيل اختبارات الوحدة (Unit Tests) لعمليات CRUD:**
```bash
node tests/app_crud.test.js
```

3. **اختبار الاتصال المباشر بـ Google Sheets API:**
```powershell
powershell -ExecutionPolicy Bypass -File .\test.ps1
```
