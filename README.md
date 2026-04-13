# Launchpad Mission Control

**Launchpad Mission Control** is a shared, multi-user web application designed for staff to manage partnerships, student outreach, interactions, and automated communications. It provides administrative controls and a shared database, ensuring all staff members can view and contribute to the organization's outreach efforts.

## Core Purpose
The application serves as a central hub for tracking and managing the relationship between staff, partners (educational and corporate), and students. It streamlines the process of logging interactions, managing student status, and facilitating outreach through AI-assisted communication.

## Key Features
- **Shared Workspace & Dashboard**: Real-time overview of recent interactions, quick actions, and administrative review queues.
- **Partner Management**: Detailed tracking of organization contacts (Leadership, Primary, Secondary), school types, and partnership status.
- **Interaction Logging**: Centralized log for infosessions, tabling, meetings, outreach, and interviews, including student participation counts and shared notes.
- **Students Directory**: Comprehensive database of students, their associated partners, status (Active Member, Applicant, Alumni), and interaction history.
- **AI-Powered Outreach**: Integration with OpenAI to generate tailored outreach emails based on partner interaction history and staff instructions.
- **Audit Trail**: Full activity logging of all record creations, updates, and deletions for security and accountability.
- **Global Search**: Searchable database for partners, interactions, and students.

## Technology Stack
- **Frontend**: React + Next.js with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/) components.
- **Backend**: Node.js + Express with [Prisma ORM](https://www.prisma.io/).
- **Database**: PostgreSQL (hosted on Neon).
- **Authentication**: NextAuth.js with Google Workspace SSO and email/password support.
- **AI**: OpenAI API for intelligent email composition.

## Potential Future Updates
- **Blockchain Integration**: Exploring the use of blockchain for secure, immutable logging of sensitive interactions and verifiable student participation records.
- **Unique User RGV (Randomly Generated Value)**: Implementation of a unique, non-identifiable RGV for each user to enhance data privacy and provide a secondary layer of unique identification for internal processing.
- **Advanced Data Tracking**: Enhanced monitoring and analytics of data funneled through the app to track usage patterns, outreach effectiveness, and data flow health.

---
*Built for Launchpad Mission Control staff.*
