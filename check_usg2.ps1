$gameFile = Get-Content DB_Game_1.json | ConvertFrom-Json
$gameRow = $gameFile | ForEach-Object { if ($_.value[0] -match '20260606_立川九②') { $_ } } | Select-Object -First 1
Write-Output "Game Row for 20260606_立川九②:"
$gameRow.value | ConvertTo-Json -Depth 5
