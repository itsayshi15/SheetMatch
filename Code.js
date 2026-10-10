/**
 * ==============================================================================
 * SheetMatch — Automated Multi-Database Record Matcher & Data Splitter
 * ==============================================================================
 *
 * Description:
 * Cross-references records from a Main Sheet against multiple external historical
 * database sheets using a unique identifier (e.g., Student ID, Email, Phone).
 *
 * Automatically generates two separate tabs:
 *   1. "Already Processed" (Includes matched source database details)
 *   2. "New / Unprocessed"
 */

// Global Configuration Settings
const CONFIG = {
  // Main sheet tab in the current active spreadsheet
  mainSheetName: "Main Applications",

  // Unique column header used to match records across spreadsheets
  uniqueIdHeader: "Student ID",

  // Output tab names generated automatically
  alreadyProcessedSheetName: "Already Processed",
  newUnprocessedSheetName: "New / Unprocessed",

  /**
   * External historical database sheets to cross-check against.
   * Add as many database sources as required.
   */
  databaseSources: [
    {
      spreadsheetUrl: "PASTE_HISTORICAL_DATABASE_URL_1",
      sheetName: "Sheet1"
    },
    {
      spreadsheetUrl: "PASTE_HISTORICAL_DATABASE_URL_2",
      sheetName: "Sheet1"
    }
  ]
};

/**
 * Main execution function for SheetMatch.
 */
function runSheetMatch() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const main = ss.getSheetByName(CONFIG.mainSheetName);

  // Validate existence of the main sheet
  if (!main) {
    throw new Error(`Main sheet "${CONFIG.mainSheetName}" was not found. Please verify tab name.`);
  }

  const data = main.getDataRange().getDisplayValues();

  if (data.length < 1) {
    throw new Error("The main sheet is empty.");
  }

  // Find unique ID column index dynamically
  const headers = data[0].map(h => h.trim());
  const idCol = headers.indexOf(CONFIG.uniqueIdHeader);

  if (idCol === -1) {
    throw new Error(`Column header "${CONFIG.uniqueIdHeader}" was not found in the main sheet.`);
  }

  // String normalizer helper (trims whitespace & converts to lowercase)
  const normalize = value => String(value ?? "").trim().toLowerCase();

  // Step 1: Collect IDs from all historical database sources
  const knownIds = new Set();
  const sourceById = new Map();

  CONFIG.databaseSources.forEach(source => {
    // Skip unconfigured or placeholder URLs
    if (!source.spreadsheetUrl || source.spreadsheetUrl.includes("PASTE_HISTORICAL_DATABASE_URL")) {
      return;
    }

    try {
      const sourceSS = SpreadsheetApp.openByUrl(source.spreadsheetUrl);
      const sheet = sourceSS.getSheetByName(source.sheetName);

      if (!sheet) {
        Logger.log(`Warning: Target tab "${source.sheetName}" not found in sheet: ${sourceSS.getName()}`);
        return;
      }

      const rows = sheet.getDataRange().getDisplayValues();
      if (rows.length === 0) return;

      const sourceHeaders = rows[0].map(h => h.trim());
      const sourceIdCol = sourceHeaders.indexOf(CONFIG.uniqueIdHeader);

      if (sourceIdCol === -1) {
        Logger.log(`Warning: Header "${CONFIG.uniqueIdHeader}" missing in database: ${sourceSS.getName()}`);
        return;
      }

      // Collect IDs and map records to source sheets
      rows.slice(1).forEach(row => {
        const id = normalize(row[sourceIdCol]);
        if (!id) return;

        knownIds.add(id);

        if (!sourceById.has(id)) {
          sourceById.set(id, new Set());
        }

        const sourceLabel = `${sourceSS.getName()} — ${source.sheetName}`;
        sourceById.get(id).add(sourceLabel);
      });
    } catch (error) {
      Logger.log(`Error processing external database (${source.spreadsheetUrl}): ${error.message}`);
    }
  });

  // Step 2: Prepare output headers
  const alreadyProcessed = [
    [...headers, "Original Main Sheet Row", "Matched Database Source(s)"]
  ];

  const newUnprocessed = [
    [...headers, "Original Main Sheet Row"]
  ];

  // Prevent processing duplicate IDs in the main sheet
  const seenIds = new Set();

  // Step 3: Categorize main sheet rows against external databases
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = normalize(row[idCol]);
    const originalRowNumber = i + 1;

    // Skip empty ID rows
    if (!id) continue;

    // Process only first occurrence of each ID
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    if (knownIds.has(id)) {
      const matchedSources = [...(sourceById.get(id) || [])].join("; ");
      alreadyProcessed.push([
        ...row,
        originalRowNumber,
        matchedSources
      ]);
    } else {
      newUnprocessed.push([
        ...row,
        originalRowNumber
      ]);
    }
  }

  // Step 4: Write output data to dedicated tabs
  writeOutputSheet(ss, CONFIG.alreadyProcessedSheetName, alreadyProcessed);
  writeOutputSheet(ss, CONFIG.newUnprocessedSheetName, newUnprocessed);

  // Completion alert
  SpreadsheetApp.getUi().alert(
    "SheetMatch Completed Successfully!\n\n" +
    `Already Processed Records: ${alreadyProcessed.length - 1}\n` +
    `New / Unprocessed Records: ${newUnprocessed.length - 1}\n\n` +
    "Note: Your main application sheet was left unchanged."
  );
}

/**
 * Helper function to create/clear output tabs and insert formatted data.
 */
function writeOutputSheet(ss, sheetName, rows) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clearContents();

  const rowCount = rows.length;
  const colCount = rows[0].length;

  if (sheet.getMaxRows() < rowCount) {
    sheet.insertRowsAfter(sheet.getMaxRows(), rowCount - sheet.getMaxRows());
  }

  if (sheet.getMaxColumns() < colCount) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), colCount - sheet.getMaxColumns());
  }

  // Format as plain text to preserve numerical IDs and formatting
  sheet.getRange(1, 1, rowCount, colCount).setNumberFormat("@");
  sheet.getRange(1, 1, rowCount, colCount).setValues(rows);

  // Format header row
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, colCount).setFontWeight("bold");
  sheet.autoResizeColumns(1, colCount);
}
