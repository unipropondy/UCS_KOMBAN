const { poolPromise, sql } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("--- Checking RestaurantInvoice ---");
    const invRes = await pool.request().query("SELECT TOP 3 OrderId, BillNumber, RestaurantBillId FROM RestaurantInvoice ORDER BY CreatedOn DESC");
    console.table(invRes.recordset);

    console.log("\n--- Checking PaymentDetail ---");
    const payRes = await pool.request().query("SELECT TOP 3 PaymentId, OrderId, RestaurantBillId FROM PaymentDetail ORDER BY CreatedOn DESC");
    if (payRes.recordset.length === 0) {
      console.log("PaymentDetail is completely empty.");
    } else {
      console.table(payRes.recordset);
    }
  } catch (err) {
    console.error("Query failed:", err);
  }
  process.exit(0);
}
run();
