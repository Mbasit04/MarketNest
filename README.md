# MarketNest — Multi-Vendor Marketplace

A complete multi-vendor marketplace built per the architecture template:
**Customer → direct access · Seller → register → admin verification → sell · Admin → controls commission, categories, products, orders, payouts.**

## Stack

- **Backend**: .NET 10 Web API, Entity Framework Core (SQLite), JWT auth
- **Frontend**: React 19 + Vite, React Router, Axios, react-toastify
- **Database**: SQLite (zero-config local file `marketnest.db`)

## Project layout

```
D:\MarketNest
├── Backend/                    # .NET Web API
│   ├── Controllers/
│   │   ├── AuthController.cs        # register / login / me
│   │   ├── CatalogController.cs     # public products, categories, search, featured
│   │   ├── CustomerController.cs    # cart, checkout, orders, reviews
│   │   ├── SellerController.cs      # apply, products, seller-side orders, dashboard
│   │   ├── AdminController.cs       # verify sellers, commission, dashboard, reports
│   │   └── UploadController.cs      # CNIC / license / product image uploads
│   ├── Models/                       # all entities (User, Shop, Product, Order, etc.)
│   ├── Data/
│   │   ├── MarketNestDbContext.cs
│   │   └── SeedData.cs              # demo admin / sellers / products
│   ├── Services/                     # JwtService, PasswordHasher, OrderService, CommissionService
│   ├── Program.cs                    # DI, EF Core, JWT, CORS, static files
│   └── appsettings.json
└── Frontend/                   # React SPA
    ├── src/
    │   ├── api/client.js             # axios + per-role API clients
    │   ├── context/AuthContext.jsx   # login/register/refresh/logout
    │   ├── components/
    │   │   ├── Layout.jsx            # header, footer, categories bar
    │   │   ├── ProtectedRoute.jsx    # role-aware route guard
    │   │   └── ProductCard.jsx
    │   ├── pages/
    │   │   ├── auth/                # Login, Register, SellerApply
    │   │   ├── customer/            # Home, Search, ProductDetail, Cart, Checkout, Orders
    │   │   ├── seller/              # Dashboard, Products, Orders, Earnings
    │   │   └── admin/               # Dashboard, Sellers, Commission, Categories, Orders, Products, Customers, Reports
    │   ├── App.jsx
    │   └── App.css
    └── .env                         # VITE_API_URL=http://localhost:5196/api
```

## How to run

### 1. Start the backend
```bash
cd D:\MarketNest\Backend
dotnet run
```
Backend listens on `http://localhost:5196`. The SQLite DB and seed data are created automatically on first run.

### 2. Start the frontend
```bash
cd D:\MarketNest\Frontend
npm install   # only the first time
npm run dev
```
Frontend dev server: `http://localhost:5173`.

### 3. Quick logins (seeded)

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@marketnest.com   | Admin@123   |
| Seller   | ali@shop.com           | Ali@12345   |
| Customer | sara@buyer.com         | Sara@123    |

The login page also has one-click "Admin / Seller / Customer" buttons.

## Core flows implemented exactly per the template

### Customer (direct access)
- Register / login (no admin approval needed)
- Browse homepage, categories, search, filter
- Product detail with image, price, discount, stock, reviews
- Cart with **multi-seller grouping** (iPhone by Seller A, Shoes by Seller B…)
- Checkout with COD or Stripe (mock), shipping address, phone
- Orders page with status timeline + sub-orders
- Cancel order, leave reviews

### Seller (admin-gated)
- `Apply as Seller` form captures: account info + shop info + license (issue/expiry/issuing authority) + bank details
- Application status: `PendingVerification`
- Cannot add products or receive orders while pending
- Once approved: dashboard (total sales / commission / earnings / order count), add/list/edit/delete products, manage orders and update statuses

### Admin (control center)
- Dashboard: customers, sellers, shops, products, orders, revenue, commission totals
- **Seller verification** queue with Approve / Reject (with reason) / Suspend / Reactivate
- Auto-check on approval: license expiry date must be in the future
- Shop statuses: `PendingVerification | Approved | Rejected | Suspended | Expired`
- Commission settings (configurable % read from DB — no hard-code)
- Category management
- All orders + recent activity reports
- Refund workflow

### Order lifecycle
`Pending → Confirmed → Processing → Packed → Shipped → OutForDelivery → Delivered → Completed`
Plus `Cancelled`, `RefundRequested`, `Refunded`, `Returned`.

### Multi-seller order split
A single checkout with items from N sellers creates:
- One parent `Order` (customer-facing, payment, shipping)
- N `SellerOrder` records, each with its own commission + earnings calculation
- Each sub-order ships independently and has its own tracking

### Commission
- Stored in `CommissionSettings` with `Percentage`, `EffectiveFrom`, `IsActive`
- Admin updates it from `/admin/commission`; no code changes needed
- Default 10% applied on order placement

### License verification
- Seller provides issue date, expiry date, issuing authority
- Admin reviews documents + admin approves manually
- Auto-block: backend rejects approval if expiry ≤ today
- Shop auto-flips to `Expired` if license past expiry

## API surface

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/seller/apply          (any authenticated user)
GET    /api/seller/me
GET    /api/seller/dashboard
GET    /api/seller/products
POST   /api/seller/products
PUT    /api/seller/products/{id}
DELETE /api/seller/products/{id}
GET    /api/seller/orders?status=
PUT    /api/seller/orders/{id}/status

GET    /api/catalog/products?q=&categoryId=&minPrice=&maxPrice=&shopId=&sort=&page=
GET    /api/catalog/products/{id}
GET    /api/catalog/categories
GET    /api/catalog/featured

GET    /api/customer/cart
POST   /api/customer/cart/add
PUT    /api/customer/cart/items/{id}
DELETE /api/customer/cart/items/{id}
DELETE /api/customer/cart
POST   /api/customer/checkout
GET    /api/customer/orders
GET    /api/customer/orders/{id}
POST   /api/customer/orders/{id}/cancel
POST   /api/customer/reviews

GET    /api/admin/dashboard
GET    /api/admin/sellers?status=
GET    /api/admin/sellers/{id}
POST   /api/admin/sellers/{id}/review
POST   /api/admin/sellers/{id}/suspend
POST   /api/admin/sellers/{id}/reactivate
GET    /api/admin/products
POST   /api/admin/products/{id}/approve
POST   /api/admin/products/{id}/reject
GET    /api/admin/orders
GET    /api/admin/orders/{id}
GET    /api/admin/customers
GET    /api/admin/commission
POST   /api/admin/commission
GET    /api/admin/categories
POST   /api/admin/categories
DELETE /api/admin/categories/{id}
GET    /api/admin/reports/summary
GET    /api/admin/refunds
POST   /api/admin/refunds/{id}/process

POST   /api/upload               (multipart, returns relative file path)
```

## Verified end-to-end

Sample checkout flow produced:
- Order `MN10001`, total Rs. 480,650
- Two `SellerOrder` sub-orders:
  - `MN10001-A` (Ali Electronics): subtotal 436,050, commission 43,605, earning 392,445
  - `MN10001-B` (Ahmed Fashion Mart): subtotal 41,400, commission 4,140, earning 37,260
- Admin dashboard reflected the new order immediately

10% commission computed at runtime from `CommissionSettings`, not hard-coded.