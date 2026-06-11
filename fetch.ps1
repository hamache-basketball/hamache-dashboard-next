$headers = @{'Referer'='https://hamache-basketball.github.io/hamache-dashboard/'}
$response = Invoke-RestMethod -Uri 'https://sheets.googleapis.com/v4/spreadsheets/1Q2c9BHrUHJB3dX2LpC7LJsVXgQqj5F_HLjrROHsRxl8/values/DB_Player_3?key=AIzaSyDDG3PeoGS6_0QBEo-H8VxKBU3XvrUJjhw' -Headers $headers
$response.values[0..2] | ConvertTo-Json -Depth 10 > db_player.json
