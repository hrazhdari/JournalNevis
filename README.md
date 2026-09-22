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

![Version](https://img.shields.io/badge/version-v5.8.2-2DE0B6?style=for-the-badge&labelColor=0B1220)
![Project](https://img.shields.io/badge/project-free-16A34A?style=for-the-badge&labelColor=0B1220)
![Platform](https://img.shields.io/badge/platform-MetaTrader_5-2563EB?style=for-the-badge&labelColor=0B1220)
![Backend](https://img.shields.io/badge/backend-Google_Apps_Script-F4B400?style=for-the-badge&labelColor=0B1220)
![Dashboard](https://img.shields.io/badge/dashboard-Google_Sheets-0F9D58?style=for-the-badge&labelColor=0B1220)
![Storage](https://img.shields.io/badge/storage-Google_Drive-4285F4?style=for-the-badge&labelColor=0B1220)

<br>

[English](#english) · [فارسی](#persian)

</div>

---

<a id="english"></a>

# English

## Overview

**JournalNevis** is a free automated trading journal for MetaTrader 5.
It sends trade data to **Google Sheets** and stores entry/exit screenshots in **Google Drive**.

Version **5.8.2** keeps the recent multi-account structure and adds two practical fixes:

1. **Better screenshot defaults**: screenshots are now captured with a more standard canvas, so they are less wide and usually clearer.
2. **Automatic dashboard refresh**: when a live trade update reaches the sheet, the Dashboard refreshes automatically for the selected account. You should no longer need to press **SYNC TODAY** just to see updated dashboard numbers.

> [!IMPORTANT]
> JournalNevis is a **journal and analytics tool**.
> It does **not** open, modify, or close trades.

---

## What is new in v5.8.2

### Better screenshots

The default screenshot settings were changed to reduce very wide images.
The new defaults aim for a more standard and readable image while keeping file size reasonable.

**Default behavior in v5.8.2:**

- `InpUseActualChartSize = false`
- `InpScreenshotMaxWidth = 1440`
- `InpScreenshotMaxHeight = 960`
- `InpScreenshotFallbackWidth = 1440`
- `InpScreenshotFallbackHeight = 900`

If you still want to capture the exact visible chart size from your monitor, you can set `InpUseActualChartSize = true` manually.

### Live dashboard refresh

In earlier builds, a trade could appear in the **Trades** sheet while the **Dashboard** stayed unchanged until a manual sync or refresh.
In v5.8.2, the Google Apps Script refreshes the Dashboard automatically after live updates for the currently selected account.

### Previous v5.8.1 fix is preserved

The screenshot-link persistence fix remains included.
That means `📷 Entry` and `📷 Exit` links should stay clickable after sync completes.

---

## Files in this package

- `JournalNevis_v5_8_2.mq5` → MT5 Expert Advisor source
- `JournalNevis_v5_8_2.gs` → Google Apps Script backend
- `JournalNevis_v5_8_2_Template.xlsx` → Spreadsheet template
- `JournalNevis_v5_8_2_README.md` → this README

---

## Setup summary

### 1) Google Sheet

1. Upload `JournalNevis_v5_8_2_Template.xlsx` to Google Drive.
2. Open it with **Google Sheets**.
3. Open **Extensions → Apps Script**.
4. Replace the script with `JournalNevis_v5_8_2.gs`.
5. Save and deploy the web app.
6. Copy the Web App URL and your API secret.

### 2) MetaTrader 5

1. Put `JournalNevis_v5_8_2.mq5` inside `MQL5/Experts`.
2. Compile it in MetaEditor.
3. Attach it to a chart.
4. Fill in `InpGoogleWebAppURL` and `InpApiSecret`.
5. Allow WebRequest for the Apps Script URL.

---

## Multi-account dashboard

- The **Trades** sheet can contain trades from more than one account.
- The **Dashboard** shows **one account at a time**.
- The selected account is controlled by the dropdown in the Dashboard.
- If only one account exists, the dashboard uses that account automatically.

### Removing an account

Use: `JournalNevis → Advanced → Delete Selected Account Data...`

This removes spreadsheet records for that account, but it does not delete old screenshots from Google Drive.

---

## Troubleshooting

### Dashboard does not update

In v5.8.2 this should refresh automatically.
If needed, use `JournalNevis → Refresh Dashboard`.

### Screenshot links exist but do not open

Use `JournalNevis → Repair Screenshot Links`.

### EX5 does not run on another PC

Compile the MQ5 source on the target machine, or compile as **X64 Regular**.

---

<a id="persian"></a>

<div dir="rtl" align="right">

# فارسی

## معرفی

**JournalNevis** یک ژورنال معاملاتی خودکار و رایگان برای **MetaTrader 5** است.
این پروژه اطلاعات معاملات را به **Google Sheets** می‌فرستد و تصویرهای ورود و خروج را در **Google Drive** ذخیره می‌کند.

در نسخه **5.8.2** دو مورد اصلی اصلاح شده است:

1. **کیفیت و نسبت تصویر بهتر برای Screenshotها**: عکس‌ها دیگر بیش از حد عریض گرفته نمی‌شوند و حالت استانداردتری دارند.
2. **به‌روزرسانی خودکار داشبورد**: وقتی معامله جدید یا آپدیت زنده به شیت می‌رسد، داشبورد برای اکانت انتخاب‌شده خودش Refresh می‌شود.

> **نکته مهم**
>
> JournalNevis فقط ابزار ژورنال و تحلیل است و هیچ معامله‌ای باز، بسته یا مدیریت نمی‌کند.

---

## تغییرات نسخه 5.8.2

### 1) Screenshot بهتر

تنظیمات پیش‌فرض Screenshot تغییر کرده تا عکس‌ها خیلی کشیده و عریض نباشند.

- `InpUseActualChartSize = false`
- `InpScreenshotMaxWidth = 1440`
- `InpScreenshotMaxHeight = 960`
- `InpScreenshotFallbackWidth = 1440`
- `InpScreenshotFallbackHeight = 900`

اگر بخواهی دقیقاً اندازه نمودار روی مانیتور خودت گرفته شود، می‌توانی `InpUseActualChartSize` را دوباره روی `true` بگذاری.

### 2) آپدیت خودکار Dashboard

قبلاً ممکن بود ترید داخل شیت **Trades** ثبت شود ولی **Dashboard** تا وقتی Sync یا Refresh دستی نزنی به‌روز نشود.
در نسخه 5.8.2 این موضوع اصلاح شده و Dashboard بعد از Live update برای اکانت انتخاب‌شده خودش Refresh می‌شود.

### 3) Fix نسخه 5.8.1 همچنان وجود دارد

مشکل از بین رفتن لینک `📷 Entry` و `📷 Exit` بعد از پایان Sync همچنان اصلاح‌شده باقی مانده است.

---

## فایل‌های داخل پکیج

- `JournalNevis_v5_8_2.mq5` : سورس اکسپرت MT5
- `JournalNevis_v5_8_2.gs` : کد Google Apps Script
- `JournalNevis_v5_8_2_Template.xlsx` : فایل قالب اکسل/گوگل‌شیت
- `JournalNevis_v5_8_2_README.md` : همین راهنما

---

## خلاصه نصب

### بخش Google Sheet

1. فایل `JournalNevis_v5_8_2_Template.xlsx` را در Google Drive آپلود کن.
2. آن را با Google Sheets باز کن.
3. از مسیر **Extensions → Apps Script** وارد اسکریپت شو.
4. کد موجود را با فایل `JournalNevis_v5_8_2.gs` جایگزین کن.
5. ذخیره و Deploy کن.
6. آدرس Web App و API Secret را بردار.

### بخش MetaTrader 5

1. فایل `JournalNevis_v5_8_2.mq5` را داخل `MQL5/Experts` بگذار.
2. در MetaEditor آن را Compile کن.
3. اکسپرت را روی یک چارت اجرا کن.
4. مقدارهای `InpGoogleWebAppURL` و `InpApiSecret` را وارد کن.
5. WebRequest را برای URL اسکریپت مجاز کن.

---

## داشبورد چنداکانته

- شیت **Trades** می‌تواند معاملات چند اکانت را با هم نگه دارد.
- **Dashboard** فقط اطلاعات **یک اکانت** را در هر لحظه نشان می‌دهد.
- انتخاب اکانت از Dropdown داخل Dashboard انجام می‌شود.
- اگر فقط یک اکانت وجود داشته باشد، همان اکانت به‌صورت خودکار انتخاب می‌شود.

### حذف اطلاعات یک اکانت

از این مسیر استفاده کن: `JournalNevis → Advanced → Delete Selected Account Data...`

این کار اطلاعات همان اکانت را از شیت‌ها حذف می‌کند، اما عکس‌های قبلی را از Google Drive پاک نمی‌کند.

---

## عیب‌یابی

### Dashboard آپدیت نمی‌شود

در نسخه 5.8.2 باید خودکار آپدیت شود.
اگر خواستی دستی هم Refresh کنی، از `JournalNevis → Refresh Dashboard` استفاده کن.

### لینک Screenshot خراب است

از `JournalNevis → Repair Screenshot Links` استفاده کن.

### EX5 روی کامپیوتر دیگر اجرا نمی‌شود

بهتر است فایل MQ5 را روی همان سیستم مقصد Compile کنی یا Build را به صورت **X64 Regular** بگیری.

</div>
