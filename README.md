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

![Version](https://img.shields.io/badge/version-v5.8-2DE0B6?style=for-the-badge&labelColor=0B1220)
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

Version **5.8** adds proper **multi-account dashboard management**. Multiple trading accounts can write into the same Google Sheet, while the Dashboard calculates and displays **one selected account at a time**.

The current release connects a JournalNevis Expert Advisor to a Google Apps Script backend. Trade data is stored in Google Sheets, while entry and exit screenshots are stored in Google Drive and linked back to the corresponding trade.

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
- [Installation](#installation)
- [First setup](#first-setup)
- [Using JournalNevis](#using-journalnevis)
- [SYNC TODAY vs FULL SYNC](#sync-today-vs-full-sync)
- [Screenshots and recovery](#screenshots-and-recovery)
- [v5.8 screenshot-link repair](#v571-screenshot-link-repair)
- [Dashboard](#dashboard)
- [Trades sheet](#trades-sheet)
- [Manual review fields](#manual-review-fields)
- [Privacy](#privacy)
- [Project status](#project-status)
- [Roadmap](#roadmap)
- [Disclaimer](#disclaimer)

---

## What's new in v5.8

### Multi-account Dashboard

The Dashboard now has an **ACCOUNT VIEW** selector. When you choose an account, JournalNevis recalculates the Dashboard only for that account.

The selected account controls:

- Balance and Equity
- Initial Capital
- Net P/L
- Win Rate
- Profit Factor
- Drawdown
- Commission
- Winning and losing streaks
- Symbol Performance
- Monthly P/L
- Dashboard charts

Data from other connected accounts is not mixed into the selected account's Dashboard.

### Shared Trades sheet

All connected accounts continue to use the same **Trades** sheet. Account Login, Server and trade identifiers keep trades from different accounts separated.

### Account-scoped cash flow

Deposits, withdrawals, Initial Capital, Running Cash Flow and balance-curve calculations are separated by account.

### Account removal

An account can be removed from the spreadsheet through:

```text
JournalNevis v5.8
→ Advanced
→ Delete Selected Account Data...
```

Google Drive screenshots are intentionally **not** deleted by this command.

### Better CPU portability

For a public `.ex5` intended to run on different x64 computers, compile `JournalNevis_v5_8.mq5` using:

```text
X64 Regular
```

This avoids requiring AVX2 on older compatible x64 systems.

---

## Features

| Feature | What it does |
|---|---|
| **Automatic trade logging** | Records live transactions and can rebuild trade history from the account. |
| **Multi-account journal** | Multiple accounts can write to one spreadsheet. |
| **Account-selected Dashboard** | Dashboard statistics are scoped to one selected account at a time. |
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
      Trading Account A ── JournalNevis ──┐
                                          │
      Trading Account B ── JournalNevis ──┼──► Google Apps Script
                                          │            │
      Trading Account C ── JournalNevis ──┘            │
                                                       ├──► Google Sheets
                                                       │    Trades
                                                       │    Dashboard
                                                       │    Accounts
                                                       │
                                                       └──► Google Drive
                                                            Entry / Exit images
```

The repository and future JournalNevis website are used for distribution and documentation.

The normal journaling workflow does **not** require a central JournalNevis trade database.

---

# Multi-account design

## Dashboard

The Dashboard displays **one account at a time**.

The selector uses an account key based on:

```text
Account Login | Server
```

Changing the account in **ACCOUNT VIEW** refreshes the Dashboard for that account only.

A newly connected account is added to the selector without forcing a switch away from the account you are already viewing.

## Trades

All accounts share the same **Trades** sheet. JournalNevis keeps them separate internally using Account Login, Server, Position ID and Trade Key information.

## Accounts

The **Accounts** sheet stores the latest snapshot for each connected account, including items such as Balance, Equity, Currency, Floating P/L, Margin and Last Updated.

---

# Installation

## 1. Create your Google journal

Upload:

```text
JournalNevis_v5_8_Template.xlsx
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

Remove the default code and paste the content of the current JournalNevis Apps Script file.

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
> Never publish your personal API Secret in GitHub, screenshots, public `.set` files, forum posts, or tutorials.

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
JournalNevis_v5_8.ex5
```

to the appropriate Expert Advisors folder.

For the current MT5 integration:

```text
MQL5/Experts
```

Restart the terminal or refresh **Navigator → Expert Advisors**.

Attach JournalNevis to a dedicated chart and enter:

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
8. Run **FULL SYNC** once for the currently connected account.
9. Repeat the initial FULL SYNC from each additional account you want to add.

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

It focuses on the current trading day rather than repeatedly scanning the entire account history.

Typical use:

```text
Trade normally
→ Live logging runs automatically
→ Press SYNC TODAY when you want a daily reconciliation
```

## FULL SYNC

Use **FULL SYNC** when you intentionally want a complete rebuild or audit for the account currently connected to that MetaTrader terminal.

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
JN58_
JN57_
JN56_
TJ5_
```

This allows newer releases to recover images created by older versions.

---

# Screenshot-link repair carried into v5.8

Version **5.7.1** addresses a specific situation discovered during testing:

> Screenshots were successfully present in Google Drive, and the journal recognized that the trades had screenshots, but the screenshot links were not added to the Trades sheet.

The repair improves the matching process by using multiple identifiers and searching the Drive screenshot structure more reliably.

It can:

- match by **Trade Key**,
- fall back to **Position ID**,
- inspect nested screenshot folders,
- inspect `UNKNOWN` folders,
- recognize `JN57_`, `JN56_`, and legacy `TJ5_` names,
- preserve already-correct links,
- restore missing Entry/Exit links without re-uploading images that already exist.

After installing the v5.8 Apps Script, use:

```text
JournalNevis
→ Repair Screenshot Links
```

A repair report can show:

```text
Links restored: 7
Already linked: 12
Unmatched image files: 0
```

---

# Dashboard

The Dashboard is designed to provide a fast account-level overview.

### Account snapshot
- Balance
- Equity
- Initial Capital
- Floating P/L

### Performance
- Total Net Profit
- Gross Profit
- Gross Loss
- Profit Factor
- Expected Payoff
- Recovery Factor
- Win Rate
- Total Trades

### Drawdown
- Absolute Drawdown
- Maximal Drawdown
- Maximum Drawdown %
- Relative Drawdown
- Minimum Balance

### Symbol performance
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
- Long / Short count

### Charts
- Balance Curve
- Drawdown
- Net P/L by Symbol
- Win Rate by Symbol
- Monthly P/L
- Wins vs Losses

---

# Trades sheet

The Trades sheet combines automatically recorded trade information with manual review fields.

Typical automatic fields include:

- Symbol
- Direction
- Volume
- Open / Close Time
- Entry / Exit Price
- Stop Loss
- Take Profit
- Exit Reason
- Gross P/L
- Commission
- Swap
- Fee
- Net P/L
- Holding Time
- Source
- Entry Screenshot
- Exit Screenshot
- Status

---

# Manual review fields

Automation records **what happened**.  
A good journal also records **why it happened**.

| Field | Example |
|---|---|
| **Setup** | Pullback |
| **Entry Reason** | Retest after breakout |
| **Emotion** | Calm |
| **Mistake** | Early Entry |
| **Notes** | Entered before confirmation |
| **Review Status** | Reviewed |

Several fields include dropdown choices to make reviews faster and more consistent.

---

# Removing an account

First select the account in the Dashboard **ACCOUNT VIEW** dropdown.

Then use:

```text
JournalNevis v5.8
→ Advanced
→ Delete Selected Account Data...
```

After confirmation, JournalNevis removes that account from:

- Trades
- Executions
- Cash Flow
- Accounts
- Equity History

> [!IMPORTANT]
> Google Drive screenshots are **not deleted**.

---

# CPU compatibility / X64 Regular

If MetaTrader reports:

```text
your CPU architecture does not allow to run the file:
AVX2 required, you have AVX only

loading failed [568]
```

the `.ex5` was compiled for a CPU architecture that is not supported by that computer.

For a portable public build:

```text
MetaEditor
→ CPU architecture
→ X64 Regular
→ Compile
```

Verify that the build log reports:

```text
0 errors, 0 warnings
```

An EX5 already compiled for AVX2 cannot be made compatible with an AVX-only CPU by changing an EA input. It must be recompiled from the source using a compatible target.

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

The public release can include compiled components without requiring the full source code of every component to be published.

---

# Roadmap

Ideas being considered include:

- easier installation,
- improved onboarding,
- account aliases,
- portfolio-level multi-account views,
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

<div dir="rtl" align="right">

<h1>فارسی</h1>

<h2>معرفی JournalNevis</h2>

<p>
<strong>JournalNevis</strong> یک پروژه رایگان برای <strong>ژورنال‌نویسی خودکار معاملات</strong> است.
هدف پروژه این است که کارهای تکراری ثبت معامله کمتر شود و معامله‌گر بتواند زمان بیشتری را صرف مرور معاملات، بررسی روش‌های ورود، شناخت اشتباهات و تحلیل عملکرد کند.
</p>

<p>
در نسخه <code>5.8</code>، پشتیبانی واقعی از چند حساب به Dashboard اضافه شده است. چند حساب می‌توانند اطلاعات خود را در یک Google Sheet مشترک نگهداری کنند، اما Dashboard در هر لحظه فقط اطلاعات <strong>یک حساب انتخاب‌شده</strong> را محاسبه و نمایش می‌دهد.
</p>

<p>
اطلاعات معاملات از ابزار سمت پلتفرم معاملاتی دریافت می‌شود، از طریق <code>Google Apps Script</code> به <code>Google Sheets</code> فرستاده می‌شود و تصاویر ورود و خروج در <code>Google Drive</code> ذخیره می‌شوند.
</p>

<blockquote>
<strong>کمتر اطلاعات را دستی وارد کن؛ بیشتر معاملاتت را بررسی کن.</strong>
</blockquote>

<p>
<strong>نکته مهم:</strong> JournalNevis یک ابزار ژورنال و تحلیل است و خودش هیچ معامله‌ای را باز، بسته یا ویرایش نمی‌کند.
</p>

<hr>

<h2>تغییرات اصلی نسخه 5.8</h2>

<h3>Dashboard چندحسابی</h3>

<p>
در بالای Dashboard بخش <code>ACCOUNT VIEW</code> اضافه شده است. با انتخاب هر Account، تمام محاسبات Dashboard فقط برای همان حساب انجام می‌شوند.
</p>

<ul>
<li>Balance و Equity</li>
<li>Initial Capital</li>
<li>Net P/L</li>
<li>Win Rate</li>
<li>Profit Factor</li>
<li>Drawdown</li>
<li>Commission</li>
<li>Streakها</li>
<li>Symbol Performance</li>
<li>Monthly P/L</li>
<li>نمودارهای Dashboard</li>
</ul>

<p>
اطلاعات Accountهای دیگر با Dashboard حساب انتخاب‌شده ترکیب نمی‌شوند.
</p>

<h3>Cash Flow مستقل برای هر Account</h3>

<p>
Deposit، Withdrawal، Initial Capital، Running Cash Flow و Balance Curve برای هر Account جداگانه محاسبه می‌شوند.
</p>

<h3>حذف Account از Spreadsheet</h3>

<p>
در بخش Advanced می‌توانی Account انتخاب‌شده را از Spreadsheet حذف کنی، بدون اینکه Screenshotهای موجود در Google Drive پاک شوند.
</p>

<h3>سازگاری بهتر با CPUهای مختلف</h3>

<p>
برای نسخه عمومی EX5 پیشنهاد می‌شود فایل با Target برابر <code>X64 Regular</code> Compile شود.
</p>

<hr>

<h2>قابلیت‌های اصلی</h2>

<ul>
<li>ثبت خودکار معاملات زنده و تاریخچه حساب</li>
<li>پشتیبانی از چند Account در یک Spreadsheet</li>
<li>Dashboard مستقل برای Account انتخاب‌شده</li>
<li>ذخیره تصویر ورود با عنوان <code>Entry Screenshot</code></li>
<li>ذخیره تصویر خروج با عنوان <code>Exit Screenshot</code></li>
<li>ذخیره تصاویر در <code>Google Drive</code> خود کاربر</li>
<li>ثبت اطلاعات معاملات در <code>Google Sheets</code></li>
<li>داشبورد عملکرد، افت سرمایه و آمار هر نماد</li>
<li>ثبت و بررسی واریز، برداشت و رویدادهای مالی حساب</li>
<li>بازیابی تصاویر قدیمی و برگرداندن لینک‌های از دست‌رفته</li>
<li>همگام‌سازی روزانه با <code>SYNC TODAY</code></li>
<li>بازسازی کامل با <code>FULL SYNC</code></li>
<li>ثبت دستی روش ورود، دلیل ورود، احساس، اشتباه، یادداشت و وضعیت بررسی</li>
</ul>

<hr>

<h2>ساختار کلی JournalNevis</h2>

</div>

```text
Account A → JournalNevis ─┐
                          │
Account B → JournalNevis ─┼──► Google Apps Script
                          │            │
Account C → JournalNevis ─┘            │
                                       ├──► Google Sheets
                                       │    Trades / Dashboard / Accounts
                                       │
                                       └──► Google Drive
                                            Entry / Exit Screenshots
```

<div dir="rtl" align="right">

<h2>مدیریت چند Account</h2>

<p>
در Dashboard از بخش <code>ACCOUNT VIEW</code> می‌توانی Account موردنظر را انتخاب کنی.
</p>

<p>
Account Key بر اساس ترکیب Login و Server ساخته می‌شود:
</p>

</div>

```text
Account Login | Server
```

<div dir="rtl" align="right">

<p>
تمام Accountها همچنان داخل یک <code>Trades</code> Sheet مشترک نگهداری می‌شوند. JournalNevis با Account Login، Server و شناسه‌های Trade/Position معاملات را از هم جدا نگه می‌دارد.
</p>

<p>
Sheet با نام <code>Accounts</code> آخرین Snapshot هر Account را نگهداری می‌کند.
</p>

<hr>

<h2>آموزش نصب</h2>

<h3>مرحله ۱ — ساخت Google Sheet</h3>

<p>
فایل <code>JournalNevis_v5_8_Template.xlsx</code> را داخل <code>Google Drive</code> آپلود کن و با <code>Google Sheets</code> باز کن.
</p>

<p>برگه‌های اصلی برای استفاده روزمره:</p>

<ul>
<li><code>Dashboard</code></li>
<li><code>Trades</code></li>
<li><code>Accounts</code></li>
<li><code>Settings</code></li>
<li><code>Help</code></li>
</ul>

<h3>مرحله ۲ — نصب Google Apps Script</h3>

<p>داخل Google Sheet از مسیر زیر وارد شو:</p>

</div>

```text
Extensions → Apps Script
```

<div dir="rtl" align="right">

<p>
کد JournalNevis را جای‌گذاری و ذخیره کن. سپس یک بار تابع زیر را اجرا کن:
</p>

</div>

```javascript
setupJournalNevis()
```

<div dir="rtl" align="right">

<p>
در اولین اجرا ممکن است Google برای دسترسی‌های موردنیاز درخواست تأیید نمایش دهد.
</p>

<h3>مرحله ۳ — ساخت Web App</h3>

<p>در محیط Apps Script از مسیر زیر استفاده کن:</p>

</div>

```text
Deploy → New deployment → Web app
```

<div dir="rtl" align="right">

<p>
پس از انتشار، آدرسی دریافت می‌کنی که برای JournalNevis باید به <code>/exec</code> ختم شود.
</p>

<h3>مرحله ۴ — API Secret</h3>

<p>
برای ارتباط بین Expert و Google Backend از یک <code>API Secret</code> استفاده می‌شود.
</p>

<p>
<strong>هشدار:</strong> مقدار شخصی <code>API Secret</code> را داخل GitHub، تصویر عمومی، فایل تنظیمات عمومی یا آموزش منتشر نکن.
</p>

<h3>مرحله ۵ — نصب Expert</h3>

<p>
فایل <code>JournalNevis_v5_8.ex5</code> را داخل پوشه Expert Advisors قرار بده.
در ادغام فعلی MT5 مسیر معمول به شکل <code>MQL5/Experts</code> است.
</p>

<p>
JournalNevis را روی یک چارت اختصاصی اجرا کن و آدرس Web App و API Secret را وارد کن.
برای Journal اصلی حساب از نقش <code>MASTER</code> استفاده کن.
</p>

<hr>

<h2>اولین راه‌اندازی</h2>

<p>اگر از صفر شروع می‌کنی، بعد از نصب اولیه برای Account اول یک بار <code>FULL SYNC</code> اجرا کن. برای هر Account دیگری که می‌خواهی اضافه کنی نیز FULL SYNC اولیه را از Terminal همان Account اجرا کن.</p>

</div>

```text
Stage 1/4  Account / Funding
Stage 2/4  Trades / Executions
Stage 3/4  Screenshots
Stage 4/4  Dashboard / Finalize
```

<div dir="rtl" align="right">

<p>
بعد از بازسازی اولیه، برای استفاده روزمره معمولاً نیازی به اجرای دوباره <code>FULL SYNC</code> نیست.
</p>

<hr>

<h2>تفاوت SYNC TODAY و FULL SYNC</h2>

<h3>SYNC TODAY</h3>

<p>
گزینه <code>SYNC TODAY</code> برای بررسی روزانه طراحی شده و روی فعالیت همان روز تمرکز می‌کند، بنابراین لازم نیست هر بار کل تاریخچه حساب دوباره بررسی شود.
</p>

<h3>FULL SYNC</h3>

<p>از <code>FULL SYNC</code> در این موارد استفاده کن:</p>

<ul>
<li>نصب اولیه</li>
<li>ساخت Sheet جدید</li>
<li>بازسازی اطلاعات حذف‌شده</li>
<li>بازیابی تاریخچه قدیمی</li>
<li>بازیابی تصاویر و لینک‌های قدیمی</li>
<li>بررسی کامل حساب</li>
</ul>

<p>
<strong>نکته:</strong> لازم نیست بعد از هر معامله <code>FULL SYNC</code> اجرا شود.
</p>

<hr>

<h2>تصاویر معاملات و بازیابی آنها</h2>

<p>JournalNevis می‌تواند برای هر معامله تصویر ورود و خروج را ذخیره کند.</p>

</div>

```text
Chart
→ Local Screenshot
→ Google Drive
→ Link inside Trades
```

<div dir="rtl" align="right">

<p>
نسخه‌های جدید می‌توانند فایل‌های تصاویر قدیمی را نیز شناسایی کنند. Prefixهای پشتیبانی‌شده شامل موارد زیر هستند:
</p>

</div>

```text
JN58_
JN57_
JN56_
TJ5_
```

<div dir="rtl" align="right">

<h2>اصلاح مهم نسخه 5.7.1</h2>

<p>
در تست واقعی حالتی مشاهده شد که تصاویر با موفقیت داخل <code>Google Drive</code> قرار گرفته بودند، اما لینک آنها داخل ستون‌های <code>Entry Screenshot</code> و <code>Exit Screenshot</code> نوشته نمی‌شد.
</p>

<p>در نسخه <code>5.7.1</code> بخش بازیابی لینک تقویت شده است و می‌تواند:</p>

<ul>
<li>معامله را با <code>Trade Key</code> پیدا کند</li>
<li>در صورت نیاز از <code>Position ID</code> استفاده کند</li>
<li>پوشه‌های زیرمجموعه Drive را بررسی کند</li>
<li>پوشه‌های <code>UNKNOWN</code> را نیز جست‌وجو کند</li>
<li>فایل‌های <code>JN57_</code>، <code>JN56_</code> و <code>TJ5_</code> را تشخیص دهد</li>
<li>لینک‌های سالم قبلی را حفظ کند</li>
<li>بدون Upload مجدد تصویر، لینک فایل موجود در Drive را برگرداند</li>
</ul>

<p>برای تعمیر لینک‌ها از منوی JournalNevis گزینه زیر را اجرا کن:</p>

</div>

```text
Repair Screenshot Links
```

<div dir="rtl" align="right">

<h2>Dashboard</h2>

<p>Dashboard برای نمایش سریع وضعیت حساب و عملکرد معاملاتی طراحی شده است.</p>

<h3>اطلاعات حساب</h3>

<ul>
<li><code>Balance</code></li>
<li><code>Equity</code></li>
<li><code>Initial Capital</code></li>
<li><code>Floating P/L</code></li>
</ul>

<h3>عملکرد</h3>

<ul>
<li><code>Net Profit</code></li>
<li><code>Gross Profit</code></li>
<li><code>Gross Loss</code></li>
<li><code>Win Rate</code></li>
<li><code>Profit Factor</code></li>
<li><code>Expected Payoff</code></li>
<li><code>Recovery Factor</code></li>
</ul>

<h3>افت سرمایه</h3>

<ul>
<li>افت سرمایه مطلق</li>
<li>بیشترین افت سرمایه</li>
<li>درصد بیشترین افت سرمایه</li>
<li>حداقل Balance</li>
</ul>

<h3>عملکرد هر Symbol</h3>

<ul>
<li>تعداد معاملات</li>
<li>تعداد برد و باخت</li>
<li><code>Win Rate</code></li>
<li><code>Net P/L</code></li>
<li><code>Profit Factor</code></li>
<li><code>Commission</code></li>
<li>بهترین و بدترین معامله</li>
<li>میانگین زمان نگهداری</li>
<li>حجم معاملات</li>
<li>تعداد معاملات Long و Short</li>
</ul>

<hr>

<h2>Trades Sheet</h2>

<p>
اطلاعاتی مانند Symbol، جهت، حجم، زمان ورود و خروج، قیمت‌ها، Stop Loss، Take Profit، سود و زیان، Commission، مدت معامله و لینک تصاویر می‌توانند به صورت خودکار ثبت شوند.
</p>

<hr>

<h2>بخش دستی Review</h2>

<p>
ثبت خودکار نشان می‌دهد <strong>چه اتفاقی افتاده است</strong>؛ اما یک Journal خوب باید به بررسی <strong>دلیل تصمیم</strong> هم کمک کند.
</p>

<table>
<tr><th>فیلد</th><th>مثال</th></tr>
<tr><td>Setup</td><td><code>Pullback</code></td></tr>
<tr><td>Entry Reason</td><td>ورود پس از Retest</td></tr>
<tr><td>Emotion</td><td><code>FOMO</code></td></tr>
<tr><td>Mistake</td><td><code>Early Entry</code></td></tr>
<tr><td>Notes</td><td>ورود قبل از تأیید کندل</td></tr>
<tr><td>Review Status</td><td><code>Reviewed</code></td></tr>
</table>

<p>
بعضی از این فیلدها Dropdown دارند تا ثبت اطلاعات سریع‌تر و یکدست‌تر باشد.
</p>

<hr>

<h2>حذف اطلاعات یک Account</h2>

<p>
ابتدا Account موردنظر را در <code>ACCOUNT VIEW</code> انتخاب کن.
</p>

<p>سپس از مسیر زیر برو:</p>

</div>

```text
JournalNevis v5.8
→ Advanced
→ Delete Selected Account Data...
```

<div dir="rtl" align="right">

<p>
بعد از تأیید، اطلاعات Account از Trades، Executions، Cash Flow، Accounts و Equity History حذف می‌شوند.
</p>

<p>
<strong>مهم:</strong> Screenshotهای موجود در Google Drive حذف نمی‌شوند.
</p>

<hr>

<h2>خطای AVX2 و X64 Regular</h2>

<p>
اگر روی یک کامپیوتر پیام زیر را دیدی:
</p>

</div>

```text
your CPU architecture does not allow to run the file:
AVX2 required, you have AVX only

loading failed [568]
```

<div dir="rtl" align="right">

<p>
مشکل از منطق JournalNevis نیست. فایل EX5 با معماری CPU ناسازگار Compile شده است.
</p>

<p>
برای نسخه عمومی، در MetaEditor معماری CPU را روی <code>X64 Regular</code> قرار بده و دوباره Compile کن.
</p>

<p>
فایل EX5 که قبلاً با AVX2 ساخته شده باشد، با تغییر Inputهای Expert روی CPU فاقد AVX2 قابل اجرا نمی‌شود.
</p>

<hr>

<h2>حریم خصوصی</h2>

<ul>
<li>Apps Script را خودت Deploy می‌کنی</li>
<li>Google Sheet متعلق به خودت است</li>
<li>تصاویر داخل Google Drive خودت قرار می‌گیرند</li>
<li>API Secret تحت کنترل خودت است</li>
</ul>

<p>
در Workflow فعلی نیازی نیست تاریخچه معاملات داخل یک دیتابیس مرکزی JournalNevis ذخیره شود.
</p>

<hr>

<h2>وضعیت پروژه</h2>

<p>
JournalNevis فعلاً <strong>رایگان</strong> منتشر می‌شود و مرحله‌به‌مرحله بر اساس تست واقعی و استفاده عملی توسعه پیدا می‌کند.
</p>

<hr>

<h2>Roadmap</h2>

<ul>
<li>نصب آسان‌تر</li>
<li>آموزش بهتر</li>
<li>Account Alias</li>
<li>Portfolio View برای چند Account</li>
<li>تحلیل رفتاری بیشتر</li>
<li>گزارش‌ها و نمودارهای بیشتر</li>
<li>فرآیند Update ساده‌تر</li>
<li>سایت <code>JournalNevis.ir</code></li>
<li>بررسی پشتیبانی از نسخه‌ها یا پلتفرم‌های معاملاتی دیگر</li>
</ul>

<hr>

<h2>حمایت از پروژه</h2>

<p>
JournalNevis رایگان است. در آینده ممکن است امکان حمایت داوطلبانه برای کمک به توسعه، تست، مستندسازی و هزینه‌های پروژه اضافه شود.
</p>

<hr>

<h2>سلب مسئولیت</h2>

<p>
JournalNevis یک ابزار ثبت و تحلیل معاملات است و توصیه سرمایه‌گذاری، سیگنال معاملاتی یا تضمین سود ارائه نمی‌کند.
</p>

</div>

---

<div align="center">

### JournalNevis

**Trade automatically. Review intentionally.**

`v5.8`

</div>
