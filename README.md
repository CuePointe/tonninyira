# Tonninyira Online App 🛒📱

Hyper-local, low-margin e-commerce and delivery ecosystem designed for budget shoppers in Kampala and surrounding suburbs.

## Core Pillars
- **Micro-Quantities & Fair Pricing:** Direct open-market sourcing.
- **Zone-Based Logistics:** Ultra-cheap hyper-local delivery + batched regional delivery.
- **Micro-Commissions:** Scalable revenue model via vendor and dispatch cuts without price markups.

tonninyira-online-app/
│
├── docs/                      # Architecture, API specs & business blueprints
│   └── architecture.md
│
├── mobile/                    # Flutter / React Native App (Customer + Vendor + Runner)
│   ├── lib/
│   │   ├── screens/           # Catalog, Checkout, Order Tracking
│   │   ├── services/          # Mobile Money, Location Services
│   │   └── main.dart
│   └── pubspec.yaml
│
├── backend/                   # Node.js / FastAPI Server
│   ├── src/
│   │   ├── controllers/       # Orders, Vendors, Runners
│   │   ├── models/            # Database Schemas (Users, Commodities, Deliveries)
│   │   ├── services/          # Batching Algorithm, SafeBoda API, Mobile Money
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── LICENSE
└── README.md                  # Project overview and setup guide
