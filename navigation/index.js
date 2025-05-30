export default [
  {
    header: "",
    description: "",
    child: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "material-symbols:dashboard",
        child: [],
        meta: {},
      },
    ],
  },
  {
    header: "Design & Build",
    description: "Create and design your workflows and forms",
    child: [
      {
        title: "Process Designer",
        icon: "material-symbols:account-tree",
        child: [
          {
            title: "Visual Builder",
            path: "/process-builder",
            child: [],
            meta: {
              description: "Design workflows with drag-and-drop interface"
            }
          },
          {
            title: "Manage Processes",
            path: "/process-builder/manage",
            child: [],
            meta: {
              description: "View and manage all your processes"
            }
          },
        ],
      },
      {
        title: "Form Designer",
        icon: "material-symbols:dynamic-form",
        child: [
          {
            title: "Form Builder",
            path: "/form-builder",
            child: [],
            meta: {
              description: "Create dynamic forms with advanced components"
            }
          },
          {
            title: "Manage Forms",
            path: "/form-builder/manage",
            child: [],
            meta: {
              description: "View and manage all your forms"
            }
          },
        ],
      },
    ],
  },
  {
    header: "Execute & Monitor",
    description: "Run processes and track their progress",
    child: [
      {
        title: "Process Execution",
        icon: "material-symbols:play-circle",
        child: [
          {
            title: "Execution Dashboard",
            path: "/execution",
            child: [],
            meta: {
              description: "Monitor active processes and performance metrics"
            }
          },
          {
            title: "Start New Process",
            path: "/execution/new-case",
            child: [],
            meta: {
              description: "Initiate a new process instance"
            }
          },
        ],
      },
      {
        title: "Task Management",
        icon: "material-symbols:task",
        child: [
          {
            title: "My Tasks",
            path: "/execution/inbox",
            child: [],
            meta: {
              description: "View and complete assigned tasks"
            }
          },
          {
            title: "Process History",
            path: "/execution/history",
            child: [],
            meta: {
              description: "Review completed processes and audit trails"
            }
          },
        ],
      },
    ],
  },
];
