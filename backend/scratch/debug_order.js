const { poolPromise, sql } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("--- Checking RestaurantOrder ---");
    const orderRes = await pool.request()
        .input("orderNo", sql.NVarChar(100), "20260516-0018")
        .query("SELECT OrderNumber, OrderId FROM RestaurantOrder WHERE OrderNumber = @orderNo");
    console.table(orderRes.recordset);
  } catch (err) {
    console.error("Query failed:", err);
  }
  process.exit(0);
}
run();
