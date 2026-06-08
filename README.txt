# PaymentManage - Full-Stack Payment Management System

A comprehensive payment management system built with the MERN stack (MongoDB, Express, React, Node.js) featuring secure authentication, multiple payment methods, and an admin panel.

## 🚀 Features

### 🔐 Authentication
- ✅ User Registration & Login
- ✅ Secure password hashing using bcrypt
- ✅ JWT-based authentication with 7-day expiry
- ✅ Protected routes for authenticated users
- ✅ Role-based access control (User/Admin)

### 💼 Payment Management Features

#### ➕ Add Payment Methods
Users can add multiple payment methods with validation:

**Common Field:**
- Payment Type (Bank / Paytm / UPI / PayPal / USDT)

**Payment Type Specific Fields:**

**🏦 Bank**
- Bank Name
- Branch Name
- Account Number (with confirmation)
- Account Holder's Name
- IFSC Code

**📱 Paytm**
- Paytm Number (with confirmation)

**🔗 UPI**
- UPI ID (with confirmation)

**🌍 PayPal**
- PayPal Email Address (with confirmation)

**🪙 USDT**
- USDT Wallet Address (with confirmation)

#### 👀 View Payment Methods
- ✅ Display all payment methods added by the logged-in user
- ✅ Organized by payment type
- ✅ Show/hide payments list
- ✅ Real-time updates

#### ✏️ Edit Payment Method
- ✅ Update any existing payment details
- ✅ Pre-populated forms with current data
- ✅ Validation on update

#### ❌ Delete Payment Method
- ✅ Remove specific payment methods
- ✅ Confirmation dialog before deletion

#### 🔁 Multiple Payment Support
- ✅ Users can add unlimited payment methods
- ✅ Support for all payment types simultaneously

### 🛠️ Admin Panel

#### 👁️ View All Users
- ✅ List all registered users
- ✅ Display username, email, and role
- ✅ User count statistics

#### 💳 View All Payment Information
- ✅ Access all users' payment details
- ✅ Organized display by payment type
- ✅ Payment count statistics

#### 🔍 Search & Filter
Admins can filter payments by:
- ✅ Username
- ✅ Payment Type (Bank / Paytm / UPI / PayPal / USDT)
- ✅ Bank Name
- ✅ IFSC Code
- ✅ Paytm Number
- ✅ UPI ID
- ✅ PayPal Email
- ✅ USDT Address

#### 👤 User-Specific Payments
- ✅ View all payment methods for individual users
- ✅ Detailed payment information per user

## 🗂️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT authentication
- **express-validator** for input validation
- **helmet** for security headers
- **express-rate-limit** for API rate limiting
- **cors** for cross-origin requests
- **express-mongo-sanitize** for MongoDB injection prevention

### Frontend
- **React 18** with Vite
- **React Router v6** for routing
- **Axios** for API calls
- **Context API** for state management
- **Material Symbols** icons
- Responsive CSS with modern design

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd PaymentManage/backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with:
- Your MongoDB Atlas connection
- Secure JWT secret
- Port and CORS settings

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd PaymentManage/frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already created:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔑 Creating an Admin User

To access the admin panel, you need to create an admin user. You can do this in two ways:

### Method 1: Direct MongoDB
```javascript
use paymentmanage
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Register and Update
1. Register a new user at `/register`
2. Update the user's role in MongoDB to "admin"
3. Login and navigate to `/admin`

## 📍 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Payment Routes (Protected)
- `GET /api/payments` - Get all user's payment methods
- `POST /api/payments` - Create new payment method
- `GET /api/payments/:id` - Get specific payment method
- `PUT /api/payments/:id` - Update payment method
- `DELETE /api/payments/:id` - Delete payment method

### Admin Routes (Protected - Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/payments` - Get all payment methods
- `GET /api/admin/users/:userId/payments` - Get user's payments
- `GET /api/admin/payments/search` - Search/filter payments

## 🎨 User Interface

### User Dashboard
- ✅ Clean, modern design with Material Design principles
- ✅ Profile dropdown with logout option (click on user avatar)
- ✅ Payment method cards with icons
- ✅ Modal-based forms for adding/editing payments
- ✅ Responsive layout for mobile and desktop
- ✅ View/hide payment list toggle
- ✅ Edit and delete options for each payment

### Admin Dashboard
- ✅ Tabbed interface (Users / All Payments)
- ✅ Advanced search and filter functionality
- ✅ User management cards
- ✅ Payment details with user information
- ✅ Responsive grid layout
- ✅ View individual user payments

## 🔒 Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (10 rounds)
   - Never stored in plain text

2. **JWT Authentication**
   - Secure token-based authentication
   - 7-day token expiry
   - Token required for protected routes

3. **Input Validation**
   - Server-side validation with express-validator
   - Client-side validation for better UX
   - Confirmation fields for sensitive data

4. **Security Headers**
   - Helmet.js for security headers
   - CORS properly configured
   - MongoDB injection prevention

5. **Rate Limiting**
   - API rate limiting (100 requests per 15 minutes)
   - Protection against brute force attacks

## 📱 Features Checklist

### User Features
✅ Register and login with secure authentication  
✅ Profile menu with logout (click on user avatar)  
✅ Add multiple payment methods (Bank, UPI, Paytm, PayPal, USDT)  
✅ View all personal payment methods  
✅ Edit existing payment details  
✅ Delete payment methods  
✅ Confirmation validation for sensitive fields  
✅ Responsive mobile-first design  

### Admin Features
✅ View all registered users  
✅ View all payment methods across all users  
✅ Search and filter by multiple criteria  
✅ View individual user's payment methods  
✅ Dedicated admin dashboard at `/admin`  
✅ Protected admin-only routes  

## 🎯 Project Structure

```
PaymentManage/
├── backend/
│   ├── config/
│   │   └── db.js                 ✅
│   ├── controllers/
│   │   ├── authController.js     ✅
│   │   ├── paymentController.js  ✅
│   │   └── adminController.js    ✅
│   ├── middleware/
│   │   ├── auth.js               ✅
│   │   ├── roleCheck.js          ✅
│   │   └── errorHandler.js       ✅
│   ├── models/
│   │   ├── User.js               ✅
│   │   └── Payment.js            ✅
│   ├── routes/
│   │   ├── authRoutes.js         ✅
│   │   ├── paymentRoutes.js      ✅
│   │   └── adminRoutes.js        ✅
│   ├── .env                      ✅
│   ├── .env.example              ✅
│   ├── package.json              ✅
│   └── server.js                 ✅
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx   ✅
    │   ├── pages/
    │   │   ├── Login.jsx         ✅
    │   │   ├── Login.css         ✅
    │   │   ├── Register.jsx      ✅
    │   │   ├── Register.css      ✅
    │   │   ├── Dashboard.jsx     ✅
    │   │   ├── Dashboard.css     ✅
    │   │   ├── AdminDashboard.jsx ✅
    │   │   └── AdminDashboard.css ✅
    │   ├── services/
    │   │   └── api.js            ✅
    │   ├── App.jsx               ✅
    │   └── main.jsx              ✅
    ├── .env                      ✅
    ├── package.json              ✅
    └── vite.config.js            ✅
```

## 🚨 Important Notes

1. **Profile Name Matching**: Users should only add bank accounts that match their profile name
2. **No Duplicate Accounts**: Don't link the same payment method to multiple accounts
3. **Fraudulent Activity**: May result in account blocking
4. **Data Validation**: All inputs are validated on both client and server
5. **Confirmation Fields**: Sensitive data requires confirmation to prevent typos
6. **Logout Feature**: Click on the user profile avatar in the top right to access the logout option

## 🧪 Testing

### Test User Flow
1. Register a new user at `/register`
2. Login with credentials at `/login`
3. You'll be redirected to `/dashboard`
4. Click on any payment method card to add it
5. Fill the form with confirmation fields
6. View your added payments by clicking "View All"
7. Edit or delete any payment method
8. Click on your avatar (top right) to see the profile menu
9. Click logout to end the session

### Test Admin Flow
1. Create an admin user (see "Creating an Admin User" section)
2. Login as admin
3. Navigate to `/admin`
4. View all users and payments
5. Test search and filter functionality
6. Click "View Payments" on any user card
7. View individual user payments

## 🚀 Quick Start

1. **Start Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. **Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Register a new user
- Login and start adding payment methods
- Click on profile avatar for logout

## 📄 License

MIT License

## 👨‍💻 Developer Notes

- Backend runs on port 5000
- Frontend runs on port 5173
- MongoDB default port: 27017
- All API calls use Axios interceptors for authentication
- Protected routes redirect to login if not authenticated
- Admin routes redirect to dashboard if not admin
- Profile menu appears when clicking on user avatar
- All modals use smooth animations

## 🔄 Future Enhancements

- Email verification
- Password reset functionality
- Payment method verification
- Transaction history
- Export data as CSV/PDF
- Dark mode support
- Multi-language support
- Mobile app version
- Real-time notifications
- Payment analytics dashboard

---

**Built with ❤️ using the MERN Stack**

**Status:** ✅ All Features Implemented & Working
