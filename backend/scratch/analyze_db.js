const { poolPromise, sql } = require("../config/db");

async function analyzeViews() {
  const pool = await poolPromise;
  const views = [
    "vw_RestaurantOrder",
    "vw_RestaurantOrderCur",
    "vw_RestaurantOrderDetail",
    "vw_RestaurantOrderDetailCur",
    "vw_PaymentDetail",
    "vw_PaymentDetailCur",
    "vw_DishMaster"
  ];

  console.log("--- Starting View Analysis ---\n");

  for (const view of views) {
    console.log(`\n================= VIEW: ${view} =================`);
    try {
      const result = await pool.request().query(`EXEC sp_helptext '${view}'`);
      console.log(result.recordset.map(r => r.Text).join(""));
    } catch (err) {
      console.error(`Error fetching text for ${view}:`, err.message);
    }
  }

  console.log("\n--- Checking Base Tables ---\n");
  // Heuristically find tables from view definitions or just check common ones
  const commonTables = [
    "RestaurantOrderHeader",
    "RestaurantOrderHeaderCur",
    "RestaurantOrderDetail",
    "RestaurantOrderDetailCur",
    "RestaurantPayment",
    "RestaurantPaymentCur",
    "SettlementHeader",
    "SettlementTotalSales",
    "DishMaster",
    "ProductMaster"
  ];

  for (const table of commonTables) {
    console.log(`\n================= TABLE: ${table} =================`);
    try {
      const result = await pool.request().query(`EXEC sp_help '${table}'`);
      // sp_help returns multiple recordsets
      console.log("Column Details:");
      console.table(result.recordsets[1]); // Columns
      
      console.log("\nTriggers:");
      const triggers = await pool.request().query(`
        SELECT name FROM sys.triggers WHERE parent_id = OBJECT_ID('${table}')
      `);
      console.table(triggers.recordset);
      
      for (const trig of triggers.recordset) {
        console.log(`\nTrigger Definition: ${trig.name}`);
        const trigDef = await pool.request().query(`EXEC sp_helptext '${trig.name}'`);
        console.log(trigDef.recordset.map(r => r.Text).join(""));
      }
    } catch (err) {
      console.error(`Error fetching info for ${table}:`, err.message);
    }
  }

  process.exit(0);
}

analyzeViews();
