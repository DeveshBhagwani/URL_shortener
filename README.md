# ✂️ Advanced URL Shortener with Analytics

A full-stack MERN application that allows users to shorten long URLs, track click analytics, generate QR codes, and manage their links via a secure dashboard.

**[🚀 Live Demo](https://url-shortener-six-sand.vercel.app/)** | **[📂 GitHub Repository](https://github.com/DeveshBhagwani/URL_shortener)**

---

## 🌟 Features

* **🔗 Smart Shortening:** Instantly convert long URLs into short, shareable links.
* **📊 Live Analytics:** Track the total number of clicks for every link in real-time.
* **🔐 User Authentication:** Secure Login and Registration using JWT (JSON Web Tokens) & bcrypt.
* **📱 QR Code Generation:** Auto-generated QR codes for easy mobile sharing.
* **✨ Custom Aliases:** Users can create custom "vanity" URLs (e.g., `/my-resume`).
* **⏳ Auto-Expiration:** Links automatically expire after a set duration (24 hours) to keep the database clean.
* **🌑 Dark Mode:** A modern, responsive dark-themed UI.

---

## 🛠️ Tech Stack

**Frontend:**
* **React.js (Vite):** For a fast and interactive user interface.
* **Axios:** For handling HTTP requests.
* **QRCode.react:** For rendering SVG QR codes.
* **CSS3:** Custom responsive styling with dark mode support.

**Backend:**
* **Node.js & Express:** RESTful API architecture.
* **MongoDB & Mongoose:** NoSQL database for flexible data storage.
* **JWT (JsonWebToken):** Stateless authentication mechanism.
* **Bcrypt.js:** Password encryption.

**Deployment:**
* **Frontend:** Hosted on Vercel.
* **Backend:** Hosted on Render.
* **Database:** MongoDB Atlas (Cloud).
