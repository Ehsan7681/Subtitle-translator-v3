# راهنمای حل مشکل 404 در GitHub Pages

## مشکلات رایج و راه‌حل‌ها

### 1. بررسی URL صحیح

#### اگر Repository نام `smart-translator` دارد:
```
✅ صحیح: https://YOUR_USERNAME.github.io/smart-translator
❌ اشتباه: https://YOUR_USERNAME.github.io/smart-translator/
❌ اشتباه: https://YOUR_USERNAME.github.io/
```

#### اگر Repository نام دیگری دارد:
```
URL باید این باشد: https://YOUR_USERNAME.github.io/REPOSITORY_NAME
```

### 2. بررسی تنظیمات GitHub Pages

#### مرحله 1: رفتن به تنظیمات
1. در GitHub به repository خود بروید
2. روی تب **Settings** کلیک کنید
3. در منوی سمت چپ **Pages** را پیدا کنید

#### مرحله 2: تنظیم Source
```
Source: Deploy from a branch
Branch: main (یا master)
Folder: / (root)
```

#### مرحله 3: ذخیره و انتظار
- روی **Save** کلیک کنید
- 5-10 دقیقه صبر کنید
- صفحه را refresh کنید

### 3. بررسی فایل‌ها

#### فایل‌های ضروری:
- ✅ `index.html` - فایل اصلی
- ✅ `manifest.json` - تنظیمات PWA
- ✅ `styles.css` - استایل‌ها
- ✅ `script.js` - منطق برنامه

#### بررسی در GitHub:
1. در repository خود فایل‌ها را ببینید
2. مطمئن شوید `index.html` در root موجود است
3. روی فایل کلیک کنید تا محتوا را ببینید

### 4. استفاده از GitHub Actions

#### فایل `.github/workflows/deploy.yml` ایجاد کنید:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5. تنظیم Pages از Actions

#### مرحله 1: تغییر Source
در تنظیمات Pages:
```
Source: GitHub Actions
```

#### مرحله 2: Push کردن فایل workflow
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### 6. بررسی وضعیت Deploy

#### در تب Actions:
1. به تب **Actions** بروید
2. آخرین workflow را ببینید
3. اگر قرمز است، روی آن کلیک کنید
4. خطاها را بررسی کنید

#### در تب Deployments:
1. به تب **Code** بروید
2. در سمت راست **Deployments** را ببینید
3. وضعیت deploy را چک کنید

### 7. مشکلات خاص

#### مشکل: Repository خصوصی است
```
راه‌حل: Repository را Public کنید
Settings → General → Danger Zone → Change visibility
```

#### مشکل: Branch اشتباه
```
راه‌حل: Branch صحیح را انتخاب کنید
Settings → Pages → Source → Branch: main
```

#### مشکل: فایل index.html وجود ندارد
```
راه‌حل: مطمئن شوید index.html در root موجود است
```

### 8. تست محلی

#### قبل از آپلود تست کنید:
```bash
# در پوشه پروژه
python -m http.server 8000

# یا
npx serve .
```

#### سپس باز کنید:
```
http://localhost:8000
```

### 9. URLs مختلف برای تست

#### تست این URLها:
```
https://YOUR_USERNAME.github.io/REPOSITORY_NAME
https://YOUR_USERNAME.github.io/REPOSITORY_NAME/
https://YOUR_USERNAME.github.io/REPOSITORY_NAME/index.html
```

### 10. کش مرورگر

#### پاک کردن کش:
- **Chrome**: Ctrl+Shift+R
- **Firefox**: Ctrl+F5
- **Safari**: Cmd+Shift+R

#### یا Incognito/Private mode استفاده کنید

### 11. بررسی Console

#### در Developer Tools:
1. F12 را بزنید
2. تب **Console** را باز کنید
3. خطاها را ببینید
4. تب **Network** را چک کنید

### 12. مثال کامل URL

#### اگر:
- نام کاربری: `john_doe`
- نام repository: `smart-translator`

#### آنگاه URL این است:
```
https://john_doe.github.io/smart-translator
```

### 13. زمان انتظار

#### GitHub Pages ممکن است:
- 5-10 دقیقه طول بکشد
- تا 24 ساعت برای اولین بار
- پس از هر push چند دقیقه

### 14. راه‌حل نهایی

#### اگر هنوز کار نمی‌کند:
1. Repository را حذف کنید
2. دوباره ایجاد کنید
3. فایل‌ها را آپلود کنید
4. Pages را فعال کنید

---

## تماس برای کمک

اگر مشکل حل نشد:
1. Screenshot از خطا بگیرید
2. URL repository را بفرستید
3. تنظیمات Pages را چک کنید 