const { poolPromise } = require('../config/db');

(async () => {
  try {
    const pool = await poolPromise;

    console.log('\n=== 1. Columns containing "BusinessUnit" or "Organization" or "Restaurant" ===');
    const colsRes = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE COLUMN_NAME LIKE '%BusinessUnit%' 
         OR COLUMN_NAME LIKE '%Organization%'
         OR COLUMN_NAME LIKE '%RestaurantId%'
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    console.table(colsRes.recordset);

    console.log('\n=== 2. Check for Views referencing "BusinessUnit" or "Organization" ===');
    const viewsRes = await pool.request().query(`
      SELECT o.name AS view_name, m.definition
      FROM sys.sql_modules m
      INNER JOIN sys.objects o ON m.object_id = o.object_id
      WHERE o.type = 'V'
        AND (m.definition LIKE '%BusinessUnit%' 
             OR m.definition LIKE '%Organization%'
             OR m.definition LIKE '%FBFD4E31-5C91-4DEC-86EA-989D3B5639CA%')
    `);
    console.table(viewsRes.recordset.map(r => ({ view_name: r.view_name, definition_snippet: r.definition.substring(0, 100).replace(/\r?\n/g, ' ') })));

    console.log('\n=== 3. Check for Stored Procedures referencing "BusinessUnit" or "Organization" ===');
    const spsRes = await pool.request().query(`
      SELECT o.name AS sp_name, m.definition
      FROM sys.sql_modules m
      INNER JOIN sys.objects o ON m.object_id = o.object_id
      WHERE o.type = 'P'
        AND (m.definition LIKE '%BusinessUnit%' 
             OR m.definition LIKE '%Organization%'
             OR m.definition LIKE '%FBFD4E31-5C91-4DEC-86EA-989D3B5639CA%')
    `);
    console.table(spsRes.recordset.map(r => ({ sp_name: r.sp_name, definition_snippet: r.definition.substring(0, 100).replace(/\r?\n/g, ' ') })));

  } catch (err) {
    console.error('Error during deep DB inspection:', err.message);
  } finally {
    process.exit(0);
  }
})();
