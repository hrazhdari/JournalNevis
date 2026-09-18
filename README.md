<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="JournalNevis_Wordmark_Dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="JournalNevis_Wordmark_Light.svg">
  <img src="JournalNevis_Wordmark_Dark.svg" alt="JournalNevis" width="620">
</picture>

<br>

### Automated Trading Journal

**Trade automatically. Review intentionally.**

<br>

![Version](https://img.shields.io/badge/version-v5.7.1-2DE0B6?style=for-the-badge&labelColor=0B1220)
![Project](https://img.shields.io/badge/project-free-16A34A?style=for-the-badge&labelColor=0B1220)
![Current Integration](https://img.shields.io/badge/current_integration-MetaTrader_5-2563EB?style=for-the-badge&labelColor=0B1220)
![Backend](https://img.shields.io/badge/backend-Google_Apps_Script-F4B400?style=for-the-badge&labelColor=0B1220)
![Dashboard](https://img.shields.io/badge/dashboard-Google_Sheets-0F9D58?style=for-the-badge&labelColor=0B1220)
![Screenshots](https://img.shields.io/badge/screenshots-Google_Drive-4285F4?style=for-the-badge&labelColor=0B1220)

<br>

[English](#english) · [فارسی](#persian)

</div>

---

<a id="english"></a>

# English

## Overview

**JournalNevis** is a free automated trading-journal project built to reduce the manual work involved in recording and reviewing trades.

The current release connects a journal Expert Advisor to a Google Apps Script backend. Trade data is stored in Google Sheets, while entry and exit screenshots are stored in Google Drive and linked back to the corresponding trade.

The goal is simple:

> **Spend less time copying trade data and more time reviewing decisions, setups, mistakes, and performance.**

JournalNevis can help answer questions such as:

- Which symbols do I trade most?
- What is my win rate by symbol?
- How much am I paying in commissions?
- What is my account drawdown?
- Which setups perform better?
- Do certain emotions or mistakes appear repeatedly?
- What did the chart look like when I entered or exited?

> [!IMPORTANT]
> JournalNevis is a **journal and analytics tool**.  
> It does **not** open, modify, or close trades.

---

## Table of contents

- [Features](#features)
- [How JournalNevis works](#how-journalnevis-works)
- [Repository files](#repository-files)
- [Installation](#installation)
- [First setup](#first-setup)
- [Using JournalNevis](#using-journalnevis)
- [SYNC TODAY vs FULL SYNC](#sync-today-vs-full-sync)
- [Screenshots and recovery](#screenshots-and-recovery)
- [v5.7.1 screenshot-link repair](#v571-screenshot-link-repair)
- [Dashboard](#dashboard)
- [Trades sheet](#trades-sheet)
- [Manual review fields](#manual-review-fields)
- [Privacy](#privacy)
- [Project status](#project-status)
- [Roadmap](#roadmap)
- [Disclaimer](#disclaimer)

---

## Features

| Feature | What it does |
|---|---|
| **Automatic trade logging** | Records live transactions and can rebuild trade history from the account. |
| **Entry screenshots** | Captures the chart around trade entry. |
| **Exit screenshots** | Captures the chart around trade exit. |
| **Google Drive storage** | Stores trade screenshots in the user's own Drive. |
| **Google Sheets journal** | Writes trade information into a structured journal. |
| **Professional dashboard** | Shows P/L, drawdown, win rate, symbol statistics, streaks and charts. |
| **Symbol performance** | Tracks results separately for each traded symbol. |
| **Funding tracking** | Can track deposits, withdrawals and account-level cash events. |
| **Screenshot recovery** | Can relink or re-upload previously saved screenshots. |
| **SYNC TODAY** | Checks only today's relevant activity. |
| **FULL SYNC** | Performs a full historical reconciliation. |
| **Manual trade review** | Setup, Entry Reason, Emotion, Mistake, Notes and Review Status remain editable. |
| **Local screenshot cache** | Existing screenshot files can be reused after rebuilding the cloud journal. |

---

## How JournalNevis works

```text
        Trading account
              │
              ▼
      JournalNevis Expert
              │
              │ HTTPS
              ▼
      Google Apps Script
         Web App backend
          │           │
          │           │
          ▼           ▼
  Google Sheets   Google Drive
  Trades          Entry images
  Dashboard       Exit images
  Accounts
```

The repository and future JournalNevis website are used for distribution and documentation.

The normal journaling workflow does **not** require a central JournalNevis trade database.

---

## Repository files

The public repository currently contains files such as:

```text
JournalNevis/
├── README.md
├── JournalNevis_v5_7.ex5
├── JournalNevis_v5_7.gs
├── JournalNevis_v5_7_Template.xlsx
├── JournalNevis_Wordmark_Dark.svg
├── JournalNevis_Wordmark_Light.svg
├── JournalNevis_Icon.png
└── JOURNALNEVIS_v5_7_FINAL_REVIEW.txt
```

> [!NOTE]
> The project is free to use.  
> The compiled Expert Advisor may be distributed without publishing the `.mq5` source in the current release.

---

# Installation

## 1. Create your Google journal

Upload:

```text
JournalNevis_v5_7_Template.xlsx
```

to Google Drive and open it using **Google Sheets**.

The main visible sheets are:

- **Dashboard**
- **Trades**
- **Accounts**
- **Settings**
- **Help**

Supporting calculation sheets may remain hidden.

---

## 2. Install the Google Apps Script backend

Inside the Google Sheet, open:

```text
Extensions → Apps Script
```

Remove the default code and paste the content of:

```text
JournalNevis_v5_7.gs
```

Save the project.

Then run:

```javascript
setupJournalNevis()
```

once.

Google may ask you to authorize the script.

---

## 3. Deploy the Web App

In Apps Script:

```text
Deploy
→ New deployment
→ Web app
```

Create the deployment and copy the production URL.

The URL used by JournalNevis should end with:

```text
/exec
```

JournalNevis also uses an **API Secret** to protect requests between the Expert Advisor and the Google backend.

> [!CAUTION]
> Never publish your personal API Secret in:
>
> - GitHub
> - screenshots
> - public `.set` files
> - forum posts
> - tutorials

---

## 4. Allow WebRequest

In MetaTrader:

```text
Tools
→ Options
→ Expert Advisors
```

Enable WebRequest and add the required Google Apps Script address/domain.

---

## 5. Install JournalNevis

Copy:

```text
JournalNevis_v5_7.ex5
```

to the appropriate Expert Advisors folder.

For the current MT5 integration:

```text
MQL5/Experts
```

Restart the terminal or refresh **Navigator → Expert Advisors**.

Attach JournalNevis to a dedicated chart.

Enter:

- Web App `/exec` URL
- API Secret
- Journal role/settings

For the main account journal, use the **MASTER** role.

---

# First setup

For a completely new journal:

1. Create/import the new Google Sheet.
2. Install the Apps Script.
3. Run `setupJournalNevis()`.
4. Deploy the Web App.
5. Add the WebRequest address in the trading terminal.
6. Attach JournalNevis.
7. Confirm the connection.
8. Run **FULL SYNC** once.

The sync is processed in four stages:

```text
Stage 1/4  Account / funding
Stage 2/4  Trades / executions
Stage 3/4  Screenshots
Stage 4/4  Dashboard / finalize
```

After the initial rebuild, normal daily use usually does **not** require FULL SYNC again.

---

# Using JournalNevis

## Live trades

When a trade event is detected, JournalNevis can:

1. identify the trade,
2. capture the relevant chart screenshot,
3. store trade information,
4. upload the screenshot,
5. link it to the correct trade,
6. update the account journal.

Trade data and screenshots are handled separately so that a screenshot problem does not have to prevent the trade itself from being recorded.

---

## MASTER and screenshot charts

A MASTER instance is responsible for account-level journaling and reconciliation.

If you want accurate screenshots for multiple symbols, you can use dedicated screenshot instances on those symbol charts.

Example:

```text
XAUUSD chart → MASTER
USDJPY chart → Screenshot Agent
US30 chart   → Screenshot Agent
```

The trade can still be opened from another chart, another Expert Advisor, or another device.

---

# SYNC TODAY vs FULL SYNC

## SYNC TODAY

Use **SYNC TODAY** for routine reconciliation.

It is designed to work on the current trading day rather than repeatedly scanning the entire account history.

Typical use:

```text
Trade normally
→ Live logging runs automatically
→ Press SYNC TODAY only when you want a daily reconciliation
```

---

## FULL SYNC

Use **FULL SYNC** when you intentionally want a complete rebuild or audit.

Recommended situations:

- first installation,
- a new Google Sheet,
- rebuilding deleted journal data,
- repairing historical trades,
- recovering old screenshot links,
- checking the complete available account history.

> [!TIP]
> FULL SYNC is a repair/rebuild tool, not a button that needs to be pressed after every trade.

---

# Screenshots and recovery

JournalNevis supports entry and exit images.

Screenshots are:

1. captured from the dedicated chart,
2. saved locally,
3. uploaded to Google Drive,
4. linked to the trade row.

The local cache is useful if the cloud journal is rebuilt later.

Supported screenshot generations currently include names beginning with:

```text
JN57_
JN56_
TJ5_
```

This allows newer releases to recover images created by older versions.

---

# v5.7.1 screenshot-link repair

Version **5.7.1** addresses a specific situation discovered during testing:

> Screenshots were successfully present in Google Drive, and the journal recognized that the trades had screenshots, but the screenshot links were not added to the Trades sheet.

The repair improves the matching process by using multiple identifiers and by searching the Drive screenshot structure more reliably.

### The repair can:

- match by **Trade Key**,
- fall back to **Position ID**,
- inspect nested screenshot folders,
- inspect `UNKNOWN` folders,
- recognize `JN57_`, `JN56_`, and legacy `TJ5_` names,
- preserve already-correct links,
- restore missing Entry/Exit links without re-uploading images that already exist.

After installing the v5.7.1 Apps Script, use:

```text
JournalNevis
→ Repair Screenshot Links
```

A repair report can show values such as:

```text
Links restored: 7
Already linked: 12
Unmatched image files: 0
```

If the image already exists in Drive, repairing its link does not require the Expert Advisor to capture it again.

---

# Dashboard

The Dashboard is designed to give a quick account-level overview.

## Account snapshot

- Balance
- Equity
- Initial Capital
- Floating P/L

## Performance

- Total Net Profit
- Gross Profit
- Gross Loss
- Profit Factor
- Expected Payoff
- Recovery Factor
- Win Rate
- Total Trades

## Drawdown

- Balance Drawdown Absolute
- Balance Drawdown Maximal
- Maximum Drawdown %
- Relative Drawdown
- Minimum Balance

## Trade statistics

- Largest profit trade
- Largest loss trade
- Average profit trade
- Average loss trade
- Maximum consecutive wins
- Maximum consecutive losses
- Maximal consecutive profit
- Maximal consecutive loss
- Average consecutive wins/losses

## Symbol performance

For each symbol JournalNevis can show:

- Trades
- Wins
- Losses
- Win Rate
- Net P/L
- Profit Factor
- Commission
- Average Trade
- Best Trade
- Worst Trade
- Average Holding Time
- Volume
- Long trades
- Short trades

## Charts

Dashboard charts can include:

- Balance curve
- Drawdown
- Net P/L by symbol
- Win rate by symbol
- Monthly P/L
- Wins vs Losses

---

# Trades sheet

The Trades sheet combines automatic trade data with manual review fields.

Automatically recorded fields can include:

- Symbol
- Direction
- Volume
- Open time
- Entry price
- Stop Loss
- Take Profit
- Close time
- Exit price
- Exit reason
- Gross P/L
- Commission
- Swap
- Fee
- Net P/L
- Holding time
- Source
- Entry screenshot
- Exit screenshot
- Status

---

# Manual review fields

Automation records **what happened**.

A good journal also records **why it happened**.

JournalNevis therefore keeps manual review fields such as:

| Field | Example |
|---|---|
| **Setup** | Pullback |
| **Entry Reason** | Retest of support after breakout |
| **Emotion** | Calm |
| **Mistake** | Early Entry |
| **Notes** | Entered before candle confirmation |
| **Review Status** | Pending Review |

Several fields include dropdown choices to make reviews faster and more consistent.

Example:

```text
Setup: Pullback
Emotion: FOMO
Mistake: Early Entry
Review Status: Reviewed
```

Over time, this information can help you identify behavioral patterns that pure P/L statistics do not show.

---

# Privacy

In the current architecture:

- the Apps Script is deployed by **you**,
- the spreadsheet belongs to **you**,
- screenshots are stored in **your Google Drive**,
- the API Secret remains under **your control**.

JournalNevis does not require a central JournalNevis trade-history database for this workflow.

---

# Project status

JournalNevis is currently provided **free of charge**.

The project is being developed iteratively based on real usage and testing.

The current public release can include compiled components without requiring the full source code of every component to be published.

---

# Roadmap

Ideas being considered include:

- easier installation,
- improved onboarding,
- more behavioral analytics,
- more dashboard reports,
- easier update workflow,
- improved documentation,
- JournalNevis.ir documentation portal,
- additional trading-platform integrations.

> [!NOTE]
> Roadmap items are ideas under consideration, not guaranteed features.

---

# Support the project

JournalNevis is free.

A voluntary donation/support option may be added later for users who want to help continued development, documentation, testing, and hosting.

Core downloads are intended to remain accessible without requiring a donation.

---

# Disclaimer

JournalNevis is a journaling and analytics tool.

It does not provide investment advice, trading signals, profit guarantees, or protection from trading losses.

---

<a id="persian"></a>

# فارسی

## معرفی JournalNevis

**JournalNevis** یک پروژه رایگان برای **ژورنال‌نویسی خودکار معاملات** است.

هدف پروژه این است که کارهای تکراری ثبت معامله کمتر شود و معامله‌گر بتواند زمان بیشتری را صرف **مرور معاملات، بررسی Setupها، شناخت اشتباهات و تحلیل عملکرد** کند.

در نسخه فعلی، JournalNevis اطلاعات معاملات را از ابزار سمت پلتفرم معاملاتی دریافت می‌کند، از طریق Google Apps Script به Google Sheets می‌فرستد و Screenshotهای ورود و خروج را در Google Drive ذخیره می‌کند.

به زبان ساده:

> **کمتر اطلاعات را دستی وارد کن؛ بیشتر معاملاتت را بررسی کن.**

> [!IMPORTANT]
> JournalNevis یک **ابزار ژورنال و تحلیل** است و خودش معامله‌ای را باز، بسته یا ویرایش نمی‌کند.

---

## قابلیت‌های اصلی

| قابلیت | توضیح |
|---|---|
| **ثبت خودکار معاملات** | معاملات Live و History را ثبت و بازیابی می‌کند. |
| **Entry Screenshot** | هنگام ورود تصویر چارت را ذخیره می‌کند. |
| **Exit Screenshot** | هنگام خروج تصویر چارت را ذخیره می‌کند. |
| **Google Drive** | تصاویر در Drive خود کاربر ذخیره می‌شوند. |
| **Google Sheets** | اطلاعات معاملات در Journal ثبت می‌شوند. |
| **Dashboard** | آمار عملکرد، Drawdown، Symbolها و نمودارها را نمایش می‌دهد. |
| **Symbol Performance** | عملکرد هر نماد را جداگانه بررسی می‌کند. |
| **Funding Tracking** | Deposit، Withdrawal و بعضی رویدادهای حساب را ثبت می‌کند. |
| **Screenshot Recovery** | عکس‌های قبلی را دوباره پیدا و Link می‌کند. |
| **SYNC TODAY** | فعالیت امروز را بررسی می‌کند. |
| **FULL SYNC** | کل History را بررسی و بازسازی می‌کند. |
| **Manual Review** | Setup، Emotion، Mistake، Notes و موارد دیگر را خودت ثبت می‌کنی. |

---

# آموزش نصب

## مرحله ۱ — Google Sheet

فایل:

```text
JournalNevis_v5_7_Template.xlsx
```

را داخل Google Drive آپلود کن و با Google Sheets باز کن.

Sheetهای اصلی:

- Dashboard
- Trades
- Accounts
- Settings
- Help

---

## مرحله ۲ — Apps Script

از داخل Google Sheet برو به:

```text
Extensions → Apps Script
```

کد JournalNevis را Paste و Save کن.

بعد یک بار اجرا کن:

```javascript
setupJournalNevis()
```

---

## مرحله ۳ — Web App

در Apps Script:

```text
Deploy → New deployment → Web app
```

Web App را Deploy کن و URL نهایی `/exec` را بردار.

همین URL در JournalNevis استفاده می‌شود.

---

## مرحله ۴ — API Secret

API Secret را از تنظیمات JournalNevis بردار و داخل Expert وارد کن.

> [!CAUTION]
> API Secret شخصی را داخل GitHub، Screenshot یا فایل عمومی منتشر نکن.

---

## مرحله ۵ — نصب Expert

فایل:

```text
JournalNevis_v5_7.ex5
```

را در پوشه Expert Advisors قرار بده.

برای ادغام فعلی MT5:

```text
MQL5/Experts
```

JournalNevis را روی یک چارت اختصاصی اجرا کن و URL و API Secret را وارد کن.

---

# اولین راه‌اندازی

اگر از صفر شروع می‌کنی، بعد از نصب اولیه یک بار:

```text
FULL SYNC
```

اجرا کن.

مراحل:

```text
Stage 1/4  Account / Funding
Stage 2/4  Trades / Executions
Stage 3/4  Screenshots
Stage 4/4  Dashboard / Finalize
```

بعد از آن برای کار روزانه معمولاً `SYNC TODAY` کافی است.

---

# تفاوت SYNC TODAY و FULL SYNC

## SYNC TODAY

برای استفاده عادی روزانه است و روی فعالیت امروز تمرکز می‌کند.

## FULL SYNC

برای موارد زیر است:

- نصب اولیه
- Sheet جدید
- بازسازی History
- بازیابی Screenshot
- Audit کامل حساب

لازم نیست بعد از هر معامله FULL SYNC بزنی.

---

# Screenshot و بازیابی

JournalNevis می‌تواند:

```text
Entry Screenshot
Exit Screenshot
```

را ذخیره کند.

مسیر کلی:

```text
Chart
→ Local Screenshot
→ Google Drive
→ Link داخل Trades
```

نسخه‌های جدید می‌توانند فایل‌هایی با Prefixهای زیر را شناسایی کنند:

```text
JN57_
JN56_
TJ5_
```

---

# اصلاح مهم v5.7.1

در تست واقعی یک مشکل مشخص شد:

**عکس‌ها داخل Google Drive بودند، اما Link آنها داخل Entry Screenshot یا Exit Screenshot قرار نمی‌گرفت.**

در v5.7.1 این بخش اصلاح شد.

Repair جدید می‌تواند:

- Trade Key را بررسی کند،
- در صورت نیاز Position ID را استفاده کند،
- Folderهای زیرمجموعه را بگردد،
- Folderهای `UNKNOWN` را هم بررسی کند،
- فایل‌های `JN57_`، `JN56_` و `TJ5_` را شناسایی کند،
- Link سالم قبلی را تغییر ندهد،
- بدون Upload مجدد عکس، Link را برگرداند.

از منوی JournalNevis اجرا کن:

```text
Repair Screenshot Links
```

---

# Dashboard

Dashboard می‌تواند اطلاعاتی مثل این را نمایش دهد:

- Balance
- Equity
- Initial Capital
- Floating P/L
- Net Profit
- Gross Profit
- Gross Loss
- Win Rate
- Profit Factor
- Expected Payoff
- Recovery Factor
- Drawdown
- Largest Win
- Largest Loss
- Consecutive Wins/Losses
- Symbol Performance

نمودارها نیز می‌توانند شامل:

- Balance Curve
- Drawdown
- Net P/L by Symbol
- Win Rate by Symbol
- Monthly P/L
- Wins vs Losses

باشند.

---

# بخش دستی Review

ثبت خودکار فقط می‌گوید **چه اتفاقی افتاده**.

اما برای یک Journal خوب باید **دلیل و رفتار معامله‌گر** هم ثبت شود.

فیلدهای دستی:

| فیلد | مثال |
|---|---|
| Setup | Pullback |
| Entry Reason | Retest after breakout |
| Emotion | FOMO |
| Mistake | Early Entry |
| Notes | Entered before confirmation |
| Review Status | Reviewed |

این داده‌ها می‌توانند در آینده برای پیدا کردن الگوهای رفتاری بسیار مفید باشند.

---

# حریم خصوصی

در معماری فعلی:

- Apps Script را خودت Deploy می‌کنی،
- Sheet متعلق به خودت است،
- Screenshotها در Google Drive خودت قرار می‌گیرند،
- API Secret تحت کنترل خودت است.

برای این Workflow نیازی نیست History معاملاتت داخل دیتابیس مرکزی JournalNevis ذخیره شود.

---

# رایگان

JournalNevis فعلاً رایگان منتشر می‌شود.

ممکن است در آینده یک بخش حمایت داوطلبانه برای کمک به توسعه، مستندسازی و هزینه‌های پروژه اضافه شود.

---

# Roadmap

مواردی که ممکن است در آینده بررسی شوند:

- نصب آسان‌تر
- آموزش بهتر
- Analytics بیشتر
- Behavioral Analytics
- Update ساده‌تر
- سایت JournalNevis.ir
- پشتیبانی از نسخه‌ها یا پلتفرم‌های معاملاتی دیگر

---

# سلب مسئولیت

JournalNevis یک ابزار ثبت و تحلیل معاملات است و توصیه سرمایه‌گذاری یا سیگنال معاملاتی ارائه نمی‌کند.

---

<div align="center">

### JournalNevis

**Trade automatically. Review intentionally.**

`v5.7.1`

</div>
