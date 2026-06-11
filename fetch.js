const https = require('https');

const url = 'https://sheets.googleapis.com/v4/spreadsheets/1Q2c9BHrUHJB3dX2LpC7LJsVXgQqj5F_HLjrROHsRxl8/values/DB_Player_3?key=AIzaSyDDG3PeoGS6_0QBEo-H8VxKBU3XvrUJjhw';

https.get(url, { headers: { 'Referer': 'https://hamache-basketball.github.io/hamache-dashboard/' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json.values.slice(0, 3), null, 2));
  });
});
