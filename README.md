# 🏪 Hemantha Hardware Store — Inventory & Billing System

A full-stack desktop application for managing inventory and billing in a hardware store environment. Built with modern web technologies and packaged as a Windows desktop app using Electron.

---

## 🚀 Features

### 📦 Product Management

* Add, edit, delete products
* Manage category, brand, price, discount
* Low stock alerts
* Search and pagination

### 🏷️ Brand Management

* Create and manage brands
* Auto-create brand during product entry

### 🧾 Sales & Billing

* Create bills with multiple items
* Automatic stock updates
* Billing interface optimized for speed

### 📊 Dashboard

* Overview of stock and activity
* Low stock monitoring

### 📅 Sales History

* View daily sales
* Filter by date and presets

### 🔐 Authentication

* User registration and login
* Role-based access (Admin / Staff)

---

## 🛠️ Tech Stack

| Layer       | Technology        |
| ----------- | ----------------- |
| Frontend    | React.js          |
| Backend     | Node.js + Express |
| Database    | MySQL             |
| Desktop App | Electron          |

---

## 🧱 Project Structure

```
d:/inventory/
├── Backend/        # Express API (controllers, models, routes)
├── Frontend/       # React app (pages, components)
└── electron-app/   # Electron main process & packaging
```

---

## ⚙️ Installation (Development)

### 1. Clone the repository

```
git clone https://github.com/your-username/hardware-inventory.git
cd hardware-inventory
```

### 2. Setup Backend

```
cd Backend
npm install
```

Create `.env` file:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hardware_store
JWT_SECRET=secretkey
```

Run backend:

```
npm start
```

---

### 3. Setup Frontend

```
cd Frontend
npm install
npm start
```

---

### 4. Setup Database

* Create MySQL database: `hardware_store`
* Import SQL file (tables: products, sales, sales_items, users)

---

## 🖥️ Desktop Build

The app is packaged using Electron.

```
cd electron-app
npm install
npm run build
```

👉 Output:

```
dist/Hemantha-Hardware-Store-2.0.0.exe
```

---

## 📦 Deployment

* Portable Windows executable (.exe)
* Runs fully offline
* Backend, frontend, and Electron bundled together

---

## ✨ Recent Updates (v2.0.0)

* Fixed billing search & autocomplete
* Added sales date filtering
* Improved dashboard
* Updated bill numbering logic
* Fixed Electron packaging issues

---

## 📸 Screenshots
<img width="825" height="611" alt="Screenshot 2026-04-12 125055" src="https://github.com/user-attachments/assets/8ff97f18-db54-492f-b1d4-28fadac70fad" />
<img width="1550" height="955" alt="Screenshot 2026-04-13 230059" src="https://github.com/user-attachments/assets/a4161195-75c0-457e-928c-93a68f962c6a" />
<img width="1538" height="914" alt="Screenshot 2026-04-13 230111" src="https://github.com/user-attachments/assets/d33d3d3a-5565-4c12-9c13-9f4d46df0cf8" />
<img width="1527" height="933" alt="Screenshot 2026-04-13 230128" src="https://github.com/user-attachments/assets/7f8a34a6-922c-4cbb-b267-6d571220cfdc" />
<img width="1548" height="905" alt="Screenshot 2026-04-13 230148" src="https://github.com/user-attachments/assets/ed468ef7-33de-41bf-8933-4fea7c6514c1" />
<img width="1556" height="945" alt="Screenshot 2026-04-13 230159" src="https://github.com/user-attachments/assets/20d2f275-5cfc-473f-bc54-ea6adf7b5238" />
<img width="1562" height="974" alt="Screenshot 2026-04-13 230222" src="https://github.com/user-attachments/assets/8f6bbb2e-8d69-4a39-a214-c560c052c309" />



---

## 🎯 Learning Outcomes

* Full-stack application development
* REST API design with Express
* Database management with MySQL
* Desktop app development using Electron
* Real-world system design

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome!

---

## 📄 License

This project is for educational and portfolio purposes.
