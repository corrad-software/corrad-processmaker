# Corrad ProcessMaker

A modern business process management platform built with Nuxt 3, Vue 3, and FormKit. Design, automate, and manage business workflows with an intuitive interface.

## Project Overview

Corrad ProcessMaker is a sophisticated business process management platform that combines visual process design with dynamic form building to automate workflows. The system follows the BPMN (Business Process Model and Notation) standard to create executable business processes.

### Key Components

The platform consists of two primary modules:

#### 1. Process Builder
A visual workflow designer that allows you to create and manage business processes with a drag-and-drop interface.
- Create process flows with start/end points, tasks, decision points, and more
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
- **Form Builder Enhancements** (December 2024):
  - Enhanced Dynamic List Component with validation, search, and bulk operations
  - JavaScript API integration for real-time calculations
  - Conditional logic system for dynamic form behavior
  - Professional-grade form components with advanced settings
- **Role-based Access Control**: Manage permissions and user roles
- **Audit Logging**: Track all system activities
- **Variable Management**: Handle data throughout the process lifecycle
- **Form-Process Integration**: Seamlessly connect forms to process tasks

## Documentation

Comprehensive documentation is available in the `/doc` directory:

### 📋 Form Builder Documentation
- **[Form Builder Roadmap](doc/form-builder/ROADMAP.md)** - Development status and planned features
- **[Technical Guide](doc/form-builder/TECHNICAL_GUIDE.md)** - Implementation details and recent updates
- **[User Guide](doc/form-builder/USER_GUIDE.md)** - How to use the form builder interface
- **[JavaScript API](doc/form-builder/JAVASCRIPT_API.md)** - Scripting and automation capabilities

### 🔄 Process Builder Documentation
- **[Process Builder Guide](doc/process-builder/)** - Process design and management

### ⚙️ System Documentation
- **[Overview](doc/overview/)** - System architecture and general information

## Recent Updates (December 2024)

### 🚀 Form Builder Enhancements
- **Dynamic List Component**: Comprehensive enhancement with item validation, uniqueness checking, search/filter functionality, bulk operations, and import/export capabilities
- **Configuration System**: Identified and addressed dual configuration system architecture issue
- **JavaScript Integration**: Enhanced form scripting capabilities for dynamic calculations and field updates
- **Conditional Logic**: Visual condition builder for creating dynamic form workflows

For detailed information about recent changes and development progress, see the [Form Builder Roadmap](doc/form-builder/ROADMAP.md).

## License

[Your license information]
