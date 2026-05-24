$lines = Get-Content diff_backup.txt -Encoding Unicode
$hunkCount = 0
$out = @()

foreach ($l in $lines) {
    if ($l -match "^@@") {
        $hunkCount++
    }
    if ($hunkCount -le 10) {
        $out += $l
    }
}

$out | Out-File clean.patch -Encoding UTF8
