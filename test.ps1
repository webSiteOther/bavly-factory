# ==============================================================================
# Bavly Kids - Automated Integration & Health Test Script
# ==============================================================================

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptUrl = "https://script.google.com/macros/s/AKfycbxArh5h7516ieZOpHu4qejoWlWsunux6p7o9vasHv8c5-1mWt36PfwzbdvMBr4_EJpn/exec"
Write-Output "====================================================="
Write-Output "Testing Bavly Kids API & Google Sheets Connection"
Write-Output "Target URL: $scriptUrl"
Write-Output "====================================================="

Write-Output "`n1. Testing GET action=get_all (Fetching live data)..."
try {
    $targetUrl = "$scriptUrl" + "?action=get_all"
    $response = Invoke-RestMethod -Uri $targetUrl -Method Get -TimeoutSec 15
    if ($response.status -eq "success") {
        Write-Output "GET Success!"
        Write-Output "  - Inventory models count: $($response.data.inventory.Count)"
        Write-Output "  - Sales invoices count:   $($response.data.sales.Count)"
        Write-Output "  - Supplier invoices count:$($response.data.supplier_invoices.Count)"
        Write-Output "  - Supplier profiles count:$($response.data.supplier_profiles.Count)"
        Write-Output "  - Checks count:           $($response.data.checks.Count)"
        Write-Output "  - Live Calculated Stats:"
        Write-Output "      * Total Stock Qty:    $($response.data.stats.totalStockQty)"
        Write-Output "      * Total Stock Value:  $($response.data.stats.totalStockValue) EGP"
        Write-Output "      * Total Supplier Debt:$($response.data.stats.totalSupplierDebt) EGP"
        Write-Output "      * Total Sales:        $($response.data.stats.totalSales) EGP"
    } else {
        Write-Output "GET returned error: $($response.message)"
    }
} catch {
    Write-Output "GET request failed: $_"
}

Write-Output "`n====================================================="
Write-Output "Tests Finished."
Write-Output "====================================================="
