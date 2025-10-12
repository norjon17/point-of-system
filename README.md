# 🚀 Project Information

This project uses Laravel + Reactjs (Typescript) + Vite.
This project is a custom Point of System.

# 🚀 Project Setup Guide

## 🧰 Prerequisites

Make sure you have the following installed:

-   **PHP 8.4+**
-   **Composer**
-   **Node.js & npm**
-   **MySQL** (or your configured database)

---

## ⚙️ Installation & Setup

```bash
# 1. Install PHP dependencies
composer install

# 2. Run database migrations
php artisan migrate

# 3. Storage link
php artisan storage:link

# 4. Install frontend dependencies
npm install

# 5. Start Vite development server
npm run dev
```

> 💡 If you’re using Laravel Sail or Valet, make sure your `.env` file is configured correctly before running migrations.

---

## 🗄️ Database Setup

### Run all migrations

```bash
php artisan migrate
```

### Seed default admin account

```bash
php artisan db:seed
```

---

## 🧪 Testing Database Seeders

To seed specific tables for testing, run any of the following commands:

```bash
php artisan db:seed --class=ProdCatSeeder
php artisan db:seed --class=ProdLocSeeder
php artisan db:seed --class=ProdUOMSeeder
php artisan db:seed --class=SupplierSeeder
```

> 🧩 These seeders populate test data for products, locations, units of measure, and suppliers.

---

## 🖼️ Example Workflow

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
```

Then open your app in the browser, typically at:

```
http://localhost:8000
```

---

## 📦 Production Build (optional)

```bash
# Build frontend assets
npm run build

# Optimize Laravel for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## 🛠 Troubleshooting Tips

-   If `php artisan storage:link` says the link already exists, run:

    ```powershell
    Remove-Item public\storage -Force
    php artisan storage:link
    ```

    (On Windows, run PowerShell as Administrator if needed.)

-   If static files (e.g., `/assets/images/logo.png`) are redirecting to `/login`, ensure your web server uses `try_files $uri $uri/ /index.php?$query_string;` so static files are served directly.

-   If you see JSX errors like `React is not defined` in a TypeScript project, ensure:
    -   `@vitejs/plugin-react` is installed and `vite.config.js` uses `react({ jsxRuntime: 'automatic' })`
    -   `tsconfig.json` has `"jsx": "react-jsx"`

---

## ✅ Final Notes

-   Always copy `.env.example` to `.env` and run `php artisan key:generate` before running migrations.
-   Use `php artisan migrate --seed` to run migrations and seeders in one step for a fresh local setup.

If you want, I can tailor this README to include Docker / Sail commands or add CI steps.
