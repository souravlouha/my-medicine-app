<div align="center">

  <img src="https://via.placeholder.com/1200x400?text=Medicine+Tracking+Framework+Banner" alt="Project Banner" width="100%" />

  <br />
  <br />

  # 💊 Counterfeit Medicine Tracking Framework
  ### Open Source Anti-Counterfeiting Solution for Governments & Manufacturers

  <p>
    <b>Ensure Authenticity. Track Supply Chain. Save Lives.</b>
  </p>

  <p>
    <a href="https://github.com/souravlouha/my-medicine-app/graphs/contributors">
      <img src="https://img.shields.io/github/contributors/souravlouha/my-medicine-app" alt="contributors" />
    </a>
    <a href="">
      <img src="https://img.shields.io/github/last-commit/souravlouha/my-medicine-app" alt="last update" />
    </a>
    <a href="https://github.com/souravlouha/my-medicine-app/network/members">
      <img src="https://img.shields.io/github/forks/souravlouha/my-medicine-app" alt="forks" />
    </a>
    <a href="https://github.com/souravlouha/my-medicine-app/stargazers">
      <img src="https://img.shields.io/github/stars/souravlouha/my-medicine-app" alt="stars" />
    </a>
    <a href="https://github.com/souravlouha/my-medicine-app/blob/master/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
    </a>
  </p>

  <br />

  <h3>
    <a href="https://my-medicine-app.vercel.app/">🌐 View Live Demo</a>
    <span> | </span>
    <a href="https://github.com/souravlouha/my-medicine-app/issues">🐛 Report Bug</a>
    <span> | </span>
    <a href="https://github.com/souravlouha/my-medicine-app/pulls">✨ Request Feature</a>
  </h3>
</div>

<br />

## 📦 About The Project

**Counterfeit medicine is a global crisis**, causing thousands of deaths and billions in economic loss annually. This project provides a robust, **Open Source Framework** designed for Governments, Pharmaceutical Manufacturers, and Supply Chain stakeholders to track medicines from production to patient.

Inspired by currency security standards (like RBI note serialization), this system assigns a **Unique Digital Identity (UID)** to every single medicine strip, enabling real-time verification and complete transparency.

### 🌟 Key Features

* **🏭 Manufacturer Dashboard:** Generate unique, encrypted QR codes for each batch and unit.
* **🚚 Smart Supply Chain:** Distributors can scan, receive, and dispatch stock with automated handshakes.
* **🏥 Retailer/Pharmacy Panel:** Verify stock authenticity before selling to consumers.
* **🔍 Consumer Verification:** Instant scan-and-verify feature for public safety.
* **📊 Analytics & Insights:** Real-time stock flow charts, expiration alerts, and fraud detection maps.
* **🔐 Tamper-Proof:** Blockchain-ready architecture to prevent data manipulation.

---

## 🛠 Tech Stack

This project is built using the most modern, scalable, and secure technologies:

| Category | Technology |
| --- | --- |
| **Frontend** | [Next.js 15](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Backend** | [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via [Neon DB](https://neon.tech/)), [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | Custom Auth / NextAuth |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

* Node.js (v18 or higher)
* Git
* A Neon DB account (PostgreSQL)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/souravlouha/my-medicine-app.git](https://github.com/souravlouha/my-medicine-app.git)
    cd my-medicine-app
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your database connection:
    ```env
    DATABASE_URL="postgresql://user:password@ep-xyz.
    ```

4.  **Push Database Schema**
    ```bash
    npx prisma db push
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📸 Screenshots & Demos

| Manufacturer Dashboard | Supply Chain Tracking |
|:----------------------:|:---------------------:|
| <img src="https://via.placeholder.com/400x200?text=Dashboard+UI" width="100%"> | <img src="https://via.placeholder.com/400x200?text=Tracking+Map" width="100%"> |

| Unique QR Generation | Mobile Verification |
|:--------------------:|:-------------------:|
| <img src="https://via.placeholder.com/400x200?text=QR+Generation" width="100%"> | <img src="https://via.placeholder.com/400x200?text=Mobile+Scan" width="100%"> |

---

## 🗺 Roadmap

- [x] Initial Project Setup & Architecture
- [x] Manufacturer Dashboard (Product & Batch Creation)
- [x] Distributor Dashboard (Receive & Dispatch Logic)
- [ ] **Retailer Dashboard Integration** (In Progress)
- [ ] Public Verification Portal
- [ ] AI-Powered Fraud Detection
- [ ] Blockchain Integration for Immutable Logs

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for a Safer World</p>
</div>
