# ==============================================================================
# Link and Asset Checker for Bavly Kids
# ==============================================================================

$htmlFiles = Get-ChildItem -Path . -Filter "*.html"
$errorsFound = 0

Write-Output "Scanning $($htmlFiles.Count) HTML files for internal links and assets..."

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Check href attributes
    $hrefMatches = [regex]::Matches($content, 'href=["'']([^"'':#]+)["'']')
    foreach ($match in $hrefMatches) {
        $link = $match.Groups[1].Value.Trim()
        if ($link -and -not $link.StartsWith("http") -and -not $link.StartsWith("mailto") -and -not $link.StartsWith("tel") -and -not $link.StartsWith("#")) {
            $decodedLink = [System.Uri]::UnescapeDataString($link)
            if (-not (Test-Path -Path $decodedLink) -and -not (Test-Path -Path $link)) {
                Write-Output "❌ Broken href in $($file.Name): '$link'"
                $errorsFound++
            }
        }
    }

    # Check src attributes
    $srcMatches = [regex]::Matches($content, 'src=["'']([^"'':]+)["'']')
    foreach ($match in $srcMatches) {
        $src = $match.Groups[1].Value.Trim()
        if ($src -and -not $src.StartsWith("http") -and -not $src.StartsWith("data:") -and -not $src.StartsWith("#") -and -not $src.Contains('${')) {
            $decodedSrc = [System.Uri]::UnescapeDataString($src)
            if (-not (Test-Path -Path $decodedSrc) -and -not (Test-Path -Path $src)) {
                Write-Output "❌ Broken src in $($file.Name): '$src'"
                $errorsFound++
            }
        }
    }
}

if ($errorsFound -eq 0) {
    Write-Output "✅ ALL internal links, stylesheets, and scripts exist! No broken links found."
} else {
    Write-Output "⚠️ Found $errorsFound broken link(s)."
}
