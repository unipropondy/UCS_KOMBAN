const { poolPromise, sql } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT TOP 10
          ro.OrderNumber,
          ro.OrderId,

          ri.BillNumber,
          ri.RestaurantBillId,

          pd.PaymentId,
          pd.Paymode,
          pd.Amount,
          pd.PaymentCollectedOn,

          sh.SettlementID,

          ro.OrderDateTime

      FROM RestaurantOrder ro

      LEFT JOIN RestaurantInvoice ri
          ON ro.OrderId = ri.OrderId

      LEFT JOIN PaymentDetail pd
          ON pd.RestaurantBillId = ri.RestaurantBillId

      LEFT JOIN SettlementHeader sh
          ON sh.SettlementID = pd.RestaurantBillId

      ORDER BY ro.OrderDateTime DESC
    `;
    const res = await pool.request().query(query);
    console.table(res.recordset);
  } catch (err) {
    console.error("Query failed:", err);
  }
  process.exit(0);
}
run();
