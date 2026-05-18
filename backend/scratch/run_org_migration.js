const { poolPromise } = require("../config/db");

(async () => {
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error("Database pool not available");

    console.log("⚡ Starting Organization GUID Decoupling Migration...");

    const migrationQuery = `
      BEGIN TRANSACTION;

      BEGIN TRY
          -- 1. Identify active Organization ID
          DECLARE @ActiveOrgId UNIQUEIDENTIFIER;
          SELECT TOP 1 @ActiveOrgId = BusinessUnitId FROM Organization;

          IF @ActiveOrgId IS NULL
          BEGIN
              THROW 50000, 'Error: No active Organization found in database. Migration aborted.', 1;
          END

          PRINT 'Active Organization ID Found: ' + CAST(@ActiveOrgId AS VARCHAR(50));

          -- 2. Update RestaurantOrder & RestaurantOrderCur
          UPDATE RestaurantOrder 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          UPDATE RestaurantOrderCur 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          -- 3. Update RestaurantOrderDetail & RestaurantOrderDetailCur
          UPDATE RestaurantOrderDetail 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          UPDATE RestaurantOrderDetailCur 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          -- 4. Update RestaurantInvoice
          UPDATE RestaurantInvoice 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          -- 5. Update SettlementHeader
          UPDATE SettlementHeader 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          -- 6. Update PaymentDetail & PaymentDetailCur
          UPDATE PaymentDetail 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          UPDATE PaymentDetailCur 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          -- 7. Update TransactionMaster
          UPDATE TransactionMaster 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000000' OR BusinessUnitId IS NULL;

          -- 8. Update TimeEntry (Attendance punches)
          UPDATE TimeEntry 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000001' OR BusinessUnitId IS NULL;

          -- 9. Update DailyAttendance (Daily shift aggregations)
          UPDATE DailyAttendance 
          SET BusinessUnitId = @ActiveOrgId 
          WHERE BusinessUnitId = '00000000-0000-0000-0000-000000000001' OR BusinessUnitId IS NULL;

          -- 10. Align OrderSequences Table
          UPDATE OrderSequences
          SET RestaurantId = @ActiveOrgId
          WHERE RestaurantId = '00000000-0000-0000-0000-000000000000';

          COMMIT TRANSACTION;
          SELECT 'SUCCESS' AS Status, CAST(@ActiveOrgId AS VARCHAR(50)) AS ActiveOrgId;
      END TRY
      BEGIN CATCH
          ROLLBACK TRANSACTION;
          SELECT 'FAILURE' AS Status, ERROR_MESSAGE() AS ErrorMessage;
      END CATCH
    `;

    const result = await pool.request().query(migrationQuery);
    const summary = result.recordset[0];
    
    if (summary.Status === "SUCCESS") {
      console.log(`✅ SUCCESS: All historical stubs successfully migrated to: ${summary.ActiveOrgId}`);
    } else {
      console.error(`❌ FAILURE: Migration failed and rolled back!`);
      console.error(`Reason: ${summary.ErrorMessage}`);
    }

  } catch (err) {
    console.error("🔥 Error running migration script:", err.message);
  } finally {
    process.exit(0);
  }
})();
