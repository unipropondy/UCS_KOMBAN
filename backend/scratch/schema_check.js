const { poolPromise, sql } = require("../config/db");

async function checkSchema() {
  const pool = await poolPromise;
  const tables = [
    "RestaurantOrderCur",
    "RestaurantOrderDetailCur",
    "RestaurantmodifierdetailCur"
  ];
  
  for (const table of tables) {
    console.log(`\n================= TABLE: ${table} =================`);
    try {
      const res = await pool.request().input("tname", sql.VarChar(100), table).query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tname
        ORDER BY ORDINAL_POSITION
      `);
      console.table(res.recordset);
    } catch (err) {
      console.error(`Error checking ${table}:`, err.message);
    }
  }
  process.exit(0);
}

checkSchema();
