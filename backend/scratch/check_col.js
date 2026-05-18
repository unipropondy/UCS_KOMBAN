const { poolPromise, sql } = require("../config/db");

async function run() {
  const pool = await poolPromise;
  const res = await pool.request().query(`
    SELECT TABLE_NAME, COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME IN ('RestaurantOrder', 'RestaurantOrderCur') 
    AND COLUMN_NAME = 'PriorityCode'
  `);
  console.table(res.recordset);
  process.exit(0);
}
run();
