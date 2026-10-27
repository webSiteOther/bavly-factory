# دليل النشر على GitHub و GitHub Pages (GitHub Deployment Guide)

## 1. رفع المشروع إلى مستودع GitHub (Push to GitHub)

### خطوات إنشاء ورفع المستودع:
1. افتح حسابك على [GitHub.com](https://github.com) وأنشئ مستودعاً جديداً باسم (مثلاً: `bavly-kids-pos`).
2. في مجلد المشروع، افتح سطر الأوامر (Terminal / Git Bash) ونفّذ الأوامر التالية:

```bash
# تهيئة المستودع المحلي
git init

# إضافة جميع الملفات
git add .

# تسجيل الـ Commit الأول
git commit -m "feat: complete Bavly Kids v2.0 with Google Sheets integration and full CRUD"

# تعيين الفرع الرئيسي
git branch -M main

# ربط المستودع البعيد (استبدل الرابط برابط مستودعك)
git remote add origin https://github.com/YOUR_USERNAME/bavly-kids-pos.git

# رفع الكود
git push -u origin main
```

---

## 2. تفعيل الاستضافة المجانية عبر GitHub Pages

1. افتح صفحة المستودع على GitHub.
2. اذهب إلى علامة التبويب **Settings** (الإعدادات).
3. من القائمة الجانبية اليسرى اختر **Pages**.
4. تحت عنوان **Build and deployment**:
   - **Source:** اختر `Deploy from a branch`.
   - **Branch:** اختر `main` والمجلد `/ (root)`.
   - اضغط على **Save** (حفظ).
5. خلال دقيقة واحدة، سيظهر لك الرابط الحي لموقعك، مثل:
   `https://YOUR_USERNAME.github.io/bavly-kids-pos/`
6. الموقع جاهز 100% ويعمل بكامل إمكانياته على الكمبيوتر والموبايل وأجهزة التابلت!

---

## 3. ملاحظات هامة حول التوافقية والأمان

1. **ملف `.nojekyll`:** تم تضمينه في المجلد الرئيسي لضمان أن خوادم GitHub Pages تخدم جميع الخطوط والملفات والمسارات بشكل مباشر دون تجاهل أي ملف يبدأ بشرطة سفلية.
2. **الروابط النسبية (Relative Paths):** جميع روابط الصفحات والخطوط ومكتبات الجافاسكريبت تستخدم مسارات نسبية لتعمل بسلاسة داخل أي مسار فرعي على GitHub Pages.
3. **الأمان:** لا توجد أي مفاتيح سرية أو كلمات مرور مخزنة في كود الواجهة؛ الاتصال يتم مع Google Apps Script Web App المصمم لمعالجة طلبات التطبيق بشكل آمن وفق صلاحيات محددة.
