/**
 * Unit Test Suite for Bavly Kids Data Layer (app.js)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Mock LocalStorage in Node environment
const localStorageStore = {};
global.localStorage = {
    getItem: (key) => localStorageStore[key] || null,
    setItem: (key, val) => { localStorageStore[key] = String(val); },
    removeItem: (key) => { delete localStorageStore[key]; },
    clear: () => { for (let k in localStorageStore) delete localStorageStore[k]; }
};

// Mock browser globals
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => {}, remove: () => {} } }),
    body: { appendChild: () => {} },
    addEventListener: () => {}
};
global.window = {
    dispatchEvent: () => {},
    addEventListener: () => {}
};
global.fetch = async () => ({
    ok: true,
    json: async () => ({ status: "success", data: {} })
});

const vm = require('vm');
const appCode = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
vm.runInThisContext(appCode);

console.log("==================================================");
console.log("Running Bavly Kids Unit Tests for Data Models & CRUD");
console.log("==================================================");

let testsPassed = 0;

function it(desc, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${desc}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${desc}`);
        console.error(err);
        process.exit(1);
    }
}

// ==================================================
// 1. InventoryDB Tests
// ==================================================
it("InventoryDB: Can add a new item", () => {
    InventoryDB.save({
        code: "TEST-01",
        name: "طقم تجريبي",
        colors: "أزرق",
        size: "2",
        qty: 10,
        costPrice: 100,
        sellPrice: 150
    });
    const items = InventoryDB.getAll();
    const found = items.find(i => i.code === "TEST-01");
    assert(found, "Item should exist");
    assert.strictEqual(found.qty, 10);
});

it("InventoryDB: Can edit an existing item", () => {
    InventoryDB.save({
        code: "TEST-01",
        name: "طقم تجريبي معدل",
        colors: "أحمر",
        size: "4",
        qty: 15,
        costPrice: 110,
        sellPrice: 160
    });
    const items = InventoryDB.getAll();
    const found = items.find(i => i.code === "TEST-01");
    assert.strictEqual(found.name, "طقم تجريبي معدل");
    assert.strictEqual(found.qty, 15);
});

it("InventoryDB: Can delete an item", () => {
    InventoryDB.delete("TEST-01");
    const items = InventoryDB.getAll();
    const found = items.find(i => i.code === "TEST-01");
    assert.strictEqual(found, undefined, "Item should be deleted");
});

it("InventoryDB: deductStock and restoreStock work correctly", () => {
    InventoryDB.save({ code: "STK-1", name: "صنف تجربة مخزون", qty: 20 });
    InventoryDB.deductStock([{ code: "STK-1", qty: 5 }]);
    let item = InventoryDB.getAll().find(i => i.code === "STK-1");
    assert.strictEqual(item.qty, 15, "Qty should be reduced to 15");

    InventoryDB.restoreStock([{ code: "STK-1", qty: 3 }]);
    item = InventoryDB.getAll().find(i => i.code === "STK-1");
    assert.strictEqual(item.qty, 18, "Qty should be restored to 18");
    InventoryDB.delete("STK-1");
});

// ==================================================
// 2. SalesDB Tests
// ==================================================
it("SalesDB: Generates next invoice number", () => {
    const nextNo = SalesDB.getNextInvoiceNo();
    assert(nextNo.startsWith("INV-"), "Invoice number should start with INV-");
});

it("SalesDB: Saves invoice and deducts stock", () => {
    InventoryDB.save({ code: "SALE-ITEM", name: "صنف بيع", qty: 10, sellPrice: 200 });
    const invNo = SalesDB.getNextInvoiceNo();
    SalesDB.save({
        invoiceNo: invNo,
        date: "2026-10-28",
        customerName: "عميل تجربة",
        customerPhone: "01000000000",
        items: [{ code: "SALE-ITEM", name: "صنف بيع", qty: 2, price: 200, discount: 0, total: 400 }],
        subtotal: 400,
        discountTotal: 0,
        netTotal: 400,
        paid: 400,
        remaining: 0
    });

    const stock = InventoryDB.getAll().find(i => i.code === "SALE-ITEM");
    assert.strictEqual(stock.qty, 8, "Stock should be reduced from 10 to 8");

    const savedInv = SalesDB.getAll().find(i => i.invoiceNo === invNo);
    assert(savedInv, "Invoice should be saved");
});

it("SalesDB: Deleting invoice restores inventory quantities", () => {
    const invoices = SalesDB.getAll();
    const lastInv = invoices[invoices.length - 1];
    SalesDB.delete(lastInv.invoiceNo);

    const stock = InventoryDB.getAll().find(i => i.code === "SALE-ITEM");
    assert.strictEqual(stock.qty, 10, "Stock should be restored back to 10");
    InventoryDB.delete("SALE-ITEM");
});

// ==================================================
// 3. SupplierDB Tests
// ==================================================
it("SupplierDB: Can save, pay, and delete supplier invoice", () => {
    SupplierDB.save({
        invoiceNo: "TEST-SUP-99",
        supplierName: "مصنع الاختبار",
        date: "2026-10-28",
        qty: 50,
        total: 5000,
        paid: 2000,
        remaining: 3000
    });

    let inv = SupplierDB.getAll().find(i => i.invoiceNo === "TEST-SUP-99");
    assert.strictEqual(inv.remaining, 3000);

    // Pay 1000
    SupplierDB.pay("TEST-SUP-99", 1000);
    inv = SupplierDB.getAll().find(i => i.invoiceNo === "TEST-SUP-99");
    assert.strictEqual(inv.paid, 3000);
    assert.strictEqual(inv.remaining, 2000);

    // Delete
    SupplierDB.delete("TEST-SUP-99");
    inv = SupplierDB.getAll().find(i => i.invoiceNo === "TEST-SUP-99");
    assert.strictEqual(inv, undefined);
});

// ==================================================
// 4. CheckDB Tests
// ==================================================
it("CheckDB: Can save, pay, edit, and delete check", () => {
    CheckDB.save({
        checkNo: "CHK-TEST-77",
        bank: "بنك تجريبي",
        supplierName: "مصنع التجربة",
        dueDate: "2026-11-01",
        total: 10000,
        paid: 0,
        remaining: 10000,
        status: "لم يسدد"
    });

    let chk = CheckDB.getAll().find(c => c.checkNo === "CHK-TEST-77");
    assert.strictEqual(chk.total, 10000);
    assert.strictEqual(chk.status, "لم يسدد");

    // Pay partial
    CheckDB.pay("CHK-TEST-77", 4000);
    chk = CheckDB.getAll().find(c => c.checkNo === "CHK-TEST-77");
    assert.strictEqual(chk.paid, 4000);
    assert.strictEqual(chk.remaining, 6000);
    assert.strictEqual(chk.status, "جاري التسديد");

    // Pay full
    CheckDB.pay("CHK-TEST-77", 6000);
    chk = CheckDB.getAll().find(c => c.checkNo === "CHK-TEST-77");
    assert.strictEqual(chk.remaining, 0);
    assert.strictEqual(chk.status, "تم التسديد");

    // Delete
    CheckDB.delete("CHK-TEST-77");
    chk = CheckDB.getAll().find(c => c.checkNo === "CHK-TEST-77");
    assert.strictEqual(chk, undefined);
});

console.log("==================================================");
console.log(`All ${testsPassed} unit tests passed successfully!`);
console.log("==================================================");
