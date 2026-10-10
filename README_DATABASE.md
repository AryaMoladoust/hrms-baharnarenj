# راه‌اندازی دیتابیس (MongoDB)

خطای ۵۰۰ هنگام ورود یعنی سایت به دیتابیس وصل نیست. این‌جا اول MongoDB را روی همین ویندوز بالا می‌آوریم (برای تست)، بعد در صورت نیاز به Atlas می‌رویم. کد پروژه فقط یک خط را می‌شناسد: `MONGODB_URI`. با عوض کردن همین یک خط، بین محلی، Atlas یا سرور خودتان جابه‌جا می‌شوید و به کد دست نمی‌زنید.

## الف) MongoDB روی ویندوز (برای شروع)
1. از https://www.mongodb.com/try/download/community نسخه‌ی **Windows MSI** را دانلود و نصب کنید. در نصب گزینه‌ی **Complete** و تیک **Install MongoDB as a Service** را بزنید. تیک **Install MongoDB Compass** هم روشن بماند (برنامه‌ی دیدن داده‌ها).
2. بررسی سرویس: کلیدهای `Win + R` ← `services.msc` ← سرویس **MongoDB Server** باید *Running* باشد. یا در PowerShell: `Get-Service MongoDB`
3. (اختیاری) شل: https://www.mongodb.com/try/download/shell یا `winget install MongoDB.Shell`. بعد در PowerShell بنویسید `mongosh` و سپس `show dbs`. اگر جواب آمد، MongoDB سالم است.
4. در پوشه‌ی پروژه: `npm install mongoose web-push`
5. فایل `.env.local` بسازید (کنار `package.json`) و این خط را بنویسید. توی حالت توسعه حتی بدون این خط هم همین آدرس استفاده می‌شود:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/baharnarenj
   ```
6. سرور را با `Ctrl + C` ببندید و دوباره `npm run dev` بزنید (env فقط موقع شروع خوانده می‌شود).
7. بررسی اتصال: آدرس http://localhost:3000/api/health/db را باز کنید. باید `{"ok":true,...}` ببینید. یا در ترمینال: `node scripts/db-check.mjs`
8. حالا `/owner/login` ← `milad` و رمز `1234` (یا `mmd`). در اولین ورود، هر دو حساب خودکار ساخته می‌شوند.
9. دیدن داده‌ها در **Compass**: برنامه را باز کنید ← Connect روی `mongodb://127.0.0.1:27017` ← دیتابیس `baharnarenj` ← collectionهای `owners`، `reservations`، `expenses`، `settings`، `notifications`. رمزها در `owners` فقط به شکل هش دیده می‌شوند.

### اگر کار نکرد
| نشانه | علت و راه‌حل |
|---|---|
| ورود می‌گوید «اتصال به دیتابیس برقرار نیست» | سرویس MongoDB خاموش است (`services.msc`) یا `MONGODB_URI` غلط است. متن دقیق خطا در ترمینال `npm run dev` و در `/api/health/db` هست. |
| `Cannot find package 'mongoose'` | `npm install mongoose web-push` را اجرا نکرده‌اید. |
| خطای `ECONNREFUSED ::1` | به‌جای `localhost` از `127.0.0.1` استفاده کنید (در فایل بالا همین است). |
| قفل شدن حساب (۵ رمز اشتباه) | ۱۰ دقیقه صبر کنید یا `node scripts/reset-owner.mjs milad 1234` |
| رمز را فراموش کردید | `node scripts/reset-owner.mjs milad رمزجدید` (حساب را هم می‌سازد اگر نبود) |
| دیتابیس را از صفر می‌خواهید | در Compass دیتابیس `baharnarenj` را Drop کنید؛ ورود بعدی دو حساب را دوباره می‌سازد. |

دیتابیس محلی فقط روی همین کامپیوتر است. سایت روی Vercel نمی‌تواند به آن وصل شود؛ برای سایت اصلی باید به Atlas (یا سرور خودتان) بروید.

## ب) رفتن به MongoDB Atlas (وقتی سایت اصلی را وصل می‌کنید)
1. ثبت‌نام در https://www.mongodb.com/atlas ← **Create** ← پلن **Free (M0)** ← نزدیک‌ترین Region.
2. **Database Access** ← Add New Database User ← نام کاربری و رمز (ترجیحاً فقط حرف و عدد؛ کاراکتر خاص را باید URL-encode کرد).
3. **Network Access** ← Add IP Address ← برای Vercel `0.0.0.0/0` (آی‌پی‌های Vercel ثابت نیستند؛ امنیت با رمز قوی کاربر دیتابیس است).
4. **Connect** ← Drivers ← آدرس `mongodb+srv://...` را کپی کنید، رمز را جایگزین کنید و بعد از `.net/` نام دیتابیس را بنویسید: `.../baharnarenj?retryWrites=true&w=majority`
5. همان آدرس را در `.env.local` و در Vercel (Settings ← Environment Variables) بگذارید و دوباره Deploy کنید. `OWNER_SESSION_SECRET` و `OWNER_SEED_PASSWORD` را هم همان‌جا بگذارید.
6. انتقال داده‌های محلی (اگر لازم بود): ابزار *MongoDB Database Tools* ← `mongodump --uri="mongodb://127.0.0.1:27017/baharnarenj" --out=dump` و بعد `mongorestore --uri="<آدرس Atlas>" dump`.

## ج) Atlas یا هاست/سرور خودتان؟ (برای بعد)
- **حجم داده کم است**: چند ده هزار رزرو هم چند مگابایت است. محدودیت ۵۱۲ مگابایتی پلن رایگان Atlas برای این پروژه سال‌ها کافی است.
- **ایرادهای پلن رایگان**: بک‌آپ خودکار ندارد (باید خودتان دوره‌ای `mongodump` بگیرید یا از Compass خروجی بگیرید)، منابعش اشتراکی است، و طبق مستندات فعلی اگر ۳۰ روز هیچ اتصالی نباشد متوقف می‌شود (با یک کلیک دوباره روشن می‌شود).
- **پلن پولی Atlas (M10 به بالا)** بک‌آپ خودکار و منابع اختصاصی می‌دهد، ولی ماهانه به دلار است.
- **سرور/هاست خودتان** (VPS) وقتی منطقی است که سایت را هم از Vercel بردارید و روی همان سرور اجرا کنید (درگاه پرداخت ایرانی ممکن است آی‌پی ایران بخواهد؛ این را موقع انتخاب درگاه از پشتیبانی‌اش بپرسید). آن‌وقت MongoDB را کنار برنامه نصب می‌کنید و `MONGODB_URI` می‌شود `mongodb://127.0.0.1:27017/baharnarenj`. هزینه‌اش بک‌آپ، به‌روزرسانی و امنیت سرور است که با خودتان است.
- **نتیجه**: الان محلی، بعد Atlas رایگان برای شروع. هر وقت بک‌آپ و پایداری مهم شد، به Atlas پولی یا سرور خودتان بروید. جابه‌جایی فقط `mongodump` و `mongorestore` و عوض کردن یک خط `MONGODB_URI` است.
