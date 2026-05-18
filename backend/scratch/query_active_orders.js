const { poolPromise } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("Connected to MSSQL.");
    
    const ordersResult = await pool.request().query(`
      SELECT OrderId, OrderNumber, OrderDateTime, Tableno, StatusCode, isOrderClosed, BusinessUnitId
      FROM RestaurantOrderCur WITH (NOLOCK)
      WHERE isOrderClosed = 0 OR isOrderClosed IS NULL
    `);
    
    console.log("\n--- ACTIVE ORDERS ---");
    console.table(ordersResult.recordset);
    
    const detailsResult = await pool.request().query(`
      SELECT d.OrderDetailId, d.OrderId, d.DishId, d.DishName, d.Quantity, d.PricePerUnit, d.StatusCode, d.CreatedOn, h.Tableno
      FROM RestaurantOrderDetailCur d WITH (NOLOCK)
      JOIN RestaurantOrderCur h WITH (NOLOCK) ON d.OrderId = h.OrderId
      WHERE h.isOrderClosed = 0 OR h.isOrderClosed IS NULL
    `);
    
    console.log("\n--- ACTIVE ORDER DETAILS ---");
    console.table(detailsResult.recordset);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

run();
