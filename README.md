
```
my-medicine-app
├─ app
│  ├─ (auth)
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ register
│  │     └─ page.tsx
│  ├─ (public)
│  │  └─ track
│  │     └─ [id]
│  │        └─ page.tsx
│  ├─ api
│  │  └─ auth
│  │     └─ [...nextauth]
│  │        └─ route.ts
│  ├─ contact
│  │  └─ page.tsx
│  ├─ dashboard
│  │  ├─ distributor
│  │  │  ├─ components
│  │  │  │  └─ DistributorCharts.tsx
│  │  │  ├─ incoming
│  │  │  │  ├─ IncomingAnalytics.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ ReceiveButton.tsx
│  │  │  │  └─ [id]
│  │  │  │     └─ invoice
│  │  │  │        ├─ InvoicePrintButton.tsx
│  │  │  │        └─ page.tsx
│  │  │  ├─ inventory
│  │  │  │  ├─ InventoryAnalytics.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ orders
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ place-order
│  │  │  │  ├─ OrderCard.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ recall
│  │  │  │  └─ page.tsx
│  │  │  └─ shipment
│  │  │     └─ create
│  │  │        ├─ CreateShipmentForm.tsx
│  │  │        └─ page.tsx
│  │  ├─ EditProfileModal.tsx
│  │  ├─ layout.tsx
│  │  ├─ manufacturer
│  │  │  ├─ catalog
│  │  │  │  ├─ CatalogClient.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ create-batch
│  │  │  │  ├─ CreateBatchForm.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ inventory
│  │  │  │  └─ page.tsx
│  │  │  ├─ orders
│  │  │  │  ├─ OrderActions.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [orderId]
│  │  │  │     ├─ invoice
│  │  │  │     │  ├─ InvoicePrintButton.tsx
│  │  │  │     │  └─ page.tsx
│  │  │  │     └─ ship
│  │  │  │        ├─ ConfirmButton.tsx
│  │  │  │        └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ production
│  │  │  │  ├─ assign
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ operator-mode
│  │  │  │  └─ page.tsx
│  │  │  ├─ quality
│  │  │  │  └─ page.tsx
│  │  │  ├─ recall
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ RecallButton.tsx
│  │  │  └─ shipment
│  │  │     ├─ DispatchClient.tsx
│  │  │     ├─ page.tsx
│  │  │     ├─ ShipmentForm.tsx
│  │  │     └─ [id]
│  │  │        ├─ InvoiceView.tsx
│  │  │        └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ retailer
│  │  │  ├─ components
│  │  │  │  ├─ POSCharts.tsx
│  │  │  │  └─ RetailerCharts.tsx
│  │  │  ├─ incoming
│  │  │  │  └─ page.tsx
│  │  │  ├─ inventory
│  │  │  │  └─ page.tsx
│  │  │  ├─ invoice
│  │  │  │  └─ [orderId]
│  │  │  │     └─ page.tsx
│  │  │  ├─ orders
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ pos
│  │  │  │  └─ page.tsx
│  │  │  ├─ sales
│  │  │  │  └─ page.tsx
│  │  │  └─ shop
│  │  │     ├─ page.tsx
│  │  │     └─ [productId]
│  │  │        └─ page.tsx
│  │  └─ track
│  │     ├─ page.tsx
│  │     └─ TrackClient.tsx
│  ├─ docs
│  │  └─ page.tsx
│  ├─ favicon.ico
│  ├─ features
│  │  ├─ generic-finder
│  │  └─ pharmacy-locator
│  │     └─ page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ operator
│  │  ├─ page.tsx
│  │  └─ panel
│  │     └─ [code]
│  │        └─ page.tsx
│  ├─ page.tsx
│  ├─ track
│  │  ├─ page.tsx
│  │  └─ TrackClient.tsx
│  └─ verify
│     └─ [batchId]
│        └─ page.tsx
├─ auth.ts
├─ components
│  ├─ dashboard
│  │  ├─ activity-log.tsx
│  │  ├─ DashboardCharts.tsx
│  │  ├─ EditProfileModal.tsx
│  │  ├─ ManufacturerHeader.tsx
│  │  └─ Sidebar.tsx
│  ├─ EditProfileModal.tsx
│  ├─ ManufacturerHeader.tsx
│  ├─ PharmacyMap.tsx
│  ├─ RecallButton.tsx
│  ├─ RetailerCharts.tsx
│  ├─ tracking
│  │  └─ TrackingResultViewer.tsx
│  └─ ui
│     ├─ button.tsx
│     ├─ card.tsx
│     └─ input.tsx
├─ components.json
├─ eslint.config.mjs
├─ lib
│  ├─ actions
│  │  ├─ auth-actions.ts
│  │  ├─ distributor-actions.ts
│  │  ├─ log-actions.ts
│  │  ├─ manufacturer-actions.ts
│  │  ├─ pos-actions.ts
│  │  ├─ production-actions.ts
│  │  ├─ profile-actions.ts
│  │  ├─ recall-actions.ts
│  │  ├─ retailer-actions.ts
│  │  ├─ sales-actions.ts
│  │  ├─ shipment-actions.ts
│  │  ├─ team-actions.ts
│  │  └─ track-actions.ts
│  ├─ actions.ts
│  ├─ auth.ts
│  ├─ formatters.ts
│  ├─ idGenerator.ts
│  ├─ prisma.ts
│  └─ utils.ts
├─ middleware.ts
├─ New folder
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20251217205014_reset_data
│  │  │  └─ migration.sql
│  │  ├─ 20251228073845_add_shipment_model
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ public
│  ├─ bg.jpg
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ hero.png
│  ├─ next.svg
│  ├─ photo-1562243061-204550d8a2c9.jpg
│  ├─ premium_photo-1664373622064-3847709d4cf9.jpg
│  ├─ premium_photo-1668605108427-695ef1c16256.jpg
│  ├─ premium_photo-1671411374326-65e8b381a6d4.jpg
│  ├─ premium_photo-1674572257954-a1a9265ce1a9.jpg
│  ├─ slide2.jpg
│  ├─ slide3.jpg
│  ├─ vercel.svg
│  └─ window.svg
└─ tsconfig.json

```