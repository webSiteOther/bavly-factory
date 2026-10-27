# 👶 Bavly Kids - نظام إدارة المحل والمصنع ونقطة البيع (POS & Inventory Management)

نظام متكامل وخفيف الوزن لإدارة محلات ومصانع ملابس الأطفال، يجمع بين واجهة مستخدم سريعة وعصرية باللغة العربية، والربط السحابي المباشر مع **Google Sheets** و **Google Drive** عبر **Google Apps Script**، مع دعم العمل دون اتصال بالإنترنت عبر التخزين المحلي (Offline-First / LocalStorage).

---

## 🌟 المميزات الرئيسية (Key Features)

1. **📊 الشاشة الرئيسية ولوحة التحكم (Dashboard):**
   - حساب فوري وتلقائي لإجمالي ديون ومستحقات الموردين (**أنا عليا كام تلقائياً**).
   - إحصائيات المبيعات والأرباح وعدد الفواتير المسجلة.
   - إجمالي كميات وقيمة المخزون برأس المال وسعر الجملة وسعر البيع.
   - تنبيهات فورية للنواقص بالمخزن (الموديلات الأقل من 5 قطع).
   - تنبيهات بمواعيد استحقاق الشيكات البنكية القادمة.
   - مؤشر اتصال حي بالنظام السحابي (Google Sheets).

2. **🧾 الفاتورة ونقطة البيع (POS & Sales):**
   - تسجيل فواتير البيع بسرعة مع الإكمال التلقائي من المخزن.
   - خصم الكميات المباعة من رصيد المخزن تلقائياً فور حفظ الفاتورة.
   - إمكانية تعديل السعر أو تطبيق خصومات بحرية.
   - حساب فوري للصافي والمتبقي كمديونية على العميل.
   - **طباعة إيصالات حرارية متوافقة مع طابعات الكاشير 80mm**.
   - إمكانية تعديل الفواتير السابقة، تسديد المتبقي، إعادة الطباعة، أو حذفها (مع إرجاع الكميات للمخزن تلقائياً).

3. **📦 المخزن والموديلات (Inventory):**
   - تسجيل الموديلات بأكواد فريدة، الأسماء، الألوان، المقاسات، والكميات.
   - احتساب سعر البيع المقترح تلقائياً (+25% هامش ربح).
   - بحث وفلترة فورية للموديلات.
   - إمكانية الإضافة، التعديل الكامل، والحذف (Full CRUD) مع مزامنة جوجل شيت.

4. **🚚 فواتير وبيانات الموردين (Suppliers & Invoices):**
   - تسجيل فواتير الشراء المبسطة وتحديث حساب المورد تلقائياً.
   - إمكانية رفع وتصوير الفاتورة الورقية وحفظها في Google Drive.
   - إمكانية سداد فواتير الموردين بطرق متعددة (كاش، انستا باي، فودافون كاش، محفظة) مع رفع إيصال التحويل.
   - إمكانية تعديل أو حذف أي فاتورة مورد.
   - دليل شامل لبيانات المصانع والموردين (الهواتف، العناوين، وإجمالي مديونية كل مورد).

5. **💳 الشيكات والتسديد وكشف الحساب (Checks & Statements):**
   - تسجيل الشيكات البنكية الصادرة مع تواريخ الاستحقاق والبنك والمستفيد.
   - رفع وتصوير الشيكات الورقية.
   - إمكانية تسديد الشيك على دفعات مع تحديث حالته تلقائياً (`لم يسدد` / `جاري التسديد` / `تم التسديد`).
   - إمكانية تعديل وحذف أي شيك بنكي.
   - **كشف حساب تفصيلي لأي مورد** يعرض كامل فواتيره ومستحقاته ومسدداته بضغطة زر.

6. **🏗️ تهيئة الجداول التلقائية في Google Apps Script:**
   - يقوم كود Google Apps Script بفحص وإنشاء الجداول الخمسة وتنسيق الهيدر العربي والـ RTL تلقائياً عند أول تشغيل.

---

## 🔗 الروابط وقاعدة البيانات (Google Sheets Connection)

- **رابط الشيت المباشر:** [عرض جدول Google Sheets](https://docs.google.com/spreadsheets/d/1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY/edit?usp=sharing)
- **معرف الشيت (Spreadsheet ID):** `1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY`
- **رابط Apps Script Web App:**  
  `https://script.google.com/macros/s/AKfycbxArh5h7516ieZOpHu4qejoWlWsunux6p7o9vasHv8c5-1mWt36PfwzbdvMBr4_EJpn/exec`

---

## 📁 هيكل ملفات المشروع (Project Structure)

```text
bavly-kids/
├── index.html                  # الشاشة الرئيسية ولوحة التحكم (Dashboard)
├── sales.html                  # الفاتورة ونقطة البيع وطباعة الإيصالات (POS)
├── inventory.html              # المخزن والموديلات والتسعير (Inventory)
├── suppliers.html              # فواتير وبيانات الموردين (Suppliers)
├── checks.html                 # الشيكات والتسديد وكشف حساب الموردين (Checks)
├── app.js                      # محرك البيانات المشترك والمزامنة السحابية
├── tailwind.min.js             # مكتبة التصميم والتنسيق المستقلة (Offline)
├── cairo-font.css              # ملف استدعاء الخط العربي
├── fonts/                      # خطوط Cairo المضمنة محلياً بالكامل
│   ├── cairo.css
│   ├── cairo-400.ttf
│   ├── cairo-600.ttf
│   ├── cairo-700.ttf
│   └── cairo-800.ttf
├── apps-script/                # كود Google Apps Script للباك إند
│   └── Code.gs
├── js/
│   ├── app.js
│   └── config.example.js
├── tests/                      # الاختبارات الآلية وفحص الروابط
│   ├── app_crud.test.js        # اختبارات الوحدة لعمليات CRUD (Node.js)
│   └── check_links.ps1         # فحص سلامة جميع الروابط والملفات الداخلية
├── docs/                       # التوثيق الشامل
│   ├── SETUP.md                # دليل التشغيل المحلي
│   ├── GOOGLE_SHEETS_SETUP.md  # دليل إعداد ونشر Google Apps Script
│   └── DEPLOYMENT.md           # دليل النشر على GitHub Pages
├── test.ps1                    # سكريبت اختبار الاتصال الحي بالسحابة
├── .gitignore                  # استثناء الملفات المؤقتة من Git
├── .nojekyll                   # تجاوز معالجة Jekyll على GitHub Pages
└── README.md                   # التوثيق الرئيسي للمشروع
```

---

## 🚀 التشغيل السريع (Quick Start)

### 1. التشغيل المباشر
افتح ملف `index.html` في أي متصفح ويب. سيتصل النظام مباشرة بالسحابة وسيجلب بياناتك الحقيقية.

### 2. التعديل في إعدادات الرابط
يمكنك في أي وقت الضغط على زر **⚙️ إعدادات رابط جوجل شيت** في القائمة الجانبية لتعديل الرابط، أو الضغط على **🏗️ فحص وتهيئة الجداول** لإنشاء أي ورقة ناقصة فوراً.

---

## 🧪 الاختبار والتحقق (Testing & Verification)

تم فحص التطبيق واختباره بنجاح:
1. **اختبار عمليات CRUD والبيانات:**
   ```bash
   node tests/app_crud.test.js
   # ✅ All 9 unit tests passed successfully!
   ```
2. **فحص الروابط والمسارات:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\tests\check_links.ps1
   # ✅ ALL internal links, stylesheets, and scripts exist! No broken links found.
   ```
3. **فحص الاتصال الحي بـ Google Sheets:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\test.ps1
   # ✅ GET Success! Fetched 22 live inventory models, 4 sales invoices, 8 supplier invoices.
   ```

---

## 🌐 النشر على GitHub Pages

1. ارفع المشروع إلى مستودعك على GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Bavly Kids v2.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. من إعدادات المستودع (Settings -> Pages)، اختر فرع `main` واضغط **Save**.
3. موقعك سيعمل مباشرة برابط آمن `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

---

## 🔒 الأمان والخصوصية (Security Notes)
- لا يحتوي المستودع على أي مفاتيح سرية، كلمات مرور، أو Service Account Keys خاصة.
- يتم الاتصال بقاعدة البيانات عبر Google Apps Script Web App من خلال دوال آمنة ومحددة.
- العمليات تتم بحماية التزامن (Concurrency Locking) لمنع تداخل عمليات الكتابة المتزامنة.
