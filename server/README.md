# Tech Gadgets Store — Backend

A MERN stack e-commerce API server. Node.js/Express connected to MongoDB, serving a separate React client.

**Frontend repo:** https://tech-gadgets-client.vercel.app/

## Tech Stack

- Runtime: Node.js, Express
- Database: MongoDB, Mongoose
- Auth: JSON Web Tokens (Bearer token), bcryptjs password hashing
- Validation: Joi
- Image uploads: Multer + Cloudinary (`multer-storage-cloudinary` streams uploads directly to Cloudinary, nothing is stored on local disk, which matters on serverless deploy targets where local disk storage doesn't persist)
- Email: Nodemailer with Gmail SMTP (used for the password-reset flow)

## Project Structure

```text
server/
├── config/            # MongoDB connection (mongoose.js), CORS allowlist (corsOptions.js)
├── Controllers/        # Route handler logic
│   └── admin/           # Admin-only controllers (dashboard, user management)
├── Middlewares/         # Auth, authorization, validation, upload, error handling
├── Model/               # Mongoose models
├── Routes/              # API route files, including admin.routes.js
├── Services/            # Email service (Nodemailer)
├── Utils/               # Shared helpers: logger, ApiError
└── validations/         # Joi validation schemas
```

## Features

- User registration and login (JWT-based)
- Password reset flow: a hashed, time-limited reset code is emailed and stored on the user document. no session/cookie involved, purely stateless
- Product and category APIs, with Cloudinary backed image uploads
- Cart APIs for logged-in users
- Cash order APIs, with order-status email notifications
- Role-based access: most admin actions reuse the same routes as regular users, gated inside the controller/middleware by role. a separate `/admin` route group exists specifically for dashboard stats and user management

## Requirements

- Node.js
- npm
- MongoDB connection string
- Cloudinary account (cloud name, API key, API secret)
- Gmail account or app password for sending reset emails

## Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
EMAIL=your_gmail_address
USERPASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URLS=http://localhost:5173,https://tech-gadgets-client.vercel.app
NODE_ENV=development
```

Important: the email service checks `EMAIL` and `USERPASS` on server start, if either is missing, the server exits with an error.

`CLIENT_URLS` is a comma-separated allowlist of every frontend origin permitted to call this API (see CORS, below). Add another origin here (a staging deploy, a custom domain) without touching any code.

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev     # local development, auto-restarts on file changes
npm start        # production start
```

The server runs on `http://localhost:5000` by default.

## API Overview

Base API URL: `/api/v1`

### Users

```text
POST /users/register
POST /users/login
POST /users/forgot-password
POST /users/verify-reset-code
POST /users/reset-password
```

### Products

```text
GET    /products
GET    /products/:id
POST   /products       Admin only
PATCH  /products/:id   Admin only
DELETE /products/:id   Admin only
```

Product create/update accept a multipart `image` field (Cloudinary upload via Multer).

### Categories

```text
GET    /categories
GET    /categories/:id
POST   /categories       Admin only
DELETE /categories/:id   Admin only
```

Note: there is no update/edit route for categories, only create and delete.

### Cart

All cart routes require login.

```text
GET    /cart
POST   /cart
DELETE /cart
PATCH  /cart/:itemId
DELETE /cart/:itemId
```

### Orders

All order routes require login. Admin access is enforced inside the controller, not by a separate route.

```text
POST   /orders             Create a cash order (logged-in user)
GET    /orders             List orders, own orders for regular users, all orders for admins
GET    /orders/:orderId    Get a single order, owner or admin only
PATCH  /orders/:orderId    Update status/paid/delivered => admin only
DELETE /orders/:orderId    Delete an order => admin only
```

### Admin

Mounted separately at `/api/v1/admin`. Every route here requires authentication and the `admin` role.

```text
GET    /admin/dashboard/stats
GET    /admin/dashboard/sales
GET    /admin/dashboard/activity
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id/role
PATCH  /admin/users/:id/status
DELETE /admin/users/:id
```

## Authentication

Protected routes expect a JWT in the request header:

```text
Authorization: `Bearer your_token_here`
```

The frontend stores the token in `localStorage` after login and attaches it via an Axios interceptor.

## CORS

CORS is restricted to an explicit origin allowlist (`config/corsOptions.js`), populated from the `CLIENT_URLS` env var. Requests from any origin not on that list are rejected. Since auth is a stateless Bearer-token JWT with no cookies involved, `credentials: true` isn't needed for the auth flow itself, the allowlist exists purely to control which origins can reach the API at all.

## Deployment Notes

- Product/category images are uploaded directly to Cloudinary, no local `/uploads` directory is involved, which avoids the disk-persistence issues serverless platforms have with local file storage.
- Set all environment variables (including the three `CLOUDINARY_*` keys and `CLIENT_URLS`) on the deployment platform before deploying.
- If you add a new frontend origin (a custom domain, a staging deploy), add it to `CLIENT_URLS` and redeploy, or requests from that origin will be rejected by CORS.

## License

This project is under a custom portfolio license, see LICENSE for details.