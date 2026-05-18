const { poolPromise, sql } = require('../config/db');
(async () => {
  try {
    const pool = await poolPromise;

    // 1. Organization table structure and data
    console.log('\\n===== 1. ORGANIZATION TABLE =====');
    const orgCols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Organization' ORDER BY ORDINAL_POSITION");
    console.table(orgCols.recordset);
    const orgData = await pool.request().query("SELECT TOP 1 * FROM Organization");
    console.log('\\nOrganization Data:');
    console.log(JSON.stringify(orgData.recordset[0], null, 2));

    // 2. Check current BizId in RestaurantOrderCur
    console.log('\\n===== 2. RestaurantOrderCur BizId Samples =====');
    const curBiz = await pool.request().query("SELECT TOP 5 OrderNumber, BusinessUnitId, PriorityCode FROM RestaurantOrderCur ORDER BY CreatedOn DESC");
    console.table(curBiz.recordset);

    // 3. Check current BizId in RestaurantOrder (master)
    console.log('\\n===== 3. RestaurantOrder BizId Samples =====');
    const masterBiz = await pool.request().query("SELECT TOP 5 OrderNumber, BusinessUnitId, PriorityCode FROM RestaurantOrder ORDER BY CreatedOn DESC");
    console.table(masterBiz.recordset);

    // 4. Check SettlementHeader BizId
    console.log('\\n===== 4. SettlementHeader BizId Samples =====');
    const shBiz = await pool.request().query("SELECT TOP 5 SettlementID, BusinessUnitId FROM SettlementHeader ORDER BY CreatedOn DESC");
    console.table(shBiz.recordset);

    // 5. Check RestaurantInvoice BizId
    console.log('\\n===== 5. RestaurantInvoice BizId Samples =====');
    const invBiz = await pool.request().query("SELECT TOP 5 BillNumber, BusinessUnitId FROM RestaurantInvoice ORDER BY CreatedOn DESC");
    console.table(invBiz.recordset);

    // 6. Check PaymentDetail BizId
    console.log('\\n===== 6. PaymentDetail BizId Samples =====');
    const payBiz = await pool.request().query("SELECT TOP 5 PaymentId, BusinessUnitId FROM PaymentDetail ORDER BY CreatedOn DESC");
    console.table(payBiz.recordset);

    // 7. Check vw_Organization
    console.log('\\n===== 7. vw_Organization =====');
    try {
      const vwOrg = await pool.request().query("SELECT TOP 1 * FROM vw_Organization");
      console.log(JSON.stringify(vwOrg.recordset[0], null, 2));
    } catch(e) { console.log('vw_Organization not found or error:', e.message); }

    // 8. Check TransactionMaster columns
    console.log('\\n===== 8. TransactionMaster Columns =====');
    try {
      const tmCols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TransactionMaster' ORDER BY ORDINAL_POSITION");
      console.table(tmCols.recordset);
    } catch(e) { console.log('TransactionMaster not found:', e.message); }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
