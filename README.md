# LohanLogistics — Transport Brokerage & Fleet ERP

A full-stack, enterprise-grade Transport Brokerage & Fleet Management ERP system built for Indian road logistics, goods transport commission agents, and fleet operators.

---

## 🚀 Key Highlights & Capabilities

- **Indian Logistics Ready**: Built-in support for Goods & Services Tax (GSTIN), PAN numbers, Consignor/Consignee workflows, E-Way Bill numbers, and driver licensing.
- **Digital Bilty (Lorry Receipt / LR) Generator**: Standard Indian Goods Carriage Consignment Note complying with transport law (Consignor, Consignee, Driver copies, cargo itemization, freight math with advances & leftovers, and authorized sign-off blocks).
- **Party Ledger & 1-Click Khata Statement**: Complete debit/credit running ledger for commercial clients and transporters, with instant PDF print and formatted WhatsApp statement dispatch.
- **Leftover & Extra Dues Tracking**: Direct tracking of unpaid trip leftovers, detention/halting charges, loading/unloading variances, and extra stops.
- **Trip Dispatch & Bhatta Advance**: Track Up & Down journeys, driver bhatta advances, and fuel/pump slip receipts.
- **Universal WhatsApp Sharing**: Direct click-to-chat WhatsApp dispatch with contact auto-detection and phone selector to dispatch Bilties and Khata summaries to clients, drivers, and transporters.
- **Fully Responsive for Android**: Native bottom navigation bar, touch-friendly cards for smartphones, horizontal touch-scrolling for A4 Bilties and Ledgers, and mobile PWA meta tags.
- **Multi-Device & Network Ready**: Configured on `0.0.0.0` so you can use the system across multiple computers, phones, or tablets on your local network.

---

## 🛠 Tech Stack

- **Frontend**:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS
  - Lucide Icons
- **Backend**:
  - Node.js
  - Express
  - TypeScript (tsx runtime)
  - Persistent JSON file database (`backend/data/db.json`)

---

## 📁 Repository Structure

```text
├── transport-broker/
│   ├── backend/
│   │   ├── data/
│   │   │   └── db.json          # Persistent JSON database
│   │   ├── index.ts             # Express REST API & CORS setup
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/      # BiltyModal, PartyStatementModal, Drawers, etc.
│   │   │   ├── context/         # DataContext (State, CRUD, CSV export, Reset)
│   │   │   ├── layouts/         # Layout & Mobile Bottom Navigation Bar
│   │   │   └── pages/           # Bookings, Trips, Clients, Transporters, etc.
│   │   ├── index.html           # Viewport & Android mobile meta tags
│   │   └── package.json
│   └── LOHAN_LOGISTICS_MANUAL.txt
├── LohanLogistics_Complete_Guide.txt # Comprehensive user manual & field guide
├── README.md
└── .gitignore
```

---

## ⚡ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 2. Install Dependencies

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd transport-broker/backend
npm install
```

**Terminal 2 — Frontend:**
```bash
cd transport-broker/frontend
npm install
```

### 3. Run the Development Servers

**Terminal 1 — Backend:**
```bash
npm run dev
# Server runs on http://0.0.0.0:5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173 (and your local IP)
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📱 Using on Mobile / Another PC

Because both the frontend and backend are configured to listen on all local network interfaces (`0.0.0.0`), you can access the ERP from any phone or computer on the same Wi-Fi:

1. Find your computer's local IP (e.g. `192.168.31.248`).
2. Open Chrome on your Android phone or another PC on the same network.
3. Visit:
   ```text
   http://192.168.31.248:5173
   ```
4. On Android Chrome, tap **Add to Home screen** to use it as a full-screen mobile app!

---

## 📄 License
ISC
