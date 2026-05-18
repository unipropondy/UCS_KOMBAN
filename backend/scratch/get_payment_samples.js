const { poolPromise, sql } = require("../config/db");

async function run() {
  const pool = await poolPromise;
  
  console.log("\n--- PaymentDetailCur Sample ---");
  const curRes = await pool.request().query("SELECT TOP 1 * FROM PaymentDetailCur");
  console.log(JSON.stringify(curRes.recordset[0], null, 2));

  console.log("\n--- PaymentDetail Sample ---");
  const masterRes = await pool.request().query("SELECT TOP 1 * FROM PaymentDetail");
  console.log(JSON.stringify(masterRes.recordset[0], null, 2));

  process.exit(0);
}
run();
