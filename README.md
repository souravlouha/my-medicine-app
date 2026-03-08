 <div align="center">
  <img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/6434763b-cf79-4fca-8443-b78d61f48501" />

# MedTrace
## Digital Medicine Authentication & Traceability Framework

**Manufacturer → Distributor → Retailer → Consumer. One platform. Zero counterfeits.**

[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-blue?style=flat-square)](https://github.com/your-username/medtrace)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Firebase%20%7C%20Node-orange?style=flat-square)](https://github.com/your-username/medtrace)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/your-username/medtrace/pulls)
[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-ff6600?style=flat-square)](https://github.com/your-username/medtrace)
[![Final Year Project](https://img.shields.io/badge/Final%20Year-Project-9333ea?style=flat-square)](https://github.com/your-username/medtrace)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-22c55e?style=flat-square)](https://github.com/your-username/medtrace)
[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square)](https://github.com/your-username/medtrace)
<img width="600" height="500" alt="Screenshot 2026-03-07 123538" src="https://github.com/user-attachments/assets/0b33eb77-33b3-4455-a0c1-f76e13ab6e77" />
</div>

---

## 🚨 The Problem

According to the **World Health Organization**, an estimated **1 in 10 medical products** in low- and middle-income countries is substandard or falsified. In India alone:

- 🏥 **20%** of medicines sold are estimated to be counterfeit or substandard
- 💀 **7 lakh people** die annually from substandard antimalarials and antibiotics in Africa and Asia
- 💰 **₹3,500 crore+** worth of fake medicines are seized annually in India
- 🔬 Counterfeit medicines may contain **wrong active ingredients**, **incorrect dosages**, **chalk powder**, **floor wax**, or **toxic substances**

**The Root Cause?** The existing supply chain lacks a unified digital traceability system. Medicines change hands from manufacturer → distributor → retailer with no verifiable digital custody trail. Recalls are slow. Counterfeiting is easy. Patients have no way to verify authenticity.

---

## 💡 Our Solution

**MedTrace** is an end-to-end pharmaceutical supply chain traceability framework that:

1. **Assigns a unique digital identity** to every medicine unit at the moment of manufacture
2. **Tracks every ownership transfer** digitally — manufacturer to distributor to retailer
3. **Enables instant verification** by any consumer by scanning a QR code
4. **Propagates recalls in real time** across the entire distribution network
5. **Provides a B2B marketplace** for transparent medicine procurement
6. **Generates GST-compliant invoices** automatically at every dispatch
7. **Works offline** — scans queue and sync when connectivity restores

---

## 📢 News

`2026-01-31` 🎉 **MedTrace v1.0 Released** — All five stakeholder portals live. 12,000 QR codes tracked in pilot with zero counterfeit breach.

`2025-11-01` 🚀 **Development started** — Project kicked off after literature gap analysis confirmed no open-source end-to-end solution existed.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Unique Digital Identity** | Every medicine unit gets a QR-based UDI at manufacture, linked to batch, strength, expiry, and manufacturer |
| 📦 **Parent–Child Packaging** | Scan one carton QR → all linked boxes, strips, and units update automatically |
| ⚡️ **Real-Time Verification** | Any stakeholder verifies medicine authenticity in under 1 second |
| 🚨 **Instant Recall** | Manufacturer triggers recall → entire network flagged in real time |
| 🏭 **Production Floor Security** | Time-limited operator job codes with PIN. One-time use per batch. |
| 🛒 **B2B Marketplace** | Retailers compare medicine prices, stock, and expiry across all distributors |
| 🧾 **GST Invoicing** | GST-compliant PDF invoices auto-generated on every dispatch |
| 📴 **Offline Support** | Mobile scans queue locally and sync when internet restores |
| 📊 **Live Analytics** | Scan trends, expiry risk, recall impact, distribution heatmaps |
| 🖥️ **POS Terminal** | Fast in-store billing for full strips or loose tablets — Cash & UPI |
| 👥 **Multi-Role System** | Manufacturer, Distributor, Retailer, Consumer, Inspector — each scoped |
| 🔍 **Inspector Audit** | Regulatory inspectors can trace any batch across the entire chain |
| 📱 **Mobile-First Consumer** | No app needed — browser-based QR scan on any smartphone |
| 📈 **Sales Analytics** | Retailer sales history with CSV/PDF export |
| 🗂️ **Ownership Chain** | Every unit stores full custody chain from manufacture to purchase |

---
## 📊 Comparison with Existing Systems

|  | Sproxil | mPedigree | PharmaSecure | EMVS (EU) | MediLedger | **MedTrace** |
|---|---|---|---|---|---|---|
| **Technology** | SMS OTP | USSD/SMS | SMS OTP | 2D Barcode | Blockchain | QR + Firebase |
| **End-to-End Chain** | ❌ | ❌ | ❌ | Partial | Partial | ✅ |
| **Parent–Child Packaging** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Real-Time Recall** | ❌ | ❌ | ❌ | Partial | ❌ | ✅ |
| **B2B Marketplace** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **POS Terminal** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Offline Support** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Regulatory Inspector** | ❌ | ❌ | ❌ | ✅ | Limited | ✅ |
| **GST Invoicing** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Open Source** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **No Hardware Needed** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Free to Use** | ❌ | ❌ | ❌ | N/A | ❌ | ✅ |
| **Works Without Internet** | ❌ | Partial | ❌ | ❌ | ❌ | ✅ |

---

## 📚 Research & Problem Statement

### Literature Gap Analysis

| Research Area | Gap Identified | MedTrace Solution |
|---|---|---|
| Authentication systems | Single-level verification (strip only) — no packaging hierarchy | Parent–child QR model (Carton→Box→Strip→Unit) |
| Recall systems | Manual, phone-based recall — 24–72h propagation | Cloud Function recall — < 5 seconds propagation |
| Supply chain tracking | Closed, proprietary systems — no interoperability | Open-source, API-first design |
| Consumer access | Requires dedicated SMS/app per brand | Universal QR, browser-based, works on any phone |
| Regulatory compliance | No built-in audit trail for inspectors | Inspector portal with full custody chain |
| Invoicing | Manual GST invoicing, error-prone | Auto-generated, CGST+SGST split, PDF download |

---

## 🖥️ Demonstration

### 📊 Overview Dashboard

![Dashboard](assets/demo/dashboard.png)

*Real-time KPIs, 7-day scan chart, top verified products, supply chain coverage stats, and live activity feed — everything a manufacturer needs at a glance.*

---

### 🔑 Onboarding & Registration

![Register](assets/demo/register.png)

*Organisations — Manufacturers, Distributors, Retailers — register with company name, Drug License Number, and GSTIN. Role selection determines which portal they access after verification.*

---

### 🏭 Manufacturer Workflows

| 📦 Product Catalog | 🧬 Batch Creation & QR Generation |
|:---:|:---:|
| ![Catalog](assets/demo/catalog.png) | ![Batch](assets/demo/batch.png) |
| Register medicines with dosage, strength, HSN code, pricing | Create batches → set hierarchy → generate all QR codes |

| 📋 Dispatch & GST Invoice | 🖨️ QR Code Print Sheet |
|:---:|:---:|
| ![Dispatch](assets/demo/dispatch.png) | ![QR Sheet](assets/demo/qrsheet.png) |
| Select distributor → auto GST calculation → confirm dispatch | Print-ready QR sheets with batch info, expiry, strip ID |

| 🚨 Quality Control & Recall | 👥 Team Management |
|:---:|:---:|
| ![Recall](assets/demo/recall.png) | ![Team](assets/demo/team.png) |
| Monitor batches · trigger recall · view propagation impact | Register operators · assign PIN-protected job codes · audit prints |

---

### 🚚 Distributor Workflows

| 📥 Incoming Shipments | 🛒 B2B Medicine Marketplace |
|:---:|:---:|
| ![Incoming](assets/demo/incoming.png) | ![Marketplace](assets/demo/marketplace.png) |
| Review manifests → accept stock → inventory auto-updates | Compare manufacturers · prices · expiry · ratings · order |

| 📋 Order Management | 🚨 Quality Alerts & Recall Notices |
|:---:|:---:|
| ![Orders](assets/demo/orders.png) | ![Alerts](assets/demo/alerts.png) |
| Approve / reject retailer orders · partial fulfillment | Critical · Warning · Notice — with required action instructions |

---

### 🏪 Retailer Workflows

| 🖥️ POS Terminal | 📊 Live Shelf Inventory |
|:---:|:---:|
| ![POS](assets/demo/pos.png) | ![Inventory](assets/demo/inventory.png) |
| Fast billing · Cash & UPI · receipt print · auto stock deduct | Real-time expiry monitoring · reorder alerts · valuation |

| 📈 Sales History & Reports | 🧾 GST Invoice Preview |
|:---:|:---:|
| ![Sales](assets/demo/sales.png) | ![Invoice](assets/demo/invoice.png) |
| Full transaction log · filter · search · export CSV/PDF | Auto-generated GST invoice · CGST + SGST · rupees in words |

---

### 📱 Consumer Verification

| 📷 QR Scanner | ✅ Genuine | ⏰ Expired | 🚨 Recalled | ❓ Invalid |
|:---:|:---:|:---:|:---:|:---:|
| ![Scan](assets/demo/scan.png) | ![Genuine](assets/demo/genuine.png) | ![Expired](assets/demo/expired.png) | ![Recalled](assets/demo/recalled.png) | ![Invalid](assets/demo/invalid.png) |
| Camera scan | Safe to consume | Do not consume | Return immediately | Report it |

*Works in any smartphone browser — no app installation required.*

---

## 🏗️ Architecture

<img width="501" height="551" alt="Screenshot 2026-01-05 225219" src="https://github.com/user-attachments/assets/dd74196b-6d48-4833-b3d4-2479ffecb157" />

```
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **Firebase over self-hosted DB** | Managed infrastructure, real-time listeners, free tier generous enough for production pilot |
| **Next.js over CRA** | Server-side rendering for faster initial load on low-end mobile devices |
| **JWT over sessions** | Stateless auth scales to multiple server instances without session store |
| **QR over RFID** | QR scannable by any smartphone with no hardware cost. RFID requires dedicated readers. |
| **Centralized over blockchain** | Blockchain adds latency and complexity without solving the core data integrity problem for this use case. Our signed QR + audit log approach provides equivalent tamper evidence. |
| **Client-side PDF** | Reduces server load; invoice generation is purely deterministic from Firestore data |

---

## 🔄 Traceability Flow

![MedTrace Traceability Flow](assets/flowchart.png)

```
STEP 1 — MANUFACTURE
  Manufacturer registers product → creates batch → generates QR hierarchy
  QR codes: Carton → Box → Strip → Unit (parent-child linked)
  Every QR = unique URL: https://medtrace.app/verify/{unique_id}

STEP 2 — DISPATCH TO DISTRIBUTOR
  Manufacturer selects distributor → adds batches → confirms dispatch
  Digital ownership transfers instantly
  GST invoice auto-generated and stored

STEP 3 — DISTRIBUTOR RECEIVES
  Distributor clicks "Receive & Add to Stock"
  Inventory updates in real time
  Distributor can now sell to retailers

STEP 4 — RETAILER ORDERS
  Retailer browses B2B marketplace → places order
  Distributor approves → dispatches → retailer receives
  POS terminal tracks every unit sold

STEP 5 — CONSUMER VERIFIES
  Consumer scans QR code on any strip/box/carton
  System resolves full chain: who made it, who handled it
  Result: Genuine ✅ / Expired ⏰ / Recalled 🚨 / Invalid ❓

RECALL FLOW (any time)
  Manufacturer triggers recall with reason
  Cloud Function fires → updates all affected batch records
  All distributors + retailers with that batch get instant alert
  Any future consumer scan shows red recall warning
```

---

## 🔳 QR Code System

### Unique Digital Identity (UDI) Format

Every QR code encodes a secure URL:
```
https://medtrace.app/verify/MTR-{MANUFACTURER_ID}-{BATCH_ID}-{STRIP_ID}-{UNIT_INDEX}-{CHECKSUM}

Example:
https://medtrace.app/verify/MTR-PGL-20250042-STR00891-U0012-A7F3
```

### Packaging Hierarchy

```
Carton QR  →  MTR-PGL-20250042-CTN-001
  │
  ├── Box QR  →  MTR-PGL-20250042-BOX-001-01
  │     ├── Strip QR  →  MTR-PGL-20250042-STR-001-01-01
  │     │     └── Unit QR  →  MTR-PGL-20250042-UNT-001-01-01-001
  │     └── Strip QR  →  MTR-PGL-20250042-STR-001-01-02
  │
  └── Box QR  →  MTR-PGL-20250042-BOX-001-02
```

**Parent resolution:** Scanning a Carton QR automatically resolves and updates all linked Boxes, Strips, and Units. A distributor receiving a shipment can scan one carton QR to accept all 2,400 units inside.

### QR Generation Engine

```javascript
// Simplified QR generation logic (Cloud Function)
async function generateBatchQRs(batch) {
  const { batchId, hierarchy } = batch;
  const { cartonsPerBatch, boxesPerCarton, stripsPerBox, unitsPerStrip } = hierarchy;

  for (let c = 0; c < cartonsPerBatch; c++) {
    const cartonId = `CTN-${String(c+1).padStart(3,'0')}`;
    await createQR('carton', batchId, cartonId, null);

    for (let b = 0; b < boxesPerCarton; b++) {
      const boxId = `BOX-${cartonId}-${String(b+1).padStart(2,'0')}`;
      await createQR('box', batchId, boxId, cartonId);

      for (let s = 0; s < stripsPerBox; s++) {
        const stripId = `STR-${boxId}-${String(s+1).padStart(2,'0')}`;
        await createQR('strip', batchId, stripId, boxId);

        for (let u = 0; u < unitsPerStrip; u++) {
          const unitId = `UNT-${stripId}-${String(u+1).padStart(3,'0')}`;
          await createQR('unit', batchId, unitId, stripId);
        }
      }
    }
  }
}
```

### QR Error Correction

All MedTrace QR codes use **Level H error correction** — meaning up to **30% of the QR code can be damaged or obscured** (torn, wet, partially printed) and the code still scans correctly. This is critical for real-world packaging that gets handled, stored, and transported.

---

## 🧩 Stakeholder Modules

<details>
<summary><b>🏭 Manufacturer — Full Module Reference</b></summary>

### Manufacturer Portal

The root of the entire traceability chain. Every medicine's digital life begins here.

#### 📋 Product Catalog

Register medicines with complete pharmaceutical details:

| Field | Description | Example |
|---|---|---|
| Brand Name | Proprietary trade name | Crocin |
| Generic Name | INN / pharmacological name | Paracetamol IP |
| Dosage Form | Physical form | Tablet / Capsule / Syrup |
| Strength | Active ingredient amount | 500mg |
| Pack Size | Packaging configuration | 10 strips × 10 tablets |
| Storage Condition | Temperature requirements | Ambient (15–30°C) |
| HSN Code | GST classification code | 3004 |
| Base Distributor Price | Per strip excl. GST | ₹4.20 |
| MRP | Maximum retail price | ₹6.50 |
| Therapeutic Category | ATC classification | Analgesic / Antipyretic |

#### ⚗ Advanced Production Line

Step-by-step batch creation:

```
1. Select Product from Catalog
2. Enter Batch Details:
   └── Batch Number (auto-suggested or manual)
   └── Manufacturing Date
   └── Expiry Date
   └── Total Units Target
3. Set Packaging Hierarchy:
   └── Units per Strip     (e.g., 10)
   └── Strips per Box      (e.g., 12)
   └── Boxes per Carton    (e.g., 5)
   └── Total Cartons       (e.g., 4)
   └── System calculates → 4 × 5 × 12 × 10 = 2,400 Units
4. Review & Confirm
5. System generates 2,400 + 240 + 20 + 4 = 2,664 QR codes
6. Download print-ready QR sheets (PDF) by level
```

#### 👥 Team Management

Secure production floor access control:

- **Operator Registration:** Employee ID + name + 4–6 digit PIN
- **Job Code Assignment:** Time-limited (configurable 1h–24h, default 8h)
- **Single-use locking:** Job auto-locks when printed quantity == target
- **Supervisor override:** Manager can extend or unlock with dual-auth
- **Full audit log:** Who printed, when, which batch, how many units

**Job Code Lifecycle:**
```
Create → Assign → Operator enters PIN → Print starts
                                       → Target reached → Auto-lock
                                       → Time expired  → Auto-expire
                                       → Supervisor    → Manual extend
```

#### 🚚 Dispatch & Logistics

1. Select verified distributor from network
2. Add medicines by batch (with per-unit quantity)
3. System auto-computes GST (5% / 12% / 18% by HSN)
4. Preview full GST invoice (CGST + SGST breakdown)
5. Confirm → ownership transfers digitally → distributor notified
6. Invoice auto-saved to Firebase Storage as PDF

#### 🚨 Quality Control & Recall

**Recall trigger reasons:**
- Quality Check Failed (QCF)
- Contamination Suspected
- Packaging Defect
- Regulatory Order (CDSCO/State FDA/High Court)
- Voluntary Precautionary Recall

**Post-trigger flow:**
1. Batch status → `recalled` across all records instantly
2. Cloud Function propagates to all distributor inventory records
3. All retailer inventory records updated
4. Push notification to all affected stakeholders
5. Consumer QR scans return red recall screen immediately
6. Full impact report: X distributors, Y retailers, Z units affected

</details>

<details>
<summary><b>🚚 Distributor — Full Module Reference</b></summary>

### Distributor Portal

#### 🛒 B2B Marketplace

- Browse products from all registered manufacturers
- Compare same generic medicine across multiple manufacturers:
  - Price per strip
  - Available stock
  - Nearest expiry batch
  - Manufacturer rating
  - Delivery timeline
- Sort by: Price (low–high) · Expiry (farthest first) · Rating
- Filter by: Therapeutic category · Dosage form · Manufacturer state

#### 📥 Incoming Shipments

Review each incoming shipment:

| Field | Detail |
|---|---|
| Shipment ID | Auto-generated |
| From | Manufacturer name + license number |
| Medicines list | Name, batch, quantity, unit price |
| GST breakdown | CGST + SGST per item |
| Invoice | Download PDF |
| Action | Accept / Dispute |

On "Accept": stock added to inventory with timestamp. On "Dispute": reason logged, manufacturer notified, shipment held.

#### 📊 My Inventory

Real-time dashboard with expiry risk analysis:

| Expiry Risk | Threshold | Action |
|---|---|---|
| 🟢 Safe | > 6 months | No action needed |
| 🟡 Warning | 2–6 months | Plan to move stock |
| 🔴 Critical | < 2 months | Immediate sale or return |
| ⚫ Expired | Past date | Remove from shelf, return |

Adjustable per-medicine sell price to retailers (cannot go below purchase price).

#### 📋 Order Management

- Incoming retailer orders with full item breakdown
- Approve → triggers dispatch workflow
- Reject → retailer notified with reason
- Partial approval → specify per-item approved quantities
- Bulk approve (for trusted long-term retailers)
- Priority ordering: Urgent / High / Normal / Low

#### 🚚 Dispatch to Retailers

Same workflow as Manufacturer dispatch — select retailer, add medicines, confirm, invoice auto-generated.

#### 🚨 Quality Alerts

Three alert levels:

| Level | Trigger | Required Action |
|---|---|---|
| 🚨 Critical | Contamination / Regulatory recall | Stop sales immediately. Remove + return. |
| ⚠ Warning | Packaging defect / Quality issue | Hold stock. Await manufacturer instruction. |
| ℹ Notice | Label update / Advisory | Update labelling. Continue sales. |

</details>

<details>
<summary><b>🏪 Retailer — Full Module Reference</b></summary>

### Retailer Portal

#### 🖥️ POS Terminal

Fast billing workflow:

```
Search medicine (name / generic / batch) →
→ Add quantity (full strips OR loose tablets) →
→ System auto-calculates price + GST →
→ Apply discount (if applicable) →
→ Select payment: Cash | UPI | Card →
→ Confirm →
→ Inventory auto-deducted →
→ Receipt: Print | WhatsApp | Email
```

**Supported sale types:**
- Full strip (standard sale)
- Loose tablets (partial strip — system tracks remaining units)
- Bundle sale (multiple medicines in one bill)
- Return / refund (stock restored)

#### 🛒 Medicine Marketplace

Same as distributor marketplace but orders from distributors (not manufacturers).

**Compare view shows:**
- Distributor name + rating
- Price per strip
- Available stock
- Batch expiry (nearest)
- Estimated delivery date
- Minimum order quantity

#### 📊 Shelf Inventory

| Column | Description |
|---|---|
| Medicine | Brand + generic name |
| Batch | Batch number |
| Strips | Current strip count |
| Units | Current loose unit count |
| Expiry | Per-batch expiry date |
| Risk | Safe / Warning / Critical |
| MRP | Maximum retail price |
| Sell Price | Your sell price (editable) |
| Reorder | Auto-suggested quantity |

#### 📈 Sales History

Complete transaction log with filters:
- Date range (today / week / month / custom)
- Medicine name or batch
- Payment mode
- Amount range

Export options:
- CSV (for Tally/accounting software import)
- PDF (for printing monthly reports)
- Summary report (totals by medicine / payment mode)

#### 🚨 Critical Alerts at POS

If a cashier tries to scan/sell a recalled batch:
- POS immediately blocks the sale
- Red warning banner: "RECALLED — Do NOT sell"
- Batch auto-removed from sellable inventory
- Retailer instructed: return to distributor for credit

</details>

<details>
<summary><b>📱 Consumer — Full Module Reference</b></summary>

### Consumer Interface

No app installation. Works in Safari, Chrome, any mobile browser.

#### How to Scan

1. Open phone camera
2. Point at QR code on medicine (strip / box / carton)
3. Tap the notification or link
4. Verification result loads in under 1 second

#### Verification Statuses

| Status | Visual | Meaning | Recommended Action |
|---|---|---|---|
| ✅ Genuine | Green shield | Verified authentic | Safe to consume as prescribed |
| ⏰ Expired | Orange clock | Past expiry date | Do not consume. Return to pharmacy. |
| 🚨 Recalled | Red siren | Active recall by manufacturer/authority | Do NOT consume. Return for full refund. |
| ❓ Invalid | Grey question | Not in MedTrace database | May be counterfeit. Report to authorities. |

#### Result Screen Information

**Medicine Details:**
- Brand name + generic name
- Dosage form + strength
- Batch number
- Strip / Unit ID (specific physical item)
- Manufacturing date
- Expiry date (with days remaining)
- Manufacturer name + drug license number
- MRP (official maximum retail price)

**Safety Indicators:**
- Safety Score (0–100)
  - 100: Fully verified, within expiry, no issues
  - 70–99: Verified but expiry within 60 days
  - Below 70: Issues found
- Last verified: timestamp of most recent scan
- Total verifications: how many times this unit was scanned

**Quick Actions:**
- 📍 Find nearby pharmacy
- 🚩 Report suspected fake (photo + description)
- 📞 Drug authority helpline (1800-xxx-xxxx)
- 📲 Share verification result

#### Offline Mode

When the device has no internet:
1. Scan is saved locally with timestamp
2. Partial data shown from cached batch info (if available)
3. "Pending verification" status shown
4. On reconnect: full verification runs automatically, result updated

</details>

<details>

### Inspector Dashboard

MedTrace's Regulatory Inspector module is designed specifically around **India's pharmaceutical regulatory hierarchy**. Multiple central and state-level bodies operate with different jurisdictions, powers, and data access needs — each gets a scoped role inside MedTrace.

---

#### 🏛️ Indian Regulatory Bodies Integrated in MedTrace

India's drug regulation involves a layered system of central and state authorities. MedTrace maps each body to a specific access role:

| Regulatory Body | Full Name | Jurisdiction | MedTrace Role |
|---|---|---|---|
| **CDSCO** | Central Drugs Standard Control Organisation | National — all medicines, biologicals, medical devices | `central_inspector` — full national read + recall authority |
| **ICMR** | Indian Council of Medical Research | National — research oversight, pharmacovigilance, clinical trial drugs | `icmr_researcher` — read-only + research data export |
| **NPPA** | National Pharmaceutical Pricing Authority | National — price compliance, MRP enforcement | `nppa_auditor` — read MRP data + pricing audit |
| **IPC / PVPI** | Indian Pharmacopoeia Commission / Pharmacovigilance Programme of India | National — adverse drug reaction, quality standards | `ipc_auditor` — quality alerts + ADR data |
| **State FDA** | State Food and Drug Administration | State-level — licensing, inspections, state recalls | `state_inspector` — state-scoped read + state recall |
| **DCG(I)** | Drugs Controller General of India | National — highest drug authority, approves all new drugs | `dcgi_authority` — highest access level, national recall |
| **NIB** | National Institute of Biologicals | National — biological medicines, vaccines | `nib_auditor` — read-only for biological product batches |

---

#### 🔬 ICMR — Indian Council of Medical Research

ICMR is India's apex body for biomedical and health research. Within MedTrace, ICMR has a specialised **Research & Pharmacovigilance** access role that gives it unique capabilities beyond standard inspection.

##### Why ICMR Needs Access to MedTrace Data

ICMR uses real-world medicine distribution and consumption data for:
- **Pharmacovigilance** — monitoring adverse drug reactions (ADR) at population scale
- **Drug utilisation studies** — which medicines are being consumed, where, in what quantities
- **Counterfeit medicine epidemiology** — mapping where fake medicines are geographically concentrated
- **Clinical trial drug tracking** — ensuring investigational medicines in trials are properly authenticated
- **Essential medicines monitoring** — tracking availability of Schedule H / National Essential Medicines List drugs across states
- **Antimicrobial resistance (AMR) research** — monitoring antibiotic consumption patterns linked to resistance

##### ICMR Access Capabilities in MedTrace

```
ICMR Researcher Login
│
├── 📊 National Medicine Consumption Dashboard
│     ├── Scan frequency heatmap (district → state → national)
│     ├── Medicine category breakdown (antibiotics, analgesics, etc.)
│     ├── Month-over-month trend analysis
│     └── Export: CSV / JSON / FHIR-compliant format
│
├── 🗺️ Geographic Distribution Analysis
│     ├── Which districts have highest unverified (Invalid QR) scan rates
│     ├── Urban vs rural medicine access patterns
│     ├── State-wise distribution of Schedule H / H1 medicines
│     └── Correlate scan data with HMIS health data
│
├── 🔬 Pharmacovigilance Integration
│     ├── View all "Recalled" QR scan events with patient geography
│     ├── Cross-reference with PvPI (Pharmacovigilance Programme of India) ADR reports
│     ├── Flag batches with abnormally high "Recalled" or "Invalid" scan rates
│     └── Generate batch-level risk signal reports for CDSCO
│
├── 🧪 Clinical Trial Drug Monitoring
│     ├── Search batches tagged as "Investigational Medicinal Product (IMP)"
│     ├── Verify trial drugs remain in authorised trial site supply chain
│     ├── Flag any trial batch that appears outside registered trial sites
│     └── Export chain-of-custody report for Ethics Committee submission
│
├── 📋 Drug Utilisation Studies (DUS)
│     ├── Defined Daily Dose (DDD) calculations per region
│     ├── Antibiotic consumption index (WHO ATC/DDD methodology)
│     ├── Essential medicines coverage analysis
│     └── Schedule H1 antibiotic dispensing patterns
│
└── 📤 Data Export for Research
      ├── Anonymised dataset export (no patient PII — geography + medicine only)
      ├── FHIR R4 format for interoperability with ABDM / NHA systems
      ├── API access for ICMR's own analytics platforms
      └── Scheduled automated reports (daily / weekly / monthly)
```

##### ICMR Dashboard — Key Views

**1. Pharmacovigilance Signal Board**
Automatically flags batches where the ratio of `recalled` or `invalid` scan responses exceeds a configurable threshold in a given region. For example: if more than 5% of scans for Amoxicillin 250mg in a district return "Invalid" in a 7-day window, ICMR is alerted to a possible counterfeit surge in that area.

**2. Antibiotic Stewardship Monitor**
Tracks dispensing of Schedule H1 antibiotics (Azithromycin, Amoxicillin-Clavulanate, Ciprofloxacin, etc.) by region. Highlights districts with consumption spikes — potential indicators of irrational use or AMR risk — aligned with India's National Action Plan on AMR (NAP-AMR 2017).

**3. Essential Medicines Availability Tracker**
Cross-references MedTrace scan data against the National List of Essential Medicines (NLEM 2022). Shows which NLEM medicines have low scan density in tribal / rural districts — indicating potential supply gaps — and flags for PMBJP (Pradhan Mantri Bhartiya Janaushadhi Pariyojana) review.

**4. Clinical Trial Supply Chain Monitor**
Any batch registered in MedTrace with the `IMP` (Investigational Medicinal Product) flag is tracked separately. ICMR can see the exact authorised trial sites each IMP batch should reach. Any QR scan of an IMP batch outside a registered trial site triggers an automatic alert to ICMR and the sponsor company.

---

#### 🏥 CDSCO — Central Drugs Standard Control Organisation

CDSCO holds the highest regulatory authority and has the broadest access in MedTrace.

##### CDSCO Capabilities

```
CDSCO Inspector Login
│
├── 🔍 National Batch Search
│     ├── Search by batch no, medicine, manufacturer, state, date range
│     ├── Full custody chain from manufacture to retailer
│     └── Flag for investigation or trigger immediate recall
│
├── 🚨 National Recall Authority
│     ├── Trigger Class I / II / III recall (WHO classification)
│     ├── Mandatory recall (overrides manufacturer) with regulatory order number
│     ├── Real-time propagation to all distributors and retailers nationwide
│     └── Issue public advisory (appears on all consumer scan results)
│
├── 🏭 Manufacturer Compliance Audit
│     ├── Schedule M GMP compliance score per manufacturer
│     ├── Batch rejection rates, QC failure history
│     ├── Operator job code audit (who printed what, when)
│     ├── Drug License expiry monitoring
│     └── Export Schedule 17 (labelling compliance) audit report
│
├── 🗂️ National Drug Register View
│     ├── All registered manufacturers with license status
│     ├── Approved vs unapproved products being sold
│     ├── Cross-reference with CDSCO's own Central Drugs Standard database
│     └── Flag unlicensed products in the MedTrace chain
│
└── 📊 National Intelligence Dashboard
      ├── Counterfeit hotspot map (high Invalid QR density by district)
      ├── Recall response compliance (how fast distributors/retailers acted)
      ├── Top 10 most-complained medicines (via consumer "Report Fake" button)
      └── Monthly compliance report auto-generated for Ministry of Health
```

##### CDSCO Recall Classification (WHO Framework, India-Adapted)

| Class | Definition | Example | MedTrace Action |
|---|---|---|---|
| **Class I** | Reasonable probability of serious adverse health consequence or death | Contaminated sterile injectable; wrong active ingredient | Immediate nationwide recall. All portals locked for that batch. Consumer scan → RED + emergency banner. |
| **Class II** | May cause temporary adverse health consequences; remote probability of serious effects | Sub-potent antibiotic (60% of label strength) | Rapid state/national recall. Distributor and retailer stock flagged. Consumer scan → RECALL warning. |
| **Class III** | Unlikely to cause adverse health consequences but violates regulations | Missing batch number on label; minor packaging defect | Administrative recall. Supply chain flagged. Consumer scan → WARNING (orange, not red). |

---

#### 🏛️ State FDA — State Food and Drug Administration

Each state has its own FDA with jurisdiction over manufacturers, distributors, and retailers registered in that state.

##### State FDA Capabilities

```
State FDA Inspector Login (e.g., Maharashtra FDA)
│
├── Scoped to Maharashtra-registered entities only
├── View all batches manufactured in Maharashtra
├── Inspect distributors operating within Maharashtra
├── Trigger state-level recall (does not propagate beyond state boundary)
├── Schedule M inspection report upload per manufacturer
├── Drug license renewal status monitoring
└── Export state-level compliance report for State Health Department
```

---

#### 💊 NPPA — National Pharmaceutical Pricing Authority

NPPA enforces the Drugs (Prices Control) Order (DPCO) — ensuring medicines are not sold above the government-set ceiling price.

##### NPPA Capabilities in MedTrace

```
NPPA Auditor Login
│
├── 📋 MRP Compliance Monitor
│     ├── View base price, distributor price, retailer price, and MRP per medicine
│     ├── Flag any medicine where retailer selling price > MRP (as set in product catalog)
│     ├── Cross-reference with NPPA's National List of Price-Controlled Medicines
│     └── Auto-flag DPCO Schedule I (price-controlled formulations) violations
│
├── 📊 Price Trend Analysis
│     ├── Track distributor-set prices over time per medicine per region
│     ├── Identify price gouging during shortage events
│     └── Export pricing data for DPCO enforcement proceedings
│
└── 🏭 Manufacturer Price Declaration Audit
      ├── Verify manufacturer's declared base price matches NPPA ceiling
      └── Flag products sold above DPCO ceiling price for prosecution
```

---

#### 🧬 IPC / PVPI — Pharmacovigilance Programme of India

The Indian Pharmacopoeia Commission runs PvPI — India's national adverse drug reaction (ADR) monitoring system.

##### IPC / PVPI Capabilities in MedTrace

```
IPC / PVPI Auditor Login
│
├── 🔗 ADR Signal Correlation
│     ├── Cross-reference recalled batches with reported ADR events in VigiFlow
│     ├── Link batch-level QR data to patient ADR reports (by geography + time)
│     └── Generate medicine risk signals for Pharmacopoeia quality review
│
├── 📋 Quality Standard Compliance
│     ├── Verify pharmacopoeial standards declared on product label match IP/USP/BP
│     └── Flag products making unapproved pharmacopoeial claims
│
└── 📊 National ADR Heatmap
      └── Districts with highest ADR reports correlated with batch recall data
```


#### Access Levels

| Level | Jurisdiction | Can Trigger Recall | Audit Export |
|---|---|---|---|
| State Drug Inspector | Single state | State-level only | Yes |
| Central Drug Controller | All India | National | Yes |
| Audit Access | Read-only | No | Yes |
| Emergency Authority | Any | Yes + nationwide | Yes |

#### Cross-Chain Batch Search

Search any batch by:
- Batch number (exact or partial)
- Medicine name
- Manufacturer name
- Date range (manufactured between X and Y)
- Status (active / recalled / expired)

Results show:
- Full custody chain (manufacturer → distributors → retailers)
- Units accounted for vs. total manufactured
- Geographic distribution map
- Any QC flags or alerts

#### Investigation Management

Create and track formal drug investigations:
- Assign severity: Critical / High / Medium / Low
- Link to batch records
- Add evidence (lab reports, photos, seizure documents)
- Track remediation actions
- Close with resolution notes
- Generate court-ready audit export (PDF with tamper-evident timestamp)

#### National Analytics

- Scan frequency by state / district / city
- Most-counterfeited medicine categories (by invalid scan reports)
- Recall response time analysis (how quickly distributor / retailer acted)
- Manufacturer compliance scoring

</details>

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Firebase CLI | Latest | Deploy & emulator |
| Git | Any | Version control |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/medtrace.git
cd medtrace

# 2. Install all dependencies
npm install

# 3. Install Firebase CLI globally
npm install -g firebase-tools

# 4. Login to Firebase
firebase login

# 5. Create a Firebase project at console.firebase.google.com
#    Enable: Firestore, Authentication, Functions, Storage

# 6. Copy example config
cp config.example.json config.json
cp .env.example .env.local

# 7. Fill in your Firebase credentials in .env.local

# 8. Initialize Firebase in the project
firebase use --add   # select your project

# 9. Deploy Firestore security rules
firebase deploy --only firestore:rules,storage

# 10. (Optional) Seed demo data
npm run seed

# 11. Start development server
npm run dev
# → http://localhost:3000
```

### Quick Setup with Firebase Emulator (No Cloud Needed)

```bash
# Start all Firebase services locally
firebase emulators:start

# In another terminal
npm run dev:emulator

# Demo accounts (after npm run seed):
# Manufacturer:  mfr@demo.medtrace.app   / Demo@1234
# Distributor:   dist@demo.medtrace.app  / Demo@1234
# Retailer:      retail@demo.medtrace.app / Demo@1234
# Inspector:     insp@demo.medtrace.app  / Demo@1234
```

---

## 🗂️ Project Structure

```
medtrace/
├── 📁 app/                          # Next.js app directory (App Router)
│   ├── 📁 (auth)/                   # Auth pages (unauthenticated)
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── 📁 manufacturer/             # Manufacturer portal
│   │   ├── dashboard/page.jsx
│   │   ├── catalog/page.jsx         # Product catalog
│   │   ├── production/page.jsx      # Batch + QR generation
│   │   ├── team/page.jsx            # Operator management
│   │   ├── inventory/page.jsx
│   │   ├── dispatch/page.jsx
│   │   ├── recall/page.jsx
│   │   └── analytics/page.jsx
│   ├── 📁 distributor/              # Distributor portal
│   │   ├── dashboard/page.jsx
│   │   ├── marketplace/page.jsx
│   │   ├── incoming/page.jsx
│   │   ├── inventory/page.jsx
│   │   ├── orders/page.jsx
│   │   ├── dispatch/page.jsx
│   │   └── alerts/page.jsx
│   ├── 📁 retailer/                 # Retailer portal
│   │   ├── dashboard/page.jsx
│   │   ├── pos/page.jsx             # POS terminal
│   │   ├── marketplace/page.jsx
│   │   ├── orders/page.jsx
│   │   ├── inventory/page.jsx
│   │   ├── sales/page.jsx
│   │   └── alerts/page.jsx
│   ├── 📁 consumer/                 # Consumer verification
│   │   └── verify/[uid]/page.jsx   # QR scan result
│   ├── 📁 inspector/                # Regulatory dashboard
│   │   ├── dashboard/page.jsx
│   │   ├── search/page.jsx
│   │   ├── investigations/page.jsx
│   │   └── reports/page.jsx
│   └── 📁 api/                      # REST API handlers
│       ├── auth/
│       ├── batch/
│       ├── medicine/
│       ├── shipment/
│       ├── orders/
│       ├── recall/
│       └── analytics/
│
├── 📁 components/
│   ├── 📁 ui/                       # Shared UI: Button, Card, Badge...
│   ├── 📁 manufacturer/             # Manufacturer-specific components
│   ├── 📁 distributor/
│   ├── 📁 retailer/
│   └── 📁 consumer/
│
├── 📁 lib/
│   ├── 📁 firebase/                 # Firebase config + client helpers
│   ├── 📁 auth/                     # JWT, RBAC middleware, session
│   ├── 📁 qr/                       # QR generation + UID builder
│   ├── 📁 invoice/                  # GST invoice PDF generator (jsPDF)
│   └── 📁 recall/                   # Recall propagation engine
│
├── 📁 functions/                    # Firebase Cloud Functions
│   ├── qrGenerate.js                # Batch QR generation
│   ├── recallPropagation.js         # Recall cascade across chain
│   ├── invoiceGenerator.js          # PDF invoice generation
│   ├── ownershipTransfer.js         # Custody chain recorder
│   └── notificationSender.js        # Push notifications
│
├── 📁 scripts/
│   ├── seed.js                      # Demo data seeder
│   └── migrate.js                   # DB migration helper
│
├── 📁 docs/
│   ├── api.md                       # Full API documentation
│   ├── deployment.md                # Step-by-step deploy guide
│   └── data-model.md                # Firestore schema reference
│
├── 📁 assets/                       # README assets
│   ├── banner.png
│   ├── architecture.png
│   ├── flowchart.png
│   └── demo/                        # Screenshot images
│
├── 📄 firestore.rules               # Firestore security rules
├── 📄 storage.rules                 # Firebase Storage rules
├── 📄 firebase.json                 # Firebase project config
├── 📄 next.config.js
├── 📄 config.example.json
├── 📄 .env.example
└── 📄 README.md
```

---

## ⚙️ Configuration

### Environment Variables Reference

```env
# ── Firebase Client SDK (public) ──────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# ── Server-side secrets ────────────────────────────────────────
JWT_SECRET=minimum_32_character_secret_key_here
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# ── App configuration ──────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_QR_BASE_URL=https://your-domain.com/verify/
NEXT_PUBLIC_APP_NAME=MedTrace

# ── GST ────────────────────────────────────────────────────────
GST_DEFAULT_RATE=12
GST_HSN_3004_RATE=12
GST_HSN_2936_RATE=5

# ── Feature flags ──────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_INSPECTOR_PORTAL=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WHATSAPP_SHARE=true
```

### Firestore Security Rules Summary

```javascript
// firestore.rules (simplified)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own profile
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }

    // Medicine verification is public (no auth required)
    match /medicines/{medicineId} {
      allow read: if true;
      allow write: if isManufacturer();
    }

    // Batches: manufacturer creates, others read if in chain
    match /batches/{batchId} {
      allow read: if request.auth != null;
      allow create: if isManufacturer();
      allow update: if isManufacturer() || isInspector();
    }

    // Shipments: sender creates, receiver updates
    match /shipments/{shipmentId} {
      allow read: if isParty(resource.data.fromId) || isParty(resource.data.toId);
      allow create: if isManufacturer() || isDistributor();
      allow update: if isParty(resource.data.toId);
    }

    // Recalls: manufacturer or inspector can trigger
    match /recalls/{recallId} {
      allow read: if request.auth != null;
      allow create: if isManufacturer() || isInspector();
    }

    function isManufacturer() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manufacturer';
    }
    function isDistributor() { ... }
    function isRetailer() { ... }
    function isInspector() { ... }
    function isParty(id) { return request.auth.uid == id; }
  }
}
```

---

## 🖥️ API Reference

### Base URL
```
Production:  https://your-domain.com/api
Development: http://localhost:3000/api
```

### Authentication

All protected routes require `Authorization: Bearer <jwt_token>` header.

```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "companyName": "PharmaGen Labs Pvt. Ltd.",
  "licenseNumber": "MH-P-001234",
  "gstin": "27AABCP1234R1ZX",
  "role": "manufacturer",
  "email": "admin@pharmagen.in",
  "password": "SecurePass@123"
}

# Login
POST /api/auth/login
{
  "email": "admin@pharmagen.in",
  "password": "SecurePass@123"
}
# Returns: { "token": "eyJ...", "user": { "uid", "role", "companyName" } }
```

### Medicine Verification (Public — No Auth)

```bash
# Verify any medicine QR
GET /api/medicine/verify/MTR-PGL-20250042-STR-001-01-01

# Response:
{
  "status": "genuine",          # genuine | recalled | expired | invalid
  "medicine": {
    "brandName": "Crocin 500mg",
    "genericName": "Paracetamol IP",
    "dosageForm": "Tablet",
    "strength": "500mg",
    "mrp": 6.50
  },
  "batch": {
    "batchNumber": "BATCH-2025-0042",
    "mfgDate": "2025-11-01",
    "expDate": "2027-10-31",
    "daysToExpiry": 696
  },
  "unit": {
    "uid": "MTR-PGL-20250042-STR-001-01-01",
    "level": "strip",
    "stripId": "STR-001-01-01"
  },
  "manufacturer": {
    "companyName": "PharmaGen Labs Pvt. Ltd.",
    "licenseNumber": "MH-P-001234",
    "state": "Maharashtra"
  },
  "safetyScore": 98,
  "scanCount": 3,
  "lastScanned": "2025-11-14T10:32:00Z"
}
```

### Batch Management

```bash
# Create batch + trigger QR generation
POST /api/batch/create
Auth: Manufacturer JWT
{
  "productId": "prod_001",
  "batchNumber": "BATCH-2025-0042",
  "mfgDate": "2025-11-01",
  "expDate": "2027-10-31",
  "hierarchy": {
    "unitsPerStrip": 10,
    "stripsPerBox": 12,
    "boxesPerCarton": 5,
    "cartonsPerBatch": 4
  }
}
# Returns: { "batchId", "totalQRs": 2664, "printJobId" }

# Trigger recall
POST /api/batch/recall
Auth: Manufacturer or Inspector JWT
{
  "batchId": "batch_042",
  "reason": "contamination_suspected",
  "notes": "Failed microbial limit test — Batch MH-QC-2025-1114",
  "regulatoryOrderNumber": "CDSCO/2025/RC-4891"   // optional
}
# Returns: { "recallId", "affectedDistributors": 3, "affectedRetailers": 8, "totalUnits": 4800 }
```

### Shipments

```bash
# Create and dispatch shipment
POST /api/shipment/dispatch
Auth: Manufacturer or Distributor JWT
{
  "toId": "dist_user_001",
  "items": [
    { "batchId": "batch_042", "quantity": 2400, "unitPrice": 4.50 },
    { "batchId": "batch_031", "quantity": 1200, "unitPrice": 8.00 }
  ]
}

# Accept shipment
POST /api/shipment/receive/SHIP-2025-0089
Auth: Distributor or Retailer JWT

# Get shipment details
GET /api/shipment/SHIP-2025-0089
Auth: Sender or Receiver JWT
```

### Orders & Inventory

```bash
# Place B2B order
POST /api/orders/place
Auth: Distributor or Retailer JWT
{
  "fromId": "mfr_001",
  "items": [
    { "productId": "prod_001", "quantity": 2400 }
  ],
  "deliveryDate": "2025-11-18"
}

# Approve order
PUT /api/orders/ORD-1201/approve
Auth: Manufacturer or Distributor JWT

# Reject order
PUT /api/orders/ORD-1201/reject
Auth: Manufacturer or Distributor JWT
{ "reason": "Out of stock until Dec 2025" }

# Get live inventory
GET /api/inventory
Auth: Any org role JWT
# Returns all batches owned by the authenticated organisation
```

### Analytics

```bash
# Scan analytics (own batches)
GET /api/analytics/scans?range=30d
Auth: Manufacturer JWT

# Supply chain trace for a batch
GET /api/analytics/chain/batch_042
Auth: Inspector JWT
# Returns full custody trail from manufacture to present

# Recall impact report
GET /api/analytics/recall/recall_001
Auth: Manufacturer or Inspector JWT

# National overview (inspector only)
GET /api/analytics/national?state=MH
Auth: Inspector JWT
```

---

## 🔒 Security

### Authentication & Authorization

| Mechanism | Implementation |
|---|---|
| **Authentication** | Firebase Auth (email/password) + JWT tokens |
| **Token Storage** | HttpOnly cookies (not localStorage) |
| **Token Expiry** | 7 days default, configurable |
| **Session Invalidation** | Firestore `tokenVersion` field — increment to invalidate all sessions |
| **Password Policy** | Min 8 chars, uppercase, lowercase, number, special char |

### Role-Based Access Control (RBAC)

| Action | Manufacturer | Distributor | Retailer | Consumer | Inspector |
|---|:---:|:---:|:---:|:---:|:---:|
| Create product / batch | ✅ | ❌ | ❌ | ❌ | ❌ |
| Generate QR codes | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dispatch stock | ✅ | ✅ | ❌ | ❌ | ❌ |
| Receive shipment | ❌ | ✅ | ✅ | ❌ | ❌ |
| Place B2B order | ❌ | ✅ | ✅ | ❌ | ❌ |
| Sell at POS | ❌ | ❌ | ✅ | ❌ | ❌ |
| Verify medicine (public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Trigger recall | ✅ | ❌ | ❌ | ❌ | ✅ |
| View own analytics | ✅ | ✅ | ✅ | ❌ | ✅ |
| View national analytics | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cross-chain audit | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |

### Production Floor Security

**Operator Job Code System:**
```
Job Code Properties:
  ├── Unique per batch run
  ├── Single-use (auto-locks at target quantity)
  ├── Time-limited (default 8h, max 24h)
  ├── PIN-protected (4–6 digit operator PIN)
  ├── Supervisor override requires dual authentication
  └── All events immutably logged in Firestore
```

### Data Protection

- **HTTPS Only** — All traffic over TLS 1.3. HTTP redirected to HTTPS.
- **Input Validation** — Zod schema validation on all API endpoints.
- **SQL/NoSQL Injection** — Firestore's typed API prevents injection by design.
- **Replay Protection** — Verification sessions use nonce system.
- **Rate Limiting** — 100 req/min per IP on public endpoints, 1000 req/min for authenticated.
- **CORS** — Restricted to verified domain origins only.
- **CSP Headers** — Content Security Policy prevents XSS.
- **Audit Immutability** — Firestore rules prevent deletion of audit log records.

### Compliance

| Standard | Implementation |
|---|---|
| **OWASP API Security Top 10** | Addressed in API gateway design |
| **CDSCO Schedule M** | Product catalog fields aligned with GMP documentation requirements |
| **GST Act 2017** | CGST + SGST split invoices, HSN code mapping |
| **IT Act 2000** | Digital signatures on invoices, audit logs |
| **WHO PIC/S Guidelines** | Traceability records maintained per recommendation |

---

## 🗃️ Database Schema

### Core Collections

```
/users/{uid}
  ├── role: string
  ├── companyName: string
  ├── licenseNumber: string
  ├── gstin: string
  ├── state: string
  ├── verified: boolean
  ├── tokenVersion: number         ← increment to invalidate sessions
  └── createdAt: timestamp

/products/{productId}
  ├── manufacturerId: string
  ├── brandName: string
  ├── genericName: string
  ├── dosageForm: string
  ├── strength: string
  ├── hsnCode: string
  ├── basePrice: number
  ├── mrp: number
  ├── gstRate: number
  └── storageCondition: string

/batches/{batchId}
  ├── productId: string
  ├── manufacturerId: string
  ├── batchNumber: string
  ├── mfgDate: timestamp
  ├── expDate: timestamp
  ├── totalUnits: number
  ├── hierarchy: { unitsPerStrip, stripsPerBox, boxesPerCarton, cartonsPerBatch }
  ├── status: "active" | "recalled" | "expired"
  ├── recallId: string | null
  └── createdAt: timestamp

/medicines/{medicineUid}
  ├── batchId: string
  ├── level: "carton" | "box" | "strip" | "unit"
  ├── parentId: string | null
  ├── currentOwnerId: string
  ├── status: "genuine" | "recalled" | "expired" | "sold"
  ├── ownershipHistory: [{ ownerId, timestamp, action, shipmentId }]
  └── scanLog: [{ timestamp, scannerId (null if consumer), result }]

/shipments/{shipmentId}
  ├── fromId: string
  ├── toId: string
  ├── items: [{ batchId, quantity, unitPrice, gstRate }]
  ├── subtotal: number
  ├── gstAmount: number
  ├── grandTotal: number
  ├── status: "pending" | "dispatched" | "received" | "disputed"
  ├── invoiceUrl: string
  └── timestamps: { created, dispatched, received }

/recalls/{recallId}
  ├── batchId: string
  ├── triggeredBy: string
  ├── reason: string
  ├── notes: string
  ├── regulatoryOrderNumber: string | null
  ├── affectedDistributors: string[]
  ├── affectedRetailers: string[]
  ├── totalUnitsAffected: number
  ├── unitsReturned: number
  └── timestamp: timestamp

/orders/{orderId}
  ├── fromId: string
  ├── toId: string
  ├── items: [{ productId, quantity, unitPrice }]
  ├── status: "pending" | "approved" | "rejected" | "fulfilled"
  ├── priority: "urgent" | "high" | "normal" | "low"
  └── timestamps: { placed, responded, fulfilled }
```

---

## 🚀 Deployment

### Option 1 — Vercel + Firebase (Recommended)

```bash
# 1. Deploy Firebase services
firebase deploy --only firestore:rules,storage,functions

# 2. Deploy frontend to Vercel
npm install -g vercel
vercel

# 3. Add env vars in Vercel dashboard
# Settings → Environment Variables → Add all from .env.local
```

### Option 2 — Firebase Hosting (Full Firebase)

```bash
npm run build
firebase deploy --only hosting,functions,firestore:rules,storage
```

### Option 3 — Docker (Self-Hosted)

```dockerfile
# Dockerfile (provided in repo)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t medtrace .
docker run -p 3000:3000 --env-file .env.local medtrace
```

### Option 4 — Railway / Render

```bash
# railway.json (provided in repo)
# Connects directly to GitHub — auto-deploy on push
```

### Post-deployment Checklist

- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Firebase Functions deployed
- [ ] Custom domain connected + SSL enabled
- [ ] `NEXT_PUBLIC_QR_BASE_URL` points to production URL
- [ ] First manufacturer account created and verified
- [ ] Test QR scan with production URL
- [ ] Recall propagation Cloud Function tested

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode (development)
npm run test:watch

# E2E tests with Playwright
npm run test:e2e

# Specific module test
npm test -- --testPathPattern=batch

# Coverage report
npm run test:coverage

# API integration tests
npm run test:api
```

### Test Accounts After `npm run seed`

| Role | Email | Password | Notes |
|---|---|---|---|
| Manufacturer | `mfr@demo.medtrace.app` | `Demo@1234` | PharmaGen Labs demo account |
| Distributor | `dist@demo.medtrace.app` | `Demo@1234` | MediPharm Distributors demo |
| Retailer | `retail@demo.medtrace.app` | `Demo@1234` | CityPharma demo |
| Inspector | `insp@demo.medtrace.app` | `Demo@1234` | CDSCO read-only demo |

### Pre-seeded Demo Data

After `npm run seed`, the demo environment contains:
- 8 registered products in manufacturer catalog
- 3 active batches with 100 QR codes each
- 1 recalled batch (for testing recall flow)
- 1 expired batch (for testing expiry screen)
- 2 active shipments in transit
- 5 completed sales in retailer history

---



### Key Research References

| # | Citation | Relevance |
|---|---|---|
| 1 | WHO (2017). *Substandard and Falsified Medical Products* | Baseline statistics: 1 in 10 medicines substandard in LMICs |
| 2 | Cockburn R. et al. (2005). *The Global Threat of Counterfeit Drugs* | Magnitude of harm from counterfeit medicines |
| 3 | GS1 (2020). *Global Traceability Standard for Healthcare* | UDI hierarchy and packaging level standards |
| 4 | FDA. *Drug Supply Chain Security Act (DSCSA) 2023* | US legal framework for pharmaceutical serialisation |
| 5 | EU Falsified Medicines Directive 2011/62/EU | European standard for medicine authentication |
| 6 | CDSCO. *Schedule M (Revised) — GMP Requirements* | Indian pharmaceutical manufacturing compliance |
| 7 | Mackey T.K. et al. (2017). *Digital Strategies for Medicine Supply Chains* | Technology review for pharmaceutical traceability |
| 8 | IEEE (2020). *QR Code-Based Medicine Authentication System* | Technical precedent for QR-based approaches |
| 9 | Sylim P. et al. (2018). *Blockchain Technology for Medicine Supply Chain* | Comparison: blockchain vs. centralized approaches |
| 10 | OWASP. *API Security Top 10* | Security framework for API design |

---

## 🛠 Tech Stack

MedTrace has two defined technology tiers — the **Prototype** (current build, academic/pilot use) and the **Enterprise** (future production-grade version designed to handle national-scale pharmaceutical traceability, millions of QR scans per day, and regulatory-grade uptime).

---

### 🔬 Tier 1 — Prototype Stack
*Current implementation. Suitable for academic demonstration, regional pilots, and early-stage deployments up to ~50 manufacturers and ~5,000 retailers.*

#### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | React framework with SSR |
| React | 18 | UI library |
| Tailwind CSS | 3 | Utility-first styling |
| shadcn/ui | Latest | Component library |
| Recharts | 2 | Analytics charts |
| react-qr-code | 2 | QR code rendering |
| html5-qrcode | 2 | Camera QR scanning |
| jsPDF | 2 | Client-side PDF generation (invoices) |
| Zod | 3 | Schema validation (frontend) |

#### Backend & Infrastructure

| Technology | Purpose |
|---|---|
| Firebase Firestore | NoSQL database, real-time listeners |
| Firebase Auth | Authentication, session management |
| Firebase Cloud Functions | QR generation, recall propagation, invoice storage |
| Firebase Storage | PDF invoices, QR print sheets |
| Firebase Cloud Messaging | Push notifications for recalls/alerts |
| JWT (jsonwebtoken) | Stateless API authentication |

#### Development Tools

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code quality and formatting |
| Jest | Unit testing |
| Playwright | End-to-end testing |
| Husky + lint-staged | Pre-commit hooks |
| GitHub Actions | CI/CD pipeline |

**Prototype Limitations:**
- Single Firestore instance — no horizontal DB scaling
- Firebase Functions cold-start latency (~1–3s) under low traffic
- No message queue — recall propagation is synchronous
- No dedicated caching layer — repeated QR verifications hit Firestore each time
- Logging and monitoring via Firebase console only
- No multi-region failover

---
### 🏭 Tier 2 — Enterprise Stack
*Future version. Designed for national-scale deployment — CDSCO integration, crores of QR codes, 99.99% uptime SLA, multi-region redundancy, and regulatory-grade audit immutability.*

#### Frontend & Mobile

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15+ (App Router) | Web portal — SSR + ISR for fast public verification pages |
| React Native + Expo | Latest | Native iOS + Android apps for consumers and field inspectors |
| TypeScript | 5+ | Full type safety across all clients |
| Tailwind CSS | 4 | Styling |
| TanStack Query | 5 | Server state, caching, background refetch |
| Zustand | 4 | Lightweight global state management |
| React Hook Form + Zod | Latest | Form handling + schema validation |
| Recharts / D3.js | Latest | Interactive analytics dashboards |
| i18next | Latest | Multi-language support (English, Hindi, Bengali, Tamil, Telugu) |
| PWA (next-pwa) | Latest | Installable web app for offline-capable consumer verification |

#### Backend — Microservices

| Service | Technology | Purpose |
|---|---|---|
| **API Gateway** | Kong / AWS API Gateway | Rate limiting, auth, routing, load balancing |
| **Auth Service** | Node.js + Keycloak (OAuth 2.0 / OIDC) | SSO, role management, Aadhaar integration |
| **Medicine Registry** | Node.js + Express | Product catalog, batch registration, ownership records |
| **QR Engine** | Go (Golang) | High-throughput QR UID generation — handles 100K+ codes/batch |
| **Verification Service** | Node.js + Redis cache | Sub-100ms QR scan responses at scale |
| **Recall Engine** | Node.js + Apache Kafka | Asynchronous, guaranteed recall propagation across all stakeholders |
| **Invoice Service** | Node.js + Puppeteer | Server-side PDF invoice generation (GSTN-compliant) |
| **Notification Service** | Node.js + Firebase FCM + Twilio | Push, SMS, WhatsApp, email alerts |
| **Analytics Service** | Python + Apache Spark | Batch analytics, ML anomaly detection for counterfeit patterns |
| **Audit Service** | Node.js + append-only DB | Immutable audit log — no record can be deleted or modified |
| **Inspector Service** | Node.js | CDSCO API integration, investigation management |

#### Database Layer — Polyglot Persistence

*Different data has different access patterns — one database type cannot optimally serve all use cases.*

| Database | Technology | What It Stores | Why This DB |
|---|---|---|---|
| **Primary Transactional DB** | PostgreSQL 16 (with Citus for sharding) | Users, products, batches, shipments, orders, recalls | ACID transactions, complex joins, relational integrity |
| **Medicine Records (Hot)** | MongoDB Atlas | Individual medicine QR records (billions of docs) | Flexible schema, horizontal sharding by batchId, fast point lookups |
| **Verification Cache** | Redis Cluster | QR verification results cached for 60 seconds | Sub-millisecond read latency for high-frequency consumer scans |
| **Session Store** | Redis Sentinel | JWT session blacklist, rate-limit counters | In-memory speed, TTL support |
| **Analytics / OLAP** | Apache Cassandra | Scan event logs, verification history, time-series data | Write-optimized, horizontally scalable, no single point of failure |
| **Search Engine** | Elasticsearch | Full-text medicine search, inspector cross-chain queries | Fuzzy search, faceted filtering, aggregations |
| **Audit Ledger** | Amazon QLDB / Hyperledger Fabric | Immutable ownership chain, recall trigger records | Cryptographic tamper-evidence, append-only by design |
| **Object Storage** | AWS S3 / MinIO (self-hosted) | QR print PDFs, invoice PDFs, lab reports, evidence files | Durable, cheap, scalable blob storage |
| **Message Queue** | Apache Kafka | Recall propagation events, shipment notifications, audit events | Guaranteed delivery, replay capability, decouples services |
| **Time-Series DB** | InfluxDB | System performance metrics, API latency, scan rate telemetry | Purpose-built for metrics, high write throughput |

#### Infrastructure & DevOps

| Layer | Technology | Purpose |
|---|---|---|
| **Container Runtime** | Docker + Kubernetes (EKS / GKE) | Containerised microservices, auto-scaling, self-healing |
| **Service Mesh** | Istio | Service-to-service mTLS, traffic management, circuit breaking |
| **CI/CD** | GitHub Actions + ArgoCD | Automated testing, build, and GitOps deployment |
| **Infrastructure as Code** | Terraform + Helm | Reproducible cloud infrastructure provisioning |
| **Secrets Management** | HashiCorp Vault | Centralised secrets, API keys, DB credentials — never in env vars |
| **CDN** | Cloudflare | Global edge caching for public verification pages (< 50ms worldwide) |
| **Load Balancer** | AWS ALB / NGINX | L7 load balancing, SSL termination, health checks |
| **DNS** | Cloudflare DNS | Low-TTL failover routing |
| **Multi-Region** | AWS Mumbai (primary) + AWS Singapore (DR) | 99.99% uptime SLA, disaster recovery |

#### Observability & Security

| Category | Technology | Purpose |
|---|---|---|
| **Centralised Logging** | ELK Stack (Elasticsearch + Logstash + Kibana) | All service logs, searchable, retained 365 days |
| **Distributed Tracing** | Jaeger / OpenTelemetry | End-to-end request tracing across microservices |
| **Metrics & Alerting** | Prometheus + Grafana | Real-time dashboards, anomaly alerts, SLA monitoring |
| **Error Tracking** | Sentry | Exception capture, stack traces, release tracking |
| **Uptime Monitoring** | Pingdom / Betterstack | External health checks, incident alerts |
| **SIEM** | AWS GuardDuty + Wazuh | Threat detection, intrusion monitoring |
| **Penetration Testing** | OWASP ZAP + Burp Suite | Scheduled automated security scans |
| **WAF** | Cloudflare WAF + AWS WAF | SQL injection, XSS, DDoS protection at edge |
| **DDoS Protection** | Cloudflare Magic Transit | Network-layer volumetric attack mitigation |
| **Vulnerability Scanning** | Snyk + Trivy | Container and dependency CVE scanning in CI/CD |

#### Compliance & Regulatory Integration

| Integration | Purpose |
|---|---|
| **GSTN API** | Direct GST invoice validation and e-invoicing (IRN + QR) |
| **CDSCO API** | Regulatory recall triggers, drug license verification |
| **Aadhaar / DigiLocker** | Manufacturer and inspector KYC verification |
| **ABDM (Ayushman Bharat)** | Health ID integration for patient medicine history |
| **ONDC (Open Network for Digital Commerce)** | B2B marketplace interoperability with national commerce network |
| **India Post / Delhivery API** | Shipment tracking integration |
| **RBI Payment Gateway** | UPI, NEFT, IMPS for B2B payment settlement |

---

### 📊 Prototype vs Enterprise — At a Glance

| Dimension | 🔬 Prototype | 🏭 Enterprise |
|---|---|---|
| **QR Codes / Day** | ~10,000 | ~50,000,000+ |
| **Concurrent Users** | ~100 | ~500,000+ |
| **Verification Latency** | ~800ms (Firestore) | < 50ms (Redis cache + CDN) |
| **Recall Propagation** | ~5 seconds (synchronous) | < 500ms (Kafka async, guaranteed) |
| **Database** | Single Firestore | Polyglot — PostgreSQL + MongoDB + Redis + Cassandra |
| **Architecture** | Monolith + Firebase Functions | Microservices on Kubernetes |
| **Uptime SLA** | ~99.5% (Firebase managed) | 99.99% (multi-region active-active) |
| **Mobile App** | Browser PWA | Native iOS + Android (React Native) |
| **Languages** | English only | English + Hindi + 4 regional languages |
| **Regulatory** | Manual CDSCO reporting | Direct CDSCO API integration |
| **Audit Trail** | Firestore records | Immutable QLDB / Hyperledger ledger |
| **Analytics** | Basic charts (Recharts) | Apache Spark + ML anomaly detection |
| **Infrastructure** | Firebase (serverless) | Kubernetes on AWS (multi-region) |
| **Cost / Month** | ~₹0 (free tier) | ~₹8–15 lakh (national scale) |
| **Team Size to Operate** | 1–2 developers | 8–15 engineers (SRE + backend + mobile) |

---

## 🤝 Contribute & Roadmap

### How to Contribute

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR-USERNAME/medtrace.git
cd medtrace
git remote add upstream https://github.com/your-username/medtrace.git

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: describe your change"

# Push and open PR
git push origin feature/your-feature-name
```

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    UI/UX changes only
refactor: Code restructure (no behavior change)
perf:     Performance improvement
test:     Add/update tests
chore:    Build, deps, config
```

### Roadmap

| Feature | Status | Version |
|---|---|---|
| Manufacturer portal | ✅ Complete | v1.0 |
| Distributor portal | ✅ Complete | v1.0 |
| Retailer portal + POS | ✅ Complete | v1.0 |
| Consumer verification app | ✅ Complete | v1.0 |
| GST invoice auto-generation | ✅ Complete | v1.0 |
| Real-time recall propagation | ✅ Complete | v1.0 |
| Regulatory Inspector dashboard | 🔄 In Progress | v1.1 |
| WhatsApp verification bot | 📋 Planned | v1.2 |
| District-level analytics heatmap | 📋 Planned | v1.2 |
| Hindi / Bengali / Tamil UI | 📋 Planned | v1.2 |
| Aadhaar KYC for manufacturer | 📋 Planned | v1.3 |
| Mobile apps (iOS + Android) | 📋 Planned | v2.0 |
| Blockchain optional audit layer | 🔬 Research | v2.x |
| ML anomaly detection for fakes | 🔬 Research | v2.x |

---

## 🐛 Troubleshooting

<details>
<summary><b>QR scan returns "Invalid" for a newly printed batch</b></summary>

The QR was scanned before Firestore finished writing all medicine records (large batches take 3–5 seconds). Wait and retry. If persistent, check Firebase Functions logs:

```bash
firebase functions:log --only qrGenerate
```
</details>

<details>
<summary><b>Recall not showing in distributor/retailer portal</b></summary>

The distributor must have clicked "Receive & Add to Stock" — units dispatched but not formally received are not in their inventory records and won't trigger the alert.
</details>

<details>
<summary><b>Batch QR generation times out for large batches</b></summary>

Increase Firebase Function timeout and memory:

```json
// firebase.json
{
  "functions": {
    "timeoutSeconds": 540,
    "memory": "1GB"
  }
}
```

For batches > 50,000 units, use chunked generation — see `lib/qr/batchGenerator.js`.
</details>

<details>
<summary><b>Login works but dashboard shows blank / infinite spinner</b></summary>

1. Check Firestore rules allow reads for your role
2. Check the `verified: true` field is set on your user document (unverified orgs are blocked)
3. Check browser console for 403 errors from Firestore
</details>

<details>
<summary><b>GST invoice showing 0% tax</b></summary>

Ensure the product's `hsnCode` is set correctly in the Product Catalog. The system maps HSN codes to GST rates via `config.json → gst.hsnRateMap`. Add missing HSN codes there.
</details>

<details>
<summary><b>Firebase Functions deployment error: "Billing account required"</b></summary>

Firebase Cloud Functions require the **Blaze (pay-as-you-go)** plan. The free quota is 2M invocations/month — sufficient for development and moderate production. Upgrade at [console.firebase.google.com → Billing](https://console.firebase.google.com).
</details>

<details>
<summary><b>POS can't find medicine in search</b></summary>

The retailer must first receive the shipment ("Incoming Stock → Accept Delivery") before the medicine appears in POS inventory. Medicines not formally received cannot be sold.
</details>

<details>
<summary><b>Push notifications not working for recalls</b></summary>

1. Firebase Cloud Messaging requires HTTPS (not localhost)
2. Users must have allowed browser notifications for the domain
3. Check the `notificationSender` Cloud Function logs for errors
4. Verify `FIREBASE_MESSAGING_SENDER_ID` is correctly set in env vars
</details>

---

## ❓ FAQ

**Q: Does MedTrace work without internet?**
A: Consumer QR verification queues locally and syncs on reconnect. All portal operations (dispatch, receive, POS billing) require internet.

**Q: Can any medicine QR code be scanned, or only those registered in MedTrace?**
A: Only medicines whose QR was generated by MedTrace will verify as "Genuine". Other QR codes return "Invalid" — which is itself useful information to the consumer.

**Q: What prevents a counterfeiter from generating fake QR codes?**
A: Every QR UID contains a checksum and is registered in Firestore at generation. A fake QR won't exist in the database and returns "Invalid". Additionally, UIDs include a manufacturer-specific prefix that cannot be predicted without system access.

**Q: Is this compliant with Indian drug regulations (CDSCO / Schedule M)?**
A: MedTrace is designed to align with CDSCO traceability requirements and Schedule M manufacturing documentation standards. However, it is a software tool — legal compliance depends on how it is deployed within a licensed pharmaceutical operation.

**Q: Can a manufacturer use MedTrace for all product types?**
A: Yes — Tablets, Capsules, Syrups, Injections, Sprays, Drops, Creams, Ointments, and any custom dosage form can be registered.

**Q: What happens to QR codes if the manufacturer account is deleted?**
A: Medicine records persist independently in Firestore. Scans return the last known verified status with a note that the manufacturer account is no longer active.

**Q: Can the same QR code be scanned multiple times?**
A: Yes — each scan is logged with timestamp. The `scanCount` field tracks how many times a unit has been scanned, which can itself be an authenticity signal (a strip scanned 500 times is suspicious).

**Q: Is there a limit on the number of QR codes per batch?**
A: No hard limit. The Cloud Function handles generation in chunks. The largest tested batch in development was 100,000 units (~5 minutes generation time).

---

## 📝 Changelog

### v1.0.0 (2026-01-31)
- Initial release — all five stakeholder portals live
- QR generation engine with parent-child hierarchy
- Real-time recall propagation via Cloud Functions
- GST invoice auto-generation
- B2B Marketplace for distributor/retailer procurement
- POS terminal with Cash/UPI payment modes
- Consumer verification (Genuine/Expired/Recalled/Invalid)
- Offline mode with sync-on-reconnect

### v0.9.0 (2025-12-20) — Pilot Release
- Pilot testing with 3 distributors and 8 retailers
- 12,000 QR codes generated and tracked
- Bug fixes from beta testing

### v0.5.0 (2025-11-15) — Beta
- Manufacturer and Distributor portals functional
- Basic QR generation and verification
- No recall propagation yet (manual process)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for full terms.

```
MIT License

Copyright (c) 2026 [Your Name] and Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```


---


Built with ❤️ to protect patients from counterfeit medicines.

⭐ **Star this repo if MedTrace helped you or inspired your work!**

[🐛 Report Bug](https://github.com/your-username/medtrace/issues) · [✨ Request Feature](https://github.com/your-username/medtrace/issues) · [💬 Discussions](https://github.com/your-username/medtrace/discussions)

</div>
