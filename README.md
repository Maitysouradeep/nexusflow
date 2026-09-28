# NexusFlow

> A modern multi-tenant SaaS workspace platform for teams to manage projects, tasks, members, analytics, activity, APIs, webhooks, and workspace billing.

**Repository:** https://github.com/Maitysouradeep/nexusflow

## Overview

NexusFlow is a workspace-based SaaS application focused on team collaboration and project execution. It provides workspace-aware authentication, role-based access control, project and task management, team management, analytics, activity tracking, webhook integrations, API management, and a billing interface.

The project was developed by extending an existing React SaaS dashboard starter and substantially evolving it into the NexusFlow workspace platform.

## Features

### Authentication & Workspaces
- Firebase Authentication
- Workspace-based data isolation
- Workspace creation during registration
- Persistent user/workspace context
- Role-aware access

### Role-Based Access Control
Supported roles:
- Owner
- Admin
- Manager
- Member
- Viewer

Permissions are applied across workspace features such as projects, tasks, team management, and webhooks.

### Project Management
- Create, edit and delete projects
- Project status and priority
- Project details
- Workspace activity logging

### Task Management
- Create and edit tasks
- Kanban-style workflow
- Drag-and-drop status updates
- Project and assignee management
- Priority management
- Task comments and activity
- Role-aware permissions
- Custom delete confirmation

### Team Management
- Workspace member management
- Role management
- Member invitations
- Role-aware controls

### Analytics
- Task status charts
- Project status charts
- Team workload
- Role distribution
- Activity trends
- Activity breakdown
- Period-based performance summaries

### Activity Tracking
Workspace-level activity history for important project, task, and team actions.

### Webhooks
- Webhook endpoint management
- Event subscriptions
- Webhook testing
- Delivery tracking
- Local development relay

Tested events include:
- `project.created`
- `project.updated`
- `project.deleted`
- `task.created`
- `task.updated`
- `task.deleted`

### API & Billing
- Dedicated API management interface
- Free, Pro and Enterprise billing UI
- Multi-currency display
- Current workspace plan

> Payment processing is intentionally not enabled in the current demo. Razorpay integration is planned as a future enhancement.

## Tech Stack

**Frontend:** React 19, Vite, React Router, Tailwind CSS, Lucide React, Recharts

**Backend / Cloud:** Firebase Authentication, Cloud Firestore, Firebase Cloud Functions structure

**Development:** JavaScript, Git, GitHub, Express, webhook integrations

## Architecture

```text
                    NexusFlow
                        |
              +---------+---------+
              |                   |
           React UI          Firebase Auth
              |                   |
              +---------+---------+
                        |
                    Firestore
                        |
        +---------------+----------------+
        |               |                |
    Workspaces       Projects          Tasks
        |               |                |
      Members       Activity Logs     Comments
        |
        +--- Analytics
        +--- Webhooks
        +--- API
        +--- Billing
```

## Project Structure

```text
src/
├── components/
│   ├── analytics/
│   ├── projects/
│   ├── tasks/
│   ├── team/
│   ├── webhooks/
│   ├── API.jsx
│   ├── ActivityLog.jsx
│   ├── Analytics.jsx
│   ├── Dashboard.jsx
│   ├── DemoLanding.jsx
│   ├── Projects.jsx
│   ├── Tasks.jsx
│   ├── Team.jsx
│   ├── Webhooks.jsx
│   └── Subscription.jsx
├── context/
│   ├── AuthContext.jsx
│   └── DarkModeContext.jsx
├── utils/
│   ├── activityLogger.js
│   ├── permissions.js
│   └── webhookDispatcher.js
├── App.jsx
├── firebase.js
└── index.css

functions/
└── index.js

local-webhook-server/
└── index.js
```

## Getting Started

### Clone

```bash
git clone https://github.com/Maitysouradeep/nexusflow.git
cd nexusflow
```

### Install

```bash
npm install
```

### Configure Firebase

Create `.env.local` with the Firebase environment variables used by the application.

Never commit environment files or private credentials.

### Run

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

## Webhook Development Server

The repository includes a local webhook relay for development/testing:

```bash
cd local-webhook-server
npm install
npm start
```

This local relay is for development and is not the production payment backend.

## Environment Variables

Never commit:

```text
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

Private API secrets must remain server-side.

## Current Status

### Implemented
- Authentication
- Workspace architecture
- RBAC
- Projects
- Tasks
- Team management
- Analytics
- Activity tracking
- API interface
- Webhooks
- Billing/subscription UI
- Firebase integration
- Production build

### Planned
- Production webhook infrastructure
- Razorpay payment integration
- Production billing persistence
- Additional API capabilities
- Performance optimization and code splitting

## Deployment

Recommended architecture:

```text
GitHub
   ↓
Vercel
   ↓
Firebase Authentication + Firestore
```

Production environment variables should be configured through the deployment platform rather than committed to Git.

## Security Notes

- Authentication uses Firebase Authentication.
- Firestore rules provide workspace-aware access control.
- Application permissions are role-aware.
- Private environment files are excluded from Git.
- Payment secrets are not part of the frontend application.

## Roadmap

- [x] Authentication
- [x] Workspace architecture
- [x] Role-based access control
- [x] Project management
- [x] Task management
- [x] Team management
- [x] Analytics
- [x] Activity tracking
- [x] Webhook management
- [x] Billing UI
- [ ] Production payment integration
- [ ] Production webhook infrastructure
- [ ] Additional API capabilities
- [ ] Performance optimization

## Author

**Souradeep Maity**

Computer Science & Engineering

GitHub: https://github.com/Maitysouradeep/nexusflow

---

Built as a portfolio-grade SaaS application demonstrating modern React development, Firebase architecture, RBAC, data-driven dashboards, and integration workflows.


