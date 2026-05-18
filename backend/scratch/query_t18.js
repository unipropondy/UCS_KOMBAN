const { poolPromise } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TableId, TableNumber, Status, CurrentOrderId, DiningSection
      FROM TableMaster WITH (NOLOCK)
      WHERE TableNumber LIKE '%18%'
    `);
    console.log("Matches:");
    console.table(result.recordset);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
