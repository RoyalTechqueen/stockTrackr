# 📘 StockTrackr

StockTrackr is a simple sales and inventory management tool for small business owners.  
It helps track products, sales, and stock levels without the stress of spreadsheets or notebooks.

The MVP will be built in **5 weeks**.  
So far, I have completed the **login/signup** with Supabase and the **dashboard** (protected route with navbar and sidebar).

---

## 🛠 Tech Stack

- Next.js (TypeScript)
- Tailwind CSS
- Zustand
- Supabase (Auth & Database)
- Recharts

---

## ⚙️ Setup

1. Clone the repo

   ```bash
   git clone https://github.com/RoyalTechqueen/stockTrackr.git
   cd stockTrackr

   ## 📅 Milestones
   ```

- ✅ **Login/Signup with Supabase** – users can sign up or log in, and are redirected to the dashboard on success
- ✅ **Dashboard** – responsive layout with navbar and sidebar, protected route redirecting unauthenticated users to login
- ⏳ **Product management** – add, edit, list products
- ⏳ **Sales tracking** – record sales and auto-update stock
- ⏳ **Analytics and charts** – sales trends, revenue, top products
- ⏳ **Low-stock alerts**
- ⏳ **Deployment to Vercel**

---

## 🔑 Current Auth Flow

- Supabase Auth handles signup/login
- User session is stored in Zustand
- Protected routes check for session and redirect to login if none exists
