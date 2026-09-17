<div align="center">

<img src="JournalNevis_v5_7_Wordmark.png" alt="JournalNevis" width="720">

<br>

<img src="https://img.shields.io/badge/JournalNevis-v5.7.1-2DE0B6?style=for-the-badge&labelColor=0B1220" alt="JournalNevis v5.7.1">
<img src="https://img.shields.io/badge/Project-Free-16A34A?style=for-the-badge&labelColor=0B1220" alt="Free">
<img src="https://img.shields.io/badge/Current_Integration-MetaTrader_5-2563EB?style=for-the-badge&labelColor=0B1220" alt="MetaTrader 5">
<img src="https://img.shields.io/badge/Journal-Google_Sheets-0F9D58?style=for-the-badge&labelColor=0B1220" alt="Google Sheets">
<img src="https://img.shields.io/badge/Screenshots-Google_Drive-F59E0B?style=for-the-badge&labelColor=0B1220" alt="Google Drive">

### Automated Trading Journal

**Trade automatically. Review intentionally.**

[English](#english) • [فارسی](#persian)

</div>

---

<a id="english"></a>

# 🇬🇧 English

## What is JournalNevis?

**JournalNevis** is a free automated trading-journal project designed to reduce the manual work involved in documenting trades.

The current release connects a MetaTrader 5 journal EA to a Google Apps Script backend. Trade information is written to Google Sheets, while entry/exit screenshots are stored in Google Drive and linked back to the corresponding trade.

JournalNevis is intended to help you answer practical questions such as:

- What symbols am I trading most?
- What is my win rate on each symbol?
- How much am I paying in commissions?
- What is my account drawdown?
- Which setups are working?
- What mistakes or emotions appear repeatedly?
- What did the chart actually look like when I entered or exited?

> [!IMPORTANT]
> JournalNevis is a **journal and analytics tool**.  
> It does **not** open, modify, or close trades.

---

## ✨ Main features

| Feature | Description |
|---|---|
| **Automatic trade logging** | Records trade data from account history and live transactions. |
| **Entry & exit screenshots** | Captures chart images and stores them in Google Drive. |
| **Screenshot recovery** | Can recover and relink existing `JN57_`, `JN56_`, and legacy `TJ5_` images. |
| **Dashboard** | Shows trading statistics, drawdown, symbol performance, win rate, P/L and charts. |
| **Symbol analytics** | Trades, wins, losses, win rate, net P/L, commission, best/worst trade and more by symbol. |
| **MT-style statistics** | Profit factor, expected payoff, drawdown, consecutive wins/losses and related metrics. |
| **Manual journal fields** | Setup, Entry Reason, Emotion, Mistake, Notes and Review Status. |
| **SYNC TODAY** | Reconciles the current trading day without repeatedly scanning all history. |
| **FULL SYNC** | Performs a complete account-history and screenshot reconciliation. |
| **Local screenshot cache** | Existing screenshots can be re-uploaded after rebuilding the cloud journal. |
| **No central JournalNevis trade database** | In the current self-hosted setup, your Sheet/Drive data stays in your own Google account. |

---

## 🧩 How it works

```text
             ┌──────────────────┐
             │ Trading account  │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ JournalNevis EA  │
             └────────┬─────────┘
                      │ HTTPS
                      ▼
             ┌──────────────────┐
             │ Google Apps      │
             │ Script Web App   │
             └──────┬─────┬─────┘
                    │     │
          ┌─────────┘     └─────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ Google Sheets    │      │ Google Drive     │
│ Trades/Dashboard │      │ Entry/Exit PNGs  │
└──────────────────┘      └──────────────────┘
```

The website/repository is used for distribution and documentation; the journal does not depend on JournalNevis.ir being online during normal operation.

---

## 📦 Current v5.7.1 files

A typical release contains:

```text
JournalNevis/
├── JournalNevis_v5_7.ex5
├── JournalNevis_v5_7_1_LinkFix.gs
├── JournalNevis_v5_7_Template.xlsx
├── JournalNevis_v5_7_Icon.png
├── JournalNevis_v5_7_Wordmark.png
└── README.md
```

> [!NOTE]
> The current public repository may distribute the compiled EA (`.ex5`) without the `.mq5` source file.  
> JournalNevis is still provided free of charge; source-code publication can be handled separately later.

---

# 🚀 Installation

## 1. Prepare the Google Sheet

Upload:

```text
JournalNevis_v5_7_Template.xlsx
```

to Google Drive and open it with **Google Sheets**.

The main user-facing sheets are:

- **Dashboard**
- **Trades**
- **Accounts**
- **Settings**
- **Help**

Supporting calculation sheets can remain hidden.

---

## 2. Install the Google Apps Script backend

Open the Google Sheet and go to:

```text
Extensions → Apps Script
```

Delete the default code and paste the contents of:

```text
JournalNevis_v5_7_1_LinkFix.gs
```

Save the project.

Run:

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

Create the deployment and copy the production URL ending in:

```text
/exec
```

JournalNevis also uses an **API Secret** generated/stored in the Sheet settings.

> [!CAUTION]
> Do not publish your personal API Secret in screenshots, GitHub commits, `.set` files, or public documentation.

---

## 4. Allow WebRequest in MetaTrader

In MetaTrader:

```text
Tools
→ Options
→ Expert Advisors
```

Enable WebRequest and add the Google Apps Script domain/URL required by your deployment.

---

## 5. Install the EA

Copy:

```text
JournalNevis_v5_7.ex5
```

to the appropriate MetaTrader `MQL5/Experts` folder.

Restart MetaTrader or refresh **Navigator → Expert Advisors**.

Attach JournalNevis to a dedicated chart.

Enter:

- Web App `/exec` URL
- API Secret
- Journal role/settings

For the main account journal, use the **MASTER** role.

---

## 6. First clean synchronization

For a new Sheet, run:

```text
FULL SYNC
```

JournalNevis processes the synchronization in stages:

```text
Stage 1/4  Account / funding
Stage 2/4  Trades / executions
Stage 3/4  Screenshots
Stage 4/4  Dashboard / finalize
```

For normal daily use after that, prefer:

```text
SYNC TODAY
```

---

# 📸 Screenshots

JournalNevis can capture:

- Entry screenshot
- Exit screenshot

Images are stored in Google Drive and linked to the corresponding trade row.

Current/legacy screenshot names supported by the v5.7.1 repair logic include:

```text
JN57_...
JN56_...
TJ5_...
```

This is useful when you rebuild the Google Sheet or Drive structure but keep old images.

---

# 🛠 v5.7.1 — Screenshot Link Repair

Version **5.7.1** specifically fixes a case where:

> the screenshots existed in Google Drive, but the Entry Screenshot / Exit Screenshot cells in the Trades sheet remained blank.

### What changed?

- Screenshot links use Google Sheets rich-text links.
- The script first tries **Trade Key**.
- It can fall back to **Position ID**.
- The repair can scan screenshot subfolders recursively.
- `UNKNOWN` folders are also checked.
- Existing good screenshot links are not overwritten.
- `JN57_`, `JN56_`, and legacy `TJ5_` file names are supported.

### Repair existing links

After installing the v5.7.1 Apps Script, reload the Sheet and use:

```text
JournalNevis v5.7.1
→ Repair Screenshot Links
```

The result reports:

```text
Links restored
Already linked
Unmatched image files
```

If the screenshots are already in Drive, this repair does **not** require the EA to upload them again.

---

# 📊 Dashboard

The Dashboard is designed to provide a quick account-level view, including items such as:

### Account
- Balance
- Equity
- Initial capital
- Floating P/L

### Performance
- Net profit
- Gross profit
- Gross loss
- Profit factor
- Expected payoff
- Recovery factor
- Win rate
- Total trades

### Drawdown
- Absolute drawdown
- Maximal drawdown
- Relative drawdown
- Minimum balance

### Trade statistics
- Largest profit trade
- Largest loss trade
- Average profit trade
- Average loss trade
- Consecutive wins/losses

### Symbol performance
- Trades
- Wins
- Losses
- Win rate
- Net P/L
- Profit factor
- Commission
- Average trade
- Best/worst trade
- Average holding time
- Volume
- Long/short trade count

---

# 📝 Manual trade review

Automation should not remove the human part of journaling.

The **Trades** sheet includes fields you can complete yourself:

| Field | Example |
|---|---|
| Setup | Breakout / Pullback / Reversal |
| Entry Reason | Why the trade was taken |
| Emotion | Calm / Focused / FOMO / Anxious |
| Mistake | Early Entry / Oversized Risk / Moved SL |
| Notes | Free-form review |
| Review Status | Pending Review / Reviewed |

These fields are intended to help connect trading performance with decision-making behavior.

---

# 🔄 FULL SYNC vs SYNC TODAY

### `SYNC TODAY`

Use it for routine reconciliation.

It focuses on current-day activity and avoids repeatedly processing the entire history.

### `FULL SYNC`

Use it when:

- creating a fresh journal,
- rebuilding a deleted Sheet,
- repairing historical information,
- recovering old screenshot links,
- or deliberately auditing the full account history.

> [!TIP]
> For normal daily trading, you usually do **not** need to keep pressing FULL SYNC.

---

# 🔐 Privacy

In the current JournalNevis architecture:

- the Google Apps Script is deployed by **you**;
- the Google Sheet belongs to **you**;
- screenshots are stored in **your Google Drive**;
- your API Secret should remain private.

JournalNevis does not require a central JournalNevis trade-data server for this workflow.

---

# 💚 Free project

JournalNevis is currently provided **free of charge**.

The goal is to make practical trading journaling easier without requiring a subscription.

A voluntary support/donation option may be added later for people who want to help continued development.

---

# 🗺 Roadmap

Ideas being considered for future versions include:

- improved onboarding,
- more dashboard analytics,
- easier installation,
- additional reporting,
- automatic update workflow,
- website documentation at **JournalNevis.ir**,
- and potentially support for additional trading-platform versions.

No roadmap item should be treated as a guaranteed release until it is implemented.

---

# ⚠️ Disclaimer

JournalNevis is a journaling and analytics tool, not trading or investment advice.

It does not guarantee profitability, prevent losses, or evaluate whether a trade is suitable for you.

---

<a id="persian"></a>

# 🇮🇷 فارسی

## JournalNevis چیست؟

**JournalNevis** یک پروژه رایگان برای ساخت ژورنال معاملاتی خودکار است؛ هدفش این است که بخش زیادی از کارهای تکراری ثبت معاملات را به‌صورت خودکار انجام دهد تا تمرکز شما بیشتر روی **بررسی عملکرد و تصمیم‌های معاملاتی** باشد.

در نسخه فعلی، JournalNevis اطلاعات معاملات را از MetaTrader 5 دریافت می‌کند، از طریق Google Apps Script به Google Sheets می‌فرستد و عکس‌های ورود و خروج را در Google Drive ذخیره می‌کند.

در نتیجه به جای اینکه بعد از هر معامله دستی اطلاعات را وارد کنید، JournalNevis می‌تواند بخش زیادی از این اطلاعات را برای شما ثبت کند.

> [!IMPORTANT]
> JournalNevis فقط **ژورنال و ابزار تحلیل** است.  
> این اکسپرت **هیچ معامله‌ای باز، بسته یا ویرایش نمی‌کند**.

---

## ✨ قابلیت‌های اصلی

| قابلیت | توضیح |
|---|---|
| **ثبت خودکار معاملات** | اطلاعات معاملات Live و History را ثبت می‌کند. |
| **عکس ورود و خروج** | از چارت عکس می‌گیرد و در Google Drive ذخیره می‌کند. |
| **بازیابی عکس‌ها** | فایل‌های `JN57_`، `JN56_` و `TJ5_` قدیمی را می‌تواند دوباره پیدا کند. |
| **Dashboard** | آمار حساب، Drawdown، Win Rate، P/L و نمودارها را نمایش می‌دهد. |
| **آمار هر Symbol** | تعداد معاملات، برد، باخت، Win Rate، سود/زیان و هزینه‌ها برای هر نماد. |
| **آمار شبیه Statement** | Profit Factor، Expected Payoff، Drawdown، Streakها و موارد مشابه. |
| **فیلدهای دستی ژورنال** | Setup، Entry Reason، Emotion، Mistake، Notes و Review Status. |
| **SYNC TODAY** | فقط فعالیت امروز را بررسی می‌کند. |
| **FULL SYNC** | کل History و Screenshotها را بررسی و بازسازی می‌کند. |
| **Local Screenshot Cache** | در صورت ساخت مجدد Sheet/Drive می‌توان از عکس‌های باقی‌مانده روی سیستم استفاده کرد. |

---

## 🧩 ساختار کلی

```text
حساب معاملاتی
      │
      ▼
JournalNevis EA
      │
      ▼
Google Apps Script
      │
      ├──────────────► Google Sheets
      │                 Trades + Dashboard
      │
      └──────────────► Google Drive
                        Entry / Exit Screenshots
```

در ساختار فعلی، Google Sheet و Google Drive متعلق به خود کاربر هستند.

---

# 🚀 آموزش نصب

## مرحله ۱ — ساخت Google Sheet

فایل:

```text
JournalNevis_v5_7_Template.xlsx
```

را در Google Drive آپلود کن و با Google Sheets باز کن.

Sheetهای اصلی:

- `Dashboard`
- `Trades`
- `Accounts`
- `Settings`
- `Help`

هستند.

---

## مرحله ۲ — نصب Apps Script

از داخل Google Sheet برو به:

```text
Extensions
→ Apps Script
```

کد پیش‌فرض را پاک کن و محتوای:

```text
JournalNevis_v5_7_1_LinkFix.gs
```

را وارد کن.

بعد Save کن و یک بار تابع زیر را Run کن:

```javascript
setupJournalNevis()
```

اگر Google دسترسی خواست، باید Permissionهای لازم را تأیید کنی.

---

## مرحله ۳ — Deploy

در Apps Script:

```text
Deploy
→ New deployment
→ Web app
```

Web App را Deploy کن.

در پایان یک URL می‌گیری که باید به:

```text
/exec
```

ختم شود.

این URL را داخل تنظیمات JournalNevis در MT5 وارد می‌کنی.

---

## مرحله ۴ — API Secret

JournalNevis برای ارتباط بین EA و Google Script از یک Secret استفاده می‌کند.

Secret را از Settings/Connection Info بردار و داخل EA وارد کن.

> [!CAUTION]
> API Secret شخصی خودت را در GitHub، Screenshot، فایل عمومی یا `.set` منتشر نکن.

---

## مرحله ۵ — نصب EA

فایل:

```text
JournalNevis_v5_7.ex5
```

را در فولدر Expert Advisors متاتریدر قرار بده.

سپس JournalNevis را روی یک چارت اختصاصی اجرا کن و:

- Web App URL
- API Secret

را وارد کن.

---

# 🔄 اولین FULL SYNC

برای یک Journal جدید، یک بار:

```text
FULL SYNC
```

را اجرا کن.

مراحل به صورت زیر نمایش داده می‌شوند:

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

بعد از اینکه Journal کامل شد، برای استفاده روزانه معمولاً:

```text
SYNC TODAY
```

کافی است.

---

# 📸 عکس‌های معاملات

JournalNevis می‌تواند برای هر معامله:

```text
Entry Screenshot
Exit Screenshot
```

ذخیره کند.

عکس‌ها در Google Drive قرار می‌گیرند و لینک آنها داخل Sheet `Trades` ثبت می‌شود.

---

# 🛠 اصلاح مهم نسخه 5.7.1

در یک حالت خاص، عکس‌ها با موفقیت وارد Google Drive می‌شدند اما لینک آنها در ستون:

```text
Entry Screenshot
Exit Screenshot
```

قرار نمی‌گرفت.

این مشکل در **v5.7.1** اصلاح شده است.

بعد از نصب Apps Script نسخه 5.7.1 می‌توانی از منوی Google Sheet اجرا کنی:

```text
JournalNevis v5.7.1
→ Repair Screenshot Links
```

این بخش:

- فایل‌های موجود در Drive را پیدا می‌کند؛
- پوشه‌های `UNKNOWN` را هم بررسی می‌کند؛
- با Trade Key یا Position ID معامله را پیدا می‌کند؛
- لینک عکس را به ردیف درست اضافه می‌کند؛
- لینک‌های سالم قبلی را خراب نمی‌کند.

همچنین فایل‌های قدیمی با این Prefixها قابل شناسایی هستند:

```text
JN57_
JN56_
TJ5_
```

---

# 📊 چه چیزهایی در Dashboard می‌بینیم؟

از جمله:

- Balance
- Equity
- Net Profit
- Gross Profit
- Gross Loss
- Win Rate
- Profit Factor
- Expected Payoff
- Drawdown
- Largest Win
- Largest Loss
- Consecutive Wins
- Consecutive Losses
- Symbol Performance
- Monthly P/L

و نمودارهایی مثل:

- Balance Curve
- Drawdown
- Net P/L by Symbol
- Win Rate by Symbol
- Monthly Performance
- Wins vs Losses

---

# 🧠 بخش دستی ژورنال

فقط ثبت خودکار اطلاعات کافی نیست.

هدف اصلی JournalNevis این است که بعداً بتوانی بفهمی **چرا** نتیجه خوب یا بد گرفته‌ای.

برای همین در `Trades` فیلدهایی مثل این وجود دارند:

```text
Setup
Entry Reason
Emotion
Mistake
Notes
Review Status
```

مثلاً:

```text
Setup: Pullback
Emotion: FOMO
Mistake: Early Entry
Review Status: Pending Review
```

بعداً می‌توان از همین اطلاعات برای تحلیل رفتار معاملاتی هم استفاده کرد.

---

# SYNC TODAY یا FULL SYNC؟

### SYNC TODAY

برای کار روزمره.

فقط فعالیت امروز را reconcile می‌کند و لازم نیست مرتب کل History را بررسی کند.

### FULL SYNC

برای مواقعی مثل:

- نصب اولیه
- ساخت Sheet جدید
- حذف شدن اطلاعات
- بازیابی History
- بازیابی Screenshotهای قدیمی
- Audit کامل حساب

استفاده کن.

---

# 🔐 حریم خصوصی

در روش فعلی:

- Apps Script را خودت Deploy می‌کنی؛
- Google Sheet متعلق به خودت است؛
- Screenshotها داخل Google Drive خودت ذخیره می‌شوند؛
- API Secret دست خودت است.

پس این Workflow برای کارکرد روزانه نیازی به ذخیره معاملات شما روی یک دیتابیس مرکزی JournalNevis ندارد.

---

# 💚 رایگان

JournalNevis فعلاً **رایگان** منتشر می‌شود.

هدف این پروژه این است که یک ابزار کاربردی و ساده برای ژورنال معاملاتی در اختیار کاربران باشد.

در آینده ممکن است یک بخش **حمایت داوطلبانه / Donate** برای افرادی که دوست دارند به ادامه توسعه پروژه کمک کنند اضافه شود؛ اما هدف این نیست که دانلود اصلی پشت پرداخت قرار بگیرد.

---

# 🌱 آینده JournalNevis

مواردی که ممکن است در آینده بررسی شوند:

- آموزش کامل‌تر
- نصب آسان‌تر
- گزارش‌ها و نمودارهای بیشتر
- امکانات تحلیلی بیشتر
- Update ساده‌تر
- سایت **JournalNevis.ir**
- و بررسی نسخه‌های دیگر پلتفرم معاملاتی

این موارد Roadmap هستند و تا زمانی که پیاده‌سازی نشده‌اند، نباید به عنوان قابلیت قطعی در نظر گرفته شوند.

---

# ⚠️ سلب مسئولیت

JournalNevis ابزار ثبت و تحلیل معاملات است و توصیه سرمایه‌گذاری یا سیگنال معاملاتی ارائه نمی‌کند.

استفاده از JournalNevis تضمینی برای سودآوری یا جلوگیری از ضرر ایجاد نمی‌کند.

---

<div align="center">

### JournalNevis

**Record less manually. Review more intelligently.**

`v5.7.1`

</div>
