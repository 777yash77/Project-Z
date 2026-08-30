# Employee Retention and Decision Support System (ERDSS)

An AI-powered, enterprise-grade decision support platform designed to help Organizations and Human Resource (HR) departments predict, analyze, and mitigate employee attrition.

This application provides a comprehensive suite of tools ranging from real-time attrition risk monitoring to AI-driven retention strategies, wrapped in a beautiful, responsive, and dynamic Next.js frontend.

---

## 🌟 How It Works

The system integrates a Java Spring Boot backend, a Python Machine Learning service, and a Next.js frontend. 

1. **Data Ingestion**: HRs can upload employee data in bulk via CSV or enter records manually.
2. **Machine Learning Pipeline**: The ML Service evaluates employee profiles against trained models to generate an **Attrition Risk Score** and a **Risk Level** (Low, Medium, High).
3. **Executive Dashboard**: The Next.js frontend visualizes this data in a stock-market style watchlist and department-wise risk heatmaps, updating in real-time.
4. **AI Copilot (Gemini)**: The system leverages Gemini AI (or a similar LLM) to generate **Explainable AI (XAI)** reports. It tells HR not just *who* is at risk, but *why* they are at risk, and provides concrete intervention strategies.

---

## 💼 Benefits for HR and Organizations

### 1. Proactive Retention (Stop Churn Before It Happens)
Instead of reacting to resignation letters, HR can monitor the live **Attrition Risk Dashboard**. High-risk employees are flagged automatically based on predictive models analyzing tenure, compensation, and performance metrics.

### 2. Explainable AI Insights (No Black-Box Decisions)
When a high-risk employee is identified, HR can generate an **AI Impact Analysis**. This report breaks down the specific factors contributing to the employee's flight risk (e.g., salary below market average, long tenure without promotion) and offers a tailored executive retention strategy.

### 3. Department Risk Heatmaps
Organizational leaders can view risk density across the entire company. If a specific department (e.g., Engineering) suddenly spikes in flight risk, executives can investigate systemic issues like poor management or burnout before a mass exodus occurs.

### 4. Internal "Trading Window"
Instead of losing talent to competitors, the platform features a **Trading Window**. If an employee is burnt out in their current role but highly valued by the company, HR can list them internally. Other departments can "draft" or transfer them, retaining institutional knowledge and reducing hiring costs.

### 5. Seamless Data Onboarding
HR teams don't have to enter data one by one. The **Smart CSV Upload** allows for bulk importing of hundreds of employee records, which are immediately scored by the ML pipeline.

### 6. Cross-HR Messaging
Built-in communication tools allow HR partners and department heads to collaborate on retention strategies securely within the platform.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization).
- **Backend**: Java 17, Spring Boot, Spring Security (JWT Auth), Spring Data JPA.
- **ML Service**: Python, Flask, Pandas, Scikit-learn (or similar ML libraries), Gemini API integration.
- **Database**: MySQL.
- **Deployment**: Docker, Docker Compose.

---

## 🚀 Quick Start (Docker - Recommended)

The easiest way to run the entire stack (Frontend, Backend, ML Service, and MySQL database) is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed.
- Ensure ports `3000`, `8080`, `5000`, and `3306` are available.

### Steps
1. Clone the repository.
2. From the root directory, run:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application:
   - **Frontend UI**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8080`
   - **ML Service API**: `http://localhost:5000`

---

## 💻 Manual Local Setup

If you prefer to run the services locally without Docker:

### 1. Backend (Spring Boot)
1. Create a MySQL database named `employee_retention`.
2. Update database credentials in `backend/src/main/resources/application.properties`.
3. Start the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### 2. ML Service (Python)
1. Navigate to the ML service directory.
2. Install dependencies:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   ```
3. Run the Flask application:
   ```bash
   python app.py
   ```

### 3. Frontend (Next.js)
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
