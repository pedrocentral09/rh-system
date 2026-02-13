const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const c = new Client('postgresql://postgres:glNJnFRkCSEXzRrahznMnSkRyDzuiNVG@shortline.proxy.rlwy.net:25803/railway');
    await c.connect();

    let output = '';

    const tables = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    output += '=== TABLES ===\n';
    tables.rows.forEach(r => output += ` - ${r.table_name}\n`);

    for (const row of tables.rows) {
        const cols = await c.query(
            "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
            [row.table_name]
        );
        output += `\n=== COLUMNS: ${row.table_name} ===\n`;
        cols.rows.forEach(col => output += `  ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})\n`);

        const count = await c.query(`SELECT COUNT(*) as cnt FROM "${row.table_name}"`);
        output += `  TOTAL ROWS: ${count.rows[0].cnt}\n`;
    }

    // Get first 2 rows from each table
    for (const row of tables.rows) {
        const sample = await c.query(`SELECT * FROM "${row.table_name}" LIMIT 2`);
        output += `\n=== SAMPLE: ${row.table_name} ===\n`;
        sample.rows.forEach(r => {
            // Truncate content field to 200 chars
            const copy = { ...r };
            if (copy.content && copy.content.length > 200) {
                copy.content = copy.content.substring(0, 200) + '... [TRUNCATED]';
            }
            output += JSON.stringify(copy, null, 2) + '\n';
        });
    }

    fs.writeFileSync('scripts/afd-db-report.txt', output);
    console.log('Report written to scripts/afd-db-report.txt');
    await c.end();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
