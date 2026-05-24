$lines = Get-Content diff_backup.txt -Encoding Unicode
for ($i=0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "header bảng báo giá" -or $lines[$i] -match "quote-table-wrap") {
        $start = [Math]::Max(0, $i-20)
        $end = [Math]::Min($lines.Length-1, $i+20)
        $lines[$start..$end]
        break
    }
}
