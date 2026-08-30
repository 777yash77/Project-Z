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
11. [Upcoming Features & Roadmap](#-upcoming-features--roadmap)
12. [Known Problems & Current Limitations](#-known-problems--current-limitations)
13. [Contributing & License](#-contributing--license)

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

### 🔍 Explainable AI (XAI) with SHAP values (Future Integration)
The system is designed to eventually support SHAP (SHapley Additive exPlanations) values to tell the user *exactly* which feature pushed the score high (e.g., "+20% risk due to 'Years in Current Role = 5'"). 🔬

---

## 🤖 Gemini AI Copilot Integration 🤖

Raw numbers are great, but human resources is about *humans*. We integrated Google's Gemini AI to bridge the gap between cold data and actionable strategy. 🗣️

When HR clicks "Get Insights" on an employee, the backend takes the employee's data (Salary, Tenure, Risk Score, Department) and sends a highly structured prompt to Gemini. 

**Gemini then returns a 3-part report:**
1. **Diagnosis:** Why is this person at risk? 🩺
2. **Impact:** What happens to the company if they leave? 💥
3. **Action Plan:** A bulleted, step-by-step roadmap for HR to retain the employee (e.g., "Schedule a 1-on-1", "Review compensation band", "Offer lateral movement"). 🗺️

This text is rendered beautifully in the frontend using the `AiReportRenderer` component. ✨

---

## ✨ Key Features Deep-Dive ✨

### 📈 Executive Stock-Market Dashboard
Forget boring spreadsheets! ERDSS treats employee risk like a live stock market.
- **Flashing Rows:** When an employee's risk score changes, their row flashes green or red! 🚨
- **Live Trend Chart:** A beautiful Area chart tracks the aggregate risk of the organization over time. 📊

### 🔄 Internal Trading Window
A revolutionary concept in HR software! 
- If an employee is flagged as "High Risk" due to role stagnation, HR can list their profile on the **Trading Window**.
- Other departments (e.g., moving from Support to QA) can view these candidates and offer them a role transfer.
- *Result:* The employee stays at the company, just in a different seat! 🪑

### 📂 Smart Bulk CSV Upload
Onboarding a company of 10,000 employees? No problem.
- Drag and drop a CSV file. 📁
- The Spring Boot backend parses it, saves it to MySQL, and instantly batches requests to the Python ML service.
- Within seconds, your entire workforce is scored and ranked! ⚡

### 💬 Cross-HR Messaging System
Secure, intra-organization messaging.
- HR managers can DM each other directly within the platform to discuss sensitive employee retention strategies without relying on external, less secure tools like Slack. 📩

---

## 🛠️ Comprehensive Technology Stack 🛠️

We spared no expense in choosing the best tools for the job! 🏆

### Frontend (User Interface) 🎨
- **Framework:** Next.js 14 (React 18) ⚛️
- **Styling:** Tailwind CSS (Utility-first goodness) 💅
- **Icons:** Lucide-React (Crisp, clean SVGs) 🖼️
- **Charts:** Recharts (D3 built for React) 📉
- **State Management:** React Hooks (useState, useMemo, useContext) 🪝
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

Here is a quick overview of the core endpoints exposed by the Spring Boot Backend (`http://localhost:8080/api`):

### Authentication (`/api/auth`) 🔐
- `POST /register`: Register a new user (Organization or Employee).
- `POST /login`: Authenticate and receive a JWT token.
- `POST /send-otp`: Request an OTP for registration or login.
- `POST /verify-otp`: Validate OTP.

### Employees (`/api/employees`) 🧑‍💼
- `GET /`: Retrieve all employees for the current organization.
- `POST /`: Add a new employee.
- `GET /{id}`: Get specific employee details.
- `POST /upload-csv`: Bulk import employees via Multipart File.
- `GET /{id}/impact`: Trigger a request to the ML service to generate a Gemini XAI report for this employee.

### User Profile (`/api/users`) 👤
- `GET /me`: Get details of the currently authenticated user based on JWT.

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

---

## 🚧 Known Problems & Current Limitations 🚧

While ERDSS is powerful, we want to be transparent about its current boundaries: 🧱

1. **Docker Memory Limits:** Running MySQL, Spring Boot, Python ML, and Next.js concurrently via Docker requires a machine with at least 8GB of RAM. Machines with 4GB or less may experience container crashes (`OOMKilled`). 🛑
2. **Gemini API Rate Limits:** The free tier of the Gemini API limits the number of AI reports you can generate per minute. If you bulk-request insights, you may encounter `429 Too Many Requests` errors. ⏳
3. **Static Model Weights:** Currently, the ML model in the Python service uses static rules/pre-trained weights. It does not continuously retrain itself on the fly as new data is uploaded. Active learning is on our roadmap! 🧠
4. **Mobile App Incomplete:** The mobile directory is initialized but not yet fully functional. Please rely on the Next.js web application for now. 🚧

---

## 🤝 Contributing & License 🤝

We welcome contributions from the open-source community! 💖

### How to Contribute:
1. Fork the repository. 🍴
2. Create a new branch (`git checkout -b feature/AmazingFeature`). 🌿
3. Make your changes and commit them (`git commit -m 'Add some AmazingFeature'`). 💾
4. Push to the branch (`git push origin feature/AmazingFeature`). 🚀
5. Open a Pull Request! 📬

### License 📜
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

---

<div align="center">
  
**Made with ❤️ by the ERDSS Team**

*Empowering Organizations to Keep Their Best People.* 🌟

</div>
