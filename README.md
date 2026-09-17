# JournalNevis v5.7

Clean package for a fresh start.

## Included files
- `JournalNevis_v5_7.mq5` — MT5 expert advisor
- `JournalNevis_v5_7.gs` — Google Apps Script backend
- `JournalNevis_v5_7_Template.xlsx` — spreadsheet template
- `JournalNevis_v5_7_Icon.png` — app icon
- `JournalNevis_v5_7_Wordmark.png` — wordmark/logo

## Main updates in v5.7
1. Cleaner JournalNevis branding without platform-specific title text.
2. Refined EA panel defaults:
   - upper-left by default
   - lower-left as alternate preset
   - panel placed slightly lower
   - progress bar moved lower
   - cleaner button spacing
3. Google Sheet updates:
   - Dashboard title updated
   - Accounts, Settings, and Help sheets remain visible
   - Setup / Emotion / Mistake / Review Status dropdown defaults added
   - Lists sheet stays hidden
4. Screenshot filename prefix updated to `JN57_` while still accepting `JN56_` and legacy `TJ5_` names.
5. Wins vs losses color convention kept as Wins=green and Losses=red in the Apps Script dashboard charts.

## Fresh-start suggestion
If you want a clean start:
1. Keep local screenshot files in `MQL5/Files`.
2. Replace the old EA with `JournalNevis_v5_7.mq5`.
3. Replace the Apps Script code with `JournalNevis_v5_7.gs`.
4. Use the new spreadsheet template.
5. Run setup once, then use FULL SYNC.
