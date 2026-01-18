
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
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ verify
│     ├─ [batchId]
│     │  └─ page.tsx
│     └─ [id]
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
│  │  ├─ recall-actions.ts
│  │  ├─ retailer-actions.ts
│  │  ├─ sales-actions.ts
│  │  ├─ shipment-actions.ts
│  │  └─ track-actions.ts
│  ├─ actions.ts
│  ├─ auth.ts
│  ├─ formatters.ts
│  ├─ idGenerator.ts
│  ├─ prisma.ts
│  └─ utils.ts
├─ middleware.ts
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
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
└─ tsconfig.json

```