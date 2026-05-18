const { poolPromise } = require("../config/db");

async function checkIndexes() {
  const pool = await poolPromise;
  const tables = [
    "RestaurantOrderCur"
  ];

  for (const table of tables) {
    console.log(`\n--- Indexes for Table: ${table} ---`);
    try {
      const result = await pool.request().query(`
        SELECT 
            i.name AS IndexName,
            i.type_desc AS IndexType,
            is_unique AS IsUnique,
            is_primary_key AS IsPrimaryKey,
            COL_NAME(ic.object_id, ic.column_id) AS ColumnName
        FROM 
            sys.indexes i
        INNER JOIN 
            sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        WHERE 
            i.object_id = OBJECT_ID('${table}')
        ORDER BY 
            i.name, ic.key_ordinal;
      `);
      console.table(result.recordset);
    } catch (err) {
      console.error(`Error for ${table}:`, err.message);
    }
  }
  process.exit(0);
}

checkIndexes();
