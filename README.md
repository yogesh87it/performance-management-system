# Corporate Performance Management System (PMS)

A **Performance Management System (PMS)** built with **React, TypeScript, and Tailwind CSS**.  
This application facilitates a structured **KRA/KPI lifecycle**, managing organizational hierarchies from company registration to individualized performance tracking.

---
## 🌐 Live Demo
Click Here: https://performance-management-system-nine.vercel.app/


## 🚀 Key Features

### 🏢 Multi-Tenant Organization Management

- **Company Onboarding**  
  Dynamic registration flow for companies, including secondary contact details and administrative configuration.

- **Department & Designation Setup**  
  Tools for Admins to define the organizational structure before employee assignment.

- **Employee Lifecycle Management**  
  Centralized management of employee profiles and their roles within the hierarchy.

---

### 🔐 Role-Based Access Control (RBAC)

The system implements a robust security layer via a `ProtectedRoute` component to handle three distinct roles:

#### Admin
- Full access to company settings
- Department management
- System-wide employee data

#### Reporting Manager
- Assign KRAs and KPIs to direct reportees
- Track team-level performance and progress

#### User (Employee)
- View assigned KRAs and KPIs
- Add self-assessment notes and performance updates

---

### 📈 Performance Tracking Workflow

- **KRA & KPI Assignment**  
  Structured goal-setting with defined weightage and target scores.

- **Self-Assessment**  
  Integrated *View/Add Notes* functionality enabling employees to record accomplishments against specific KPIs.

- **Management Dashboard**  
  High-level overview for managers and admins to monitor organizational performance.

---

## 🛠️ Technical Stack

- **Frontend**  
  React 18 with TypeScript for strict type safety across data models.

- **Routing**  
  React Router DOM (v6) with `HashRouter` for reliable deployment.

- **State Management**  
  Context API (`AuthContext`) for global authentication and user session handling.

- **UI Components**  
  Custom, reusable atomic components (`Button`, `Card`, `Input`, `Select`) built using Tailwind CSS.

- **Persistence Layer**  
  Custom `localStorageService` that mimics a backend database and manages complex data relationships locally in the browser.

---

## 🏗️ Architecture Highlights

### 1. Data Integrity & Persistence

The system follows a **service-oriented architecture**.  
Business logic and data management are decoupled from UI components in `localStorageService.ts`, enabling a seamless transition to a real REST API in the future.

---

### 2. Component-Driven Design

The project adopts a **highly modular structure**, utilizing shared layouts (`AppLayout`) and reusable UI components to ensure consistency, scalability, and maintainability.

---

### 3. Secure Navigation

A custom `ProtectedRoute` wrapper ensures that users can only access routes permitted by their assigned role:

- Admin  
- Reporting Manager  
- User  

This guarantees strict role-based route protection across the application.
