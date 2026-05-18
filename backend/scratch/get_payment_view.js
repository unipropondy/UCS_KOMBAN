const { poolPromise, sql } = require("../config/db");

async function run() {
  const pool = await poolPromise;
  const res = await pool.request().query("EXEC sp_helptext 'vw_PaymentDetail'");
  console.log(res.recordset.map(r => r.Text).join(""));
  process.exit(0);
}
run();
