const fs = require('fs');

async function fetchSheet() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/1Q2c9BHrUHJB3dX2LpC7LJsVXgQqj5F_HLjrROHsRxl8/values/DB_Game_1?key=AIzaSyDDG3PeoGS6_0QBEo-H8VxKBU3XvrUJjhw`;
  
  const res = await fetch(url, { 
    headers: {
      'Referer': 'https://hamache-basketball.github.io/hamache-dashboard/'
    }
  });
  
  const data = await res.json();
  fs.writeFileSync('sheet.json', JSON.stringify(data, null, 2));
}

fetchSheet();
