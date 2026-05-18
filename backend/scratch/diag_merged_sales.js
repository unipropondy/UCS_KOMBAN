const sql = require("mssql");
const { poolPromise } = require("../config/db");

async function diagnoseMergeSales() {
  try {
    const pool = await poolPromise;
    console.log("Connected to DB.");

    // 1. Get a recent merged order from OrderMergeHistory
    const mergeHistory = await pool.request().query(`
      SELECT TOP 1 ParentOrderId, ChildOrderId, ParentTableNo, ChildTableNo, MergedAt 
      FROM OrderMergeHistory 
      ORDER BY MergedAt DESC
    `);
    
    if (mergeHistory.recordset.length === 0) {
      console.log("No merged orders found in history.");
      return;
    }
    
    const merge = mergeHistory.recordset[0];
    console.log("Recent Merge History:", merge);

    // 2. Check RestaurantOrder (History) for both parent and child
    const parentOrder = await pool.request()
      .input("oid", sql.UniqueIdentifier, merge.ParentOrderId)
      .query("SELECT OrderId, OrderNumber, Tableno, TotalAmount FROM RestaurantOrder WHERE OrderId = @oid");
    console.log("\nParent in RestaurantOrder:", parentOrder.recordset);

    const childOrder = await pool.request()
      .input("oid", sql.UniqueIdentifier, merge.ChildOrderId)
      .query("SELECT OrderId, OrderNumber, Tableno, TotalAmount FROM RestaurantOrder WHERE OrderId = @oid");
    console.log("Child in RestaurantOrder:", childOrder.recordset);

    // 3. Check RestaurantOrderDetail for both
    const parentItems = await pool.request()
      .input("oid", sql.UniqueIdentifier, merge.ParentOrderId)
      .query("SELECT OrderDetailId, DishName, Quantity, TotalDetailLineAmount FROM RestaurantOrderDetail WHERE OrderId = @oid");
    console.log("\nParent Items in RestaurantOrderDetail:", parentItems.recordset);

    const childItems = await pool.request()
      .input("oid", sql.UniqueIdentifier, merge.ChildOrderId)
      .query("SELECT OrderDetailId, DishName, Quantity, TotalDetailLineAmount FROM RestaurantOrderDetail WHERE OrderId = @oid");
    console.log("Child Items in RestaurantOrderDetail:", childItems.recordset);
    
    // 4. Check SettlementHeader
    const settlement = await pool.request()
      .input("billNo", sql.NVarChar(50), parentOrder.recordset[0]?.OrderNumber)
      .query("SELECT SettlementID, BillNo, SysAmount FROM SettlementHeader WHERE BillNo = @billNo");
    console.log("\nSettlementHeader for Parent:", settlement.recordset);

    if (settlement.recordset.length > 0) {
      const sid = settlement.recordset[0].SettlementID;
      const sidItems = await pool.request()
        .input("sid", sql.UniqueIdentifier, sid)
        .query("SELECT DishName, Qty, Price FROM SettlementItemDetail WHERE SettlementID = @sid");
      console.log("SettlementItemDetail:", sidItems.recordset);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diagnoseMergeSales();
