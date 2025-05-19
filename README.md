# Corrad ProcessMaker

A modern business process management platform built with Nuxt 3, Vue 3, and FormKit. Design, automate, and manage business workflows with an intuitive interface.

## Project Overview

Corrad ProcessMaker is a sophisticated business process management platform that combines visual process design with dynamic form building to automate workflows. The system follows the BPMN (Business Process Model and Notation) standard to create executable business processes.

### Key Components

The platform consists of two primary modules:

#### 1. Process Builder
A visual workflow designer that allows you to create and manage business processes with a drag-and-drop interface.
- Create process flows with start/end events, tasks, gateways, and more
- Define conditions for workflow branching
- Connect tasks to forms for data collection
- Manage process variables and data flow
- Execute scripts within processes

#### 2. Form Builder
A drag-and-drop interface for creating dynamic forms to collect data within processes.
- Design forms with various input components
- Configure validation rules
- Create multi-step forms
- Manage form data and submissions
- Preview forms in real-time

### Technology Stack

- **Frontend Framework**: Nuxt 3 / Vue 3
- **UI Framework**: Tailwind CSS / Custom Rose UI components
- **State Management**: Pinia
- **Form Handling**: FormKit
- **Flow Visualization**: Vue Flow
- **Database ORM**: Prisma
- **Icons**: Material Design Icons

## Getting Started

### Prerequisites
- Node.js 16+
- MySQL/MariaDB database
- Yarn or NPM

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd corrad-processmaker
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Start the development server:
```bash
yarn dev
```

### Project Structure

```
├── components/            # Vue components
│   ├── process-flow/      # Process Builder components
│   ├── formkit/           # Custom FormKit components
│   └── rs-*/              # Rose UI components
├── pages/                 # Nuxt pages/routes
│   ├── process-builder/   # Process Builder UI
│   └── form-builder/      # Form Builder UI
├── stores/                # Pinia state management
├── prisma/                # Database schema and migrations
├── server/                # API endpoints and server logic
├── doc/                   # Documentation
│   ├── overview/          # General system documentation
│   ├── process-builder/   # Process Builder documentation
│   └── form-builder/      # Form Builder documentation
└── assets/                # Static assets
```

## Key Features

- **Visual Process Design**: Drag-and-drop interface to create BPMN-compliant process flows
- **Dynamic Form Building**: Create complex forms with validation and conditional logic
- **Process Execution**: Run and monitor business processes
- **User Task Management**: Assign and track tasks for users
- **Role-based Access Control**: Manage permissions and user roles
- **Audit Logging**: Track all system activities
- **Variable Management**: Handle data throughout the process lifecycle
- **Form-Process Integration**: Seamlessly connect forms to process tasks

## Documentation

See the `/doc` folder for detailed documentation:

- `/doc/overview/` - General system documentation
- `/doc/process-builder/` - Process Builder guides and technical details
- `/doc/form-builder/` - Form Builder guides and technical details

## License

[Your license information]
