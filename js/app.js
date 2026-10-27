/**
 * ==============================================================================
 * Bavly Kids - محرك البيانات والربط السحابي المشترك (Data Engine & Cloud Sync)
 * متصل مباشرة بـ Google Sheets عبر Google Apps Script Web App
 * ==============================================================================
 */

const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxArh5h7516ieZOpHu4qejoWlWsunux6p7o9vasHv8c5-1mWt36PfwzbdvMBr4_EJpn/exec";
const DEFAULT_SPREADSHEET_ID = "1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY";
const DEFAULT_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY/edit?usp=sharing";

// استرجاع وتخزين رابط الاسكريبت
function getScriptUrl() {
    return localStorage.getItem("bavly_script_url") || DEFAULT_SCRIPT_URL;
}

function setScriptUrl(url) {
    if (url && url.trim()) {
        localStorage.setItem("bavly_script_url", url.trim());
    }
}

// مزامنة الرابط الجديد مع التخزين المحلي فوراً
if (localStorage.getItem("bavly_script_url") !== DEFAULT_SCRIPT_URL) {
    localStorage.setItem("bavly_script_url", DEFAULT_SCRIPT_URL);
}

// مفاتيح التخزين المحلي (LocalStorage) للتخزين المؤقت والسرعة
const STORAGE_KEYS = {
    INVENTORY: "bavly_inventory",
    SALES: "bavly_sales",
    SUPPLIERS: "bavly_supplier_invoices",
    PROFILES: "bavly_supplier_profiles",
    CHECKS: "bavly_checks"
};

// تهيئة البيانات الأولية الافتراضية كنسخة احتياطية سريعة قبل أول جلب
function initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
        const defaultInv = [
            { code: "501", name: "كناريا جاكت ام اي جلد", colors: "متنوع", size: "حر", qty: 3, costPrice: 600, sellPrice: 750 },
            { code: "500", name: "كناريا جاكت ام اي جلد", colors: "متنوع", size: "حر", qty: 6, costPrice: 600, sellPrice: 750 },
            { code: "2502", name: "بنانا جاكت اطفالي", colors: "متنوع", size: "حر", qty: 10, costPrice: 480, sellPrice: 600 }
        ];
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(defaultInv));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
        const defaultProfiles = [
            { id: "SUP-796", name: "خلبوطه", phone: "-", address: "-", notes: "مورد ملابس أطفال" }
        ];
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(defaultProfiles));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
        const defaultSup = [
            { invoiceNo: "804242", supplierName: "خلبوطه", date: "2026-10-01", qty: 120, total: 58292, paid: 99, remaining: 58193, imageUrl: "" },
            { invoiceNo: "5244", supplierName: "خلبوطه", date: "2026-10-01", qty: 156, total: 88628, paid: 0, remaining: 88628, imageUrl: "" }
        ];
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(defaultSup));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CHECKS)) {
        localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
        const defaultSales = [
            {
                invoiceNo: "INV-1004",
                date: "2026-10-01",
                customerName: "عميل نقدي",
                customerPhone: "-",
                items: [
                    { code: "40121861", name: "ترنج محير", qty: 2, price: 850, discount: 0, total: 1700 },
                    { code: "40121855", name: "محير اطفالي ترنج", qty: 1, price: 800, discount: 0, total: 800 }
                ],
                subtotal: 2500,
                discountTotal: 0,
                netTotal: 2500,
                paid: 2500,
                remaining: 0
            }
        ];
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(defaultSales));
    }
}

initDefaultData();

// ==============================================================================
// 1. إدارة المخزن والموديلات (Inventory DB)
// ==============================================================================
const InventoryDB = {
    getAll: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || "[]");
        } catch (e) {
            return [];
        }
    },
    save: (item, oldCode) => {
        let items = InventoryDB.getAll();
        const code = String(item.code || "").trim();
        const targetOld = oldCode ? String(oldCode).trim() : code;

        const index = items.findIndex(i => String(i.code).trim() === targetOld || String(i.code).trim() === code);
        if (index > -1) {
            items[index] = item;
        } else {
            items.push(item);
        }
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
        syncWithCloud("save_inventory_item", { ...item, oldCode: targetOld });
    },
    delete: (code) => {
        const searchCode = String(code || "").trim();
        let items = InventoryDB.getAll().filter(i => String(i.code).trim() !== searchCode);
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
        syncWithCloud("delete_inventory_item", { code: searchCode });
    },
    deductStock: (soldItems) => {
        if (!soldItems || !soldItems.length) return;
        let items = InventoryDB.getAll();
        soldItems.forEach(sold => {
            const soldCode = String(sold.code || "").trim();
            const index = items.findIndex(i => String(i.code).trim() === soldCode);
            if (index > -1) {
                const current = Number(items[index].qty) || 0;
                const deduct = Number(sold.qty) || 0;
                items[index].qty = Math.max(0, current - deduct);
            }
        });
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    },
    restoreStock: (soldItems) => {
        if (!soldItems || !soldItems.length) return;
        let items = InventoryDB.getAll();
        soldItems.forEach(sold => {
            const soldCode = String(sold.code || "").trim();
            const index = items.findIndex(i => String(i.code).trim() === soldCode);
            if (index > -1) {
                const current = Number(items[index].qty) || 0;
                const restore = Number(sold.qty) || 0;
                items[index].qty = current + restore;
            }
        });
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    }
};

// ==============================================================================
// 2. إدارة فواتير المبيعات (Sales DB)
// ==============================================================================
const SalesDB = {
    getAll: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || "[]");
        } catch (e) {
            return [];
        }
    },
    save: (invoice) => {
        let list = SalesDB.getAll();
        const invoiceNo = String(invoice.invoiceNo || "").trim();
        const index = list.findIndex(i => String(i.invoiceNo).trim() === invoiceNo);
        if (index > -1) {
            list[index] = invoice;
        } else {
            list.push(invoice);
        }
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(list));
        // خصم المخزون محلياً
        InventoryDB.deductStock(invoice.items);
        syncWithCloud("save_invoice", invoice);
    },
    update: (invoice) => {
        let list = SalesDB.getAll();
        const invoiceNo = String(invoice.invoiceNo || "").trim();
        const index = list.findIndex(i => String(i.invoiceNo).trim() === invoiceNo);

        if (index > -1) {
            // إرجاع الكميات القديمة أولاً
            if (list[index].items) {
                InventoryDB.restoreStock(list[index].items);
            }
            list[index] = invoice;
        } else {
            list.push(invoice);
        }

        // خصم الكميات المعدلة
        InventoryDB.deductStock(invoice.items);
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(list));
        syncWithCloud("save_invoice", invoice);
    },
    delete: (invoiceNo) => {
        const searchInvNo = String(invoiceNo || "").trim();
        let list = SalesDB.getAll();
        const inv = list.find(i => String(i.invoiceNo).trim() === searchInvNo);

        // إرجاع الكميات للمخزن عند حذف الفاتورة
        if (inv && inv.items) {
            InventoryDB.restoreStock(inv.items);
        }

        list = list.filter(i => String(i.invoiceNo).trim() !== searchInvNo);
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(list));
        syncWithCloud("delete_invoice", { invoiceNo: searchInvNo });
    },
    pay: (invoiceNo, amount, method = "كاش") => {
        const searchInvNo = String(invoiceNo || "").trim();
        let list = SalesDB.getAll();
        const inv = list.find(i => String(i.invoiceNo).trim() === searchInvNo);
        if (inv) {
            const currentPaid = Number(inv.paid) || 0;
            const netTotal = Number(inv.netTotal) || 0;
            inv.paid = currentPaid + Number(amount);
            inv.remaining = Math.max(0, netTotal - inv.paid);
            inv.lastPaymentMethod = method;
            localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(list));
            syncWithCloud("save_invoice", inv);
        }
    },
    getNextInvoiceNo: () => {
        const list = SalesDB.getAll();
        let maxNum = 1000;
        list.forEach(i => {
            const num = parseInt(String(i.invoiceNo).replace(/\D/g, ''));
            if (!isNaN(num) && num > maxNum) maxNum = num;
        });
        return "INV-" + (maxNum + 1);
    }
};

// ==============================================================================
// 3. إدارة فواتير ومشتريات الموردين (Supplier Invoices DB)
// ==============================================================================
const SupplierDB = {
    getAll: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || "[]");
        } catch (e) {
            return [];
        }
    },
    save: (invoice) => {
        let list = SupplierDB.getAll();
        const invoiceNo = String(invoice.invoiceNo || "").trim();
        const index = list.findIndex(i => String(i.invoiceNo).trim() === invoiceNo);
        if (index > -1) {
            list[index] = invoice;
        } else {
            list.push(invoice);
        }
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
        syncWithCloud("save_supplier_invoice", invoice);
    },
    delete: (invoiceNo) => {
        const searchInvNo = String(invoiceNo || "").trim();
        let list = SupplierDB.getAll().filter(i => String(i.invoiceNo).trim() !== searchInvNo);
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
        syncWithCloud("delete_supplier_invoice", { invoiceNo: searchInvNo });
    },
    pay: (invoiceNo, amount) => {
        const searchInvNo = String(invoiceNo || "").trim();
        let list = SupplierDB.getAll();
        const inv = list.find(i => String(i.invoiceNo).trim() === searchInvNo);
        if (inv) {
            const currentPaid = Number(inv.paid) || 0;
            const total = Number(inv.total) || 0;
            inv.paid = currentPaid + Number(amount);
            inv.remaining = Math.max(0, total - inv.paid);
            localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
            syncWithCloud("pay_supplier_invoice", { invoiceNo: searchInvNo, amountPaid: amount });
        }
    },
    getTotalDebt: () => {
        const list = SupplierDB.getAll();
        return list.reduce((sum, inv) => sum + (Number(inv.remaining) || 0), 0);
    }
};

// ==============================================================================
// 4. إدارة دليل بيانات الموردين (Supplier Profiles DB)
// ==============================================================================
const SupplierProfilesDB = {
    getAll: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || "[]");
        } catch (e) {
            return [];
        }
    },
    save: (profile) => {
        let list = SupplierProfilesDB.getAll();
        const name = String(profile.name || "").trim();
        const id = profile.id ? String(profile.id).trim() : "";

        const index = list.findIndex(p => 
            String(p.name).trim() === name || (id && String(p.id).trim() === id)
        );

        if (index > -1) {
            list[index] = profile;
        } else {
            list.push(profile);
        }
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(list));
        syncWithCloud("save_supplier_profile", profile);
    },
    delete: (nameOrId) => {
        const searchKey = String(nameOrId || "").trim();
        let list = SupplierProfilesDB.getAll().filter(p => 
            String(p.name).trim() !== searchKey && String(p.id).trim() !== searchKey
        );
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(list));
        syncWithCloud("delete_supplier_profile", { name: searchKey, id: searchKey });
    }
};

// ==============================================================================
// 5. إدارة الشيكات البنكية (Checks DB)
// ==============================================================================
const CheckDB = {
    getAll: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKS) || "[]");
        } catch (e) {
            return [];
        }
    },
    save: (chk) => {
        let list = CheckDB.getAll();
        const checkNo = String(chk.checkNo || "").trim();
        const index = list.findIndex(c => String(c.checkNo).trim() === checkNo);
        if (index > -1) {
            list[index] = chk;
        } else {
            list.push(chk);
        }
        localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(list));
        syncWithCloud("save_check", chk);
    },
    delete: (checkNo) => {
        const searchCheckNo = String(checkNo || "").trim();
        let list = CheckDB.getAll().filter(c => String(c.checkNo).trim() !== searchCheckNo);
        localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(list));
        syncWithCloud("delete_check", { checkNo: searchCheckNo });
    },
    pay: (checkNo, amount) => {
        const searchCheckNo = String(checkNo || "").trim();
        let list = CheckDB.getAll();
        const chk = list.find(c => String(c.checkNo).trim() === searchCheckNo);
        if (chk) {
            const currentPaid = Number(chk.paid) || 0;
            const total = Number(chk.total) || 0;
            chk.paid = currentPaid + Number(amount);
            chk.remaining = Math.max(0, total - chk.paid);
            chk.status = chk.remaining === 0 ? "تم التسديد" : "جاري التسديد";
            localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(list));
            syncWithCloud("pay_check", { checkNo: searchCheckNo, amountPaid: amount });
        }
    }
};

// ==============================================================================
// الربط والمزامنة السحابية (Cloud Sync Engine)
// ==============================================================================

/**
 * إرسال العمليات إلى Google Apps Script Web App في الخلفية
 * استخدام text/plain مع no-cors يمنع فشل CORS preflight في المتصفحات
 */
async function syncWithCloud(action, payload) {
    const url = getScriptUrl();
    if (!url) {
        console.warn("Cloud sync skipped: No script URL configured.");
        return false;
    }

    try {
        await fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                action: action,
                payload: payload
            })
        });
        console.log(`[Cloud Sync] Success sending action: ${action}`);
        updateCloudStatusBadges(true, "متصل بـ جوجل شيت (متزامن)");
        return true;
    } catch (err) {
        console.warn(`[Cloud Sync] Offline / Network issue: ${err.message}. Data saved locally.`);
        updateCloudStatusBadges(false, "غير متصل (يعمل محلياً)");
        return false;
    }
}

/**
 * جلب جميع البيانات من Google Sheets وتحديث التخزين المحلي
 */
async function fetchAllFromCloud() {
    const url = getScriptUrl();
    if (!url) return false;

    updateCloudStatusBadges(true, "جاري المزامنة مع جوجل شيت...");

    try {
        const separator = url.includes('?') ? '&' : '?';
        const res = await fetch(`${url}${separator}action=get_all`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!res.ok) {
            throw new Error(`HTTP Error ${res.status}`);
        }

        const json = await res.json();
        if (json.status === "success" && json.data) {
            // 1. المخزن والموديلات
            if (json.data.inventory && Array.isArray(json.data.inventory)) {
                const inv = json.data.inventory.map(row => ({
                    code: String(row["كود_الموديل"] ?? "").trim(),
                    name: String(row["اسم_الموديل"] ?? "").trim(),
                    colors: String(row["الألوان"] ?? "").trim() || "متنوع",
                    size: String(row["المقاس"] ?? "").trim() || "حر",
                    qty: Number(row["الكمية"]) || 0,
                    costPrice: Number(row["سعر_الجملة"]) || 0,
                    sellPrice: Number(row["سعر_البيع"]) || 0
                })).filter(i => i.code !== "");
                localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv));
            }

            // 2. فواتير المبيعات
            if (json.data.sales && Array.isArray(json.data.sales)) {
                const sales = json.data.sales.map(row => {
                    let items = [];
                    try {
                        if (typeof row["تفاصيل_الاصناف"] === "string") {
                            items = JSON.parse(row["تفاصيل_الاصناف"] || "[]");
                        } else if (Array.isArray(row["تفاصيل_الاصناف"])) {
                            items = row["تفاصيل_الاصناف"];
                        }
                    } catch (e) {
                        items = [];
                    }

                    let dateStr = String(row["التاريخ"] || "");
                    if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];

                    return {
                        invoiceNo: String(row["رقم_الفاتورة"] ?? "").trim(),
                        date: dateStr,
                        customerName: String(row["اسم_العميل"] ?? "عميل نقدي").trim(),
                        customerPhone: String(row["رقم_الهاتف"] ?? "-").trim(),
                        items: items,
                        subtotal: Number(row["الاجمالي"]) || 0,
                        discountTotal: Number(row["الخصم"]) || 0,
                        netTotal: Number(row["الصافي"]) || 0,
                        paid: Number(row["المدفوع"]) || 0,
                        remaining: Number(row["المتبقي"]) || 0
                    };
                }).filter(s => s.invoiceNo !== "");
                localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
            }

            // 3. فواتير الموردين
            if (json.data.supplier_invoices && Array.isArray(json.data.supplier_invoices)) {
                const sups = json.data.supplier_invoices.map(row => {
                    let dateStr = String(row["التاريخ"] || "");
                    if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];

                    return {
                        invoiceNo: String(row["رقم_الفاتورة"] ?? "").trim(),
                        supplierName: String(row["اسم_المورد"] ?? "").trim(),
                        date: dateStr,
                        qty: Number(row["الكمية"]) || 0,
                        total: Number(row["اجمالي_الشراء"] ?? row["الاجمالي"]) || 0,
                        paid: Number(row["المدفوع"]) || 0,
                        remaining: Number(row["المتبقي"]) || 0,
                        imageUrl: String(row["رابط_صورة_الفاتورة"] ?? "").trim()
                    };
                }).filter(s => s.invoiceNo !== "");
                localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(sups));
            }

            // 4. دليل الموردين
            if (json.data.supplier_profiles && Array.isArray(json.data.supplier_profiles)) {
                const profiles = json.data.supplier_profiles.map(row => ({
                    id: String(row["كود_المورد"] ?? "").trim(),
                    name: String(row["اسم_المورد"] ?? "").trim(),
                    phone: String(row["رقم_التليفون"] ?? "-").trim(),
                    address: String(row["العنوان"] ?? "-").trim(),
                    notes: String(row["ملاحظات"] ?? "-").trim()
                })).filter(p => p.name !== "");
                localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
            }

            // 5. الشيكات
            if (json.data.checks && Array.isArray(json.data.checks)) {
                const chks = json.data.checks.map(row => {
                    let issueDate = String(row["تاريخ_الاصدار"] || "");
                    if (issueDate.includes("T")) issueDate = issueDate.split("T")[0];
                    let dueDate = String(row["تاريخ_الاستحقاق"] || "");
                    if (dueDate.includes("T")) dueDate = dueDate.split("T")[0];

                    return {
                        checkNo: String(row["رقم_الشيك"] ?? "").trim(),
                        bank: String(row["البنك"] ?? "").trim(),
                        supplierName: String(row["المستفيد"] ?? "").trim(),
                        issueDate: issueDate,
                        dueDate: dueDate,
                        total: Number(row["القيمة"]) || 0,
                        paid: Number(row["المدفوع"]) || 0,
                        remaining: Number(row["المتبقي"]) || 0,
                        status: String(row["الحالة"] ?? "لم يسدد").trim(),
                        imageUrl: String(row["رابط_صورة_الشيك"] ?? "").trim()
                    };
                }).filter(c => c.checkNo !== "");
                localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(chks));
            }

            // إشعار الواجهات بأن البيانات تم تحديثها
            window.dispatchEvent(new CustomEvent("bavly-data-synced", { detail: json.data }));
            updateCloudStatusBadges(true, "🟢 متصل بـ جوجل شيت");
            return true;
        }
    } catch (err) {
        console.warn("[Cloud Fetch Notice] Direct fetch failed, continuing with local data:", err);
        updateCloudStatusBadges(false, "🟡 وضع عدم الاتصال (بيانات محفوظة محلياً)");
    }
    return false;
}

/**
 * أمر إنشاء وفحص جداول Google Sheets تلقائياً
 */
async function setupCloudDatabase() {
    const url = getScriptUrl();
    if (!url) return;
    showToast("جاري فحص وتهيئة الجداول في Google Sheets...", "info");
    try {
        const separator = url.includes('?') ? '&' : '?';
        const res = await fetch(`${url}${separator}action=setup_database`);
        const json = await res.json();
        if (json.status === "success") {
            showToast("✅ تم تهيئة وفحص جداول Google Sheets بنجاح!");
            await fetchAllFromCloud();
            return true;
        } else {
            showToast("⚠️ حدث تنبيه أثناء التهيئة: " + (json.message || "خطأ غير معروف"), "error");
        }
    } catch (err) {
        // محاولة بديلة عبر POST
        await syncWithCloud("setup_database", {});
        showToast("تم إرسال أمر تهيئة الجداول لجوجل شيت بنجاح!");
    }
    return false;
}

// ==============================================================================
// أدوات الواجهة والتنبيهات وإدارة الإعدادات
// ==============================================================================

/**
 * عرض إشعار عائم Toast
 */
function showToast(msg, type = "success") {
    let toast = document.getElementById("bavly-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "bavly-toast";
        document.body.appendChild(toast);
    }

    const bgClass = type === "error" 
        ? "bg-rose-600" 
        : (type === "info" ? "bg-blue-600" : "bg-emerald-600");

    toast.className = `fixed bottom-5 left-5 z-[9999] text-white px-5 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${bgClass}`;
    
    let icon = "✅";
    if (type === "error") icon = "⚠️";
    if (type === "info") icon = "ℹ️";

    toast.innerHTML = `<span class="text-xl">${icon}</span> <span>${msg}</span>`;

    if (window.bavlyToastTimer) clearTimeout(window.bavlyToastTimer);
    window.bavlyToastTimer = setTimeout(() => {
        toast.className = toast.className.replace("opacity-100", "opacity-0 translate-y-4");
    }, 4000);
}

/**
 * تحديث شارة حالة الربط السحابي في الهيدر
 */
function updateCloudStatusBadges(isOnline, text) {
    document.querySelectorAll(".cloud-sync-badge").forEach(badge => {
        if (isOnline) {
            badge.className = "cloud-sync-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ${text}`;
        } else {
            badge.className = "cloud-sync-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300";
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> ${text}`;
        }
    });
}

/**
 * نافذة الإعدادات الشاملة (رابط الشيت، فحص الجداول، تحديث الرابط)
 */
function openSettingsModal() {
    let modal = document.getElementById("bavlySettingsModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "bavlySettingsModal";
        modal.className = "fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]";
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5 text-right border border-slate-200">
                <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>⚙️</span> إعدادات الربط مع Google Sheets
                    </h3>
                    <button onclick="closeSettingsModal()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                </div>

                <div class="space-y-4 text-xs text-slate-600">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">رابط Google Apps Script Web App:</label>
                        <input type="text" id="settingScriptUrl" class="w-full border-2 border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:border-pink-500 outline-none dir-ltr">
                        <p class="text-[11px] text-slate-400 mt-1">هذا الرابط يربط الموقع بقاعدة بيانات جوجل شيت مباشرة.</p>
                    </div>

                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div class="font-bold text-slate-700">جدول البيانات المرتبط (Spreadsheet):</div>
                        <a href="${DEFAULT_SPREADSHEET_URL}" target="_blank" class="text-pink-600 hover:underline block truncate font-mono text-[11px]">
                            🔗 ${DEFAULT_SPREADSHEET_URL}
                        </a>
                        <div class="text-[11px] text-slate-500">معرف الشيت: <span class="font-mono font-bold">${DEFAULT_SPREADSHEET_ID}</span></div>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-slate-100">
                        <button onclick="triggerSetupDbFromModal()" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2">
                            <span>🏗️</span> إنشاء / فحص جداول Google Sheets تلقائياً
                        </button>
                        <button onclick="triggerManualSyncFromModal()" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2">
                            <span>🔄</span> تحديث ومزامنة البيانات الآن من الشيت
                        </button>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button onclick="closeSettingsModal()" class="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition">إلغاء</button>
                    <button onclick="saveSettingsModal()" class="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition">حفظ الرابط</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const input = document.getElementById("settingScriptUrl");
    if (input) input.value = getScriptUrl();
    modal.classList.remove("hidden");
}

function closeSettingsModal() {
    const modal = document.getElementById("bavlySettingsModal");
    if (modal) modal.classList.add("hidden");
}

function saveSettingsModal() {
    const input = document.getElementById("settingScriptUrl");
    if (input && input.value.trim()) {
        setScriptUrl(input.value.trim());
        showToast("تم حفظ رابط Google Apps Script بنجاح!");
        closeSettingsModal();
        setTimeout(() => location.reload(), 800);
    }
}

async function triggerSetupDbFromModal() {
    closeSettingsModal();
    await setupCloudDatabase();
}

async function triggerManualSyncFromModal() {
    closeSettingsModal();
    showToast("جاري التحديث من جوجل شيت...");
    const ok = await fetchAllFromCloud();
    if (ok) {
        showToast("تم تحديث كافة البيانات بنجاح من Google Sheets!");
        setTimeout(() => location.reload(), 600);
    } else {
        showToast("تعذر التحديث المباشر، تم الإبقاء على البيانات المحلية.", "error");
    }
}

function promptChangeScriptUrl() {
    openSettingsModal();
}

// المزامنة التلقائية عند فتح الصفحة
document.addEventListener("DOMContentLoaded", () => {
    fetchAllFromCloud();
});
