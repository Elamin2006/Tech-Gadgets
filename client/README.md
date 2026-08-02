# Tech Gadgets — Frontend

A full-stack MERN e-commerce storefront and admin dashboard, built end-to-end as a self-initiated portfolio project. This repo contains:
**Live demo:** https://tech-gadgets-client.vercel.app/
**Backend repo:** https://tech-gadgets-server-kappa.vercel.app/api/v1
---

## Features

**Storefront**
- Product browsing with category filtering and search
- Product detail pages with reviews
- Shopping cart with live quantity updates and subtotal calculation
- Guest and authenticated checkout (cash on delivery / card)
- Order history for logged-in users
- Auth flows: register, login, forgot password, reset via verification code

**Admin Dashboard** (role-protected)
- Overview stats and sales insights
- Product management (create, edit, delete, stock/discount tracking)
- Category management
- Order management (status updates, payment/delivery tracking, order details view)
- User management
- Role-based access control (RBAC) — admin-only routes are fully guarded

**Shared component library** — reusable `Button`, `Modal`, `ConfirmDialog`, `Loader`, and `Pagination` components used consistently across the storefront and admin sections

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 19, Vite |
| State | Redux Toolkit |
| Routing | React Router v7 |
| HTTP | Axios |
| UI | React Bootstrap, Bootstrap 5, custom CSS design system |
| Notifications | React Toastify |
| Carousels / Media | Swiper, React Slick, React Fast Marquee |
| Testing | React Testing Library, Jest DOM |
| Linting | ESLint |

## Getting Started

### Prerequisites
- Node.js 18+
- A running instance of the [backend API](#) (see backend README for setup)

### Installation

```bash
git clone https://github.com/Elamin2006/Tech-Gadgets
cd <repo-name>
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production, point this at your deployed backend URL instead. Vite only exposes variables prefixed with `VITE_` to the client, anything without that prefix won't be available in the browser bundle (and secret keys should never go here regardless, since everything in `VITE_*` ships to the browser).

### Running Locally

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Building for Production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```

## Project Structure

```
src/
├── components/
│   ├── common/        # Shared UI: Button, Modal, ConfirmDialog, Loader, Pagination
│   └── ...             # Feature components: Navbar, ProductCard, Filter, Slider, etc.
├── layouts/
│   ├── MainLayout/     # Public storefront shell (Navbar + Footer)
│   └── AdminLayout/    # Admin shell (Sidebar + Header)
├── pages/
│   ├── Home, Shop, Product, Cart, Order, Login, Register, ...
│   └── Admin/          # Dashboard, Products, Categories, Orders, Users, Settings
├── routes/              # AppRoutes, ProtectedRoutes, AdminRoute
├── services/            # Axios API layer, split by customer/admin domain
├── store/               # Redux Toolkit store and slices
└── hooks/                # Shared custom hooks
```

## Deployment

Deployed on [Vercel](https://vercel.com). Since routing uses `BrowserRouter`, a `vercel.json` rewrite rule is required so client-side routes resolve correctly on refresh/direct visit:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Set `VITE_API_URL` as an environment variable in the Vercel project settings, pointing to your deployed backend. Make sure the backend's CORS configuration allows your Vercel domain as an origin.

## License

This project is under a custom portfolio license, see LICENSE for details.