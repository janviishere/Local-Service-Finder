<div align="center">

 🌟 Local Service Finder

 Find Trusted Local Professionals Anytime, Anywhere

<img src="https://readme-typing-svg.herokuapp.com?font=Poppins&size=24&duration=3500&pause=1000&color=4CAF50&center=true&vCenter=true&width=650&lines=Book+Verified+Local+Services;MERN+Stack+Project;Google+Maps+Integration;Secure+Authentication;Fast+%26+Responsive+UI" />

![GitHub stars](https://img.shields.io/github/stars/janviishere/Local-Service-Finder?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/janviishere/Local-Service-Finder?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/janviishere/Local-Service-Finder?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

 📖 About

**Local Service Finder** is a full-stack MERN web application that connects users with nearby verified service providers such as electricians, plumbers, carpenters, mechanics, cleaners, tutors, and many more.

The platform provides secure authentication, location-based search using Google Maps, service booking, profile management, image uploads, and an intuitive dashboard for both customers and service providers.

---

 ✨ Features

 👤 User

- Secure Authentication (JWT)
- Register/Login
- Browse Nearby Services
- Search by Category
- Google Maps Integration
- Book Local Services
- View Booking History
- Update Profile
- Responsive UI

---

 🛠️ Service Provider

- Provider Dashboard
- Add Services
- Edit/Delete Services
- Manage Bookings
- Upload Images
- View Customer Requests

---

 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role Based Access

---

 🏗️ Tech Stack

## Frontend

- React.js
- React Router
- Axios
- Tailwind CSS
- Google Maps API

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Prisma ORM
- JWT Authentication
- Multer
- ImageKit

---

 📂 Project Structure

```
Local-Service-Finder
│
├── Frontend
│   ├── Components
│   ├── Pages
│   ├── Hooks
│   ├── Context
│   └── Assets
│
├── Backend
│   ├── Controllers
│   ├── Models
│   ├── Routes
│   ├── Middleware
│   ├── Config
│   └── Utils
│
└── README.md
```

---

 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/janviishere/Local-Service-Finder.git
```

```
cd Local-Service-Finder
```

---

## Backend

```bash
cd Backend
npm install
npm run dev
```

---

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

 ⚙️ Environment Variables

Create a `.env` file.

```env
PORT=

MONGO_URI=

JWT_SECRET=

GOOGLE_MAP_API=

IMAGEKIT_PUBLIC_KEY=

IMAGEKIT_PRIVATE_KEY=

IMAGEKIT_URL_ENDPOINT=
```

---

 🗺️ Google Maps Features

- Current User Location
- Nearby Services
- Interactive Maps
- Location Selection
- Distance-based Search

---

 📸 Screenshots

<img width="1917" height="931" alt="Screenshot 2026-07-20 214305" src="https://github.com/user-attachments/assets/27833de5-e66c-47e2-8917-00ad4394d06c" />
<img width="1913" height="932" alt="Screenshot 2026-07-20 214321" src="https://github.com/user-attachments/assets/e283040c-8d37-4bed-80ee-563d123e2b70" />
<img width="1918" height="931" alt="Screenshot 2026-07-20 214335" src="https://github.com/user-attachments/assets/ae008fa3-6590-474c-9dfb-9f504601cef4" />
<img width="1918" height="928" alt="Screenshot 2026-07-20 214349" src="https://github.com/user-attachments/assets/ed54baff-3377-4f95-aca5-b0ea465d083d" />
<img width="1917" height="931" alt="Screenshot 2026-07-20 214401" src="https://github.com/user-attachments/assets/a61eff5f-2eee-43d4-ae94-1532e2b0af3e" />


---

 🔄 Workflow

```text
User
   │
   ▼
Authentication
   │
   ▼
Browse Services
   │
   ▼
View Provider
   │
   ▼
Book Service
   │
   ▼
Booking Stored
   │
   ▼
Provider Dashboard
```

---

 🌐 API Routes

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Users

```
GET /api/user/profile
PUT /api/user/profile
```

### Services

```
GET /api/services
POST /api/services
PUT /api/services/:id
DELETE /api/services/:id
```

### Booking

```
POST /api/book
GET /api/bookings
```

---

 📈 Future Improvements

- AI Service Recommendation
- Live Chat
- Payment Gateway
- Ratings & Reviews
- Notification System
- Real-time Booking Status
- Voice Search
- Service Analytics

---
<div align="center">

Made with ❤️ using MERN Stack

</div>
