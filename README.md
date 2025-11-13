# Supplier Portal

This is the standalone Supplier Portal application for MaterialMatrix.

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The supplier portal will run on `http://localhost:3001`

### Build
```bash
npm run build
```

## 📂 Project Structure
```
supplier-portal/
├── src/
│   ├── pages/          # Supplier pages (Login, Dashboard, etc.)
│   ├── components/     # UI components
│   ├── hooks/          # React hooks
│   ├── lib/            # Utilities
│   └── App.tsx         # Main app component
├── public/
└── package.json
```

## 🔗 Backend Connection
The supplier portal connects to the backend API at `http://localhost:5000/api`

## 📄 Available Routes
- `/login` - Supplier login
- `/onboarding` - Supplier registration
- `/dashboard` - Supplier dashboard
- `/products` - Product management
- `/test` - Test page for verification
