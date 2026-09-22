<div align="center">

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="JournalNevis_Wordmark_Dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="JournalNevis_Wordmark_Light.svg">
    <img src="JournalNevis_Wordmark_Dark.svg" alt="JournalNevis" width="620">
  </picture>
</p>

<br>

### Automated Trading Journal

**Trade automatically. Review intentionally.**

<br>

![Version](https://img.shields.io/badge/version-v5.8.2-2DE0B6?style=for-the-badge&labelColor=0B1220)
![Project](https://img.shields.io/badge/project-free-16A34A?style=for-the-badge&labelColor=0B1220)
![Multi Account](https://img.shields.io/badge/dashboard-multi--account-7C3AED?style=for-the-badge&labelColor=0B1220)
![Platform](https://img.shields.io/badge/platform-MetaTrader_5-2563EB?style=for-the-badge&labelColor=0B1220)
![Backend](https://img.shields.io/badge/backend-Google_Apps_Script-F4B400?style=for-the-badge&labelColor=0B1220)
![Dashboard](https://img.shields.io/badge/dashboard-Google_Sheets-0F9D58?style=for-the-badge&labelColor=0B1220)
![Storage](https://img.shields.io/badge/storage-Google_Drive-4285F4?style=for-the-badge&labelColor=0B1220)

<br>

[فارسی](#persian) · [English](#english)

</div>

---

<a id="persian"></a>

<div dir="rtl" align="right">

# فارسی

## JournalNevis چیست؟

**JournalNevis** یک پروژه رایگان برای ژورنال‌نویسی خودکار معاملات است.

هدف پروژه این است که کارهای تکراری ثبت معامله کمتر شود و معامله‌گر زمان بیشتری را صرف مرور عملکرد، روش ورود، اشتباهات، احساسات و تصمیم‌های معاملاتی کند.

در نسخه فعلی:

- اطلاعات معامله داخل فایل Google Sheets ثبت می‌شود.
- تصاویر ورود و خروج داخل Google Drive ذخیره می‌شوند.
- چند حساب می‌توانند از یک فایل مشترک استفاده کنند.
- داشبورد فقط اطلاعات حساب انتخاب‌شده را نشان می‌دهد.
- معاملات زنده می‌توانند داشبورد را بدون Sync دستی به‌روزرسانی کنند.

> **نکته مهم:** JournalNevis فقط ابزار ژورنال و تحلیل است و خودش هیچ معامله‌ای را باز، بسته یا ویرایش نمی‌کند.

---

## تغییرات نسخه 5.8.2

### تصویرهای استانداردتر و خواناتر

در نسخه 5.8.2، اندازه پیش‌فرض تصویر تغییر کرده تا روی مانیتورهای عریض، عکس بیش از حد کشیده نشود و کندل‌ها واضح‌تر باقی بمانند.

تنظیمات پیش‌فرض جدید:

</div>

<div dir="ltr" align="left">

```text
InpUseActualChartSize = false
InpScreenshotMaxWidth = 1440
InpScreenshotMaxHeight = 960
InpScreenshotFallbackWidth = 1440
InpScreenshotFallbackHeight = 900
```

</div>

<div dir="rtl" align="right">

اگر بخواهی دقیقاً اندازه فعلی چارت روی مانیتور گرفته شود، می‌توانی مقدار زیر را فعال کنی:

</div>

<div dir="ltr" align="left">

```text
InpUseActualChartSize = true
```

</div>

<div dir="rtl" align="right">

### به‌روزرسانی خودکار داشبورد

در نسخه‌های قبلی ممکن بود معامله داخل برگه معاملات ثبت شود ولی داشبورد تا زمان Refresh یا Sync دستی تغییر نکند.

در نسخه 5.8.2، بعد از دریافت اطلاعات زنده معامله و حساب، داشبورد برای حساب انتخاب‌شده به‌صورت خودکار به‌روزرسانی می‌شود.

اگر فقط یک حساب داخل فایل باقی مانده باشد، همان حساب به‌صورت خودکار برای داشبورد استفاده می‌شود.

### حفظ لینک تصاویر

اصلاح نسخه 5.8.1 همچنان داخل نسخه 5.8.2 وجود دارد.

لینک‌های تصویر ورود و خروج بعد از مراحل بعدی Sync نباید به متن ساده بدون لینک تبدیل شوند.

---

## قابلیت‌های اصلی

- ثبت خودکار معاملات زنده
- بازیابی تاریخچه حساب
- ثبت چند حساب در یک فایل
- انتخاب حساب برای داشبورد
- ثبت تصویر ورود
- ثبت تصویر خروج
- ذخیره تصاویر در Google Drive
- ثبت معاملات در Google Sheets
- تحلیل عملکرد هر نماد
- محاسبه سود و زیان
- محاسبه افت سرمایه
- ثبت کمیسیون، Swap و Fee
- ثبت واریز و برداشت
- ثبت روش ورود
- ثبت دلیل ورود
- ثبت احساس
- ثبت اشتباه
- ثبت یادداشت
- وضعیت Review
- بازیابی تصاویر قدیمی
- تعمیر لینک تصاویر
- Sync روزانه
- Full Sync برای بازسازی کامل

---

## ساختار کلی پروژه

برای جلوگیری از به‌هم‌ریختگی فارسی و انگلیسی در GitHub، ساختار پروژه را به‌صورت مرحله‌ای توضیح می‌دهیم:

1. MetaTrader اطلاعات معامله را تشخیص می‌دهد.
2. JournalNevis اطلاعات را به Google Apps Script می‌فرستد.
3. Google Apps Script اطلاعات را داخل Google Sheets ثبت می‌کند.
4. تصویرهای معامله داخل Google Drive ذخیره می‌شوند.
5. لینک تصویرها به همان معامله در برگه معاملات متصل می‌شود.
6. داشبورد برای حساب انتخاب‌شده محاسبه می‌شود.

بخش‌های اصلی پروژه:

| بخش | وظیفه |
|---|---|
| Expert Advisor | خواندن معاملات و گرفتن Screenshot |
| Google Apps Script | ارتباط بین MetaTrader و Google |
| Google Sheets | معاملات، حساب‌ها و Dashboard |
| Google Drive | ذخیره تصاویر ورود و خروج |

---

# آموزش نصب

## مرحله 1 — ساخت Google Sheet

فایل قالب را داخل Google Drive آپلود کن:

</div>

<div dir="ltr" align="left">

```text
JournalNevis_v5_8_2_Template.xlsx
```

</div>

<div dir="rtl" align="right">

بعد آن را با Google Sheets باز کن.

برگه‌های اصلی که کاربر می‌بیند:

- Dashboard
- Trades
- Accounts
- Settings
- Help

برگه‌های محاسباتی می‌توانند مخفی بمانند.

---

## مرحله 2 — نصب Google Apps Script

داخل Google Sheet این منوها را به ترتیب باز کن:

</div>

<div dir="ltr" align="left">

```text
Extensions
Apps Script
```

</div>

<div dir="rtl" align="right">

محتوای فایل زیر را داخل Apps Script قرار بده:

</div>

<div dir="ltr" align="left">

```text
JournalNevis_v5_8_2.gs
```

</div>

<div dir="rtl" align="right">

بعد فایل را Save کن.

برای نصب اولیه، یک بار تابع زیر را Run کن:

</div>

<div dir="ltr" align="left">

```javascript
setupJournalNevis()
```

</div>

<div dir="rtl" align="right">

در اولین اجرا ممکن است Google برای دسترسی‌های موردنیاز درخواست Permission نمایش دهد.

---

## مرحله 3 — Deploy کردن Web App

داخل Apps Script این گزینه‌ها را به ترتیب باز کن:

</div>

<div dir="ltr" align="left">

```text
Deploy
New deployment
Web app
```

</div>

<div dir="rtl" align="right">

بعد از Deploy یک URL دریافت می‌کنی.

URL مورد استفاده JournalNevis باید در انتها این مقدار را داشته باشد:

</div>

<div dir="ltr" align="left">

```text
/exec
```

</div>

<div dir="rtl" align="right">

همچنین JournalNevis از API Secret برای ارتباط امن بین Expert و Apps Script استفاده می‌کند.

> **هشدار:** API Secret شخصی خودت را داخل GitHub، Screenshot عمومی، فایل تنظیمات عمومی یا آموزش‌ها منتشر نکن.

---

## مرحله 4 — فعال‌کردن WebRequest

داخل MetaTrader این قسمت‌ها را به ترتیب باز کن:

</div>

<div dir="ltr" align="left">

```text
Tools
Options
Expert Advisors
```

</div>

<div dir="rtl" align="right">

گزینه زیر را فعال کن:

</div>

<div dir="ltr" align="left">

```text
Allow WebRequest for listed URL
```

</div>

<div dir="rtl" align="right">

بعد **هر دو آدرس زیر** را به لیست اضافه کن:

</div>

<div dir="ltr" align="left">

```text
https://script.google.com
https://script.googleusercontent.com
```

</div>

<div dir="rtl" align="right">

هر دو آدرس توصیه می‌شوند چون ارتباط Google Apps Script می‌تواند از دامنه اصلی و دامنه محتوای Google استفاده کند.

چیدمان این قسمت باید تقریباً این‌طور باشد:

</div>

<div dir="ltr" align="left">

```text
Experts

[x] Allow algorithmic trading

[x] Allow WebRequest for listed URL

https://script.google.com
https://script.googleusercontent.com
```

</div>

<div dir="rtl" align="right">

---

## مرحله 5 — نصب Expert

فایل اجرایی زیر را داخل پوشه Expert Advisors قرار بده:

</div>

<div dir="ltr" align="left">

```text
JournalNevis_v5_8_2.ex5
```

</div>

<div dir="rtl" align="right">

برای MT5 مسیر معمول:

</div>

<div dir="ltr" align="left">

```text
MQL5/Experts
```

</div>

<div dir="rtl" align="right">

بعد MetaTrader را Restart کن یا از بخش Navigator قسمت Expert Advisors را Refresh کن.

برای استفاده از JournalNevis نیازی به فایل Source یا Compile کردن کد نیست.


---

# تنظیم Expert

بعد از Attach کردن Expert به چارت، برای راه‌اندازی معمول فقط اطلاعات اتصال را وارد کن:

- Web App URL
- API Secret

بقیه تنظیمات می‌توانند روی مقدارهای پیش‌فرض باقی بمانند، مگر اینکه بخواهی رفتار Screenshot یا حالت چندچارتی را تغییر بدهی.

---

# اولین Full Sync

برای یک فایل جدید:

1. Google Sheet را آماده کن.
2. Apps Script را نصب کن.
3. تابع Setup را اجرا کن.
4. Web App را Deploy کن.
5. WebRequest را فعال کن.
6. Expert را روی چارت Attach کن.
7. اتصال را بررسی کن.
8. برای حساب اول یک بار Full Sync بزن.
9. اگر حساب دوم یا سوم داری، Full Sync اولیه را از Terminal همان حساب اجرا کن.

مراحل Full Sync:

</div>

<div dir="ltr" align="left">

```text
Stage 1/4
Account / Funding

Stage 2/4
Trades / Executions

Stage 3/4
Screenshots

Stage 4/4
Dashboard / Finalize
```

</div>

<div dir="rtl" align="right">

---

# تفاوت Sync Today و Full Sync

## Sync Today

برای استفاده روزانه است.

روی فعالیت همان روز تمرکز می‌کند و لازم نیست کل تاریخچه دوباره بررسی شود.

## Full Sync

برای بازسازی کامل اطلاعات حساب است.

مناسب برای:

- نصب اولیه
- اضافه‌کردن حساب جدید
- بازیابی تاریخچه
- بازسازی اطلاعات حذف‌شده
- بازیابی تصاویر
- Audit کامل حساب

لازم نیست بعد از هر معامله Full Sync اجرا شود.

---

# مدیریت چند حساب

## انتخاب حساب برای Dashboard

در بالای Dashboard بخش انتخاب حساب وجود دارد.

نام این بخش:

</div>

<div dir="ltr" align="left">

```text
ACCOUNT VIEW
```

</div>

<div dir="rtl" align="right">

هر حساب با ترکیب شماره Login و Server شناخته می‌شود.

نمونه:

</div>

<div dir="ltr" align="left">

```text
20279432 | WMMarkets-Demo
58423981 | WMMarkets-Demo
```

</div>

<div dir="rtl" align="right">

با انتخاب هر حساب:

- Balance همان حساب نمایش داده می‌شود.
- Equity همان حساب نمایش داده می‌شود.
- Profit و Loss همان حساب محاسبه می‌شود.
- Drawdown همان حساب محاسبه می‌شود.
- Win Rate همان حساب نمایش داده می‌شود.
- Symbol Performance همان حساب نمایش داده می‌شود.
- نمودارهای داشبورد فقط برای همان حساب ساخته می‌شوند.

اگر فقط یک حساب وجود داشته باشد، همان حساب به‌صورت خودکار انتخاب می‌شود.

---

## Trades

تمام حساب‌ها از یک برگه مشترک برای معاملات استفاده می‌کنند.

JournalNevis با استفاده از Account Login، Server، Position ID و Trade Key معاملات حساب‌های مختلف را از هم جدا نگه می‌دارد.

---

## Accounts

برگه Accounts آخرین Snapshot هر حساب را نگهداری می‌کند.

اطلاعاتی مثل:

- Account Login
- Server
- Broker
- Currency
- Balance
- Equity
- Credit
- Floating P/L
- Margin
- Free Margin
- Last Updated

---

# حذف اطلاعات یک حساب

ابتدا حساب موردنظر را در Dashboard انتخاب کن.

بعد منوی JournalNevis را باز کن و این گزینه‌ها را به ترتیب انتخاب کن:

</div>

<div dir="ltr" align="left">

```text
JournalNevis v5.8.2
Advanced
Delete Selected Account Data...
```

</div>

<div dir="rtl" align="right">

قبل از حذف، تأیید گرفته می‌شود.

اطلاعات حساب از این بخش‌ها حذف می‌شوند:

- Trades
- Executions
- Cash Flow
- Accounts
- Equity History

> **مهم:** تصاویر Google Drive با این دستور حذف نمی‌شوند.

---

# Screenshotها

برای هر معامله می‌توان تصویر ورود و خروج داشت.

روند کلی:

1. تصویر از چارت گرفته می‌شود.
2. فایل ابتدا Local ذخیره می‌شود.
3. فایل به Google Drive ارسال می‌شود.
4. لینک تصویر به معامله مربوطه وصل می‌شود.

نسخه 5.8.2 نام‌های قدیمی و جدید را برای Recovery در نظر می‌گیرد:

</div>

<div dir="ltr" align="left">

```text
JN58_
JN57_
JN56_
TJ5_
```

</div>

<div dir="rtl" align="right">

---

# تعمیر لینک Screenshotها

اگر تصویر داخل Google Drive وجود دارد ولی لینک آن داخل Trades کار نمی‌کند، منوی JournalNevis را باز کن و گزینه زیر را اجرا کن:

</div>

<div dir="ltr" align="left">

```text
Repair Screenshot Links
```

</div>

<div dir="rtl" align="right">

این بخش می‌تواند:

- Trade Key را بررسی کند.
- Position ID را بررسی کند.
- پوشه‌های داخلی Drive را بگردد.
- پوشه‌های UNKNOWN را هم بررسی کند.
- لینک‌های سالم قبلی را حفظ کند.
- لینک گم‌شده را بدون Upload مجدد تصویر برگرداند.

---

# Dashboard

Dashboard برای حساب انتخاب‌شده می‌تواند این اطلاعات را نمایش دهد:

## اطلاعات حساب

- Balance
- Equity
- Initial Capital
- Floating P/L

## عملکرد

- Net Profit
- Gross Profit
- Gross Loss
- Profit Factor
- Expected Payoff
- Recovery Factor
- Win Rate
- Total Trades

## Drawdown

- Absolute Drawdown
- Maximal Drawdown
- Maximum Drawdown Percentage
- Relative Drawdown
- Minimum Balance

## آمار معاملات

- Largest Win
- Largest Loss
- Average Win
- Average Loss
- Maximum Consecutive Wins
- Maximum Consecutive Losses
- Maximal Consecutive Profit
- Maximal Consecutive Loss
- Pending Reviews

## عملکرد هر نماد

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
- Long Count
- Short Count

## نمودارها

- Balance Curve
- Drawdown
- Net P/L by Symbol
- Win Rate by Symbol
- Monthly P/L
- Wins vs Losses

---

# بخش دستی Review

ثبت خودکار نشان می‌دهد چه اتفاقی افتاده است.

Review دستی کمک می‌کند دلیل تصمیم هم ثبت شود.

| فیلد | نمونه |
|---|---|
| Setup | Pullback |
| Entry Reason | ورود پس از Retest |
| Emotion | FOMO |
| Mistake | Early Entry |
| Notes | ورود قبل از تأیید |
| Review Status | Reviewed |

بعضی از این بخش‌ها Dropdown دارند تا Review سریع‌تر انجام شود.

---

# عیب‌یابی

## معاملات داخل Trades ثبت می‌شوند ولی Dashboard تغییر نمی‌کند

در نسخه 5.8.2 باید Dashboard بعد از Live update به‌صورت خودکار Refresh شود.

موارد زیر را بررسی کن:

1. حساب درست در Dashboard انتخاب شده باشد.
2. هر دو URL مربوط به WebRequest اضافه شده باشند.
3. آخرین نسخه Apps Script Deploy شده باشد.
4. Expert از URL صحیح استفاده کند.
5. API Secret درست باشد.

اگر لازم بود می‌توانی Dashboard را دستی هم Refresh کنی.

---

## Screenshot بیش از حد عریض است

تنظیم زیر را روی حالت پیش‌فرض نگه دار:

</div>

<div dir="ltr" align="left">

```text
InpUseActualChartSize = false
```

</div>

<div dir="rtl" align="right">

---

## Screenshot خالی یا ناقص است

اگر کندل‌ها یا History بروکر هنوز Load نشده باشند، گرفتن تصویر مناسب ممکن است با تأخیر انجام شود.

این موضوع در اینترنت ضعیف بروکر بیشتر دیده می‌شود.

---

## لینک Entry یا Exit وجود دارد ولی باز نمی‌شود

گزینه زیر را اجرا کن:

</div>

<div dir="ltr" align="left">

```text
Repair Screenshot Links
```

</div>

<div dir="rtl" align="right">

---

---

# حریم خصوصی

در معماری فعلی:

- Apps Script را خودت Deploy می‌کنی.
- Google Sheet متعلق به خودت است.
- تصاویر داخل Google Drive خودت هستند.
- API Secret تحت کنترل خودت است.

JournalNevis برای این Workflow نیاز ندارد تاریخچه معاملات را داخل دیتابیس مرکزی خودش ذخیره کند.

---

# وضعیت پروژه

JournalNevis فعلاً رایگان منتشر می‌شود.

---

# Roadmap

مواردی که ممکن است در آینده بررسی شوند:

- نصب آسان‌تر
- Account Alias
- Portfolio View
- تحلیل رفتاری بیشتر
- گزارش‌های بیشتر
- نمودارهای بیشتر
- Update ساده‌تر
- مستندات کامل‌تر
- JournalNevis.ir
- پشتیبانی از پلتفرم‌های معاملاتی دیگر

---

# حمایت از پروژه

JournalNevis رایگان است.

در آینده ممکن است Donation اختیاری برای کمک به توسعه، تست، مستندسازی و هزینه‌های پروژه اضافه شود.

دانلود اصلی پروژه قرار نیست به Donation وابسته باشد.

---

# سلب مسئولیت

JournalNevis یک ابزار ثبت و تحلیل معاملات است.

این پروژه توصیه سرمایه‌گذاری، سیگنال معاملاتی یا تضمین سود ارائه نمی‌کند.

</div>

---

<a id="english"></a>

# English

## Overview

**JournalNevis** is a free automated trading journal designed to reduce the manual work involved in recording and reviewing trades.

Version **5.8.2** supports multi-account journaling, account-scoped dashboards, improved screenshots, persistent screenshot links, and automatic live Dashboard refresh.

> [!IMPORTANT]
> JournalNevis is a **journal and analytics tool**. It does **not** open, modify, or close trades.

---

## Main features

- Automatic trade logging
- Live transaction capture
- Account-history recovery
- Multi-account support
- One selected account shown on Dashboard at a time
- Entry screenshots
- Exit screenshots
- Google Drive screenshot storage
- Google Sheets trade log
- Account-specific Dashboard metrics
- Symbol performance
- Cash-flow tracking
- Screenshot recovery and relinking
- Manual Setup / Emotion / Mistake / Notes review fields
- SYNC TODAY
- FULL SYNC

---

## What's new in v5.8.2

### Better screenshot defaults

The default screenshot canvas is now less wide and more readable:

```text
InpUseActualChartSize = false
InpScreenshotMaxWidth = 1440
InpScreenshotMaxHeight = 960
InpScreenshotFallbackWidth = 1440
InpScreenshotFallbackHeight = 900
```

If you want the exact visible chart-window size, set:

```text
InpUseActualChartSize = true
```

### Automatic Dashboard refresh

A live trade/account update now refreshes the Dashboard for the currently selected account.

This removes the need to press SYNC TODAY only to refresh Dashboard numbers.

### Screenshot-link persistence

The v5.8.1 RichText hyperlink fix remains included in v5.8.2.

---

# Installation

## 1. Google Sheet

Upload:

```text
JournalNevis_v5_8_2_Template.xlsx
```

to Google Drive and open it with Google Sheets.

Main visible sheets:

- Dashboard
- Trades
- Accounts
- Settings
- Help

---

## 2. Google Apps Script

Open:

```text
Extensions
Apps Script
```

Replace the code with:

```text
JournalNevis_v5_8_2.gs
```

Run once:

```javascript
setupJournalNevis()
```

---

## 3. Deploy Web App

Open:

```text
Deploy
New deployment
Web app
```

Use the production URL ending in:

```text
/exec
```

Keep your API Secret private.

---

## 4. MetaTrader WebRequest

Open:

```text
Tools
Options
Expert Advisors
```

Enable:

```text
Allow WebRequest for listed URL
```

Add both:

```text
https://script.google.com
https://script.googleusercontent.com
```

---

## 5. Install the Expert Advisor

Copy:

```text
JournalNevis_v5_8_2.ex5
```

into:

```text
MQL5/Experts
```

Restart MetaTrader or refresh **Navigator → Expert Advisors**.

Attach JournalNevis to a chart.

For normal use, enter only:

- Web App URL
- API Secret

No source file or local compilation is required for end users.


---

# First setup

1. Prepare the Google Sheet.
2. Install the Apps Script.
3. Run setup.
4. Deploy the Web App.
5. Allow both WebRequest URLs.
6. Attach the EA to a chart.
7. Confirm the connection.
8. Run FULL SYNC once for the first account.
9. Repeat the initial FULL SYNC from each additional account you want to add.

Sync stages:

```text
Stage 1/4  Account / Funding
Stage 2/4  Trades / Executions
Stage 3/4  Screenshots
Stage 4/4  Dashboard / Finalize
```

---

# Multi-account behavior

## Dashboard

The Dashboard shows one selected account at a time.

Account identity is based on:

```text
Account Login | Server
```

Changing ACCOUNT VIEW recalculates the Dashboard for that account.

If only one account remains, JournalNevis can use it automatically.

## Trades

All accounts share the same Trades sheet.

JournalNevis separates accounts internally using account identity and trade identifiers.

## Accounts

The Accounts sheet keeps the latest snapshot of every connected account.

---

# Removing an account

Select the account in ACCOUNT VIEW, then use:

```text
JournalNevis v5.8.2
Advanced
Delete Selected Account Data...
```

The selected account is removed from:

- Trades
- Executions
- Cash Flow
- Accounts
- Equity History

Google Drive screenshots are intentionally not deleted.

---

# Screenshot recovery

Supported screenshot generations include:

```text
JN58_
JN57_
JN56_
TJ5_
```

If screenshot files exist but their links are missing, use:

```text
Repair Screenshot Links
```

---

# Dashboard metrics

JournalNevis can show, for the selected account:

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
- Consecutive Wins / Losses
- Symbol Performance
- Monthly P/L

Charts can include:

- Balance Curve
- Drawdown
- Net P/L by Symbol
- Win Rate by Symbol
- Monthly P/L
- Wins vs Losses

---

# Manual review

The Trades sheet includes manual review fields such as:

| Field | Example |
|---|---|
| Setup | Pullback |
| Entry Reason | Retest after breakout |
| Emotion | FOMO |
| Mistake | Early Entry |
| Notes | Entered before confirmation |
| Review Status | Reviewed |

---

# Troubleshooting

## Trades update but Dashboard does not

Check:

1. The correct account is selected.
2. Both WebRequest URLs are allowed.
3. The latest Apps Script deployment is active.
4. The EA uses the correct `/exec` URL.
5. The API Secret is correct.

## Screenshot is too wide

Keep:

```text
InpUseActualChartSize = false
```

## Screenshot link is missing

Use:

```text
Repair Screenshot Links
```

---

# Privacy

The current workflow keeps the journal inside the user's own Google account:

- Apps Script is deployed by the user.
- Google Sheet belongs to the user.
- Screenshots stay in the user's Google Drive.
- API Secret remains private.

---

# Project status

JournalNevis is currently free to use.

A voluntary support/donation option may be added later.

---

# Disclaimer

JournalNevis is a journaling and analytics tool.

It does not provide investment advice, trading signals, profit guarantees, or protection from trading losses.

---

<div align="center">

### JournalNevis

**Trade automatically. Review intentionally.**

`v5.8.2`

</div>
