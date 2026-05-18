const { poolPromise } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("Checking string matching with and without LTRIM(RTRIM)...");
    
    // Find some active tables
    const tableRes = await pool.request().query("SELECT TOP 5 Tableno FROM RestaurantOrderCur WHERE Tableno IS NOT NULL AND Tableno <> ''");
    console.log("Sample TableNos in RestaurantOrderCur:", tableRes.recordset);
    
    if (tableRes.recordset.length > 0) {
      const sample = tableRes.recordset[0].Tableno;
      const trimmed = sample.trim();
      console.log(`Testing with sample TableNo: '${sample}' (trimmed: '${trimmed}')`);
      
      const resWithTrim = await pool.request()
        .input("val", trimmed)
        .query("SELECT COUNT(*) as count FROM RestaurantOrderCur WHERE LTRIM(RTRIM(Tableno)) = @val");
      
      const resDirect = await pool.request()
        .input("val", trimmed)
        .query("SELECT COUNT(*) as count FROM RestaurantOrderCur WHERE Tableno = @val");
        
      console.log(`With LTRIM(RTRIM): ${resWithTrim.recordset[0].count} rows`);
      console.log(`Direct matching (=): ${resDirect.recordset[0].count} rows`);
    } else {
      console.log("No rows found to test.");
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
  process.exit(0);
}
run();
