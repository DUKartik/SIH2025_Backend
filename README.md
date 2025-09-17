<h1>Alumni Connecting Backend</h1>
# Alumni-Student Management System

## 📌 Overview
This project is a **role-based alumni-student management platform** built with **Node.js, Express.js, and MongoDB Atlas**. It facilitates **secure user management, alumni verification, student–alumni interactions, and event creation**.  

Key features include:
- Four-level hierarchical structure: **Super Admin, Admin, Alumni, Student**  
- **Secure authentication** using JWT and cookies  
- **Chat system** for communication between students and alumni  
- **Event management**, where Admins create events with AI-powered assistance using **Gemini API**  
- **Cloudinary integration** for storing and managing media files  

---

## 🏗️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **File Storage:** Cloudinary  
- **Authentication:** JWT, cookie-parser  
- **API Testing:** Postman  
- **Collaboration:** GitHub  
- **AI Integration:** Gemini API (for auto-filling event schema fields)  

---

## 🔑 Role Hierarchy
1. **Super Admin** – Registered directly through the database. Can create Admins.  
2. **Admin** – Registered by Super Admin. Can verify Alumni and create events.  
3. **Alumni** – Registered users verified by Admin. Can chat with students.  
4. **Student** – Base-level users with limited access. Can interact with Alumni.  

---

## 💬 Features
### ✅ Authentication & Security
- JWT-based login and session management  
- Secure cookies for persistent sessions  

### ✅ Alumni–Student Chat System
- One-to-one chat between alumni and students  
- Real-time communication support  

### ✅ Event Management
- Admins can create events by providing a rough description  
- **Gemini API** auto-fills other fields of the schema (e.g., title, description, tags, etc.)  

### ✅ Media Handling
- Profile pictures, event posters, and documents stored in **Cloudinary**  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)  
- MongoDB Atlas account  
- Cloudinary account  
- Gemini API key  
