const xlsx = require('xlsx');
const wb = xlsx.readFile('importar.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws);
console.log('HEADERS:', Object.keys(data[0] || {}));
console.log('TOTAL_ROWS:', data.length);
console.log('SAMPLE:');
for (let i = 0; i < Math.min(5, data.length); i++) {
    console.log(JSON.stringify(data[i]));
}
