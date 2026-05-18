const { poolPromise, sql } = require("../config/db");

async function analyzeTables() {
  const pool = await poolPromise;
  const tables = [
    "RestaurantOrder",
    "RestaurantOrderDetail",
    "RestaurantPayment",
    "SettlementHeader",
    "SettlementItemDetail",
    "SettlementTotalSales",
    "RestaurantInvoice",
    "PickListMaster",
    "DishMaster"
  ];

  console.log("--- Starting Table Analysis ---\n");

  for (const table of tables) {
    console.log(`\n================= TABLE: ${table} =================`);
    try {
      const result = await pool.request().query(`EXEC sp_help '${table}'`);
      if (result.recordsets[1]) {
        console.log("Columns:");
        const cols = result.recordsets[1].map(c => ({
          Name: c.Column_name.trim(),
          Type: c.Type.trim(),
          Length: c.Length,
          Nullable: c.Nullable.trim()
        }));
        console.table(cols);
      }
      
      console.log("\nTriggers:");
      const triggers = await pool.request().query(`
        SELECT name FROM sys.triggers WHERE parent_id = OBJECT_ID('${table}')
      `);
      console.table(triggers.recordset);
    } catch (err) {
      console.error(`Error fetching info for ${table}:`, err.message);
    }
  }

  process.exit(0);
}

analyzeTables();
