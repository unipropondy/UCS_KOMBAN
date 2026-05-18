const { poolPromise, sql } = require("../config/db");

async function run() {
  const pool = await poolPromise;
  
  const queries = {
    "PaymentDetail": "SELECT TOP 5 * FROM PaymentDetail ORDER BY PaymentCollectedOn DESC",
    "PaymentDetailCur": "SELECT TOP 5 * FROM PaymentDetailCur ORDER BY PaymentCollectedOn DESC",
    "SettlementHeader": "SELECT TOP 5 * FROM SettlementHeader ORDER BY LastSettlementDate DESC",
    "SettlementDetail": "SELECT TOP 5 * FROM SettlementDetail ORDER BY SettlementId DESC",
    "SettlementTotalSales": "SELECT TOP 5 * FROM SettlementTotalSales ORDER BY SettlementID DESC",
    "RestaurantInvoice": "SELECT TOP 5 * FROM RestaurantInvoice ORDER BY CreatedOn DESC"
  };

  for (const [name, query] of Object.entries(queries)) {
    console.log(`\n================= QUERY: ${name} =================`);
    try {
      const result = await pool.request().query(query);
      console.table(result.recordset);
    } catch (err) {
      console.error(`Error running query for ${name}:`, err.message);
    }
  }

  console.log("\n--- Checking Triggers on SettlementHeader ---");
  try {
    const triggers = await pool.request().query(`
      SELECT name FROM sys.triggers WHERE parent_id = OBJECT_ID('SettlementHeader')
    `);
    console.table(triggers.recordset);
    for (const trig of triggers.recordset) {
      console.log(`\nTrigger: ${trig.name}`);
      const def = await pool.request().query(`EXEC sp_helptext '${trig.name}'`);
      console.log(def.recordset.map(r => r.Text).join(""));
    }
  } catch (err) {}

  console.log("\n--- Checking Triggers on RestaurantInvoice ---");
  try {
    const triggers = await pool.request().query(`
      SELECT name FROM sys.triggers WHERE parent_id = OBJECT_ID('RestaurantInvoice')
    `);
    console.table(triggers.recordset);
  } catch (err) {}

  process.exit(0);
}
run();
