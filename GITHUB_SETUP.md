# راهنمای آپلود به GitHub و فعال‌سازی GitHub Pages

## مرحله 1: آماده‌سازی پروژه

### 1. بررسی فایل‌ها
مطمئن شوید این فایل‌ها در پوشه پروژه موجود هستند:
```
smart-translator/
├── index.html
├── styles.css
├── script.js
├── manifest.json
├── sw.js
├── README.md
├── LICENSE
├── .gitignore
├── ICON_GUIDE.md
├── GITHUB_SETUP.md
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── shortcut-translate.png
│   └── shortcut-history.png
└── screenshots/
    ├── mobile-1.png
    └── desktop-1.png
```

## مرحله 2: ایجاد Repository در GitHub

### 1. ورود به GitHub
- به [GitHub.com](https://github.com) بروید
- وارد حساب کاربری خود شوید

### 2. ایجاد Repository جدید
- روی دکمه "New" یا "+" کلیک کنید
- "New repository" را انتخاب کنید

### 3. تنظیمات Repository
```
Repository name: smart-translator
Description: مترجم هوشمند با استفاده از هوش مصنوعی
☑️ Public (برای GitHub Pages رایگان)
☑️ Add a README file (اگر README.md ندارید)
☐ Add .gitignore (چون خودتان دارید)
☐ Choose a license (چون LICENSE دارید)
```

## مرحله 3: آپلود فایل‌ها

### روش 1: استفاده از Git Command Line

```bash
# مقداردهی اولیه Git در پوشه پروژه
git init

# اضافه کردن فایل‌ها
git add .

# اولین commit
git commit -m "Initial commit: Smart Translator v3.0"

# اضافه کردن remote repository
git remote add origin https://github.com/YOUR_USERNAME/smart-translator.git

# آپلود به GitHub
git branch -M main
git push -u origin main
```

### روش 2: استفاده از GitHub Desktop
1. GitHub Desktop را دانلود و نصب کنید
2. "Clone a repository from the Internet" را انتخاب کنید
3. Repository خود را clone کنید
4. فایل‌ها را در پوشه clone شده کپی کنید
5. تغییرات را commit و push کنید

### روش 3: آپلود مستقیم از وب
1. در صفحه repository روی "uploading an existing file" کلیک کنید
2. فایل‌ها را drag & drop کنید
3. پیام commit بنویسید
4. "Commit new files" کلیک کنید

## مرحله 4: فعال‌سازی GitHub Pages

### 1. رفتن به تنظیمات
- در repository خود روی تب "Settings" کلیک کنید

### 2. پیدا کردن بخش Pages
- در منوی سمت چپ "Pages" را پیدا کنید

### 3. تنظیم Source
```
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

### 4. ذخیره تنظیمات
- روی "Save" کلیک کنید
- چند دقیقه صبر کنید تا سایت آماده شود

## مرحله 5: دسترسی به سایت

### URL سایت شما:
```
https://YOUR_USERNAME.github.io/smart-translator
```

### مثال:
اگر نام کاربری شما `john_doe` باشد:
```
https://john_doe.github.io/smart-translator
```

## مرحله 6: تنظیمات اضافی

### 1. Custom Domain (اختیاری)
اگر دامنه شخصی دارید:
- در تنظیمات Pages قسمت "Custom domain" را پر کنید
- فایل `CNAME` در root پروژه ایجاد کنید

### 2. HTTPS
- ✅ "Enforce HTTPS" را فعال کنید (برای PWA ضروری است)

### 3. تنظیم README.md
در فایل README.md لینک سایت را به‌روزرسانی کنید:
```markdown
## 🚀 دمو زنده
[مشاهده برنامه](https://YOUR_USERNAME.github.io/smart-translator)
```

## مرحله 7: تست نصب PWA

### 1. باز کردن سایت
- سایت را در Chrome یا Edge باز کنید
- مطمئن شوید HTTPS فعال است

### 2. بررسی PWA
- F12 → Application → Manifest
- بررسی کنید همه آیکون‌ها لود شده‌اند

### 3. نصب برنامه
- آیکون نصب در نوار آدرس ظاهر می‌شود
- روی آن کلیک کنید
- برنامه روی دسکتاپ نصب می‌شود

## مرحله 8: به‌روزرسانی‌های آینده

### برای به‌روزرسانی پروژه:
```bash
# تغییرات جدید
git add .
git commit -m "Update: توضیح تغییرات"
git push origin main
```

### GitHub Pages خودکار به‌روزرسانی می‌شود:
- هر push به branch main
- سایت در عرض چند دقیقه به‌روز می‌شود

## نکات مهم

### ✅ موارد ضروری:
- Repository باید Public باشد (برای GitHub Pages رایگان)
- HTTPS باید فعال باشد
- همه آیکون‌ها باید موجود باشند
- manifest.json باید صحیح باشد

### ⚠️ نکات امنیتی:
- هرگز کلید API را در کد commit نکنید
- از .gitignore برای فایل‌های حساس استفاده کنید
- کلیدهای API را در localStorage ذخیره کنید

### 🔧 عیب‌یابی:
- اگر سایت لود نمی‌شود: چند دقیقه صبر کنید
- اگر PWA نصب نمی‌شود: آیکون‌ها و manifest را بررسی کنید
- اگر HTTPS کار نمی‌کند: تنظیمات Pages را بررسی کنید

## مثال کامل

### فایل package.json (اختیاری):
```json
{
  "name": "smart-translator",
  "version": "3.0.0",
  "description": "مترجم هوشمند با استفاده از هوش مصنوعی",
  "main": "index.html",
  "scripts": {
    "start": "python -m http.server 8000",
    "build": "echo 'No build process needed'",
    "deploy": "git push origin main"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/smart-translator.git"
  },
  "keywords": ["translator", "ai", "pwa", "persian"],
  "author": "Your Name",
  "license": "MIT"
}
```

پس از تکمیل این مراحل، برنامه شما آماده استفاده و نصب خواهد بود! 🎉 