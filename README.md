<div align="center">
  
# 🌟📈 Employee Retention and Decision Support System (ERDSS) 🤖🚀

*An Enterprise-Grade, AI-Powered HR Intelligence Platform*

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/ML%20Service-Python%20Flask-blue?style=for-the-badge&logo=python)](https://python.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge&logo=mysql)](https://mysql.com/)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-blue?style=for-the-badge&logo=docker)](https://docker.com)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-yellow?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

</div>

<br/>

---

## 📖 Table of Contents 📑
1. [Introduction to ERDSS](#-introduction-to-erdss)
2. [The Core Problem We Are Solving](#-the-core-problem-we-are-solving)
3. [Who Can Benefit?](#-who-can-benefit)
4. [System Architecture Breakdown](#-system-architecture-breakdown)
5. [Machine Learning & Predictive Pipeline](#-machine-learning--predictive-pipeline)
6. [Gemini AI Copilot Integration](#-gemini-ai-copilot-integration)
7. [Key Features Deep-Dive](#-key-features-deep-dive)
8. [Comprehensive Technology Stack](#-comprehensive-technology-stack)
9. [Detailed Installation & Setup Guide](#-detailed-installation--setup-guide)
10. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
11. [Database Schema Definition](#-database-schema-definition)
12. [Frontend Component Architecture](#-frontend-component-architecture)
13. [Backend Security & JWT Flow](#-backend-security--jwt-flow)
14. [Deployment Scenarios (K8s & CI/CD)](#-deployment-scenarios-k8s--cicd)
15. [Upcoming Features & Roadmap](#-upcoming-features--roadmap)
16. [Known Problems & Current Limitations](#-known-problems--current-limitations)
17. [Contributing & License](#-contributing--license)

---

## 🌟 Introduction to ERDSS 🌟

Welcome to the **Employee Retention and Decision Support System (ERDSS)**! 🎉 

In today’s fast-paced, highly competitive corporate environment, human capital is the most valuable asset a company possesses. Losing top talent is not just a minor inconvenience—it is a massive financial and cultural setback. ERDSS is designed to be the ultimate, proactive, AI-driven shield against employee attrition. 🛡️

Instead of relying on gut feelings, annual surveys, or exit interviews (when it's already too late! 😭), ERDSS utilizes cutting-edge Machine Learning (ML) algorithms and Large Language Models (LLMs) to predict exactly *who* is likely to leave your company, *why* they might leave, and most importantly, *what you can do right now to stop it*. 🛑

This platform merges the beautiful, dynamic user experience of modern web frameworks (Next.js) with rock-solid, enterprise-ready backend architecture (Spring Boot) and highly specialized Python data science capabilities. 🌐

---

## 🚨 The Core Problem We Are Solving 🚨

Why did we build this? Because turnover is devastating. 🌪️

### 📉 Financial Costs of Turnover
Did you know that replacing an employee can cost anywhere from **50% to 200% of their annual salary**? 💸
- **Recruitment Costs:** Advertising, headhunter fees, interviewing time. 🕵️
- **Onboarding Costs:** Training, equipment setup, integration. 📚
- **Lost Productivity:** A new hire takes 3 to 6 months to reach full capacity. 🐢

### 🧠 Brain Drain & Institutional Knowledge
When a senior engineer or a top salesperson leaves, they don't just take their laptop. They take their relationships, their deep understanding of the codebase or product, and their unspoken knowledge of how to get things done. 🧠🏃‍♂️

### 😔 Morale Contagion
Turnover is contagious. When a well-liked employee leaves, it creates a ripple effect. Others start wondering, *"Should I be looking for a new job too?"* ERDSS stops this domino effect before the first tile falls. 🛑🧍

### ❌ The Old Way vs. The New Way
- **The Old Way (Reactive):** HR waits for a resignation letter. They scramble to offer a counter-offer, which rarely works long-term. Then they conduct an exit interview where the employee gives a polite, half-true reason for leaving. 👎
- **The New Way (Proactive with ERDSS):** HR logs into the dashboard. The ML algorithm highlights that John from Engineering has an 85% flight risk due to a lack of promotion over 3 years and salary stagnation. Gemini AI generates a concrete retention plan. HR intervenes *before* John even updates his LinkedIn profile. 👍🚀

---

## 🤝 Who Can Benefit? 🤝

### 🏢 Human Resources (HR) Professionals & Business Partners
- **Focus efforts where they matter:** Instead of spreading retention budgets thin across the entire company, HR can surgically target the highest-risk, highest-value employees. 🎯
- **Automated Insights:** No need to be a data scientist! The AI generates plain-English reports. 🗣️

### 👔 C-Suite & Executives (CEOs, COOs, CHROs)
- **High-Level Visibility:** The executive dashboard provides bird's-eye-view analytics. Which department is bleeding talent? Why is the sales team unhappy this quarter? 🦅
- **Data-Driven Strategy:** Make budgeting decisions for raises and bonuses based on predictive ROI rather than guesswork. 📊

### 🧑‍💻 Department Managers & Team Leads
- **Early Warnings:** Managers get a heads-up if their team members are showing signs of burnout (e.g., dropping performance scores, long tenure without reward). ⚠️
- **Internal Trading:** If an employee is tired of their current project, managers can list them on the internal **Trading Window**, allowing another department to scoop them up rather than losing them to a competitor! 🔄

### 👩‍💼 Employees
- **Better Workplace:** By addressing issues proactively, the company naturally becomes a better place to work. Salaries are adjusted fairly, and career paths are monitored. 💖

---

## 🏗️ System Architecture Breakdown 🏗️

ERDSS is built on a modern, decoupled microservices-inspired architecture. 🧩

### 1️⃣ The Presentation Layer (Frontend - Next.js) 🌐
The frontend is a highly dynamic, Server-Side Rendered (SSR) and Client-Side React application.
- **Next.js 14 App Router:** For blazing fast navigation and SEO-friendly pages. ⚡
- **Tailwind CSS:** Custom styling that provides a sleek, dark-mode-first, "stock-market style" aesthetic. 🎨
- **Recharts:** Used for generating beautiful, interactive charts (like the real-time Attrition Risk Trend chart). 📈

### 2️⃣ The Business Logic Layer (Backend - Spring Boot) ☕
The core engine of the application is a robust Java Spring Boot server.
- **RESTful API:** Exposes endpoints for the frontend to consume. 🔌
- **Spring Security & JWT:** Ensures that only authorized users (HR vs Employees) can access sensitive salary and risk data. 🔒
- **Orchestration:** Acts as the middleman, taking data from the database and sending it to the ML service for scoring, then caching the results. 🔀

### 3️⃣ The AI/Data Science Layer (Python ML Service) 🐍
A lightweight Python Flask service dedicated purely to crunching numbers.
- **Machine Learning Inference:** Loads pre-trained scikit-learn/XGBoost models to evaluate employee feature arrays. 🧠
- **LLM Integration:** Communicates with Google's Gemini AI API to generate Explainable AI (XAI) text summaries based on the raw risk scores. 🤖

### 4️⃣ The Persistence Layer (Database - MySQL) 🗄️
- **Relational Data:** Stores users, roles, organizations, employee metrics, and historical risk snapshots. 💾

---

## 🧠 Machine Learning & Predictive Pipeline 🧠

The ML pipeline is what makes ERDSS truly "intelligent." 💡

### 📊 Feature Engineering
The model looks at multiple dimensions of an employee's profile:
- **Demographics:** Age, Distance from Home. 🏠
- **Work History:** Years at Company, Years in Current Role, Number of Companies Worked. ⏳
- **Compensation:** Monthly Income, Percent Salary Hike, Stock Option Level. 💰
- **Satisfaction Metrics:** Job Involvement, Performance Rating, Work-Life Balance. ⚖️

### 🔮 The Predictive Model
We use a robust ensemble learning approach (like Random Forest or XGBoost) to classify the likelihood of an employee leaving within the next 6-12 months.
- The model outputs a continuous probability score (e.g., `0.85`).
- This score is mapped to a discrete **Risk Level**:
  - 🟢 **Low Risk (0.0 - 0.39):** Stable and engaged.
  - 🟡 **Medium Risk (0.40 - 0.69):** Needs monitoring. Flight risk within 6 months.
  - 🔴 **High Risk (0.70 - 1.0):** Critical. Imminent flight risk. Immediate intervention required.

### 🔬 Feature Importance and Preprocessing
The Flask backend pre-processes the data using `StandardScaler` to normalize numeric values (e.g., Salary is normalized to ensure it doesn't disproportionately weigh against smaller numeric values like performance rating). Categorical variables (e.g., Department, EducationField) are One-Hot Encoded. The resulting 1D tensor is passed to our persisted `.pkl` model for inference.

---

## 🤖 Gemini AI Copilot Integration 🤖

Raw numbers are great, but human resources is about *humans*. We integrated Google's Gemini AI to bridge the gap between cold data and actionable strategy. 🗣️

When HR clicks "Get Insights" on an employee, the Spring Boot backend takes the employee's data and triggers a REST call to the ML Service (`/predict-impact`).

### 📝 The Secret Sauce: Prompt Engineering
The ML Service formats a dynamic, highly contextual prompt before passing it to Gemini:
```text
"Act as an Expert HR Consultant. An employee named {name} working as a {designation} in the {department} department has been flagged by our ML system with a retention risk score of {riskScore * 100}%. 
Their current salary is {salary}, they have been at the company for {tenure} years, and their last performance rating was {performanceRating}/5.0. 
Based on these metrics, provide a 3-part executive report:
1. Diagnosis (Why are they at risk?)
2. Business Impact (What happens if they leave?)
3. Actionable Retention Strategy (Provide 3 concrete bullet points to retain them)."
```

Gemini returns a beautifully formatted markdown response which the Next.js `AiReportRenderer` converts into a visual UI with icons and drop-downs. ✨

---

## ✨ Key Features Deep-Dive ✨

### 📈 Executive Stock-Market Dashboard
Forget boring spreadsheets! ERDSS treats employee risk like a live stock market.
- **Flashing Rows:** When an employee's risk score changes, their row flashes green or red! 🚨
- **Live Trend Chart:** A beautiful Area chart tracks the aggregate risk of the organization over time. 📊
- **Polling Architecture:** The frontend polls the backend every 5 seconds to get the latest workforce state, instantly mapping delta changes to the UI without a hard refresh.

### 🔄 Internal Trading Window
A revolutionary concept in HR software! 
- If an employee is flagged as "High Risk" due to role stagnation, HR can list their profile on the **Trading Window**.
- Other departments (e.g., moving from Support to QA) can view these candidates and offer them a role transfer.
- *Result:* The employee stays at the company, just in a different seat! 🪑

### 📂 Smart Bulk CSV Upload
Onboarding a company of 10,000 employees? No problem.
- Drag and drop a CSV file. 📁
- The Spring Boot backend parses it using `Apache Commons CSV`, batches records, saves them to MySQL via JPA, and asynchronously passes them to the ML service to avoid blocking the HTTP request thread.
- Within seconds, your entire workforce is scored and ranked! ⚡

### 💬 Cross-HR Messaging System
Secure, intra-organization messaging.
- HR managers can DM each other directly within the platform. The UI features a real-time thread view reminiscent of iMessage or Slack, storing messages in the relational database with timestamps.

---

## 🛠️ Comprehensive Technology Stack 🛠️

We spared no expense in choosing the best tools for the job! 🏆

### Frontend (User Interface) 🎨
- **Framework:** Next.js 14 (React 18) ⚛️
- **Styling:** Tailwind CSS (Utility-first goodness) 💅
- **Icons:** Lucide-React (Crisp, clean SVGs) 🖼️
- **Charts:** Recharts (D3 built for React) 📉
- **State Management:** React Hooks (`useState`, `useMemo`, `useContext`) 🪝
- **Routing:** Next.js App Router (Server & Client components) 🛣️

### Backend (Core Server) ☕
- **Framework:** Java Spring Boot 3.x 🍃
- **Security:** Spring Security & JWT (JSON Web Tokens) 🔐
- **ORM:** Hibernate & Spring Data JPA 🗄️
- **Build Tool:** Maven 📦
- **CSV Parsing:** Apache Commons CSV 📄

### Machine Learning Service 🐍
- **Language:** Python 3.10+ 🐍
- **Web Framework:** Flask (Lightweight and fast) 🌶️
- **Data Manipulation:** Pandas & NumPy 🐼
- **AI Integration:** `google-generativeai` SDK (Gemini Pro) 🧠

### Database & DevOps 🐳
- **Relational DB:** MySQL 8 🐬
- **Containerization:** Docker & Docker Compose 🐋
- **Version Control:** Git & GitHub 🐙

---

## ⚙️ Detailed Installation & Setup Guide ⚙️

Ready to run ERDSS on your own machine? Follow these incredibly detailed steps! 🏃‍♂️💨

### 🐳 Method 1: The Easy Way (Docker Compose) - HIGHLY RECOMMENDED!

If you want to spin up the Frontend, Backend, ML Service, and MySQL database all at once without installing Java or Python locally, this is for you! 🎉

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- Ensure ports `3000`, `8080`, `5000`, and `3306` are free on your machine.

**Steps:**
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/777yash77/Project-Z.git
   cd Employee-Retention-and-Decision-Support-System
   ```
2. Build and start the containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```
3. Wait for the magic to happen! 🪄 Docker will pull the images, compile the Java code, build the Next.js production bundle, and start everything. (This might take 3-5 minutes the first time).
4. Verify the containers are running:
   ```bash
   docker ps
   ```
5. Access the application:
   - 🌍 **Frontend Application:** Open your browser and go to `http://localhost:3000`
   - 🔌 **Backend API Base URL:** `http://localhost:8080`
   - 🧠 **ML Service API:** `http://localhost:5000`

**To shut down the system:**
```bash
docker-compose down
```

---

### 💻 Method 2: The Hard Way (Manual Local Setup)

Want to run everything locally for development and debugging? Buckle up! 🎢

**Prerequisites:**
- Node.js (v18+) 🟩
- Java JDK 17+ ☕
- Maven 📦
- Python 3.10+ 🐍
- MySQL Server 🐬

#### Step 1: Database Setup 🗄️
1. Open your MySQL client (e.g., MySQL Workbench or CLI).
2. Create the database:
   ```sql
   CREATE DATABASE employee_retention;
   ```
3. Update the credentials in the Spring Boot configuration file located at `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/employee_retention?useSSL=false&serverTimezone=UTC
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

#### Step 2: Run the ML Service 🐍
1. Open a new terminal.
2. Navigate to the ML directory:
   ```bash
   cd ml-service
   ```
3. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Add your Gemini API Key as an environment variable (Required for AI insights):
   ```bash
   export GEMINI_API_KEY="your_api_key_here"  # On Windows use: set GEMINI_API_KEY="your_api_key_here"
   ```
6. Start Flask:
   ```bash
   python app.py
   ```
   *The service should now be running on port 5000.*

#### Step 3: Run the Backend (Spring Boot) ☕
1. Open a second terminal.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Build and run using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *The backend should now be connected to MySQL and running on port 8080.*

#### Step 4: Run the Frontend (Next.js) ⚛️
1. Open a third terminal.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install NPM packages:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and navigate to `http://localhost:3000`. 🎉

---

## 📡 REST API Endpoints Reference 📡

Here is a comprehensive overview of the core endpoints exposed by the Spring Boot Backend (`http://localhost:8080/api`):

### 1. Authentication Endpoints (`/api/auth`) 🔐

| Endpoint | Method | Description | Requires Auth | JSON Payload Example |
|---|---|---|---|---|
| `/register` | `POST` | Creates a new user profile (HR or Employee). | ❌ | `{"username":"john_doe","email":"john@acme.com","password":"pass","organizationName":"Acme"}` |
| `/login` | `POST` | Authenticates user and returns JWT token. | ❌ | `{"usernameOrEmail":"john_doe","password":"pass"}` |
| `/send-otp` | `POST` | Sends a 6-digit OTP to user email. | ❌ | `{"email":"john@acme.com","purpose":"LOGIN"}` |
| `/verify-otp` | `POST` | Verifies the sent OTP. | ❌ | `{"email":"john@acme.com","otp":"123456"}` |

### 2. Employee Endpoints (`/api/employees`) 🧑‍💼

| Endpoint | Method | Description | Requires Auth | Response (Snippet) |
|---|---|---|---|---|
| `/` | `GET` | Retrieve all employees for the current organization. | ✅ (JWT) | `[{"id":1, "name":"Alice", "riskScore":0.85, "riskLevel":"High"}]` |
| `/` | `POST` | Add a single new employee record manually. | ✅ (JWT) | `{"id":2, "name":"Bob"}` |
| `/{id}` | `GET` | Get detailed stats for a specific employee. | ✅ (JWT) | `{"id":1, "salary":95000, "tenure":4, "department":"Engineering"}` |
| `/upload-csv` | `POST` | Bulk import employees via Multipart File. | ✅ (JWT) | `{"status":"success","recordsProcessed":450}` |
| `/{id}/impact` | `GET` | Trigger Gemini XAI prompt to generate a report. | ✅ (JWT) | `{"aiImpactReport":"Based on Alice's tenure..."}` |

### 3. User Profile (`/api/users`) 👤

| Endpoint | Method | Description | Requires Auth |
|---|---|---|---|
| `/me` | `GET` | Decodes JWT and returns current user details. | ✅ (JWT) |

---

## 🗄️ Database Schema Definition 🗄️

The application uses MySQL. Below are the primary entities and their columns modeled by Hibernate (JPA).

### Table: `users`
- **`id`** (BIGINT, Primary Key, Auto Increment)
- **`username`** (VARCHAR, Unique)
- **`email`** (VARCHAR, Unique)
- **`password_hash`** (VARCHAR) - BCrypt encrypted.
- **`role`** (ENUM: 'EMPLOYEE', 'HR', 'ORGANISATION')
- **`organization_id`** (BIGINT, Foreign Key)

### Table: `employees`
- **`id`** (BIGINT, Primary Key)
- **`name`** (VARCHAR)
- **`age`** (INT)
- **`salary`** (DOUBLE)
- **`department`** (VARCHAR)
- **`years_at_company`** (INT)
- **`performance_rating`** (DOUBLE)
- **`risk_score`** (DOUBLE) - Generated by ML model (0.0 to 1.0).
- **`risk_level`** (ENUM: 'Low', 'Medium', 'High')
- **`organization_id`** (BIGINT, Foreign Key to `organizations`)

### Table: `organizations`
- **`id`** (BIGINT, Primary Key)
- **`name`** (VARCHAR, Unique)
- **`subscription_tier`** (VARCHAR)

### Table: `messages`
- **`id`** (BIGINT, Primary Key)
- **`sender_id`** (BIGINT, FK to `users`)
- **`receiver_id`** (BIGINT, FK to `users`)
- **`content`** (TEXT)
- **`timestamp`** (TIMESTAMP)

---

## 🖥️ Frontend Component Architecture 🖥️

Our Next.js App Router setup separates concerns gracefully:

### Root Layout (`app/layout.tsx`)
- Provides the global HTML structure, fonts (Google Inter), and the highly-critical `<ThemeProvider>` to inject dark/light mode context deeply into the React tree without hydration errors.

### Dashboard Layout (`app/dashboard/layout.tsx`)
- Contains the Sidebar Navigation and Top Header.
- **Session Management:** Uses a `useEffect` hook to read the JWT from `localStorage`, validates it via the `/api/users/me` endpoint, and dynamically renders available sidebar tabs based on the user's role (HR sees different tabs than an Employee).

### Executive Dashboard (`app/dashboard/page.tsx`)
- **Data Fetching:** Polls the `/api/employees` endpoint every 5 seconds.
- **`useMemo` Optimizations:** Filters the employee list down by search queries and selected departments instantly on the client side without triggering full tree re-renders.
- **Component Tree:** Connects to `EmployeeDetailModal.tsx` for deep-dives, and `AiReportRenderer.tsx` to parse raw Markdown from Gemini into beautiful UI widgets.

---

## 🛡️ Backend Security & JWT Flow 🛡️

ERDSS implements a robust, stateless security model using Spring Security.

1. **Authentication Process:** When a user logs in, Spring's `AuthenticationManager` verifies the BCrypt hashed password against the database.
2. **Token Generation:** The `JwtUtil` class signs a payload containing the `username`, `role`, and `organizationId` using the HS256 algorithm with a secret key.
3. **Filter Chain:** For every subsequent request, the `JwtRequestFilter` intercepts the HTTP call, extracts the `Bearer` token from the `Authorization` header, validates the signature, and populates the `SecurityContextHolder`.
4. **Method Security:** Controllers use `@PreAuthorize("hasRole('HR')")` to ensure strictly vertical access control.

---

## 🚢 Deployment Scenarios (K8s & CI/CD) 🚢

While Docker Compose is used for local development, ERDSS is built cloud-native for Enterprise scalability.

### CI/CD Pipeline (GitHub Actions / Jenkins)
- **Continuous Integration:** Every commit to `main` triggers a workflow that runs JUnit tests for the backend, Jest tests for the frontend, and PyTest for the ML service.
- **Continuous Deployment:** On a successful build, the workflow builds 3 Docker images, pushes them to Docker Hub / AWS ECR, and triggers a rolling update on the target cluster.

### Kubernetes (K8s) Architecture
For production, you can deploy ERDSS via Kubernetes Helm charts:
- **Deployments:** 3 separate deployments (`erdss-frontend`, `erdss-backend`, `erdss-ml`).
- **Services:** Internal ClusterIP services connect the backend to the ML service. An Ingress controller routes external traffic to the frontend and backend APIs.
- **Horizontal Pod Autoscaling (HPA):** The Python ML service can scale up automatically based on CPU usage during massive CSV batch processing! 📈

---

## 🚀 Upcoming Features & Roadmap 🚀

We are never done innovating! Here is what is on the horizon for ERDSS: 🌅

### 📱 1. React Native Mobile App
We are actively developing a mobile application (`/mobile` directory) using Expo and React Native! Soon, HR managers will be able to get push notifications about high-risk employees directly to their phones. 📲

### 🗓️ 2. HRIS Integrations (Workday, BambooHR, ADP)
We plan to build seamless API integrations to automatically sync employee data from major HR Information Systems. No more CSV uploads required! 🔄

### 💬 3. Slack & Microsoft Teams Bot
Get retention alerts and run AI commands directly in your company's communication tools. Type `/erdss check [Employee Name]` in Slack to get an instant risk assessment! 🤖

### 💸 4. Predictive Compensation Analytics
An upcoming feature that will simulate the exact dollar amount of raise required to lower an employee's risk score from "High" to "Low". 💵

### ⚖️ 5. Fairness & Bias Auditing
We are implementing strict AI governance tools to ensure our ML models do not show bias against any gender, ethnicity, or age group during risk assessment. 🛡️

### 🔐 6. SSO Integration (SAML / OAuth2)
We will be adding Single Sign-On capabilities allowing enterprise clients to log in using Azure AD, Okta, and Google Workspace.

---

## 🚧 Known Problems & Current Limitations 🚧

While ERDSS is powerful, we want to be transparent about its current boundaries: 🧱

1. **Docker Memory Limits:** Running MySQL, Spring Boot, Python ML, and Next.js concurrently via Docker requires a machine with at least 8GB of RAM. Machines with 4GB or less may experience container crashes (`OOMKilled`). 🛑
2. **Gemini API Rate Limits:** The free tier of the Gemini API limits the number of AI reports you can generate per minute. If you bulk-request insights, you may encounter `429 Too Many Requests` errors. ⏳
3. **Static Model Weights:** Currently, the ML model in the Python service uses static rules/pre-trained weights. It does not continuously retrain itself on the fly as new data is uploaded. Active learning is on our roadmap! 🧠
4. **Mobile App Incomplete:** The mobile directory is initialized but not yet fully functional. Please rely on the Next.js web application for now. 🚧
5. **No WebSocket Support Yet:** Currently, the real-time dashboard relies on 5-second polling intervals rather than WebSockets or SSE (Server-Sent Events).

---

## 🤝 Contributing & License 🤝

We welcome contributions from the open-source community! 💖

### How to Contribute:
1. Fork the repository. 🍴
2. Create a new branch (`git checkout -b feature/AmazingFeature`). 🌿
3. Make your changes and commit them (`git commit -m 'Add some AmazingFeature'`). 💾
4. Push to the branch (`git push origin feature/AmazingFeature`). 🚀
5. Open a Pull Request! 📬

### Code of Conduct
Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. 🤝

### License 📜
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

---

<div align="center">
  
**Made with ❤️ by the ERDSS Team**

*Empowering Organizations to Keep Their Best People.* 🌟

*Documentation Version 2.0.0 | Finalized 2026*

</div>
