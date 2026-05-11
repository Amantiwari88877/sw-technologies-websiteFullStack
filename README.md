# SW Technologies — Full-Stack Web Application

## 🚀 Tech Stack
- **Frontend**: HTML, CSS, Vanilla JS
- **Backend**: Node.js + Express.js
- **Database**: JSON file-based 
- **Auth**: JWT tokens (7-day expiry) + bcrypt password hashing

---

## ⚙️ How to Run

### Step 1 — Install dependencies
```bash
cd backend
npm install
```

### Step 2 — Seed the database (creates admin account)
```bash
node seed.js
```

### Step 3 — Start the server
```bash
node server.js
```

### Step 4 — Open your browser
```
http://localhost:3001
```

That's it! The server serves both the backend API and all frontend files.

---

## 🔑 Admin Credentials
| Field    | Value                        |
|----------|------------------------------|
| Email    | admin@swtechnologies.in      |
| Password | Admin@123                    |
| URL      | http://localhost:3001/admin.html |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /api/auth/register    | Register new user              |
| POST   | /api/auth/login       | Login, returns JWT token       |
| GET    | /api/auth/profile     | Get logged-in user profile     |

### Contact
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| POST   | /api/contact    | Submit contact form      |

### Newsletter
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/newsletter/subscribe   | Subscribe to newsletter  |

### Quote
| Method | Endpoint     | Description              |
|--------|--------------|--------------------------|
| POST   | /api/quote   | Submit quote request     |

### Admin (requires admin JWT)
| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | /api/admin/contacts        | All contact messages     |
| DELETE | /api/admin/contacts/:id    | Delete a message         |
| GET    | /api/admin/users           | All registered users     |
| GET    | /api/admin/quotes          | All quote requests       |
| DELETE | /api/admin/quotes/:id      | Delete a quote           |
| GET    | /api/admin/newsletter      | All newsletter emails    |

---

## 🔐 Security Features
- Passwords hashed with **bcrypt** (12 rounds) — never stored as plain text
- **JWT tokens** expire in 7 days
- All admin routes protected with middleware — returns 401 if no valid admin token
- Server-side validation on ALL form fields
- CORS enabled for frontend-backend communication

---

## 📁 Project Structure
```
sw-fullstack/
├── backend/
│   ├── server.js       ← Main Express server + all API routes
│   ├── seed.js         ← Creates admin account
│   ├── database.json   ← Auto-created JSON database
│   └── package.json
└── frontend/
    ├── index.html      ← Home page (quote modal + newsletter)
    ├── contact.html    ← Contact form (live backend)
    ├── login.html      ← Login page
    ├── register.html   ← Register page
    ├── admin.html      ← Admin panel
    ├── about.html      ← About page (unchanged)
    ├── services.html   ← Services page (unchanged)
    ├── api.js          ← Shared API helper + auth logic
    ├── main.js         ← Navbar + hamburger menu
    └── style.css       ← All styles (unchanged)
```
