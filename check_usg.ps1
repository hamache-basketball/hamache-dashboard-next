$gameFile = Get-Content DB_Game_1.json | ConvertFrom-Json
$playerFile = Get-Content db_player.json | ConvertFrom-Json

$gameId = "20260606_立川九②"

$gameRow = $gameFile | ForEach-Object { if ($_.value[0] -match '20260606') { $_ } } | Select-Object -First 1
Write-Output "Game Row:"
$gameRow.value | ConvertTo-Json -Depth 5
