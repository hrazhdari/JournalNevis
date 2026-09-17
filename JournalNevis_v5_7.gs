/**
 * JournalNevis v5.7 - Google Apps Script backend
 * ------------------------------------------------------------
 * Works with JournalNevis_v5_7.mq5.
 *
 * Main design:
 * - UPSERT_TRADE is small and contains trade data only.
 * - SCREENSHOT is a separate request, so an image problem never
 *   prevents the trade row from being written.
 * - Trade Key and Deal ID make retries/history sync idempotent.
 * - Recovered trades never overwrite an existing screenshot link.
 */

const JOURNALNEVIS = {
  name: 'JournalNevis',
  version: '5.7.1',
  website: 'https://JournalNevis.ir',
  navy: '#0B1220',
  navy2: '#16243A',
  mint: '#2DE0B6',
  mintDark: '#16B893',
  green: '#16A34A',
  red: '#DC2626'
};

const TRADE_HEADERS = [
  // User-facing journal columns
  'Trade #','Symbol','Direction','Volume','Open Time','Entry Price','Stop Loss','Take Profit',
  'Close Time','Exit Price','Exit Reason','Gross P/L','Commission','Swap','Fee','Net P/L',
  'Holding Min','Source','Entry Screenshot','Exit Screenshot','Setup','Entry Reason','Emotion',
  'Mistake','Notes','Review Status','Status',
  // Technical / synchronization columns (hidden by v5 formatting)
  'Trade Key','Position ID','Account Login','Server','Broker','Entry Deal ID','Exit Deal ID','Magic',
  'Timeframe','Journal Timeframe','Entry Screenshot TF','Exit Screenshot TF',
  'Entry Screenshot Status','Exit Screenshot Status','Sync Status','Last Updated','Last Sync',
  'Weekday','Session','Recovery Note'
];

const EXECUTION_HEADERS = [
  'Deal ID','Trade Key','Position ID','Account Login','Server','Symbol','Time',
  'Deal Entry','Deal Type','Volume','Price','Profit','Commission','Swap','Fee',
  'Reason','Magic','Comment'
];


const CASH_FLOW_HEADERS = [
  'Event #','Deal ID','Account Login','Server','Time','Raw Type','Category',
  'Amount','Running Cash Flow','Comment','Source','Last Sync'
];

const ACCOUNT_HEADERS = [
  'Account Key','Account Login','Server','Broker','Currency','Balance','Equity',
  'Credit','Floating P/L','Margin','Free Margin','Last Updated'
];

const ANALYTICS_HEADERS = [
  'Trade #','Close Time','Open Time','Symbol','Direction','Net P/L','Commission',
  'Swap','Fee','Cumulative Net P/L','Trading Balance','Trading Peak',
  'Drawdown $','Drawdown %','Account Balance Curve','Account Peak',
  'Account Drawdown $','Account Drawdown %','Result','Win Streak','Loss Streak',
  'Consecutive P/L'
];

const MONTHLY_HEADERS = [
  'Month','Trades','Wins','Losses','Win Rate','Net P/L','Commission','Avg Trade',
  'Largest Win','Largest Loss'
];

const SYMBOL_HEADERS = [
  'Symbol','Trades','Wins','Losses','Win Rate','Net P/L','Gross Profit','Gross Loss',
  'Profit Factor','Commission','Swap','Fees','Trading Costs','Avg Trade','Best Trade',
  'Worst Trade','Avg Holding Min','Total Volume','Long Trades','Short Trades'
];

const EQUITY_HISTORY_HEADERS = [
  'Account Key','Time','Balance','Equity','Floating P/L','Credit','Margin','Free Margin'
];

const BALANCE_CURVE_HEADERS = [
  'Time','Event','Symbol','Trade #','Change','Balance','Peak','Drawdown $','Drawdown %'
];

const SETTINGS = {
  tradesSheet: 'Trades',
  executionsSheet: 'Executions',
  cashFlowSheet: 'Cash Flow',
  accountsSheet: 'Accounts',
  analyticsSheet: 'Analytics',
  monthlySheet: 'Monthly',
  symbolSheet: 'Symbol Performance',
  equityHistorySheet: 'Equity History',
  balanceCurveSheet: 'Balance Curve',
  breakdownSheet: 'Breakdown',
  dashboardSheet: 'Dashboard',
  settingsSheet: 'Settings',
  listsSheet: 'Lists',
  defaultFolderName: 'JournalNevis Screenshots',
  helpSheet: 'Help',
  systemSheets: ['Executions','Cash Flow','Equity History','Balance Curve','Symbol Performance','Analytics','Monthly','Breakdown','Lists']
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('JournalNevis v5.7.1')
    .addItem('Initialize / Repair JournalNevis', 'setupJournalNevis')
    .addItem('Refresh Dashboard', 'refreshDashboard')
    .addItem('Repair Screenshot Links', 'repairScreenshotLinks')
    .addItem('Relink Screenshots from Drive', 'relinkScreenshotsFromDrive')
    .addItem('Normalize / Resequence Trades', 'normalizeAndRefresh')
    .addSeparator()
    .addItem('Show System Sheets', 'showSystemSheets')
    .addItem('Hide System Sheets', 'hideSystemSheets')
    .addItem('Connection Info', 'showConnectionInfo')
    .addItem('About JournalNevis', 'showAboutJournalNevis')
    .addToUi();
}

function showAboutJournalNevis() {
  SpreadsheetApp.getUi().alert(
    'JournalNevis v' + JOURNALNEVIS.version + '\n\n' +
    'Automated Trading Journal\n' +
    JOURNALNEVIS.website + '\n\n' +
    'JournalNevis does not place, modify or close trades.'
  );
}

/**
 * Run this after replacing the old Code.gs.
 * It keeps existing trade rows and repairs the v5 schema and supporting sheets.
 */
function setupJournalNevis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open the Google Sheet first, then run setupJournalNevis().');

  const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  const executions = getOrCreateSheet_(ss, SETTINGS.executionsSheet);
  const cashFlow = getOrCreateSheet_(ss, SETTINGS.cashFlowSheet);
  const accounts = getOrCreateSheet_(ss, SETTINGS.accountsSheet);
  const analytics = getOrCreateSheet_(ss, SETTINGS.analyticsSheet);
  const monthly = getOrCreateSheet_(ss, SETTINGS.monthlySheet);
  const symbols = getOrCreateSheet_(ss, SETTINGS.symbolSheet);
  const equityHistory = getOrCreateSheet_(ss, SETTINGS.equityHistorySheet);
  const balanceCurve = getOrCreateSheet_(ss, SETTINGS.balanceCurveSheet);
  const breakdown = getOrCreateSheet_(ss, SETTINGS.breakdownSheet);
  const dashboard = getOrCreateSheet_(ss, SETTINGS.dashboardSheet);
  const settings = getOrCreateSheet_(ss, SETTINGS.settingsSheet);
  const lists = getOrCreateSheet_(ss, SETTINGS.listsSheet);
  const help = getOrCreateSheet_(ss, SETTINGS.helpSheet);

  ensureHeaders_(trades, TRADE_HEADERS);
  ensureHeaders_(executions, EXECUTION_HEADERS);
  ensureHeaders_(cashFlow, CASH_FLOW_HEADERS);
  ensureHeaders_(accounts, ACCOUNT_HEADERS);
  ensureHeaders_(analytics, ANALYTICS_HEADERS);
  ensureHeaders_(monthly, MONTHLY_HEADERS);
  ensureHeaders_(symbols, SYMBOL_HEADERS);
  ensureHeaders_(equityHistory, EQUITY_HISTORY_HEADERS);
  ensureHeaders_(balanceCurve, BALANCE_CURVE_HEADERS);

  ensureSettingsLayout_(settings);
  ensureListsLayoutV57_(lists);
  ensureHelpLayoutV57_(help);
  normalizeTradeSchemaV5_(trades);
  repairReviewStatuses_(trades);
  repairReviewList_(ss);
  repairMissingSymbols_(ss);

  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', ss.getId());

  let secret = String(readSetting_(settings, 'API_SECRET') || '').trim();
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '') +
             Utilities.getUuid().replace(/-/g, '');
  }
  props.setProperty('API_SECRET', secret);

  let folderId = String(readSetting_(settings, 'DRIVE_FOLDER_ID') || '').trim();
  let folder = null;

  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
      folder.getName();
    } catch (err) {
      folder = null;
      folderId = '';
    }
  }

  if (!folder) {
    const requestedName =
      String(readSetting_(settings, 'SCREENSHOT_FOLDER_NAME') || '').trim() ||
      SETTINGS.defaultFolderName;

    // v5: if the spreadsheet was recreated, reuse an existing screenshot root
    // with the same name before creating a new folder. This allows old Drive
    // screenshots to be relinked after FULL SYNC.
    const existingFolders = DriveApp.getFoldersByName(requestedName);
    if (existingFolders.hasNext()) folder = existingFolders.next();
    else folder = DriveApp.createFolder(requestedName);
    folderId = folder.getId();
  }

  props.setProperty('DRIVE_FOLDER_ID', folderId);

  writeSetting_(settings, 'PROFILE_NAME',
    readSetting_(settings, 'PROFILE_NAME') || 'JournalNevis');
  writeSetting_(settings, 'API_SECRET', secret);
  writeSetting_(settings, 'DRIVE_FOLDER_ID', folderId);
  writeSetting_(settings, 'DRIVE_FOLDER_URL', folder.getUrl());
  writeSetting_(settings, 'SPREADSHEET_ID', ss.getId());
  writeSetting_(settings, 'SCREENSHOT_FOLDER_NAME', folder.getName());

  const deployedUrl = ScriptApp.getService().getUrl();
  if (deployedUrl) writeSetting_(settings, 'WEB_APP_URL', deployedUrl);

  formatSheet_(trades);
  formatSheet_(executions);
  formatSheet_(cashFlow);
  formatSheet_(accounts);

  compactAndResequenceTrades_(ss);
  normalizeCashFlows_(ss);
  buildProfessionalLayout_(ss);
  refreshAnalyticsAndDashboard_(ss);
  hideSystemSheets_(ss);

  SpreadsheetApp.flush();

  SpreadsheetApp.getUi().alert(
    'JournalNevis v5.7.1 setup completed.\\n\\n' +
    'Dashboard, Trades, account tracking and screenshot recovery are ready.\\n' +
    'For a clean installation, deploy the Web App and then run FULL SYNC once from MT5.\\n\\n' +
    'IMPORTANT: after changing Apps Script code, create a new Web App deployment version.'
  );
}

function prepareCleanJournalNevis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open the new JournalNevis spreadsheet first.');
  try {
    if (/Trading_Journal|Trade Journal|Untitled/i.test(ss.getName())) {
      ss.rename('JournalNevis - Trading Journal');
    }
  } catch (ignore) {}
  setupJournalNevis();
}

// Backward-compatible alias for older internal instructions.
function setupJournal() {
  return setupJournalNevis();
}

function showConnectionInfo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName(SETTINGS.settingsSheet);
  if (!settings) {
    SpreadsheetApp.getUi().alert('Run setupJournalNevis() first.');
    return;
  }

  const secret = readSetting_(settings, 'API_SECRET') || '';
  const url = ScriptApp.getService().getUrl() ||
              readSetting_(settings, 'WEB_APP_URL') ||
              '(Deploy as a Web App first.)';

  SpreadsheetApp.getUi().alert(
    'Web App URL:\n' + url + '\n\n' +
    'API Secret:\n' + secret + '\n\n' +
    'Use the /exec URL in JournalNevis MT5. Keep the secret private.'
  );
}

function clearLastPing() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName(SETTINGS.settingsSheet);
  if (settings) writeSetting_(settings, 'LAST_PING', '');
}

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'JournalNevis Google Backend',
    version: JOURNALNEVIS.version,
    message: 'Web App is online. MT5 should use POST requests.'
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: 'No POST body received.' });
    }

    const payload = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();

    const expectedSecret = props.getProperty('API_SECRET') || '';
    const receivedSecret = String(payload.secret || '');

    if (!expectedSecret || receivedSecret !== expectedSecret) {
      return jsonResponse_({ ok: false, error: 'Unauthorized: API secret mismatch.' });
    }

    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) {
      return jsonResponse_({
        ok: false,
        error: 'Backend is not configured. Run setupJournalNevis().' 
      });
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const action = String(payload.action || '').toUpperCase();

    switch (action) {
      case 'PING':
        return handlePing_(ss, payload);
      case 'LIVE_BUNDLE':
        return handleLiveBundle_(ss, payload);
      case 'SYNC_BATCH':
        return handleSyncBatch_(ss, payload);
      case 'CASH_BATCH':
        return handleCashBatch_(ss, payload);
      case 'UPSERT_TRADE':
        return handleUpsertTrade_(ss, payload);
      case 'SCREENSHOT':
        return handleScreenshot_(ss, payload);
      case 'SCREENSHOT_STATUS':
        return handleScreenshotStatus_(ss, payload);
      case 'SCREENSHOT_RECONCILE':
        return handleScreenshotReconcile_(ss, payload);
      case 'EXECUTION':
        return handleExecution_(ss, payload);
      case 'CASH_FLOW':
        return handleCashFlow_(ss, payload);
      case 'ACCOUNT_SNAPSHOT':
        return handleAccountSnapshot_(ss, payload);
      case 'SYNC_COMPLETE':
        return handleSyncComplete_(ss, payload);
      default:
        return jsonResponse_({ ok: false, error: 'Unknown action: ' + action });
    }

  } catch (err) {
    return jsonResponse_({
      ok: false,
      error: String(err && err.stack ? err.stack : err)
    });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function handlePing_(ss, p) {
  const settings = ss.getSheetByName(SETTINGS.settingsSheet);
  if (settings) writeSetting_(settings, 'LAST_PING', new Date());

  return jsonResponse_({
    ok: true,
    action: 'PING',
    spreadsheet: ss.getName(),
    profile: p.profile || '',
    message: 'Connection OK'
  });
}


function handleLiveBundle_(ss, p) {
  let tradeResult = null;
  let execResult = null;
  let accountResult = null;

  if (p.trade) {
    p.trade._skip_refresh = true;
    tradeResult = handleUpsertTrade_(ss, p.trade);
  }
  if (p.execution) {
    execResult = handleExecution_(ss, p.execution);
  }
  if (p.account) {
    p.account._skip_refresh = true;
    accountResult = handleAccountSnapshot_(ss, p.account);
  }

  // Keep the critical live request fast. Trade/execution/account data are already stored.
  // Dashboard rebuild is intentionally decoupled from the live trade path so it cannot
  // delay screenshot capture/upload. It refreshes on periodic/manual/full sync or menu refresh.
  SpreadsheetApp.flush();
  return jsonResponse_({ ok:true, action:'LIVE_BUNDLE', message:'Live trade bundle stored.' });
}

function handleCashBatch_(ss, p) {
  const items = Array.isArray(p.items) ? p.items : [];
  let count = 0;
  items.forEach(x => {
    x.sync_status = 'Recovered / Synced';
    handleCashFlow_(ss, x);
    count++;
  });
  return jsonResponse_({ok:true, action:'CASH_BATCH', items:count});
}

/**
 * Creates or updates one trade row.
 * Manual review columns are never overwritten.
 */
function handleUpsertTrade_(ss, p) {
  p = p.trade || p;
  const sheet = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  ensureHeaders_(sheet, TRADE_HEADERS);

  const tradeKey = String(p.trade_key || '');
  if (!tradeKey) {
    return jsonResponse_({ ok: false, error: 'UPSERT_TRADE is missing trade_key.' });
  }

  let row = findRowByValue_(sheet, 'Trade Key', tradeKey);
  const isNew = row === 0;

  if (isNew) {
    row = firstAvailableDataRow_(sheet, 'Trade Key');
    ensureRowExists_(sheet, row);
    setByHeader_(sheet, row, 'Trade Key', tradeKey);
  }

  const openDate = dateFromMillis_(p.open_time_ms);
  const closeDate = dateFromMillis_(p.close_time_ms);
  const status = String(p.status || '');

  const values = {
    'Trade Key': tradeKey,
    'Position ID': text_(p.position_id),
    'Account Login': text_(p.account_login),
    'Server': p.server || '',
    'Broker': p.broker || '',
    'Symbol': resolveIncomingSymbol_(ss, p, row),
    'Direction': p.direction || '',
    'Volume': number_(p.volume),
    'Open Time': openDate,
    'Entry Price': number_(p.entry_price),
    'Stop Loss': numberOrBlank_(p.stop_loss),
    'Take Profit': numberOrBlank_(p.take_profit),
    'Close Time': closeDate,
    'Exit Price': numberOrBlank_(p.exit_price),
    'Exit Reason': p.exit_reason || '',
    'Gross P/L': number_(p.gross_pl),
    'Commission': number_(p.commission),
    'Swap': number_(p.swap),
    'Fee': number_(p.fee),
    'Net P/L': number_(p.net_pl),
    'Holding Min': numberOrBlank_(p.holding_minutes),
    'Entry Deal ID': text_(p.entry_deal_id),
    'Exit Deal ID': text_(p.exit_deal_id),
    'Magic': text_(p.magic),
    'Source': p.source || '',
    'Status': status,
    'Last Updated': new Date(),
    'Weekday': weekday_(ss, openDate),
    'Session': session_(ss, openDate),
    'Journal Timeframe': p.journal_timeframe || '',
    'Last Sync': new Date()
  };

  setManyByHeader_(sheet, row, values);

  // Preserve recovery information. A later live close should not erase
  // the fact that the entry was reconstructed after the terminal was offline.
  const syncCell = getCellByHeader_(sheet, row, 'Sync Status');
  if (syncCell && p.sync_status) {
    const currentSync = String(syncCell.getValue() || '').trim();
    const incomingSync = String(p.sync_status || '').trim();

    if (currentSync.startsWith('Recovered') && incomingSync === 'Live') {
      syncCell.setValue('Recovered earlier / Live update');
    } else if (currentSync === 'Live' && incomingSync.startsWith('Recovered')) {
      // Do not downgrade a trade that was already captured live.
    } else {
      syncCell.setValue(incomingSync);
    }
  }

  if (p.recovery_note) {
    setIfBlankByHeader_(sheet, row, 'Recovery Note', p.recovery_note);
  }

  // Compatibility: the old sheet has a Timeframe column. We only use it
  // as a journal/screenshot-chart timeframe; it is NOT claimed to be the
  // chart from which a manual trade was placed.
  if (p.journal_timeframe) {
    setByHeader_(sheet, row, 'Timeframe', p.journal_timeframe);
  }

  // Recovered rows explain missing historical screenshots, but do not
  // overwrite links/statuses that already exist from live capture.
  if (p.entry_screenshot_status) {
    setScreenshotStatusIfNoUrl_(sheet, row, 'ENTRY', p.entry_screenshot_status);
  }
  if (p.exit_screenshot_status) {
    setScreenshotStatusIfNoUrl_(sheet, row, 'EXIT', p.exit_screenshot_status);
  }

  const reviewCell = getCellByHeader_(sheet, row, 'Review Status');
  if (reviewCell) {
    const current = String(reviewCell.getValue() || '').trim();

    if (status === 'Closed') {
      if (!current || current === 'Pending') {
        reviewCell.setValue('Pending Review');
      }
    } else if (status === 'Open' && isNew) {
      reviewCell.clearContent();
    }
  }

  // Do not force SpreadsheetApp.flush() for every history-recovery row.
  // Apps Script commits writes when the request finishes, and avoiding a
  // per-row flush makes large MT5 FULL SYNC runs faster and less likely
  // to hit client/server timeouts.
  if (!String(p.sync_status || '').startsWith('Recovered')) {
    SpreadsheetApp.flush();
  }

  // History recovery can upsert many rows; refresh once at SYNC_COMPLETE.
  // Live closes refresh the professional dashboard immediately.
  if (!p._skip_refresh && status === 'Closed' &&
      !String(p.sync_status || '').startsWith('Recovered')) {
    compactAndResequenceTrades_(ss);
    normalizeCashFlows_(ss);
    refreshAnalyticsAndDashboard_(ss);
  }

  return jsonResponse_({
    ok: true,
    action: 'UPSERT_TRADE',
    row: row,
    created: isNew,
    status: status
  });
}

/**
 * Separate image endpoint. A failed image upload cannot prevent the
 * trade row from being created/closed.
 */
function handleScreenshot_(ss, p) {
  const sheet = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  ensureHeaders_(sheet, TRADE_HEADERS);

  const tradeKey = String(p.trade_key || '');
  const slot = String(p.slot || '').toUpperCase();

  if (!tradeKey) {
    return jsonResponse_({ ok: false, error: 'SCREENSHOT is missing trade_key.' });
  }
  if (slot !== 'ENTRY' && slot !== 'EXIT') {
    return jsonResponse_({ ok: false, error: 'SCREENSHOT slot must be ENTRY or EXIT.' });
  }

  let row = findTradeRowForScreenshot_(sheet, tradeKey, p.position_id);
  if (!row) {
    row = firstAvailableDataRow_(sheet, 'Trade Key');
    ensureRowExists_(sheet, row);
    setByHeader_(sheet, row, 'Trade Key', tradeKey);
    if (p.position_id) setByHeader_(sheet, row, 'Position ID', text_(p.position_id));
    if (p.symbol) setByHeader_(sheet, row, 'Symbol', p.symbol);
    setByHeader_(sheet, row, 'Sync Status', 'Live screenshot arrived before trade data');
  }

  if (!p.screenshot_base64) {
    return jsonResponse_({ ok: false, error: 'No screenshot_base64 received.' });
  }

  const screenshotUrl = saveScreenshot_(p, slot);

  setScreenshotLink_(sheet, row, slot, screenshotUrl);
  if (slot === 'ENTRY') {
    setByHeader_(sheet, row, 'Entry Screenshot TF', p.timeframe || '');
    setByHeader_(sheet, row, 'Entry Screenshot Status', 'Captured / Linked');
  } else {
    setByHeader_(sheet, row, 'Exit Screenshot TF', p.timeframe || '');
    setByHeader_(sheet, row, 'Exit Screenshot Status', 'Captured / Linked');
  }

  setByHeader_(sheet, row, 'Last Updated', new Date());
  setByHeader_(sheet, row, 'Last Sync', new Date());

  SpreadsheetApp.flush();

  return jsonResponse_({
    ok: true,
    action: 'SCREENSHOT',
    slot: slot,
    row: row,
    screenshot_url: screenshotUrl
  });
}

function handleScreenshotStatus_(ss, p) {
  const sheet = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  ensureHeaders_(sheet, TRADE_HEADERS);

  const tradeKey = String(p.trade_key || '');
  const slot = String(p.slot || '').toUpperCase();
  const status = String(p.status || '');

  if (!tradeKey || (slot !== 'ENTRY' && slot !== 'EXIT')) {
    return jsonResponse_({ ok: false, error: 'Invalid SCREENSHOT_STATUS request.' });
  }

  const row = findRowByValue_(sheet, 'Trade Key', tradeKey);
  if (!row) {
    return jsonResponse_({ ok: false, error: 'Trade row not found.' });
  }

  setScreenshotStatusIfNoUrl_(sheet, row, slot, status);

  if (p.timeframe) {
    const tfHeader = slot === 'ENTRY' ? 'Entry Screenshot TF' : 'Exit Screenshot TF';
    setIfBlankByHeader_(sheet, row, tfHeader, p.timeframe);
  }

  setByHeader_(sheet, row, 'Last Sync', new Date());

  return jsonResponse_({ ok: true, action: 'SCREENSHOT_STATUS', row: row });
}

function handleExecution_(ss, p) {
  p = p.execution || p;
  const sheet = getOrCreateSheet_(ss, SETTINGS.executionsSheet);
  ensureHeaders_(sheet, EXECUTION_HEADERS);

  const dealId = text_(p.deal_id);
  if (!dealId) {
    return jsonResponse_({ ok: false, error: 'EXECUTION is missing deal_id.' });
  }

  const existing = findRowByValue_(sheet, 'Deal ID', dealId);
  if (existing) {
    return jsonResponse_({
      ok: true,
      action: 'EXECUTION',
      duplicate: true,
      row: existing
    });
  }

  const row = Math.max(sheet.getLastRow() + 1, 2);
  ensureRowExists_(sheet, row);

  const values = {
    'Deal ID': dealId,
    'Trade Key': p.trade_key || '',
    'Position ID': text_(p.position_id),
    'Account Login': text_(p.account_login),
    'Server': p.server || '',
    'Symbol': p.symbol || '',
    'Time': dateFromMillis_(p.time_ms),
    'Deal Entry': p.deal_entry || '',
    'Deal Type': p.deal_type || '',
    'Volume': number_(p.volume),
    'Price': number_(p.price),
    'Profit': number_(p.profit),
    'Commission': number_(p.commission),
    'Swap': number_(p.swap),
    'Fee': number_(p.fee),
    'Reason': p.reason || '',
    'Magic': text_(p.magic),
    'Comment': p.comment || ''
  };

  setManyByHeader_(sheet, row, values);
  return jsonResponse_({ ok: true, action: 'EXECUTION', row: row });
}


function handleCashFlow_(ss, p) {
  const sheet = getOrCreateSheet_(ss, SETTINGS.cashFlowSheet);
  ensureHeaders_(sheet, CASH_FLOW_HEADERS);

  const dealId = text_(p.deal_id);
  if (!dealId) {
    return jsonResponse_({ ok: false, error: 'CASH_FLOW is missing deal_id.' });
  }

  let row = findRowByValue_(sheet, 'Deal ID', dealId);
  const isNew = row === 0;

  if (isNew) {
    row = firstAvailableDataRow_(sheet, 'Deal ID');
    ensureRowExists_(sheet, row);
  }

  const values = {
    'Deal ID': dealId,
    'Account Login': text_(p.account_login),
    'Server': p.server || '',
    'Time': dateFromMillis_(p.time_ms),
    'Raw Type': p.raw_type || '',
    'Amount': number_(p.amount),
    'Comment': p.comment || '',
    'Source': p.source || '',
    'Last Sync': new Date()
  };

  setManyByHeader_(sheet, row, values);

  // JournalNevis v5.7: live writes stay fast. Dashboard/normalization is performed once
  // at the end of SYNC TODAY / FULL SYNC (or from the spreadsheet menu).

  return jsonResponse_({
    ok: true,
    action: 'CASH_FLOW',
    row: row,
    created: isNew
  });
}

function handleAccountSnapshot_(ss, p) {
  p = p.account || p;
  const sheet = getOrCreateSheet_(ss, SETTINGS.accountsSheet);
  const hist = getOrCreateSheet_(ss, SETTINGS.equityHistorySheet);
  ensureHeaders_(sheet, ACCOUNT_HEADERS);
  ensureHeaders_(hist, EQUITY_HISTORY_HEADERS);

  const accountKey = String(p.account_login || '') + '|' + String(p.server || '');
  if (!String(p.account_login || '')) {
    return jsonResponse_({ ok: false, error: 'ACCOUNT_SNAPSHOT is missing account_login.' });
  }

  let row = findRowByValue_(sheet, 'Account Key', accountKey);
  if (!row) {
    row = firstAvailableDataRow_(sheet, 'Account Key');
    ensureRowExists_(sheet, row);
  }

  const now = new Date();
  setManyByHeader_(sheet, row, {
    'Account Key': accountKey,
    'Account Login': text_(p.account_login),
    'Server': p.server || '',
    'Broker': p.broker || '',
    'Currency': p.currency || '',
    'Balance': number_(p.balance),
    'Equity': number_(p.equity),
    'Credit': number_(p.credit),
    'Floating P/L': number_(p.floating_pl),
    'Margin': number_(p.margin),
    'Free Margin': number_(p.free_margin),
    'Last Updated': now
  });

  // v4 keeps a sparse observed equity history. It is not tick-by-tick, so the
  // dashboard labels its equity drawdown as "Observed Equity Drawdown".
  let append = true;
  if (hist.getLastRow() >= 2) {
    const hmap = headerMap_(hist);
    const last = hist.getRange(hist.getLastRow(),1,1,hist.getLastColumn()).getValues()[0];
    const lastKey = String(last[hmap['Account Key']-1] || '');
    const lastMs = toMillis_(last[hmap['Time']-1]);
    if (lastKey === accountKey && lastMs && (Date.now() - lastMs) < 30000) append = false;
  }

  if (append) {
    const hrow = Math.max(hist.getLastRow()+1,2);
    ensureRowExists_(hist,hrow);
    setManyByHeader_(hist,hrow,{
      'Account Key': accountKey,
      'Time': now,
      'Balance': number_(p.balance),
      'Equity': number_(p.equity),
      'Floating P/L': number_(p.floating_pl),
      'Credit': number_(p.credit),
      'Margin': number_(p.margin),
      'Free Margin': number_(p.free_margin)
    });
  }

  if (!p._skip_refresh) refreshAnalyticsAndDashboard_(ss);
  return jsonResponse_({ ok: true, action: 'ACCOUNT_SNAPSHOT', row: row });
}

function handleSyncComplete_(ss, p) {
  repairMissingSymbols_(ss);

  // JournalNevis v5.7: schema migration belongs to setupJournalNevis(), not every sync.
  // Screenshot relinking is its own Stage 3 action.
  compactAndResequenceTrades_(ss);
  normalizeCashFlows_(ss);
  refreshAnalyticsAndDashboard_(ss);
  hideSystemSheets_(ss);

  return jsonResponse_({
    ok: true,
    action: 'SYNC_COMPLETE',
    mode: String(p.sync_mode || ''),
    trades: number_(p.trade_count),
    cash_flows: number_(p.cash_flow_count),
    message: 'JournalNevis v5.7 Stage 4 completed; rows preserved and dashboard refreshed once.'
  });
}

/**
 * Drive organization:
 * JournalNevis Screenshots / YYYY / YYYY-MM / SYMBOL /
 */
function saveScreenshot_(p, slot) {
  const props = PropertiesService.getScriptProperties();
  const rootFolderId = props.getProperty('DRIVE_FOLDER_ID');
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');

  if (!rootFolderId || !spreadsheetId) {
    throw new Error('Drive/backend not configured. Run setupJournalNevis().');
  }

  const ss = SpreadsheetApp.openById(spreadsheetId);
  const tz = ss.getSpreadsheetTimeZone();

  const eventMs = Number(p.event_time_ms || Date.now());
  const eventDate = new Date(eventMs);
  const year = Utilities.formatDate(eventDate, tz, 'yyyy');
  const month = Utilities.formatDate(eventDate, tz, 'yyyy-MM');
  const symbol = sanitizeName_(p.symbol || 'UNKNOWN');

  let folder = DriveApp.getFolderById(rootFolderId);
  folder = getOrCreateChildFolder_(folder, year);
  folder = getOrCreateChildFolder_(folder, month);
  folder = getOrCreateChildFolder_(folder, symbol);

  const fallbackName =
    'TJ_' + text_(p.position_id) + '_' + slot + '_' +
    Utilities.formatDate(eventDate, tz, 'yyyyMMdd_HHmmss') + '.png';

  const filename = sanitizeName_(p.screenshot_name || fallbackName);

  // HTTP retries reuse the same file rather than creating duplicates.
  const existing = folder.getFilesByName(filename);
  if (existing.hasNext()) return existing.next().getUrl();

  const bytes = Utilities.base64Decode(String(p.screenshot_base64));
  const blob = Utilities.newBlob(bytes, 'image/png', filename);
  return folder.createFile(blob).getUrl();
}

function getOrCreateChildFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function setScreenshotStatusIfNoUrl_(sheet, row, slot, status) {
  if (!status) return;

  const urlHeader = slot === 'ENTRY' ? 'Entry Screenshot' : 'Exit Screenshot';
  const statusHeader = slot === 'ENTRY' ?
    'Entry Screenshot Status' : 'Exit Screenshot Status';

  const urlCell = getCellByHeader_(sheet, row, urlHeader);
  if (urlCell && String(urlCell.getValue() || '').trim()) return;

  setByHeader_(sheet, row, statusHeader, status);
}

function repairReviewStatuses_(sheet) {
  const map = headerMap_(sheet);
  if (!map['Review Status'] || sheet.getLastRow() < 2) return;

  const range = sheet.getRange(2, map['Review Status'], sheet.getLastRow() - 1, 1);
  const values = range.getValues();
  let changed = false;

  values.forEach(r => {
    if (String(r[0] || '').trim() === 'Pending') {
      r[0] = 'Pending Review';
      changed = true;
    }
  });

  if (changed) range.setValues(values);
}

function repairReviewList_(ss) {
  const sheet = ss.getSheetByName(SETTINGS.listsSheet);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      if (String(data[r][c] || '').trim() === 'Pending') {
        sheet.getRange(r + 1, c + 1).setValue('Pending Review');
      }
    }
  }
}


function normalizeAndRefresh() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  compactAndResequenceTrades_(ss);
  normalizeCashFlows_(ss);
  refreshAnalyticsAndDashboard_(ss);
  SpreadsheetApp.getUi().alert('Trades and cash flows were compacted, sorted, and resequenced.');
}

function firstAvailableDataRow_(sheet, keyHeader) {
  const map = headerMap_(sheet);
  const col = map[keyHeader];
  if (!col) return Math.max(sheet.getLastRow() + 1, 2);

  const maxRow = Math.max(sheet.getLastRow(), 2);
  if (maxRow < 2) return 2;

  const values = sheet.getRange(2, col, Math.max(maxRow - 1, 1), 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (!String(values[i][0] || '').trim()) return i + 2;
  }
  return maxRow + 1;
}

function compactAndResequenceTrades_(ss) {
  const sheet = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  ensureHeaders_(sheet, TRADE_HEADERS);

  let lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;

  const map = headerMap_(sheet);
  const important = [
    map['Trade Key'], map['Position ID'], map['Symbol'], map['Open Time'],
    map['Entry Price'], map['Entry Deal ID']
  ].filter(Boolean);

  // Delete only genuinely empty gaps, from bottom to top.
  // Row deletion preserves formulas/hyperlinks, validation and user journal fields.
  const values = sheet.getRange(2,1,lastRow-1,lastCol).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    const meaningful = important.some(c => {
      const v = values[i][c-1];
      return v !== '' && v !== null;
    });
    if (!meaningful) sheet.deleteRow(i + 2);
  }

  lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const openCol = map['Open Time'];
  const posCol = map['Position ID'];
  const tradeNoCol = map['Trade #'];

  // Native Sheets sort moves entire rows and therefore preserves screenshot
  // HYPERLINK formulas and manually entered Setup/Emotion/Notes exactly.
  sheet.getRange(2,1,lastRow-1,lastCol).sort([
    {column: openCol, ascending: true},
    {column: posCol, ascending: true}
  ]);

  const tradeNos = Array.from({length:lastRow-1}, (_,i) => [i+1]);
  sheet.getRange(2,tradeNoCol,tradeNos.length,1).setValues(tradeNos);
}

function normalizeCashFlows_(ss) {
  const sheet = getOrCreateSheet_(ss, SETTINGS.cashFlowSheet);
  ensureHeaders_(sheet, CASH_FLOW_HEADERS);

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return;

  const map = headerMap_(sheet);
  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const dealCol = map['Deal ID'] - 1;
  const timeCol = map['Time'] - 1;
  const rawCol = map['Raw Type'] - 1;
  const catCol = map['Category'] - 1;
  const amountCol = map['Amount'] - 1;
  const runningCol = map['Running Cash Flow'] - 1;
  const eventCol = map['Event #'] - 1;

  const rows = values.filter(r => String(r[dealCol] || '').trim());
  rows.sort((a, b) => toMillis_(a[timeCol]) - toMillis_(b[timeCol]));

  const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  ensureHeaders_(trades, TRADE_HEADERS);
  const tmap = headerMap_(trades);
  let firstTradeMs = 0;
  if (trades.getLastRow() >= 2 && tmap['Open Time']) {
    const opens = trades
      .getRange(2, tmap['Open Time'], trades.getLastRow() - 1, 1)
      .getValues()
      .map(r => toMillis_(r[0]))
      .filter(v => v > 0);
    if (opens.length) firstTradeMs = Math.min.apply(null, opens);
  }

  let running = 0;
  let initialAssigned = false;

  rows.forEach((r, i) => {
    const raw = String(r[rawCol] || '');
    const amount = Number(r[amountCol] || 0);
    const eventMs = toMillis_(r[timeCol]);
    let category = classifyCashFlow_(raw, amount);

    if (raw === 'Balance' && amount > 0) {
      if ((firstTradeMs > 0 && eventMs <= firstTradeMs) ||
          (firstTradeMs === 0 && !initialAssigned)) {
        category = 'Initial Capital';
        initialAssigned = true;
      } else {
        category = 'Deposit';
      }
    }

    if (category === 'Initial Capital') initialAssigned = true;

    running += amount;
    r[eventCol] = i + 1;
    r[catCol] = category;
    r[runningCol] = running;
  });

  sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  if (rows.length) {
    ensureRowExists_(sheet, rows.length + 1);
    sheet.getRange(2, 1, rows.length, lastCol).setValues(rows);
  }
}

function classifyCashFlow_(raw, amount) {
  if (raw === 'Balance') return amount < 0 ? 'Withdrawal' : 'Deposit';
  if (raw === 'Credit') return amount < 0 ? 'Credit Out' : 'Credit In';
  if (raw === 'Bonus') return 'Bonus';
  if (raw === 'Additional charge' || raw === 'Charge') return 'Charge';
  if (raw === 'Correction') return 'Correction';
  if (raw.indexOf('commission') >= 0 || raw.indexOf('Commission') >= 0)
    return 'Account Commission';
  if (raw.indexOf('Interest') >= 0) return 'Interest';
  if (raw.indexOf('Dividend') >= 0) return 'Dividend';
  if (raw.indexOf('Tax') >= 0) return 'Tax';
  return raw || 'Account Adjustment';
}

function toMillis_(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') {
    // Google Sheets serial dates normally appear as Date through getValues(),
    // but handle numeric timestamps defensively.
    if (v > 100000000000) return v;
    if (v > 1000000000) return v * 1000;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}


function resolveIncomingSymbol_(ss, p, tradeRow) {
  const incoming = String(p.symbol || '').trim();
  if (incoming) return incoming;

  const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  const current = getCellByHeader_(trades, tradeRow, 'Symbol');
  const currentValue = current ? String(current.getValue() || '').trim() : '';
  if (currentValue) return currentValue;

  const executions = getOrCreateSheet_(ss, SETTINGS.executionsSheet);
  ensureHeaders_(executions, EXECUTION_HEADERS);
  const emap = headerMap_(executions);
  if (executions.getLastRow() >= 2) {
    const tradeKey = String(p.trade_key || '');
    const positionId = text_(p.position_id);
    const rows = executions.getRange(2,1,executions.getLastRow()-1,executions.getLastColumn()).getValues();
    for (let i=rows.length-1;i>=0;i--) {
      const key = String(rows[i][emap['Trade Key']-1] || '');
      const pos = String(rows[i][emap['Position ID']-1] || '');
      const sym = String(rows[i][emap['Symbol']-1] || '').trim();
      if (sym && ((tradeKey && key===tradeKey) || (positionId && pos===positionId))) return sym;
    }
  }
  return '';
}

function repairMissingSymbols_(ss) {
  const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  const executions = getOrCreateSheet_(ss, SETTINGS.executionsSheet);
  ensureHeaders_(trades, TRADE_HEADERS);
  ensureHeaders_(executions, EXECUTION_HEADERS);
  if (trades.getLastRow() < 2 || executions.getLastRow() < 2) return;

  const tmap = headerMap_(trades);
  const emap = headerMap_(executions);
  const execRows = executions.getRange(2,1,executions.getLastRow()-1,executions.getLastColumn()).getValues();
  const byKey = {};
  const byPos = {};

  execRows.forEach(r => {
    const sym = String(r[emap['Symbol']-1] || '').trim();
    if (!sym) return;
    const key = String(r[emap['Trade Key']-1] || '');
    const pos = String(r[emap['Position ID']-1] || '');
    if (key) byKey[key] = sym;
    if (pos) byPos[pos] = sym;
  });

  const range = trades.getRange(2,1,trades.getLastRow()-1,trades.getLastColumn());
  const rows = range.getValues();
  let changed = false;

  rows.forEach(r => {
    const col = tmap['Symbol']-1;
    if (String(r[col] || '').trim()) return;
    const key = String(r[tmap['Trade Key']-1] || '');
    const pos = String(r[tmap['Position ID']-1] || '');
    const sym = byKey[key] || byPos[pos] || '';
    if (sym) {
      r[col] = sym;
      changed = true;
    }
  });

  if (changed) range.setValues(rows);
}

function mt5DrawdownStats_(events, initialCapital) {
  let balance = 0;
  let minBalance = Number.POSITIVE_INFINITY;
  let peak = 0;
  let maximalDD = 0;
  let maximalDDPct = 0;
  let relativeDDPct = 0;
  let relativeDDMoney = 0;
  const curve = [];

  events.sort((a,b) => a.time-b.time || a.order-b.order);

  events.forEach((e, idx) => {
    balance += e.change;
    if (idx===0 || balance > peak) peak = balance;
    minBalance = Math.min(minBalance, balance);

    const dd = Math.max(0, peak-balance);
    const ddPct = peak>0 ? dd/peak : 0;

    if (dd > maximalDD) {
      maximalDD = dd;
      maximalDDPct = ddPct;
    }
    if (ddPct > relativeDDPct) {
      relativeDDPct = ddPct;
      relativeDDMoney = dd;
    }

    curve.push([
      new Date(e.time), e.event, e.symbol || '', e.tradeNo || '',
      e.change, balance, peak, dd, ddPct
    ]);
  });

  const absoluteDD = initialCapital>0 && Number.isFinite(minBalance)
    ? Math.max(0, initialCapital-minBalance) : 0;

  return {
    curve, balance, minBalance:Number.isFinite(minBalance)?minBalance:0,
    absoluteDD, maximalDD, maximalDDPct, relativeDDPct, relativeDDMoney
  };
}

function observedEquityDrawdown_(ss) {
  const sheet = getOrCreateSheet_(ss, SETTINGS.equityHistorySheet);
  ensureHeaders_(sheet, EQUITY_HISTORY_HEADERS);
  if (sheet.getLastRow()<2) return {maxDD:0,maxDDPct:0,minEquity:0};

  const map=headerMap_(sheet);
  const rows=sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getValues()
    .filter(r => Number(r[map['Equity']-1])>0)
    .sort((a,b)=>toMillis_(a[map['Time']-1])-toMillis_(b[map['Time']-1]));

  let peak=0,maxDD=0,maxPct=0,minEq=Number.POSITIVE_INFINITY;
  rows.forEach(r=>{
    const eq=Number(r[map['Equity']-1]||0);
    peak=Math.max(peak,eq);
    minEq=Math.min(minEq,eq);
    const dd=Math.max(0,peak-eq);
    const pct=peak>0?dd/peak:0;
    maxDD=Math.max(maxDD,dd);
    maxPct=Math.max(maxPct,pct);
  });
  return {maxDD,maxDDPct:maxPct,minEquity:Number.isFinite(minEq)?minEq:0};
}

function symbolSummaryRows_(symbolMap) {
  return Object.keys(symbolMap).sort().map(symbol=>{
    const x=symbolMap[symbol];
    const lossesAbs=Math.abs(x.grossLoss);
    return [
      symbol,x.trades,x.wins,x.losses,x.trades?x.wins/x.trades:0,
      x.net,x.grossProfit,x.grossLoss,
      lossesAbs>0?x.grossProfit/lossesAbs:(x.grossProfit>0?x.grossProfit:0),
      x.commission,x.swap,x.fee,x.commission+x.swap+x.fee,
      x.trades?x.net/x.trades:0,x.best,x.worst,
      x.holdingCount?x.holding/x.holdingCount:0,x.volume,x.longTrades,x.shortTrades
    ];
  });
}

function addBreakdown_(map,key,net,commission) {
  if(!map[key])map[key]={trades:0,wins:0,losses:0,net:0,commission:0,largestWin:0,largestLoss:0};
  const x=map[key];
  x.trades++;x.net+=net;x.commission+=commission;
  if(net>0){x.wins++;x.largestWin=Math.max(x.largestWin,net);}
  if(net<0){x.losses++;x.largestLoss=Math.min(x.largestLoss,net);}
}

function summaryRows_(map) {
  return Object.keys(map).sort().map(k=>{
    const x=map[k];
    return [k,x.trades,x.wins,x.losses,x.trades?x.wins/x.trades:0,x.net,x.commission];
  });
}

function writeBreakdownSheet_(sheet,symbolMap,directionMap,sessionMap,weekdayMap) {
  sheet.clear();
  sheet.setHiddenGridlines(true);

  const simpleSymbolMap={};
  Object.keys(symbolMap).forEach(k=>{
    const x=symbolMap[k];
    simpleSymbolMap[k]={
      trades:x.trades,wins:x.wins,losses:x.losses,net:x.net,
      commission:x.commission,largestWin:x.best,largestLoss:x.worst
    };
  });

  const blocks=[
    {title:'BY SYMBOL',startCol:1,map:simpleSymbolMap},
    {title:'BY DIRECTION',startCol:9,map:directionMap},
    {title:'BY SESSION',startCol:17,map:sessionMap},
    {title:'BY WEEKDAY',startCol:25,map:weekdayMap}
  ];

  blocks.forEach(b=>{
    const headers=['Group','Trades','Wins','Losses','Win Rate','Net P/L','Commission'];
    sheet.getRange(1,b.startCol,1,7).merge().setValue(b.title)
      .setBackground('#101827').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.getRange(2,b.startCol,1,7).setValues([headers])
      .setBackground('#2563EB').setFontColor('#FFFFFF').setFontWeight('bold');
    const rows=summaryRows_(b.map);
    if(rows.length){
      sheet.getRange(3,b.startCol,rows.length,7).setValues(rows);
      sheet.getRange(3,b.startCol+4,rows.length,1).setNumberFormat('0.0%');
      sheet.getRange(3,b.startCol+5,rows.length,2).setNumberFormat('#,##0.00;[Red]-#,##0.00');
    }
  });
  sheet.setFrozenRows(2);
}

function ensureSettingsLayout_(sheet) {
  if (sheet.getLastRow() < 3) {
    sheet.getRange('A1:C1').merge();
    sheet.getRange('A1').setValue('JOURNALNEVIS SETTINGS');
    sheet.getRange('A3:C3').setValues([['Key','Value','What it is for']]);
  }

  const defaults = {
    PROFILE_NAME: 'JournalNevis',
    API_SECRET: '',
    DRIVE_FOLDER_ID: '',
    DRIVE_FOLDER_URL: '',
    SPREADSHEET_ID: '',
    WEB_APP_URL: '',
    LAST_PING: '',
    SCREENSHOT_FOLDER_NAME: SETTINGS.defaultFolderName
  };

  Object.keys(defaults).forEach(key => {
    if (findSettingRow_(sheet, key) === 0) {
      const row = Math.max(sheet.getLastRow() + 1, 4);
      sheet.getRange(row, 1, 1, 3).setValues([[key, defaults[key], '']]);
    }
  });
}


function ensureListsLayoutV57_(sheet) {
  sheet.clear();
  sheet.getRange('A1:D1').setValues([['Setup','Emotion','Mistake','Review Status']]);
  const rows = [
    ['Breakout','Calm','None','Pending Review'],
    ['Pullback','Focused','Early Entry','Reviewed'],
    ['Reversal','Confident','Late Entry','Needs Follow-up'],
    ['Trend Continuation','Patient','Oversized Risk',''],
    ['Range Bounce','Hesitant','No Stop Loss',''],
    ['Liquidity Sweep','Anxious','Moved Stop Loss',''],
    ['News Reaction','FOMO','Closed Early',''],
    ['Scalp Setup','Revenge','Overtrading',''],
    ['Swing Setup','Tired','Ignored Plan',''],
    ['Other','Neutral','Other','']
  ];
  sheet.getRange(2,1,rows.length,4).setValues(rows);
  sheet.getRange('A1:D1').setBackground('#101827').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setFrozenRows(1);
  ['A','B','C','D'].forEach((col,i)=> sheet.setColumnWidth(i+1, i===3 ? 130 : 140));
}

function ensureHelpLayoutV57_(sheet) {
  sheet.clear();
  sheet.setHiddenGridlines(true);
  sheet.getRange('A1:F1').merge().setValue('JournalNevis Help').setBackground('#101827').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(16);
  sheet.getRange('A3:B10').setValues([
    ['1. Setup','Open Extensions > Apps Script, paste the new JournalNevis_v5_7.gs code, save, deploy Web App, then run setupJournalNevis once.'],
    ['2. MT5 EA','Place JournalNevis_v5_7.mq5 in MQL5/Experts, compile it, add it to one chart, then paste the Web App URL and API secret.'],
    ['3. Full Sync','Use FULL SYNC only when you want a complete rebuild from account history and screenshot reconciliation.'],
    ['4. Sync Today','Use SYNC TODAY for normal daily work. It focuses on today and avoids heavy full-history processing.'],
    ['5. Screenshots','Entry and exit screenshots are sent separately so a screenshot issue does not block trade data.'],
    ['6. Trades sheet','Setup, Entry Reason, Emotion, Mistake, Notes and Review Status stay editable by you.'],
    ['7. Visible sheets','Dashboard, Trades, Accounts, Settings and Help stay visible by default.'],
    ['8. Website','Branding: JournalNevis • JournalNevis.ir']
  ]);
  sheet.getRange('A3:A10').setFontWeight('bold');
  sheet.setColumnWidth(1,140);
  sheet.setColumnWidth(2,720);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/**
 * Adds missing headers without moving/deleting existing columns.
 */
function ensureHeaders_(sheet, requiredHeaders) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  if (existing.filter(String).length === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }

  let appendCol = lastCol + 1;
  requiredHeaders.forEach(header => {
    if (existing.indexOf(header) === -1) {
      sheet.getRange(1, appendCol).setValue(header);
      existing.push(header);
      appendCol++;
    }
  });
}

function headerMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    if (h !== '') map[String(h)] = i + 1;
  });
  return map;
}

function setManyByHeader_(sheet, row, obj) {
  const map = headerMap_(sheet);
  Object.keys(obj).forEach(header => {
    const col = map[header];
    if (col) sheet.getRange(row, col).setValue(obj[header]);
  });
}

function setByHeader_(sheet, row, header, value) {
  const map = headerMap_(sheet);
  if (map[header]) sheet.getRange(row, map[header]).setValue(value);
}

function setIfBlankByHeader_(sheet, row, header, value) {
  const cell = getCellByHeader_(sheet, row, header);
  if (cell && !String(cell.getValue() || '').trim()) cell.setValue(value);
}

function getCellByHeader_(sheet, row, header) {
  const map = headerMap_(sheet);
  return map[header] ? sheet.getRange(row, map[header]) : null;
}

function findRowByValue_(sheet, header, value) {
  const map = headerMap_(sheet);
  const col = map[header];
  if (!col || sheet.getLastRow() < 2) return 0;

  const cell = sheet
    .getRange(2, col, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(value))
    .matchEntireCell(true)
    .findNext();

  return cell ? cell.getRow() : 0;
}

function ensureRowExists_(sheet, row) {
  if (row > sheet.getMaxRows()) {
    sheet.insertRowsAfter(sheet.getMaxRows(), row - sheet.getMaxRows());
  }
}

function findSettingRow_(sheet, key) {
  if (sheet.getLastRow() < 1) return 0;
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) return i + 1;
  }
  return 0;
}

function readSetting_(sheet, key) {
  const row = findSettingRow_(sheet, key);
  return row ? sheet.getRange(row, 2).getValue() : '';
}

function writeSetting_(sheet, key, value) {
  let row = findSettingRow_(sheet, key);
  if (!row) {
    row = Math.max(sheet.getLastRow() + 1, 4);
    sheet.getRange(row, 1).setValue(key);
  }
  sheet.getRange(row, 2).setValue(value);
}

function formatSheet_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  sheet.getRange(1, 1, 1, lastCol)
    .setFontWeight('bold')
    .setBackground('#1F4E78')
    .setFontColor('#FFFFFF')
    .setWrap(true);
  sheet.setFrozenRows(1);
}

function dateFromMillis_(value) {
  const n = Number(value || 0);
  return n > 0 ? new Date(n) : '';
}

function weekday_(ss, date) {
  if (!(date instanceof Date)) return '';
  return Utilities.formatDate(date, ss.getSpreadsheetTimeZone(), 'EEE');
}

function session_(ss, date) {
  if (!(date instanceof Date)) return '';
  const hour = Number(Utilities.formatDate(date, ss.getSpreadsheetTimeZone(), 'H'));
  if (hour < 8) return 'Asia';
  if (hour < 13) return 'London';
  if (hour < 21) return 'New York';
  return 'Late';
}

function number_(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function numberOrBlank_(value) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  return Number.isFinite(n) && n !== 0 ? n : '';
}

function text_(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function sanitizeName_(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 180);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================================
// TRADE JOURNAL PRO v5 OVERRIDE LAYER
// ============================================================================

function v5Header_(sheet, header) {
  const map = headerMap_(sheet);
  return map[header] || 0;
}

function normalizeTradeSchemaV5_(sheet) {
  if (!sheet) return;

  const desired = TRADE_HEADERS.slice();
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const oldHeaders = sheet.getRange(1,1,1,lastCol).getValues()[0].map(String);

  // Nothing to migrate for a brand-new blank sheet.
  if (oldHeaders.filter(x => x.trim()).length === 0) {
    sheet.getRange(1,1,1,desired.length).setValues([desired]);
    return;
  }

  const rows = lastRow >= 2
    ? sheet.getRange(2,1,lastRow-1,lastCol).getValues()
    : [];
  const formulas = lastRow >= 2
    ? sheet.getRange(2,1,lastRow-1,lastCol).getFormulas()
    : [];

  const oldMap = {};
  oldHeaders.forEach((h,i)=>{ if(h) oldMap[h]=i; });

  const out = rows.map(r => desired.map(h => oldMap[h] !== undefined ? r[oldMap[h]] : ''));
  const outFormulas = formulas.map(r => desired.map(h => oldMap[h] !== undefined ? r[oldMap[h]] : ''));

  sheet.clearContents();
  sheet.getRange(1,1,1,desired.length).setValues([desired]);
  if (out.length) {
    sheet.getRange(2,1,out.length,desired.length).setValues(out);
    for (let rr=0; rr<outFormulas.length; rr++) {
      for (let cc=0; cc<outFormulas[rr].length; cc++) {
        if (outFormulas[rr][cc]) sheet.getRange(rr+2,cc+1).setFormula(outFormulas[rr][cc]);
      }
    }
  }
  formatTradeSheetV5_(sheet);
}

function formatTradeSheetV5_(sheet) {
  ensureHeaders_(sheet, TRADE_HEADERS);
  try { sheet.setTabColor(JOURNALNEVIS.mintDark); } catch (ignore) {}
  const map = headerMap_(sheet);
  sheet.setHiddenGridlines(true);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  const lastCol = sheet.getLastColumn();
  sheet.getRange(1,1,1,lastCol)
    .setBackground('#101827').setFontColor('#FFFFFF')
    .setFontWeight('bold').setWrap(true).setHorizontalAlignment('center');
  sheet.setRowHeight(1,30);

  const widths = {
    'Trade #':60,'Symbol':95,'Direction':75,'Volume':65,'Open Time':135,'Entry Price':90,
    'Stop Loss':85,'Take Profit':85,'Close Time':135,'Exit Price':90,'Exit Reason':105,
    'Gross P/L':80,'Commission':80,'Swap':65,'Fee':60,'Net P/L':80,'Holding Min':80,
    'Source':85,'Entry Screenshot':105,'Exit Screenshot':105,'Setup':110,'Entry Reason':220,
    'Emotion':100,'Mistake':110,'Notes':240,'Review Status':105,'Status':75
  };
  Object.keys(widths).forEach(h=>{ if(map[h]) sheet.setColumnWidth(map[h],widths[h]); });

  const technical = ['Trade Key','Position ID','Account Login','Server','Broker','Entry Deal ID',
    'Exit Deal ID','Magic','Timeframe','Journal Timeframe','Entry Screenshot TF','Exit Screenshot TF',
    'Entry Screenshot Status','Exit Screenshot Status','Sync Status','Last Updated','Last Sync',
    'Weekday','Session','Recovery Note'];
  technical.forEach(h=>{ if(map[h]) sheet.hideColumns(map[h]); });

  if(sheet.getMaxRows()>=2) {
    const n=sheet.getMaxRows()-1;
    ['Open Time','Close Time','Last Updated','Last Sync'].forEach(h=>{
      if(map[h]) sheet.getRange(2,map[h],n,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    });
    ['Entry Price','Stop Loss','Take Profit','Exit Price'].forEach(h=>{
      if(map[h]) sheet.getRange(2,map[h],n,1).setNumberFormat('0.00000');
    });
    ['Gross P/L','Commission','Swap','Fee','Net P/L'].forEach(h=>{
      if(map[h]) sheet.getRange(2,map[h],n,1).setNumberFormat('#,##0.00;[Red]-#,##0.00');
    });

    if(map['Net P/L']) {
      const r=sheet.getRange(2,map['Net P/L'],n,1);
      const rules=sheet.getConditionalFormatRules().filter(rule => {
        const ranges=rule.getRanges();
        return !ranges.some(x=>x.getColumn()===map['Net P/L']);
      });
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#DCFCE7').setFontColor('#166534').setRanges([r]).build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(0).setBackground('#FEE2E2').setFontColor('#991B1B').setRanges([r]).build());
      sheet.setConditionalFormatRules(rules);
    }
  }

  applyReviewValidationsV5_(sheet);
}

function applyReviewValidationsV5_(sheet) {
  const ss=sheet.getParent();
  const lists=getOrCreateSheet_(ss,SETTINGS.listsSheet);
  repairReviewList_(ss);
  const map=headerMap_(sheet);
  const n=Math.max(1,sheet.getMaxRows()-1);
  const links={
    'Setup':'A2:A11','Emotion':'B2:B11','Mistake':'C2:C11','Review Status':'D2:D4'
  };
  Object.keys(links).forEach(h=>{
    if(!map[h]) return;
    const rule=SpreadsheetApp.newDataValidation()
      .requireValueInRange(lists.getRange(links[h]),true)
      .setAllowInvalid(true).build();
    sheet.getRange(2,map[h],n,1).setDataValidation(rule);
  });
}

function setScreenshotLink_(sheet,row,slot,url) {
  const header = slot === 'ENTRY' ? 'Entry Screenshot' : 'Exit Screenshot';
  const cell = getCellByHeader_(sheet,row,header);
  if (!cell) return false;
  if (!url) return false;

  const label = slot === 'ENTRY' ? '📷 Entry' : '📷 Exit';

  // Rich-text hyperlinks are locale-independent and survive native row sorting
  // more reliably than HYPERLINK formulas.
  const rich = SpreadsheetApp.newRichTextValue()
    .setText(label)
    .setLinkUrl(String(url))
    .build();
  cell.setRichTextValue(rich);
  return true;
}

function screenshotExpectedNames_(row,map) {
  const login=String(row[map['Account Login']-1]||'');
  const server=sanitizeName_(String(row[map['Server']-1]||''));
  const pos=String(row[map['Position ID']-1]||'');
  const safeServer=server.substring(0,18);

  const current='JN57_'+login+'_'+safeServer+'_'+pos+'_';
  const currentFallback='JN57_'+login+'_'+pos+'_';
  const previous='JN56_'+login+'_'+safeServer+'_'+pos+'_';
  const previousFallback='JN56_'+login+'_'+pos+'_';

  // Legacy v5.x local/Drive screenshots are intentionally supported.
  const legacy='TJ5_'+login+'_'+safeServer+'_'+pos+'_';
  const legacyFallback='TJ5_'+login+'_'+pos+'_';

  return {
    entry:[
      current+'ENTRY.png',currentFallback+'ENTRY.png',
      previous+'ENTRY.png',previousFallback+'ENTRY.png',
      legacy+'ENTRY.png',legacyFallback+'ENTRY.png'
    ],
    exit:[
      current+'EXIT.png',currentFallback+'EXIT.png',
      previous+'EXIT.png',previousFallback+'EXIT.png',
      legacy+'EXIT.png',legacyFallback+'EXIT.png'
    ]
  };
}

function collectDriveFilesByName_(folder,out) {
  const files=folder.getFiles();
  while(files.hasNext()) {
    const f=files.next();
    if(!out[f.getName()]) out[f.getName()]=f;
  }
  const folders=folder.getFolders();
  while(folders.hasNext()) collectDriveFilesByName_(folders.next(),out);
}


function screenshotCellHasLink_(sheet, row, header) {
  const cell = getCellByHeader_(sheet, row, header);
  if (!cell) return false;

  try {
    const rich = cell.getRichTextValue();
    if (rich) {
      if (rich.getLinkUrl()) return true;
      const runs = rich.getRuns ? rich.getRuns() : [];
      if (runs.some(r => r.getLinkUrl && r.getLinkUrl())) return true;
    }
  } catch (ignore) {}

  const formula = String(cell.getFormula() || '').trim();
  if (/^=HYPERLINK\(/i.test(formula)) return true;

  return false;
}

function getExistingChildFolder_(parent, name) {
  const it = parent.getFoldersByName(String(name));
  return it.hasNext() ? it.next() : null;
}

function findScreenshotInEventFolder_(root, ss, eventMs, symbol, candidateNames) {
  if (!eventMs || !symbol) return null;
  const tz = ss.getSpreadsheetTimeZone();
  const dt = new Date(Number(eventMs));
  const year = Utilities.formatDate(dt, tz, 'yyyy');
  const month = Utilities.formatDate(dt, tz, 'yyyy-MM');

  let f = getExistingChildFolder_(root, year);
  if (!f) return null;
  f = getExistingChildFolder_(f, month);
  if (!f) return null;
  f = getExistingChildFolder_(f, sanitizeName_(symbol));
  if (!f) return null;

  for (const name of candidateNames) {
    const it = f.getFilesByName(name);
    if (it.hasNext()) return it.next();
  }
  return null;
}

function relinkScreenshotsScoped_(ss, mode, fromMs) {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('DRIVE_FOLDER_ID');
  if (!folderId) return 0;

  let root;
  try { root = DriveApp.getFolderById(folderId); }
  catch (err) { return 0; }

  const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  ensureHeaders_(trades, TRADE_HEADERS);
  if (trades.getLastRow() < 2) return 0;

  const map = headerMap_(trades);
  const rows = trades.getRange(2,1,trades.getLastRow()-1,trades.getLastColumn()).getValues();
  const full = String(mode || '').toUpperCase() === 'FULL';
  const threshold = Number(fromMs || 0);

  // FULL may touch many trades; one recursive index is faster than repeated
  // Drive calls. TODAY uses only exact date/symbol folders and is lightweight.
  const fullIndex = {};
  if (full) collectDriveFilesByName_(root, fullIndex);

  let count = 0;

  rows.forEach((r, i) => {
    const rowNo = i + 2;
    const symbol = String(r[map['Symbol']-1] || '').trim();
    const openMs = toMillis_(r[map['Open Time']-1]);
    const closeMs = toMillis_(r[map['Close Time']-1]);
    const names = screenshotExpectedNames_(r, map);

    const entryEligible = full || (threshold > 0 && openMs >= threshold);
    const exitEligible = full || (threshold > 0 && closeMs >= threshold);

    if (entryEligible && !screenshotCellHasLink_(trades,rowNo,'Entry Screenshot')) {
      let file = null;
      if (full) file = names.entry.map(n => fullIndex[n]).find(Boolean) || null;
      else file = findScreenshotInEventFolder_(root,ss,openMs,symbol,names.entry);

      if (file) {
        setScreenshotLink_(trades,rowNo,'ENTRY',file.getUrl());
        setByHeader_(trades,rowNo,'Entry Screenshot Status','Relinked from Drive');
        count++;
      }
    }

    if (exitEligible && closeMs > 0 &&
        !screenshotCellHasLink_(trades,rowNo,'Exit Screenshot')) {
      let file = null;
      if (full) file = names.exit.map(n => fullIndex[n]).find(Boolean) || null;
      else file = findScreenshotInEventFolder_(root,ss,closeMs,symbol,names.exit);

      if (file) {
        setScreenshotLink_(trades,rowNo,'EXIT',file.getUrl());
        setByHeader_(trades,rowNo,'Exit Screenshot Status','Relinked from Drive');
        count++;
      }
    }
  });

  return count;
}


function parseJournalNevisScreenshotName_(name) {
  const clean = String(name || '').trim();
  if (!/\.(png)$/i.test(clean)) return null;

  const base = clean.replace(/\.png$/i,'');
  const parts = base.split('_');
  if (parts.length < 4) return null;

  const prefix = String(parts[0] || '').toUpperCase();
  if (!['JN57','JN56','TJ5'].includes(prefix)) return null;

  const login = String(parts[1] || '').trim();
  const slot = String(parts[parts.length-1] || '').toUpperCase();
  const positionId = String(parts[parts.length-2] || '').trim();

  if (!/^\d+$/.test(login) || !/^\d+$/.test(positionId)) return null;
  if (slot !== 'ENTRY' && slot !== 'EXIT') return null;

  return {prefix, login, positionId, slot};
}

function buildTradeScreenshotRowIndex_(sheet) {
  ensureHeaders_(sheet, TRADE_HEADERS);
  const map = headerMap_(sheet);
  const lastRow = sheet.getLastRow();
  const exact = {};
  const byPosition = {};
  if (lastRow < 2) return {map, exact, byPosition};

  const rows = sheet.getRange(2,1,lastRow-1,sheet.getLastColumn()).getValues();
  rows.forEach((r,i) => {
    const rowNo = i + 2;
    const login = String(r[map['Account Login']-1] || '').trim();
    const positionId = String(r[map['Position ID']-1] || '').trim();
    if (!positionId) return;

    if (login) exact[login+'|'+positionId] = rowNo;
    if (!byPosition[positionId]) byPosition[positionId] = [];
    byPosition[positionId].push(rowNo);
  });

  return {map, exact, byPosition};
}

function findTradeRowForScreenshot_(sheet, tradeKey, positionId) {
  if (tradeKey) {
    const byKey = findRowByValue_(sheet, 'Trade Key', String(tradeKey));
    if (byKey) return byKey;
  }

  const map = headerMap_(sheet);
  if (!positionId || !map['Position ID'] || sheet.getLastRow() < 2) return 0;
  const target = String(positionId).trim();
  const vals = sheet.getRange(2,map['Position ID'],sheet.getLastRow()-1,1).getDisplayValues();
  for (let i=0;i<vals.length;i++) {
    if (String(vals[i][0] || '').trim() === target) return i+2;
  }
  return 0;
}

function collectScreenshotFilesParsed_(folder, out) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const parsed = parseJournalNevisScreenshotName_(f.getName());
    if (parsed) {
      const key = parsed.login+'|'+parsed.positionId+'|'+parsed.slot;
      // Keep the newest file if several legacy/current copies exist.
      const prev = out[key];
      if (!prev || f.getLastUpdated().getTime() > prev.getLastUpdated().getTime()) out[key] = f;
    }
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) collectScreenshotFilesParsed_(folders.next(), out);
}

function repairScreenshotLinks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open the JournalNevis spreadsheet first.');

  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('DRIVE_FOLDER_ID');
  if (!folderId) throw new Error('Screenshot folder is not configured. Run setupJournalNevis() first.');

  const root = DriveApp.getFolderById(folderId);
  const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
  const idx = buildTradeScreenshotRowIndex_(trades);
  const files = {};
  collectScreenshotFilesParsed_(root, files);

  let linked = 0;
  let alreadyLinked = 0;
  let unmatched = 0;

  Object.keys(files).forEach(key => {
    const parts = key.split('|');
    const login = parts[0], positionId = parts[1], slot = parts[2];
    let row = idx.exact[login+'|'+positionId] || 0;

    if (!row) {
      const candidates = idx.byPosition[positionId] || [];
      if (candidates.length === 1) row = candidates[0];
    }

    if (!row) { unmatched++; return; }

    const header = slot === 'ENTRY' ? 'Entry Screenshot' : 'Exit Screenshot';
    if (screenshotCellHasLink_(trades,row,header)) {
      alreadyLinked++;
      return;
    }

    const f = files[key];
    if (setScreenshotLink_(trades,row,slot,f.getUrl())) {
      setByHeader_(trades,row,slot === 'ENTRY' ? 'Entry Screenshot Status' : 'Exit Screenshot Status',
                   'Relinked from Drive by Position ID');
      setByHeader_(trades,row,'Last Sync',new Date());
      linked++;
    }
  });

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert(
    'JournalNevis screenshot repair completed.\n\n' +
    'Links restored: ' + linked + '\n' +
    'Already linked: ' + alreadyLinked + '\n' +
    'Unmatched image files: ' + unmatched
  );

  return {linked, alreadyLinked, unmatched};
}

function handleScreenshotReconcile_(ss, p) {
  const mode = String(p.sync_mode || 'TODAY').toUpperCase();
  const fromMs = Number(p.from_ms || 0);
  let relinked = relinkScreenshotsScoped_(ss, mode, fromMs);

  // FULL sync gets an additional folder-independent repair pass. This handles
  // legacy images that were uploaded into UNKNOWN or older symbol folders.
  if (mode === 'FULL') {
    const props = PropertiesService.getScriptProperties();
    const folderId = props.getProperty('DRIVE_FOLDER_ID');
    if (folderId) {
      const root = DriveApp.getFolderById(folderId);
      const trades = getOrCreateSheet_(ss, SETTINGS.tradesSheet);
      const idx = buildTradeScreenshotRowIndex_(trades);
      const files = {};
      collectScreenshotFilesParsed_(root, files);
      Object.keys(files).forEach(key => {
        const parts = key.split('|');
        const login = parts[0], positionId = parts[1], slot = parts[2];
        let row = idx.exact[login+'|'+positionId] || 0;
        if (!row) {
          const candidates = idx.byPosition[positionId] || [];
          if (candidates.length === 1) row = candidates[0];
        }
        if (!row) return;
        const header = slot === 'ENTRY' ? 'Entry Screenshot' : 'Exit Screenshot';
        if (screenshotCellHasLink_(trades,row,header)) return;
        if (setScreenshotLink_(trades,row,slot,files[key].getUrl())) {
          setByHeader_(trades,row,slot === 'ENTRY' ? 'Entry Screenshot Status' : 'Exit Screenshot Status',
                       'Relinked from Drive by Position ID');
          relinked++;
        }
      });
    }
  }

  SpreadsheetApp.flush();
  return jsonResponse_({
    ok: true,
    action: 'SCREENSHOT_RECONCILE',
    mode: mode,
    screenshots_relinked: relinked,
    message: mode + ' screenshot check completed.'
  });
}

function relinkScreenshotsFromDrive_(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const props=PropertiesService.getScriptProperties();
  const folderId=props.getProperty('DRIVE_FOLDER_ID');
  if(!folderId) return 0;

  let root;
  try { root=DriveApp.getFolderById(folderId); }
  catch(err) { return 0; }

  const files={};
  collectDriveFilesByName_(root,files);
  const trades=getOrCreateSheet_(ss,SETTINGS.tradesSheet);
  ensureHeaders_(trades,TRADE_HEADERS);
  const map=headerMap_(trades);
  if(trades.getLastRow()<2) return 0;
  const rows=trades.getRange(2,1,trades.getLastRow()-1,trades.getLastColumn()).getValues();
  let count=0;

  rows.forEach((r,i)=>{
    const rowNo=i+2;
    const names=screenshotExpectedNames_(r,map);
    const entryCell=getCellByHeader_(trades,rowNo,'Entry Screenshot');
    const exitCell=getCellByHeader_(trades,rowNo,'Exit Screenshot');

    if(entryCell && !String(entryCell.getDisplayValue()||'').trim()) {
      const f=names.entry.map(n=>files[n]).find(Boolean);
      if(f){ setScreenshotLink_(trades,rowNo,'ENTRY',f.getUrl()); setByHeader_(trades,rowNo,'Entry Screenshot Status','Relinked from Drive'); count++; }
    }
    if(exitCell && !String(exitCell.getDisplayValue()||'').trim()) {
      const f=names.exit.map(n=>files[n]).find(Boolean);
      if(f){ setScreenshotLink_(trades,rowNo,'EXIT',f.getUrl()); setByHeader_(trades,rowNo,'Exit Screenshot Status','Relinked from Drive'); count++; }
    }
  });
  return count;
}

function relinkScreenshotsFromDrive() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const n=relinkScreenshotsScoped_(ss,'FULL',0);
  SpreadsheetApp.getUi().alert('Screenshot relink complete: '+n+' links restored.');
}

function hideSystemSheets_(ss) {
  SETTINGS.systemSheets.forEach(name=>{
    const s=ss.getSheetByName(name);
    if(s && !s.isSheetHidden() && ss.getSheets().filter(x=>!x.isSheetHidden()).length>1) {
      try{s.hideSheet();}catch(ignore){}
    }
  });
}
function hideSystemSheets(){ hideSystemSheets_(SpreadsheetApp.getActiveSpreadsheet()); }
function showSystemSheets(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  SETTINGS.systemSheets.forEach(name=>{ const s=ss.getSheetByName(name); if(s) try{s.showSheet();}catch(ignore){} });
}

function stdPop_(arr) {
  if(!arr.length) return 0;
  const mean=arr.reduce((a,b)=>a+b,0)/arr.length;
  const v=arr.reduce((s,x)=>s+(x-mean)*(x-mean),0)/arr.length;
  return Math.sqrt(v);
}

function mt5DirectionFromEntry_(dealType) {
  return String(dealType||'').toUpperCase()==='BUY' ? 'Long' :
         String(dealType||'').toUpperCase()==='SELL' ? 'Short' : '';
}

function buildStatementDataV5_(ss) {
  const executions=getOrCreateSheet_(ss,SETTINGS.executionsSheet);
  ensureHeaders_(executions,EXECUTION_HEADERS);
  const cash=getOrCreateSheet_(ss,SETTINGS.cashFlowSheet);
  ensureHeaders_(cash,CASH_FLOW_HEADERS);
  const accounts=getOrCreateSheet_(ss,SETTINGS.accountsSheet);
  ensureHeaders_(accounts,ACCOUNT_HEADERS);
  const trades=getOrCreateSheet_(ss,SETTINGS.tradesSheet);
  ensureHeaders_(trades,TRADE_HEADERS);

  const emap=headerMap_(executions);
  let deals=[];
  if(executions.getLastRow()>=2) {
    const rows=executions.getRange(2,1,executions.getLastRow()-1,executions.getLastColumn()).getValues();
    deals=rows.map((r,i)=>({
      dealId:String(r[emap['Deal ID']-1]||''),
      tradeKey:String(r[emap['Trade Key']-1]||''),
      pos:String(r[emap['Position ID']-1]||''),
      symbol:String(r[emap['Symbol']-1]||'').trim()||'UNKNOWN',
      time:toMillis_(r[emap['Time']-1]),
      entry:String(r[emap['Deal Entry']-1]||'').toUpperCase(),
      type:String(r[emap['Deal Type']-1]||'').toUpperCase(),
      volume:Number(r[emap['Volume']-1]||0),
      price:Number(r[emap['Price']-1]||0),
      profit:Number(r[emap['Profit']-1]||0),
      commission:Number(r[emap['Commission']-1]||0),
      swap:Number(r[emap['Swap']-1]||0),
      fee:Number(r[emap['Fee']-1]||0),
      reason:String(r[emap['Reason']-1]||''),
      comment:String(r[emap['Comment']-1]||''),
      order:i
    })).filter(x=>x.time>0 && (x.type==='BUY'||x.type==='SELL'))
      .sort((a,b)=>a.time-b.time || a.order-b.order);
  }

  const posMap={};
  deals.forEach(d=>{
    if(!posMap[d.pos]) posMap[d.pos]={entryVolume:0,entryCost:0,direction:'',symbol:d.symbol,firstTime:d.time};
    const p=posMap[d.pos];
    if(d.symbol!=='UNKNOWN')p.symbol=d.symbol;
    if(d.entry==='IN'){
      if(!p.direction)p.direction=mt5DirectionFromEntry_(d.type);
      p.entryVolume+=d.volume;
      p.entryCost+=d.commission+d.swap+d.fee;
      p.firstTime=Math.min(p.firstTime,d.time);
    }
  });

  // Cash flow events (balance/deposit/withdrawal etc.).
  const cmap=headerMap_(cash);
  let cashEvents=[];
  if(cash.getLastRow()>=2){
    cashEvents=cash.getRange(2,1,cash.getLastRow()-1,cash.getLastColumn()).getValues().map((r,i)=>({
      time:toMillis_(r[cmap['Time']-1]), category:String(r[cmap['Category']-1]||''),
      raw:String(r[cmap['Raw Type']-1]||''), amount:Number(r[cmap['Amount']-1]||0), order:-100000+i
    })).filter(x=>x.time>0).sort((a,b)=>a.time-b.time);
  }

  const initialCapital=cashEvents.filter(x=>x.category==='Initial Capital').reduce((s,x)=>s+x.amount,0);
  const deposits=cashEvents.filter(x=>x.category==='Deposit').reduce((s,x)=>s+x.amount,0);
  const withdrawals=Math.abs(cashEvents.filter(x=>x.category==='Withdrawal').reduce((s,x)=>s+x.amount,0));

  const timeline=[];
  cashEvents.forEach(x=>timeline.push({time:x.time,order:x.order,change:x.amount,event:x.category||x.raw,symbol:'',deal:null}));
  deals.forEach(d=>timeline.push({time:d.time,order:d.order,change:d.profit+d.commission+d.swap+d.fee,event:'Deal',symbol:d.symbol,deal:d}));
  timeline.sort((a,b)=>a.time-b.time || a.order-b.order);

  let balance=0,peak=0,minBalance=Infinity,maxDD=0,maxDDPctAtMaxMoney=0,relPct=0,relMoney=0;
  const balanceRows=[];
  timeline.forEach((e,i)=>{
    const before=balance;
    balance+=e.change;
    if(i===0||balance>peak)peak=balance;
    minBalance=Math.min(minBalance,balance);
    const dd=Math.max(0,peak-balance);
    const pct=peak>0?dd/peak:0;
    if(dd>maxDD){maxDD=dd;maxDDPctAtMaxMoney=pct;}
    if(pct>relPct){relPct=pct;relMoney=dd;}
    e.balanceBefore=before;e.balanceAfter=balance;
    if(e.deal){ e.deal.balanceBefore=before; e.deal.balanceAfter=balance; }
    balanceRows.push([new Date(e.time),e.event,e.symbol,e.change,balance,peak,dd,pct]);
  });

  // If broker history starts with a pre-existing balance and no explicit initial deposit,
  // infer the period start balance from the first observed deal balance equation.
  let inferredInitial=initialCapital;
  if(inferredInitial===0 && timeline.length){
    // Prefer the earliest account snapshot / current balance reverse reconstruction.
    let currentBalance=0;
    if(accounts.getLastRow()>=2){
      const amap=headerMap_(accounts);
      const arows=accounts.getRange(2,1,accounts.getLastRow()-1,accounts.getLastColumn()).getValues();
      if(arows.length)currentBalance=Number(arows[arows.length-1][amap['Balance']-1]||0);
    }
    const totalChange=timeline.reduce((s,x)=>s+x.change,0);
    if(currentBalance)inferredInitial=currentBalance-totalChange;
  }
  const absoluteDD=inferredInitial>0 && Number.isFinite(minBalance)?Math.max(0,inferredInitial-minBalance):0;

  // Close-event trade ledger. This matches the MT5 report concept: every OUT deal is
  // one reported trade result; opening costs are allocated for account net/gross totals.
  const closeTrades=[];
  const returns=[];
  deals.forEach(d=>{
    if(!(d.entry==='OUT'||d.entry==='OUT_BY'||d.entry==='INOUT'))return;
    const p=posMap[d.pos]||{entryVolume:0,entryCost:0,direction:'',symbol:d.symbol,firstTime:d.time};
    const alloc=p.entryVolume>0 ? p.entryCost*(d.volume/p.entryVolume) : 0;
    const raw=d.profit+d.commission+d.swap+d.fee;
    const net=raw+alloc;
    const direction=p.direction|| (d.type==='SELL'?'Long':'Short');
    const hold=Math.max(0,(d.time-p.firstTime)/60000);
    closeTrades.push({
      time:d.time,pos:d.pos,symbol:p.symbol||d.symbol,direction,volume:d.volume,
      raw,net,commission:d.commission+alloc,swap:d.swap,fee:d.fee,holding:hold,
      profit:d.profit,reason:d.reason
    });
    if(d.balanceBefore!==0)returns.push(raw/d.balanceBefore);
  });
  closeTrades.sort((a,b)=>a.time-b.time);

  const totalNet=timeline.filter(x=>x.event==='Deal').reduce((s,x)=>s+x.change,0);
  const grossProfit=closeTrades.filter(x=>x.net>0).reduce((s,x)=>s+x.net,0);
  const grossLoss=closeTrades.filter(x=>x.net<0).reduce((s,x)=>s+x.net,0);
  const pf=grossLoss<0?grossProfit/Math.abs(grossLoss):(grossProfit>0?grossProfit:0);
  const expected=closeTrades.length?totalNet/closeTrades.length:0;
  const recovery=maxDD>0?totalNet/maxDD:0;
  const sharpe=returns.length&&stdPop_(returns)>0?(returns.reduce((a,b)=>a+b,0)/returns.length)/stdPop_(returns):0;

  let wins=0,losses=0,shorts=0,longs=0,shortWins=0,longWins=0;
  let largestWin=0,largestLoss=0,avgWin=0,avgLoss=0;
  let curWin=0,curLoss=0,maxWinStreak=0,maxLossStreak=0;
  let runSign=0,run=0,maxConProfit=0,maxConLoss=0;
  const winRunLens=[],lossRunLens=[];
  let currentRunLen=0;

  closeTrades.forEach((x,idx)=>{
    if(x.direction==='Short'){shorts++;if(x.raw>0)shortWins++;}
    if(x.direction==='Long'){longs++;if(x.raw>0)longWins++;}
    if(x.raw>0){wins++;largestWin=Math.max(largestWin,x.raw);curWin++;curLoss=0;}
    else if(x.raw<0){losses++;largestLoss=Math.min(largestLoss,x.raw);curLoss++;curWin=0;}
    else {curWin=0;curLoss=0;}
    maxWinStreak=Math.max(maxWinStreak,curWin);maxLossStreak=Math.max(maxLossStreak,curLoss);

    const sign=x.raw>0?1:x.raw<0?-1:0;
    if(sign===0){
      if(runSign===1&&currentRunLen)winRunLens.push(currentRunLen);
      if(runSign===-1&&currentRunLen)lossRunLens.push(currentRunLen);
      runSign=0;run=0;currentRunLen=0;
    } else if(sign===runSign){run+=x.raw;currentRunLen++;}
    else {
      if(runSign===1&&currentRunLen)winRunLens.push(currentRunLen);
      if(runSign===-1&&currentRunLen)lossRunLens.push(currentRunLen);
      runSign=sign;run=x.raw;currentRunLen=1;
    }
    maxConProfit=Math.max(maxConProfit,run);maxConLoss=Math.min(maxConLoss,run);
  });
  if(runSign===1&&currentRunLen)winRunLens.push(currentRunLen);
  if(runSign===-1&&currentRunLen)lossRunLens.push(currentRunLen);

  avgWin=wins?closeTrades.filter(x=>x.raw>0).reduce((s,x)=>s+x.raw,0)/wins:0;
  avgLoss=losses?closeTrades.filter(x=>x.raw<0).reduce((s,x)=>s+x.raw,0)/losses:0;
  const avgConWins=winRunLens.length?winRunLens.reduce((a,b)=>a+b,0)/winRunLens.length:0;
  const avgConLosses=lossRunLens.length?lossRunLens.reduce((a,b)=>a+b,0)/lossRunLens.length:0;

  // Exact MT5-style run pairs: longest count + that run's money, and largest
  // money run + that run's count are different statistics.
  const runs=[];
  closeTrades.forEach(x=>{
    const sign=x.raw>0?1:x.raw<0?-1:0;
    if(sign===0)return;
    const last=runs.length?runs[runs.length-1]:null;
    if(last && last.sign===sign){last.count++;last.sum+=x.raw;}
    else runs.push({sign:sign,count:1,sum:x.raw});
  });
  const winRuns=runs.filter(r=>r.sign===1), lossRuns=runs.filter(r=>r.sign===-1);
  const longestWinRun=winRuns.reduce((a,r)=>!a||r.count>a.count||(r.count===a.count&&r.sum>a.sum)?r:a,null);
  const longestLossRun=lossRuns.reduce((a,r)=>!a||r.count>a.count||(r.count===a.count&&r.sum<a.sum)?r:a,null);
  const maxProfitRun=winRuns.reduce((a,r)=>!a||r.sum>a.sum?r:a,null);
  const maxLossRun=lossRuns.reduce((a,r)=>!a||r.sum<a.sum?r:a,null);
  const maxWinStreakAmount=longestWinRun?longestWinRun.sum:0;
  const maxLossStreakAmount=longestLossRun?longestLossRun.sum:0;
  const maxConProfitCount=maxProfitRun?maxProfitRun.count:0;
  const maxConLossCount=maxLossRun?maxLossRun.count:0;
  maxWinStreak=longestWinRun?longestWinRun.count:0;
  maxLossStreak=longestLossRun?longestLossRun.count:0;
  maxConProfit=maxProfitRun?maxProfitRun.sum:0;
  maxConLoss=maxLossRun?maxLossRun.sum:0;

  // Current account snapshot.
  let currentBalance=balance,currentEquity=balance,floating=0,margin=0,freeMargin=0,credit=0;
  if(accounts.getLastRow()>=2){
    const amap=headerMap_(accounts);
    const ar=accounts.getRange(2,1,accounts.getLastRow()-1,accounts.getLastColumn()).getValues()
      .sort((a,b)=>toMillis_(a[amap['Last Updated']-1])-toMillis_(b[amap['Last Updated']-1]));
    if(ar.length){
      const a=ar[ar.length-1];
      currentBalance=Number(a[amap['Balance']-1]||currentBalance);
      currentEquity=Number(a[amap['Equity']-1]||currentBalance);
      floating=Number(a[amap['Floating P/L']-1]||0);
      margin=Number(a[amap['Margin']-1]||0);
      freeMargin=Number(a[amap['Free Margin']-1]||0);
      credit=Number(a[amap['Credit']-1]||0);
    }
  }

  const symbolMap={};
  closeTrades.forEach(x=>{
    const k=x.symbol||'UNKNOWN';
    if(!symbolMap[k])symbolMap[k]={trades:0,wins:0,losses:0,net:0,gp:0,gl:0,commission:0,swap:0,fee:0,best:0,worst:0,hold:0,volume:0,longs:0,shorts:0};
    const s=symbolMap[k];s.trades++;s.net+=x.net;s.commission+=x.commission;s.swap+=x.swap;s.fee+=x.fee;s.hold+=x.holding;s.volume+=x.volume;
    if(x.direction==='Long')s.longs++;if(x.direction==='Short')s.shorts++;
    if(x.raw>0){s.wins++;s.gp+=x.net;s.best=Math.max(s.best,x.raw);}else if(x.raw<0){s.losses++;s.gl+=x.net;s.worst=Math.min(s.worst,x.raw);}
  });
  const symbolRows=Object.keys(symbolMap).sort().map(k=>{
    const s=symbolMap[k];return [k,s.trades,s.wins,s.losses,s.trades?s.wins/s.trades:0,s.net,s.gp,s.gl,s.gl<0?s.gp/Math.abs(s.gl):(s.gp>0?s.gp:0),s.commission,s.swap,s.fee,s.commission+s.swap+s.fee,s.trades?s.net/s.trades:0,s.best,s.worst,s.trades?s.hold/s.trades:0,s.volume,s.longs,s.shorts];
  });

  const monthMap={};
  closeTrades.forEach(x=>{
    const m=Utilities.formatDate(new Date(x.time),ss.getSpreadsheetTimeZone(),'yyyy-MM');
    if(!monthMap[m])monthMap[m]={trades:0,wins:0,losses:0,net:0,comm:0,best:0,worst:0};
    const q=monthMap[m];q.trades++;q.net+=x.net;q.comm+=x.commission;
    if(x.raw>0){q.wins++;q.best=Math.max(q.best,x.raw);}else if(x.raw<0){q.losses++;q.worst=Math.min(q.worst,x.raw);}
  });
  const monthlyRows=Object.keys(monthMap).sort().map(k=>{const q=monthMap[k];return [k,q.trades,q.wins,q.losses,q.trades?q.wins/q.trades:0,q.net,q.comm,q.trades?q.net/q.trades:0,q.best,q.worst];});

  return {deals,closeTrades,balanceRows,symbolRows,monthlyRows,
    totalNet,grossProfit,grossLoss,profitFactor:pf,expectedPayoff:expected,recoveryFactor:recovery,sharpe,
    balanceDDAbsolute:absoluteDD,balanceDDMaximal:maxDD,balanceDDMaximalPct:maxDDPctAtMaxMoney,
    balanceDDRelativePct:relPct,balanceDDRelativeMoney:relMoney,minBalance:Number.isFinite(minBalance)?minBalance:0,
    initialCapital:inferredInitial,deposits,withdrawals,currentBalance,currentEquity,floating,margin,freeMargin,credit,
    totalTrades:closeTrades.length,shorts,longs,shortWinPct:shorts?shortWins/shorts:0,longWinPct:longs?longWins/longs:0,
    wins,losses,winPct:closeTrades.length?wins/closeTrades.length:0,lossPct:closeTrades.length?losses/closeTrades.length:0,
    largestWin,largestLoss,avgWin,avgLoss,maxWinStreak,maxLossStreak,maxWinStreakAmount,maxLossStreakAmount,
    maxConProfit,maxConLoss,maxConProfitCount,maxConLossCount,avgConWins,avgConLosses,
    totalCommission:deals.reduce((s,x)=>s+x.commission,0),totalSwap:deals.reduce((s,x)=>s+x.swap,0),totalFees:deals.reduce((s,x)=>s+x.fee,0)};
}

function buildProfessionalLayout_(ss) {
  const d=getOrCreateSheet_(ss,SETTINGS.dashboardSheet);
  d.clear();
  d.setHiddenGridlines(true);d.setFrozenRows(3);
  d.getRange('A1:Q110').setBackground('#F4F7FB').setFontFamily('Arial');
  try { d.setTabColor(JOURNALNEVIS.mint); } catch (ignore) {}

  d.getRange('A1:B2').merge().setValue('JN')
    .setBackground(JOURNALNEVIS.mint).setFontColor(JOURNALNEVIS.navy)
    .setFontWeight('bold').setFontSize(22)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  d.getRange('C1:Q2').merge().setValue('JournalNevis v5.7  •  MT5 PERFORMANCE DESK')
    .setBackground(JOURNALNEVIS.navy).setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(19).setVerticalAlignment('middle');

  d.getRange('A3:Q3').merge().setValue('Automated Trading Journal  •  JournalNevis.ir')
    .setBackground(JOURNALNEVIS.navy2).setFontColor('#B9D5FF').setFontSize(10);

  const sec=(row,title)=>d.getRange(row,1,1,17).merge().setValue(title).setBackground('#1E293B').setFontColor('#FFFFFF').setFontWeight('bold');
  sec(5,'ACCOUNT SNAPSHOT');sec(10,'MT5 STATEMENT — PROFITABILITY & DRAWDOWN');sec(20,'MT5 STATEMENT — TRADE STATISTICS');sec(34,'SYMBOL PERFORMANCE');sec(52,'CHARTS');

  const card=(labelRow,valueRow,startCol,width,label)=>{
    d.getRange(labelRow,startCol,1,width).merge().setValue(label).setBackground('#FFFFFF').setFontColor('#64748B').setFontWeight('bold').setFontSize(9);
    d.getRange(valueRow,startCol,2,width).merge().setValue(0).setBackground('#FFFFFF').setFontColor('#0F172A').setFontWeight('bold').setFontSize(16).setHorizontalAlignment('center').setVerticalAlignment('middle');
  };
  card(6,7,1,3,'Balance');card(6,7,4,3,'Equity');card(6,7,7,3,'Total Net Profit');card(6,7,10,3,'Total Trades');card(6,7,13,3,'Win Rate');

  // Profitability / drawdown rows: label/value pairs.
  const pairHeaders=[
    ['Total Net Profit','Gross Profit','Gross Loss','Profit Factor'],
    ['Expected Payoff','Recovery Factor','Sharpe Ratio','Initial Capital'],
    ['Balance DD Absolute','Balance DD Maximal','Balance DD Maximal %','Balance DD Relative'],
    ['Relative DD $','Minimum Balance','Commission','Floating P/L']
  ];
  pairHeaders.forEach((arr,ri)=>arr.forEach((label,ci)=>{
    const c=1+ci*4;const r=11+ri*2;
    d.getRange(r,c,1,2).merge().setValue(label).setFontColor('#64748B').setFontWeight('bold').setBackground('#FFFFFF');
    d.getRange(r,c+2,1,2).merge().setValue(0).setFontColor('#0F172A').setFontWeight('bold').setBackground('#FFFFFF').setHorizontalAlignment('right');
  }));

  const tradeLabels=[
    ['Total Trades','Short Trades (won %)','Long Trades (won %)'],
    ['Profit Trades (% total)','Loss Trades (% total)','Average Win / Loss'],
    ['Largest profit trade','Largest loss trade','Expected Payoff'],
    ['Average profit trade','Average loss trade','Sharpe Ratio'],
    ['Maximum consecutive wins ($)','Maximum consecutive losses ($)','Recovery Factor'],
    ['Maximal consecutive profit (count)','Maximal consecutive loss (count)','Profit Factor'],
    ['Average consecutive wins','Average consecutive losses','Pending Reviews']
  ];
  tradeLabels.forEach((arr,ri)=>arr.forEach((label,ci)=>{
    const c=1+ci*5;const r=21+ri*2;
    d.getRange(r,c,1,3).merge().setValue(label).setFontColor('#64748B').setFontWeight('bold').setBackground('#FFFFFF');
    d.getRange(r,c+3,1,2).merge().setValue('').setFontColor('#0F172A').setFontWeight('bold').setBackground('#FFFFFF').setHorizontalAlignment('right');
  }));

  const sh=['Symbol','Trades','Wins','Losses','Win Rate','Net P/L','Profit Factor','Commission','Avg Trade','Best','Worst','Avg Hold','Volume','Long','Short'];
  d.getRange(35,1,1,sh.length).setValues([sh]).setBackground(JOURNALNEVIS.mintDark).setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');
  d.getRange('A36:O49').setBackground('#FFFFFF');
  d.getRange('A50:Q50').merge().setValue('Dashboard, Trades, Accounts, Settings and Help stay visible. Setup, Emotion, Mistake and Review Status keep dropdown choices in Trades.').setBackground('#FFF7D6').setFontColor('#6B5B00');

  for(let c=1;c<=17;c++)d.setColumnWidth(c,92);
  d.setColumnWidth(1,110);d.setColumnWidth(6,105);d.setColumnWidth(7,105);
  d.getCharts().forEach(ch=>d.removeChart(ch));
}

function refreshAnalyticsAndDashboard_(ss) {
  const data=buildStatementDataV5_(ss);
  const d=getOrCreateSheet_(ss,SETTINGS.dashboardSheet);
  if(String(d.getRange('A1').getValue()||'').indexOf('JournalNevis v5.7')<0)buildProfessionalLayout_(ss);

  const balanceCurve=getOrCreateSheet_(ss,SETTINGS.balanceCurveSheet);
  balanceCurve.clearContents();
  balanceCurve.getRange(1,1,1,8).setValues([['Time','Event','Symbol','Change','Balance','Peak','Drawdown $','Drawdown %']]);
  if(data.balanceRows.length)balanceCurve.getRange(2,1,data.balanceRows.length,8).setValues(data.balanceRows);
  balanceCurve.getRange(1,1,1,8).setBackground('#101827').setFontColor('#FFFFFF').setFontWeight('bold');
  if(data.balanceRows.length){balanceCurve.getRange(2,1,data.balanceRows.length,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');balanceCurve.getRange(2,4,data.balanceRows.length,4).setNumberFormat('#,##0.00;[Red]-#,##0.00');balanceCurve.getRange(2,8,data.balanceRows.length,1).setNumberFormat('0.00%');}

  const sym=getOrCreateSheet_(ss,SETTINGS.symbolSheet);sym.clearContents();sym.getRange(1,1,1,SYMBOL_HEADERS.length).setValues([SYMBOL_HEADERS]);
  if(data.symbolRows.length)sym.getRange(2,1,data.symbolRows.length,SYMBOL_HEADERS.length).setValues(data.symbolRows);
  sym.getRange(1,1,1,SYMBOL_HEADERS.length).setBackground('#101827').setFontColor('#FFFFFF').setFontWeight('bold');
  if(data.symbolRows.length){sym.getRange(2,5,data.symbolRows.length,1).setNumberFormat('0.0%');sym.getRange(2,6,data.symbolRows.length,13).setNumberFormat('#,##0.00;[Red]-#,##0.00');sym.getRange(2,9,data.symbolRows.length,1).setNumberFormat('0.00');}

  const mon=getOrCreateSheet_(ss,SETTINGS.monthlySheet);mon.clearContents();mon.getRange(1,1,1,MONTHLY_HEADERS.length).setValues([MONTHLY_HEADERS]);
  if(data.monthlyRows.length)mon.getRange(2,1,data.monthlyRows.length,MONTHLY_HEADERS.length).setValues(data.monthlyRows);
  mon.getRange(1,1,1,MONTHLY_HEADERS.length).setBackground('#101827').setFontColor('#FFFFFF').setFontWeight('bold');
  if(data.monthlyRows.length){mon.getRange(2,5,data.monthlyRows.length,1).setNumberFormat('0.0%');mon.getRange(2,6,data.monthlyRows.length,5).setNumberFormat('#,##0.00;[Red]-#,##0.00');}

  // Main cards.
  d.getRange('A7').setValue(data.currentBalance).setNumberFormat('#,##0.00');
  d.getRange('D7').setValue(data.currentEquity).setNumberFormat('#,##0.00');
  d.getRange('G7').setValue(data.totalNet).setNumberFormat('#,##0.00;[Red]-#,##0.00');
  d.getRange('J7').setValue(data.totalTrades).setNumberFormat('0');
  d.getRange('M7').setValue(data.winPct).setNumberFormat('0.00%');

  const profitVals=[
    data.totalNet,data.grossProfit,data.grossLoss,data.profitFactor,
    data.expectedPayoff,data.recoveryFactor,data.sharpe,data.initialCapital,
    data.balanceDDAbsolute,data.balanceDDMaximal,data.balanceDDMaximalPct,data.balanceDDRelativePct,
    data.balanceDDRelativeMoney,data.minBalance,Math.abs(data.totalCommission),data.floating
  ];
  let pi=0;
  for(let ri=0;ri<4;ri++)for(let ci=0;ci<4;ci++){
    const cell=d.getRange(11+ri*2,3+ci*4);const val=profitVals[pi++];cell.setValue(val);
    if((ri===2&&ci>=2))cell.setNumberFormat('0.00%');else if(ci===3&&ri<2)cell.setNumberFormat('0.00');else cell.setNumberFormat('#,##0.00;[Red]-#,##0.00');
  }

  const pending=(()=>{const t=getOrCreateSheet_(ss,SETTINGS.tradesSheet);if(t.getLastRow()<2)return 0;const m=headerMap_(t);return t.getRange(2,1,t.getLastRow()-1,t.getLastColumn()).getValues().filter(r=>String(r[m['Status']-1]||'')==='Closed'&&String(r[m['Review Status']-1]||'')!=='Reviewed').length;})();
  const tradeVals=[
    String(data.totalTrades),data.shorts+' ('+(data.shortWinPct*100).toFixed(2)+'%)',data.longs+' ('+(data.longWinPct*100).toFixed(2)+'%)',
    data.wins+' ('+(data.winPct*100).toFixed(2)+'%)',data.losses+' ('+(data.lossPct*100).toFixed(2)+'%)',data.avgWin.toFixed(2)+' / '+data.avgLoss.toFixed(2),
    data.largestWin,data.largestLoss,data.expectedPayoff,
    data.avgWin,data.avgLoss,data.sharpe,
    data.maxWinStreak+' ('+data.maxWinStreakAmount.toFixed(2)+')',data.maxLossStreak+' ('+data.maxLossStreakAmount.toFixed(2)+')',data.recoveryFactor,
    data.maxConProfit.toFixed(2)+' ('+data.maxConProfitCount+')',data.maxConLoss.toFixed(2)+' ('+data.maxConLossCount+')',data.profitFactor,
    data.avgConWins.toFixed(1),data.avgConLosses.toFixed(1),pending
  ];
  let ti=0;for(let ri=0;ri<7;ri++)for(let ci=0;ci<3;ci++){d.getRange(21+ri*2,4+ci*5).setValue(tradeVals[ti++]);}

  d.getRange('A36:O49').clearContent();
  const dashRows=data.symbolRows.slice(0,14).map(r=>[r[0],r[1],r[2],r[3],r[4],r[5],r[8],r[9],r[13],r[14],r[15],r[16],r[17],r[18],r[19]]);
  if(dashRows.length){d.getRange(36,1,dashRows.length,15).setValues(dashRows);d.getRange(36,5,dashRows.length,1).setNumberFormat('0.0%');d.getRange(36,6,dashRows.length,8).setNumberFormat('#,##0.00;[Red]-#,##0.00');}

  d.getCharts().forEach(ch=>d.removeChart(ch));

  const chartBase = (builder,title,color,row,col) =>
    builder
      .setOption('title',title)
      .setOption('legend',{position:'none'})
      .setOption('backgroundColor','#FFFFFF')
      .setOption('width',610)
      .setOption('height',285)
      .setOption('colors',[color])
      .setPosition(row,col,0,0)
      .build();

  if(balanceCurve.getLastRow()>=2){
    d.insertChart(chartBase(
      d.newChart().setChartType(Charts.ChartType.LINE)
       .addRange(balanceCurve.getRange(1,1,balanceCurve.getLastRow(),1))
       .addRange(balanceCurve.getRange(1,5,balanceCurve.getLastRow(),1)),
      'Balance','#2563EB',53,1));

    d.insertChart(chartBase(
      d.newChart().setChartType(Charts.ChartType.AREA)
       .addRange(balanceCurve.getRange(1,1,balanceCurve.getLastRow(),1))
       .addRange(balanceCurve.getRange(1,7,balanceCurve.getLastRow(),1)),
      'Drawdown ($)','#DC2626',53,10));
  }

  if(sym.getLastRow()>=2){
    d.insertChart(chartBase(
      d.newChart().setChartType(Charts.ChartType.BAR)
       .addRange(sym.getRange(1,1,sym.getLastRow(),1))
       .addRange(sym.getRange(1,6,sym.getLastRow(),1)),
      'Net P/L by Symbol','#0F9D58',72,1));

    const wr=d.newChart().setChartType(Charts.ChartType.COLUMN)
      .addRange(sym.getRange(1,1,sym.getLastRow(),1))
      .addRange(sym.getRange(1,5,sym.getLastRow(),1))
      .setOption('title','Win Rate by Symbol')
      .setOption('legend',{position:'none'})
      .setOption('backgroundColor','#FFFFFF')
      .setOption('width',610).setOption('height',285)
      .setOption('vAxis',{format:'percent',viewWindow:{min:0,max:1}})
      .setOption('colors',['#16A34A'])
      .setPosition(72,10,0,0).build();
    d.insertChart(wr);
  }

  if(mon.getLastRow()>=2){
    d.insertChart(chartBase(
      d.newChart().setChartType(Charts.ChartType.COLUMN)
       .addRange(mon.getRange(1,1,mon.getLastRow(),1))
       .addRange(mon.getRange(1,6,mon.getLastRow(),1)),
      'Monthly Net P/L','#7C3AED',91,1));
  }

  const pieSheet=getOrCreateSheet_(ss,SETTINGS.analyticsSheet);
  pieSheet.clearContents();
  pieSheet.getRange('A1:B3').setValues([
    ['Result','Trades'],
    ['Wins',data.wins],
    ['Losses',data.losses]
  ]);

  const wl=d.newChart().setChartType(Charts.ChartType.PIE)
    .addRange(pieSheet.getRange('A1:B3'))
    .setOption('title','Wins vs Losses')
    .setOption('pieHole',0.55)
    .setOption('legend',{position:'bottom'})
    .setOption('backgroundColor','#FFFFFF')
    .setOption('width',610).setOption('height',285)
    .setOption('slices',{
      0:{color:'#16A34A'}, // Wins = green
      1:{color:'#DC2626'}  // Losses = red
    })
    .setPosition(91,10,0,0).build();
  d.insertChart(wl);

  formatTradeSheetV5_(getOrCreateSheet_(ss,SETTINGS.tradesSheet));
}

function refreshDashboard(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  repairMissingSymbols_(ss);compactAndResequenceTrades_(ss);normalizeCashFlows_(ss);refreshAnalyticsAndDashboard_(ss);hideSystemSheets_(ss);
}

// v5 fast batch overrides -----------------------------------------------------
function fastUpsertTradeBatchV5_(ss, trades) {
  const sheet=getOrCreateSheet_(ss,SETTINGS.tradesSheet);
  ensureHeaders_(sheet,TRADE_HEADERS);
  const map=headerMap_(sheet), lastCol=sheet.getLastColumn();
  const keyCol=map['Trade Key'];
  const existing={};
  if(sheet.getLastRow()>=2){
    sheet.getRange(2,keyCol,sheet.getLastRow()-1,1).getValues().forEach((r,i)=>{if(r[0])existing[String(r[0])]=i+2;});
  }
  let nextRow=Math.max(sheet.getLastRow()+1,2), count=0;
  const now=new Date();

  trades.forEach(p=>{
    const key=String(p.trade_key||''); if(!key)return;
    let row=existing[key]||0, isNew=!row;
    if(!row){row=nextRow++;ensureRowExists_(sheet,row);existing[key]=row;}
    const range=sheet.getRange(row,1,1,lastCol);
    const vals=isNew?Array(lastCol).fill(''):range.getValues()[0];
    const formulas=isNew?Array(lastCol).fill(''):range.getFormulas()[0];
    const put=(h,v,blankOK=true)=>{const c=map[h];if(!c)return;if(blankOK||v!==''&&v!==null&&v!==undefined)vals[c-1]=v;};
    const openDate=dateFromMillis_(p.open_time_ms), closeDate=dateFromMillis_(p.close_time_ms), status=String(p.status||'');
    put('Trade Key',key);put('Position ID',text_(p.position_id));put('Account Login',text_(p.account_login));put('Server',p.server||'');put('Broker',p.broker||'');
    const oldSym=String(vals[(map['Symbol']||1)-1]||'').trim(); put('Symbol',String(p.symbol||'').trim()||oldSym,false);
    put('Direction',p.direction||'');put('Volume',number_(p.volume));put('Open Time',openDate);put('Entry Price',number_(p.entry_price));put('Stop Loss',numberOrBlank_(p.stop_loss));put('Take Profit',numberOrBlank_(p.take_profit));
    put('Close Time',closeDate);put('Exit Price',numberOrBlank_(p.exit_price));put('Exit Reason',p.exit_reason||'');put('Gross P/L',number_(p.gross_pl));put('Commission',number_(p.commission));put('Swap',number_(p.swap));put('Fee',number_(p.fee));put('Net P/L',number_(p.net_pl));put('Holding Min',numberOrBlank_(p.holding_minutes));
    put('Entry Deal ID',text_(p.entry_deal_id));put('Exit Deal ID',text_(p.exit_deal_id));put('Magic',text_(p.magic));put('Source',p.source||'');put('Status',status);put('Last Updated',now);put('Last Sync',now);put('Weekday',weekday_(ss,openDate));put('Session',session_(ss,openDate));
    if(p.journal_timeframe){put('Journal Timeframe',p.journal_timeframe);put('Timeframe',p.journal_timeframe);}
    const sc=map['Sync Status']; if(sc){const cur=String(vals[sc-1]||'');const inc=String(p.sync_status||''); if(!(cur==='Live'&&inc.startsWith('Recovered')))vals[sc-1]=cur.startsWith('Recovered')&&inc==='Live'?'Recovered earlier / Live update':inc||cur;}
    if(p.recovery_note && map['Recovery Note'] && !vals[map['Recovery Note']-1])vals[map['Recovery Note']-1]=p.recovery_note;
    if(map['Review Status']){const c=map['Review Status']-1,cur=String(vals[c]||'');if(status==='Closed'&&(!cur||cur==='Pending'))vals[c]='Pending Review';if(status==='Open'&&isNew)vals[c]='';}
    // Historical screenshot status is explanatory only; never downgrade a linked screenshot.
    [['ENTRY','Entry Screenshot','Entry Screenshot Status',p.entry_screenshot_status],['EXIT','Exit Screenshot','Exit Screenshot Status',p.exit_screenshot_status]].forEach(x=>{
      const linkCol=map[x[1]], statusCol=map[x[2]]; if(!statusCol||!x[3])return;
      const hasLink=linkCol && (formulas[linkCol-1]||String(vals[linkCol-1]||'').trim()); if(!hasLink && !String(vals[statusCol-1]||'').includes('Captured'))vals[statusCol-1]=x[3];
    });
    range.setValues([vals]);
    // restore all formulas (primarily screenshot hyperlinks) that existed before the batch write
    formulas.forEach((f,i)=>{if(f)sheet.getRange(row,i+1).setFormula(f);});
    count++;
  });
  return count;
}

function fastExecutionBatchV5_(ss, executions) {
  const sheet=getOrCreateSheet_(ss,SETTINGS.executionsSheet);ensureHeaders_(sheet,EXECUTION_HEADERS);
  const map=headerMap_(sheet),lastCol=sheet.getLastColumn();const ids=new Set();
  if(sheet.getLastRow()>=2)sheet.getRange(2,map['Deal ID'],sheet.getLastRow()-1,1).getValues().forEach(r=>{if(r[0])ids.add(String(r[0]));});
  const rows=[];
  executions.forEach(p=>{const id=text_(p.deal_id);if(!id||ids.has(id))return;ids.add(id);const r=Array(lastCol).fill('');const put=(h,v)=>{if(map[h])r[map[h]-1]=v;};
    put('Deal ID',id);put('Trade Key',p.trade_key||'');put('Position ID',text_(p.position_id));put('Account Login',text_(p.account_login));put('Server',p.server||'');put('Symbol',p.symbol||'');put('Time',dateFromMillis_(p.time_ms));put('Deal Entry',p.deal_entry||'');put('Deal Type',p.deal_type||'');put('Volume',number_(p.volume));put('Price',number_(p.price));put('Profit',number_(p.profit));put('Commission',number_(p.commission));put('Swap',number_(p.swap));put('Fee',number_(p.fee));put('Reason',p.reason||'');put('Magic',text_(p.magic));put('Comment',p.comment||'');rows.push(r);});
  if(rows.length){const start=Math.max(sheet.getLastRow()+1,2);ensureRowExists_(sheet,start+rows.length-1);sheet.getRange(start,1,rows.length,lastCol).setValues(rows);}
  return rows.length;
}

function handleSyncBatch_(ss,p) {
  const trades=Array.isArray(p.trades)?p.trades:[], executions=Array.isArray(p.executions)?p.executions:[];
  const tc=fastUpsertTradeBatchV5_(ss,trades); const ec=fastExecutionBatchV5_(ss,executions);
  return jsonResponse_({ok:true,action:'SYNC_BATCH',trades:tc,executions:ec});
}
