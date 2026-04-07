# ElectroTech: Serverless E-Commerce Ecosystem

**ElectroTech** is a production-grade, cloud-native e-commerce ecosystem architected on a **Serverless-First** philosophy. By leveraging a decoupled microservices approach, the platform achieves sub-50ms global latency through edge-optimized content delivery via Amazon CloudFront. The architecture is engineered for **Operational Excellence**, utilizing a "Scale to Zero" consumption model that eliminates idle-resource overhead while ensuring seamless elasticity during peak traffic.

---

## 🏗️ Architectural Overview

ElectroTech follows a three-tier decoupled pattern (Presentation, Compute, Data) to ensure that each component is independently scalable and fault-tolerant.

* **Frontend:** React Single-Page Application (SPA) hosted on **Amazon S3** and distributed by **Amazon CloudFront**.
* **Identity:** Role-Based Access Control (RBAC) managed through **Amazon Cognito** and **JWT** validation.
* **Backend:** Event-driven microservices running on **AWS Lambda** via **Amazon API Gateway**.
* **Database:** High-performance NoSQL data persistence using **Amazon DynamoDB**.
* **Payments:** Secure, PCI-compliant transaction processing integrated with **Stripe**.

> **Note:** For a detailed visual of this flow, see the `docs/Electrotech-Architecture-Diagram.png` file in this repository.

---

## 🛠️ Tech Stack & Services

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, React Router |
| **Compute** | AWS Lambda (Node.js 20.x), Lambda Layers |
| **API Management** | Amazon API Gateway (REST) |
| **Storage & CDN** | Amazon S3, Amazon CloudFront |
| **Security** | AWS WAF, IAM (Least Privilege), Cognito |
| **Observability** | AWS X-Ray, Amazon CloudWatch |
| **Integrations** | Stripe API & Webhooks |

## 🛡️ Well-Architected Framework Compliance

This platform is built according to the six pillars of the **AWS Well-Architected Framework**:

* **Operational Excellence:** Centralized logging and distributed tracing via CloudWatch and X-Ray.
* **Security:** Perimeter protection via AWS WAF and strict RBAC enforcement.
* **Reliability:** Native Multi-AZ redundancy across all managed services.
* **Performance Efficiency:** Edge-optimized delivery with sub-50ms Time to First Byte (TTFB).
* **Cost Optimization:** Consumption-based pricing model that scales to zero during idle periods.
* **Sustainability:** High-utilization shared cloud resources to minimize carbon footprint.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

* **AWS CLI:** Configured with appropriate permissions to manage resources.
* **Node.js:** Version **20.x** or higher.
* **Stripe Account:** A developer account to obtain your API keys for payment processing.

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/wluena/CAA900-Capstone](https://github.com/wluena/CAA900-Capstone)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file in the root directory and configure your AWS credentials and Stripe API keys.
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
---
