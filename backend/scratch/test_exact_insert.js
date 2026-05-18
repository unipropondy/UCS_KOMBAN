const { poolPromise, sql } = require("../config/db");

async function run() {
  try {
    const pool = await poolPromise;
    console.log("Attempting exact insert into PaymentDetail...");
    
    // Simulate data
    const settlementId = "4DED7871-1925-43E4-AEEA-A81F9BA9FB8D";
    const guidOrderId = "52B7F357-47BA-4AE4-84DA-43A290476819";
    const businessUnitId = "00000000-0000-0000-0000-000000000000";
    
    const res = await pool.request()
      .input("PaymentId", sql.UniqueIdentifier, settlementId)
      .input("RestaurantBillId", sql.UniqueIdentifier, settlementId)
      .input("OrderId", sql.UniqueIdentifier, guidOrderId)
      .input("BilledFor", sql.Int, 1)
      .input("PaymentCollectedOn", sql.DateTime, new Date())
      .input("PaymentType", sql.Int, 1)
      .input("Paymode", sql.Int, 1)
      .input("Amount", sql.Decimal(18, 2), 10.00)
      .input("ReferenceNumber", sql.VarChar(100), null)
      .input("Remarks", sql.VarChar(500), "CASH")
      .input("BusinessUnitId", sql.UniqueIdentifier, businessUnitId)
      .input("CreatedBy", sql.UniqueIdentifier, settlementId)
      .input("CreatedOn", sql.DateTime, new Date())
      .input("ModifiedBy", sql.UniqueIdentifier, settlementId)
      .input("ModifiedOn", sql.DateTime, new Date())
      .query(`
        INSERT INTO [dbo].[PaymentDetailCur] (PaymentId, RestaurantBillId, BilledFor, PaymentCollectedOn, PaymentType, Paymode, Amount, ReferenceNumber, Remarks, BusinessUnitId, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
        VALUES (@PaymentId, @RestaurantBillId, @BilledFor, @PaymentCollectedOn, @PaymentType, @Paymode, @Amount, @ReferenceNumber, @Remarks, @BusinessUnitId, @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn);

        INSERT INTO [dbo].[PaymentDetail] (
          PaymentId, RestaurantBillId, SettlementId, InvoiceId, OrderId, BilledFor, PaymentCollectedOn, 
          PaymentType, Paymode, Amount, ReferenceNumber, Remarks, BusinessUnitId, 
          CreatedBy, CreatedOn, ModifiedBy, ModifiedOn, isSettlement
        ) VALUES (
          @PaymentId, @RestaurantBillId, @RestaurantBillId, @RestaurantBillId, @OrderId, @BilledFor, @PaymentCollectedOn, 
          @PaymentType, @Paymode, @Amount, @ReferenceNumber, @Remarks, @BusinessUnitId, 
          @CreatedBy, @CreatedOn, @ModifiedBy, @ModifiedOn, 1
        );
      `);
      
    console.log("Insert result:", res);
    
    // Cleanup
    await pool.request()
      .input("PaymentId", sql.UniqueIdentifier, settlementId)
      .query("DELETE FROM PaymentDetailCur WHERE PaymentId = @PaymentId; DELETE FROM PaymentDetail WHERE PaymentId = @PaymentId;");
      
  } catch (err) {
    console.error("Manual insert failed:", err);
  }
  process.exit(0);
}
run();
