const fs = require('fs');
let buildNumber = (new Date()).toISOString().replace(/-/g, '').split('T')[0]
console.log('New build number:', buildNumber);
fs.writeFileSync('./buildNumber.json', JSON.stringify({ buildNumber: buildNumber }), "utf8");
