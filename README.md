# Hiring Management Web Application

A modern, full-stack web application for managing job postings and applications, built with React Router and TypeScript.

## Project Overview

This hiring management system provides a comprehensive platform for companies to manage their recruitment process. The application features:

- **Admin Dashboard**: Create, edit, and manage job postings
- **Application Management**: View and process job applications
- **Applicant Portal**: Browse jobs and submit applications
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Form Validation**: Robust form handling with Zod validation
- **State Management**: Efficient state management with Zustand
- **Hand Tracking**: Innovative hand gesture capture for accessibility

### Key Features

- 🚀 Server-side rendering with React Router
- ⚡️ Hot Module Replacement (HMR) for development
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎨 TailwindCSS for styling
- 📱 Responsive design
- 🎯 Form validation with Zod
- 📊 State management with Zustand
- 🤖 Hand tracking integration with MediaPipe

## Tech Stack Used

### Frontend
- **React 19** - Modern React with latest features
- **React Router 7** - Full-stack React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Heroicons** - Additional icon library

### Form Management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation resolvers

### State Management
- **Zustand** - Lightweight state management

### UI Components
- **shadcn/ui** - Re-usable components built with Radix UI
- **Class Variance Authority** - Component variant management
- **clsx & tailwind-merge** - Conditional styling utilities

### Development Tools
- **Vite** - Fast build tool and dev server
- **Yarn** - Package manager
- **Docker** - Containerization support

### Special Features
- **MediaPipe** - Hand tracking and gesture recognition
- **date-fns** - Modern JavaScript date utility library
- **Sonner** - Toast notifications

## How to Run Locally

### Prerequisites

Make sure you have the following installed:
- **Node.js** (version 18 or higher)
- **Yarn** (version 4.9.4 or compatible)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hiring-management-web
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

### Development

Start the development server with Hot Module Replacement:

```bash
yarn dev
```

Your application will be available at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
yarn build
```

### Running Production Build

Start the production server:

```bash
yarn start
```

### Type Checking

Run TypeScript type checking:

```bash
yarn typecheck
```

### Docker Deployment

To build and run using Docker:

```bash
# Build the Docker image
docker build -t hiring-management-web .

# Run the container
docker run -p 3000:3000 hiring-management-web
```

The containerized application can be deployed to any platform that supports Docker, including:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Project Structure

```
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   └── ui/             # Base UI components
│   ├── data/               # Static data files
│   ├── lib/                # Utility libraries
│   ├── routes/             # Application routes
│   │   ├── admin/          # Admin routes
│   │   └── applicant/      # Applicant routes
│   ├── stores/             # State management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── build/                  # Production build output
└── package.json           # Project dependencies and scripts
```

---

Built with ❤️ using React Router and modern web technologies.