const { poolPromise, sql } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("Attempting manual insert into PaymentDetail...");
    
    const res = await pool.request()
      .input("id", sql.UniqueIdentifier, "11111111-1111-1111-1111-111111111111")
      .query(`
        INSERT INTO PaymentDetail (
          PaymentId, PaymentCollectedOn, PaymentType, Paymode, Amount, 
          BusinessUnitId, CreatedBy, CreatedOn
        ) VALUES (
          @id, GETDATE(), 1, 1, 10.00, 
          @id, @id, GETDATE()
        );
      `);
      
    console.log("Insert result:", res);
    
    const check = await pool.request()
      .input("id", sql.UniqueIdentifier, "11111111-1111-1111-1111-111111111111")
      .query("SELECT * FROM PaymentDetail WHERE PaymentId = @id");
      
    console.log("Check result:", check.recordset);
    
    // Cleanup
    await pool.request()
      .input("id", sql.UniqueIdentifier, "11111111-1111-1111-1111-111111111111")
      .query("DELETE FROM PaymentDetail WHERE PaymentId = @id");
      
  } catch (err) {
    console.error("Manual insert failed:", err);
  }
  process.exit(0);
}
run();
