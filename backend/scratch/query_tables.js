const { poolPromise } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("Connected to MSSQL.");
    
    const result = await pool.request().query(`
      SELECT TableId, TableNumber, Status, CurrentOrderId, DiningSection
      FROM TableMaster WITH (NOLOCK)
    `);
    
    console.log("\n--- TableMaster Entries ---");
    console.table(result.recordset);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

run();
