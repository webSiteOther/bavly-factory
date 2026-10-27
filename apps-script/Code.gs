/**
 * ==============================================================================
 * Bavly Kids - Google Apps Script Backend API
 * نظام إدارة محل ومصنع Bavly Kids لملابس الأطفال
 * ==============================================================================
 * 
 * الرابط المباشر لشيت البيانات:
 * https://docs.google.com/spreadsheets/d/1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY/edit?usp=sharing
 * 
 * معرف جدول البيانات (Spreadsheet ID):
 * 1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY
 * 
 * ------------------------------------------------------------------------------
 * تعليمات النشر والتحديث (Deployment Instructions):
 * ------------------------------------------------------------------------------
 * 1. افتح جدول Google Sheets أعلاه.
 * 2. من القائمة العلوية اضغط على Extensions (التطبيقات الملحقة) -> Apps Script.
 * 3. انسخ هذا الكود بالكامل واستبدل أي كود سابق في محرر Code.gs.
 * 4. اضغط على حفظ (Save 💾).
 * 5. اضغط على Deploy (نشر) -> Manage deployments (إدارة عمليات النشر)
 *    أو New deployment (نشر جديد).
 * 6. اضبط الخيارات التالية بدقة:
 *    - Type (النوع): Web app (تطبيق ويب)
 *    - Description: Bavly Kids v2.0 - Full CRUD & Auto Database Setup
 *    - Execute as (التنفيذ باسم): Me (حسابي)
 *    - Who has access (من يملك حق الوصول): Anyone (أي مستخدم) -> ضروري جداً!
 * 7. اضغط Deploy وانسخ رابط الويب (Web App URL).
 * 8. ضعه في ملف js/app.js أو من خلال زر الإعدادات ⚙️ في واجهة البرنامج.
 * ==============================================================================
 */

// معرف جدول البيانات الافتراضي
const SPREADSHEET_ID = "1TpdO0TDmTYT1AY0QNDvUF7h5XjtGuGdqLyPvHVIZeCY";
const DRIVE_FOLDER_NAME = "Bavly_Kids_Files";

/**
 * الحصول على كائن جدول البيانات (متوافق مع كل من Container-bound والـ Standalone)
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // ليس مدمجاً في شيت، استخدم المعرف المباشر
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * دالة إنشاء وتهيئة الجداول (Sheets) تلقائياً
 * تنشئ الشيتات الخمسة بالأعمدة المعتمدة والتنسيق العربي RTL إن لم تكن موجودة
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  
  const schema = {
    "المخزن": [
      "كود_الموديل",
      "اسم_الموديل",
      "الألوان",
      "المقاس",
      "الكمية",
      "سعر_الجملة",
      "سعر_البيع",
      "تاريخ_التحديث"
    ],
    "الفواتير": [
      "رقم_الفاتورة",
      "التاريخ",
      "اسم_العميل",
      "رقم_الهاتف",
      "تفاصيل_الاصناف",
      "الاجمالي",
      "الخصم",
      "الصافي",
      "المدفوع",
      "المتبقي"
    ],
    "فواتير_الموردين": [
      "رقم_الفاتورة",
      "اسم_المورد",
      "التاريخ",
      "الكمية",
      "اجمالي_الشراء",
      "المدفوع",
      "المتبقي",
      "رابط_صورة_الفاتورة"
    ],
    "دليل_الموردين": [
      "كود_المورد",
      "اسم_المورد",
      "رقم_التليفون",
      "العنوان",
      "ملاحظات"
    ],
    "الشيكات": [
      "رقم_الشيك",
      "البنك",
      "المستفيد",
      "تاريخ_الاصدار",
      "تاريخ_الاستحقاق",
      "القيمة",
      "المدفوع",
      "المتبقي",
      "الحالة",
      "رابط_صورة_الشيك"
    ]
  };

  const createdSheets = [];
  const existingSheets = [];

  for (let sheetName in schema) {
    let sheet = ss.getSheetByName(sheetName);
    const headers = schema[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      formatSheetHeaders(sheet, headers.length);
      sheet.setRightToLeft(true);
      createdSheets.push(sheetName);
    } else {
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        formatSheetHeaders(sheet, headers.length);
        sheet.setRightToLeft(true);
        createdSheets.push(sheetName);
      } else {
        existingSheets.push(sheetName);
      }
    }
  }

  try {
    const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("ورقة 1");
    if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
      ss.deleteSheet(defaultSheet);
    }
  } catch (err) {}

  return {
    status: "success",
    message: "تم فحص وتهيئة جداول Bavly Kids بنجاح",
    created: createdSheets,
    existing: existingSheets
  };
}

/**
 * تنسيق هيدر الشيت
 */
function formatSheetHeaders(sheet, colsCount) {
  try {
    const headerRange = sheet.getRange(1, 1, 1, colsCount);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#f8fafc");
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, colsCount);
  } catch (e) {}
}

/**
 * معالج طلبات GET
 */
function doGet(e) {
  try {
    const ss = getSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "get_all";

    if (action === "setup_database") {
      const setupResult = setupDatabase();
      return createJsonResponse(setupResult);
    }

    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "Bavly Kids API is running successfully",
        timestamp: new Date().toISOString()
      });
    }

    let responseData = {};

    if (action === "get_all" || action === "get_inventory") {
      responseData.inventory = getSheetData(ss.getSheetByName("المخزن"));
    }
    if (action === "get_all" || action === "get_sales") {
      responseData.sales = getSheetData(ss.getSheetByName("الفواتير"));
    }
    if (action === "get_all" || action === "get_suppliers") {
      responseData.supplier_invoices = getSheetData(ss.getSheetByName("فواتير_الموردين"));
      responseData.supplier_profiles = getSheetData(ss.getSheetByName("دليل_الموردين"));
    }
    if (action === "get_all" || action === "get_checks") {
      responseData.checks = getSheetData(ss.getSheetByName("الشيكات"));
    }

    if (action === "get_all") {
      let totalStockQty = 0;
      let totalStockValue = 0;
      (responseData.inventory || []).forEach(item => {
        let q = Number(item["الكمية"]) || 0;
        let c = Number(item["سعر_الجملة"]) || 0;
        totalStockQty += q;
        totalStockValue += (q * c);
      });

      let totalSupplierDebt = 0;
      (responseData.supplier_invoices || []).forEach(inv => {
        let rem = Number(inv["المتبقي"]) || 0;
        totalSupplierDebt += rem;
      });

      let totalSales = 0;
      (responseData.sales || []).forEach(sale => {
        totalSales += (Number(sale["الصافي"]) || 0);
      });

      responseData.stats = {
        totalStockQty: totalStockQty,
        totalStockValue: totalStockValue,
        totalSupplierDebt: totalSupplierDebt,
        totalSales: totalSales,
        totalModels: (responseData.inventory || []).length,
        totalInvoices: (responseData.sales || []).length,
        totalChecks: (responseData.checks || []).length
      };
    }

    return createJsonResponse({ status: "success", data: responseData });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * معالج طلبات POST
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "لا توجد بيانات مرسلة في الطلب" });
    }

    let rawContents = e.postData.contents.replace(/^\uFEFF/, '').trim();
    let postData;
    try {
      postData = JSON.parse(rawContents);
    } catch (parseErr) {
      return createJsonResponse({
        status: "error",
        message: "فشل تحليل JSON: " + parseErr.message
      });
    }

    const action = postData.action;
    const payload = postData.payload || {};
    const ss = getSpreadsheet();

    if (action === "setup_database") {
      const res = setupDatabase();
      return createJsonResponse(res);
    }

    if (action === "save_inventory_item") {
      saveInventoryItem(ss, payload);
      return createJsonResponse({ status: "success", message: "تم حفظ/تعديل الموديل في المخزن بنجاح" });
    }

    if (action === "delete_inventory_item") {
      deleteInventoryItem(ss, payload.code);
      return createJsonResponse({ status: "success", message: "تم حذف الموديل من المخزن بنجاح" });
    }

    if (action === "save_invoice") {
      saveSalesInvoice(ss, payload);
      return createJsonResponse({ status: "success", message: "تم حفظ/تعديل فاتورة المبيعات وتحديث المخزن بنجاح" });
    }

    if (action === "delete_invoice") {
      deleteSalesInvoice(ss, payload.invoiceNo);
      return createJsonResponse({ status: "success", message: "تم حذف فاتورة المبيعات وإرجاع الكميات للمخزن بنجاح" });
    }

    if (action === "save_supplier_invoice") {
      saveSupplierInvoice(ss, payload);
      return createJsonResponse({ status: "success", message: "تم حفظ/تعديل فاتورة المورد بنجاح" });
    }

    if (action === "delete_supplier_invoice") {
      deleteSupplierInvoice(ss, payload.invoiceNo);
      return createJsonResponse({ status: "success", message: "تم حذف فاتورة المورد بنجاح" });
    }

    if (action === "pay_supplier_invoice") {
      updateSupplierInvoicePayment(ss, payload);
      return createJsonResponse({ status: "success", message: "تم تسجيل الدفعة للمورد بنجاح" });
    }

    if (action === "save_supplier_profile") {
      saveSupplierProfile(ss, payload);
      return createJsonResponse({ status: "success", message: "تم حفظ بيانات المورد في الدليل بنجاح" });
    }

    if (action === "delete_supplier_profile") {
      deleteSupplierProfile(ss, payload.name || payload.id);
      return createJsonResponse({ status: "success", message: "تم حذف المورد من الدليل بنجاح" });
    }

    if (action === "save_check") {
      saveCheck(ss, payload);
      return createJsonResponse({ status: "success", message: "تم حفظ/تعديل الشيك البنكي بنجاح" });
    }

    if (action === "delete_check") {
      deleteCheck(ss, payload.checkNo);
      return createJsonResponse({ status: "success", message: "تم حذف الشيك البنكي بنجاح" });
    }

    if (action === "pay_check") {
      updateCheckPayment(ss, payload);
      return createJsonResponse({ status: "success", message: "تم تسجيل تسديد الشيك بنجاح" });
    }

    return createJsonResponse({ status: "error", message: "أمر غير معروف: " + action });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    let hasVal = false;
    let rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = rows[i][j];
      if (val !== "" && val !== null && val !== undefined) hasVal = true;
      rowObj[headers[j]] = val;
    }
    if (hasVal) {
      data.push(rowObj);
    }
  }
  return data;
}

function saveInventoryItem(ss, item) {
  let sheet = ss.getSheetByName("المخزن");
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName("المخزن");
  }

  const data = sheet.getDataRange().getValues();
  const code = String(item.code || "").trim();
  const oldCode = item.oldCode ? String(item.oldCode).trim() : code;

  const rowData = [
    code,
    item.name || "",
    item.colors || "",
    item.size || "",
    Number(item.qty) || 0,
    Number(item.costPrice) || 0,
    Number(item.sellPrice) || 0,
    Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd HH:mm")
  ];

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    let rowCode = String(data[i][0]).trim();
    if (rowCode === code || (oldCode && rowCode === oldCode)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteInventoryItem(ss, code) {
  const sheet = ss.getSheetByName("المخزن");
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const searchCode = String(code || "").trim();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === searchCode) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function saveSalesInvoice(ss, invoice) {
  let sheet = ss.getSheetByName("الفواتير");
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName("الفواتير");
  }

  const invSheet = ss.getSheetByName("المخزن");
  const invoiceNo = String(invoice.invoiceNo || "").trim();
  const data = sheet.getDataRange().getValues();

  const itemsArray = Array.isArray(invoice.items) ? invoice.items : [];
  const itemsJson = typeof invoice.items === "string" ? invoice.items : JSON.stringify(itemsArray);

  const rowData = [
    invoiceNo,
    invoice.date || Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd"),
    invoice.customerName || "عميل نقدي",
    invoice.customerPhone || "-",
    itemsJson,
    Number(invoice.subtotal) || 0,
    Number(invoice.discountTotal) || 0,
    Number(invoice.netTotal) || 0,
    Number(invoice.paid) || 0,
    Number(invoice.remaining) || 0
  ];

  let existingRow = -1;
  let oldItems = [];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === invoiceNo) {
      existingRow = i + 1;
      try {
        oldItems = JSON.parse(data[i][4] || "[]");
      } catch (e) {
        oldItems = [];
      }
      break;
    }
  }

  if (existingRow > 0 && oldItems.length > 0 && invSheet) {
    adjustInventoryStock(invSheet, oldItems, "restore");
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  if (itemsArray.length > 0 && invSheet) {
    adjustInventoryStock(invSheet, itemsArray, "deduct");
  }
}

function deleteSalesInvoice(ss, invoiceNo) {
  const sheet = ss.getSheetByName("الفواتير");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const searchInvNo = String(invoiceNo || "").trim();
  const invSheet = ss.getSheetByName("المخزن");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === searchInvNo) {
      try {
        const soldItems = JSON.parse(data[i][4] || "[]");
        if (soldItems.length > 0 && invSheet) {
          adjustInventoryStock(invSheet, soldItems, "restore");
        }
      } catch (e) {}

      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function adjustInventoryStock(invSheet, items, mode) {
  if (!invSheet || !items || !items.length) return;
  const invData = invSheet.getDataRange().getValues();

  items.forEach(item => {
    let itemCode = String(item.code || "").trim();
    let qty = Number(item.qty) || 0;
    if (!itemCode || qty <= 0) return;

    for (let i = 1; i < invData.length; i++) {
      if (String(invData[i][0]).trim() === itemCode) {
        let currentQty = Number(invData[i][4]) || 0;
        let newQty = mode === "restore" ? (currentQty + qty) : Math.max(0, currentQty - qty);
        invSheet.getRange(i + 1, 5).setValue(newQty);
        invData[i][4] = newQty;
        break;
      }
    }
  });
}

function saveSupplierInvoice(ss, invoice) {
  let sheet = ss.getSheetByName("فواتير_الموردين");
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName("فواتير_الموردين");
  }

  const invoiceNo = String(invoice.invoiceNo || "").trim();
  let imageUrl = invoice.imageUrl || "";

  if (invoice.imageBase64 && invoice.imageBase64.indexOf("base64,") > -1) {
    imageUrl = saveBase64Image(invoice.imageBase64, "INV_" + invoiceNo + "_" + (invoice.supplierName || "مورد"));
  }

  const data = sheet.getDataRange().getValues();
  let existingRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === invoiceNo) {
      existingRow = i + 1;
      if (!imageUrl && data[i][7]) {
        imageUrl = data[i][7];
      }
      break;
    }
  }

  const rowData = [
    invoiceNo,
    invoice.supplierName || "",
    invoice.date || Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd"),
    Number(invoice.qty) || 0,
    Number(invoice.total) || 0,
    Number(invoice.paid) || 0,
    Number(invoice.remaining) || 0,
    imageUrl
  ];

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteSupplierInvoice(ss, invoiceNo) {
  const sheet = ss.getSheetByName("فواتير_الموردين");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const searchInvNo = String(invoiceNo || "").trim();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === searchInvNo) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function updateSupplierInvoicePayment(ss, data) {
  const sheet = ss.getSheetByName("فواتير_الموردين");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  const searchInvNo = String(data.invoiceNo || "").trim();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === searchInvNo) {
      let currentPaid = Number(values[i][5]) || 0;
      let total = Number(values[i][4]) || 0;
      let newPaid = currentPaid + Number(data.amountPaid);
      let newRem = Math.max(0, total - newPaid);
      sheet.getRange(i + 1, 6).setValue(newPaid);
      sheet.getRange(i + 1, 7).setValue(newRem);
      break;
    }
  }
}

function saveSupplierProfile(ss, profile) {
  let sheet = ss.getSheetByName("دليل_الموردين");
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName("دليل_الموردين");
  }

  const data = sheet.getDataRange().getValues();
  const name = String(profile.name || "").trim();
  const id = profile.id ? String(profile.id).trim() : ("SUP-" + new Date().getTime().toString().slice(-4));

  const rowData = [
    id,
    name,
    profile.phone || "-",
    profile.address || "-",
    profile.notes || "-"
  ];

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    let rowId = String(data[i][0]).trim();
    let rowName = String(data[i][1]).trim();
    if (rowName === name || (profile.id && rowId === String(profile.id).trim())) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteSupplierProfile(ss, identifier) {
  const sheet = ss.getSheetByName("دليل_الموردين");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const searchKey = String(identifier || "").trim();

  for (let i = 1; i < data.length; i++) {
    let rowId = String(data[i][0]).trim();
    let rowName = String(data[i][1]).trim();
    if (rowId === searchKey || rowName === searchKey) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function saveCheck(ss, check) {
  let sheet = ss.getSheetByName("الشيكات");
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName("الشيكات");
  }

  const checkNo = String(check.checkNo || "").trim();
  let imageUrl = check.imageUrl || "";

  if (check.imageBase64 && check.imageBase64.indexOf("base64,") > -1) {
    imageUrl = saveBase64Image(check.imageBase64, "CHK_" + checkNo + "_" + (check.supplierName || "مورد"));
  }

  const data = sheet.getDataRange().getValues();
  let existingRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === checkNo) {
      existingRow = i + 1;
      if (!imageUrl && data[i][9]) {
        imageUrl = data[i][9];
      }
      break;
    }
  }

  const total = Number(check.total) || 0;
  const paid = Number(check.paid) || 0;
  const remaining = Math.max(0, total - paid);
  let status = check.status;
  if (!status) {
    status = remaining === 0 ? "تم التسديد" : (paid > 0 ? "جاري التسديد" : "لم يسدد");
  }

  const rowData = [
    checkNo,
    check.bank || "",
    check.supplierName || "",
    check.issueDate || Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd"),
    check.dueDate || "",
    total,
    paid,
    remaining,
    status,
    imageUrl
  ];

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteCheck(ss, checkNo) {
  const sheet = ss.getSheetByName("الشيكات");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const searchCheckNo = String(checkNo || "").trim();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === searchCheckNo) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function updateCheckPayment(ss, data) {
  const sheet = ss.getSheetByName("الشيكات");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  const searchCheckNo = String(data.checkNo || "").trim();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === searchCheckNo) {
      let currentPaid = Number(values[i][6]) || 0;
      let total = Number(values[i][5]) || 0;
      let newPaid = currentPaid + Number(data.amountPaid);
      let newRem = Math.max(0, total - newPaid);
      let status = (newRem === 0) ? "تم التسديد" : "جاري التسديد";
      sheet.getRange(i + 1, 7).setValue(newPaid);
      sheet.getRange(i + 1, 8).setValue(newRem);
      sheet.getRange(i + 1, 9).setValue(status);
      break;
    }
  }
}

function saveBase64Image(base64Data, fileNamePrefix) {
  try {
    const parts = base64Data.split(",");
    if (parts.length < 2) return "";

    const meta = parts[0];
    const rawBytes = parts[1];
    let contentType = "image/jpeg";

    if (meta.indexOf(":") > -1 && meta.indexOf(";") > -1) {
      contentType = meta.substring(meta.indexOf(":") + 1, meta.indexOf(";"));
    }

    const decoded = Utilities.base64Decode(rawBytes);
    const blob = Utilities.newBlob(decoded, contentType, fileNamePrefix + "_" + new Date().getTime() + ".jpg");

    let folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return "";
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
