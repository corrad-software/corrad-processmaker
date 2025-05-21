export default [
  {
    header: "",
    description: "",
    child: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "ic:outline-dashboard",
        child: [],
        meta: {},
      },
    ],
  },
  {
    header: "Administration",
    description: "Manage your application",
    child: [
      {
        title: "Configuration",
        icon: "ic:outline-settings",
        child: [
          {
            title: "Environment",
            path: "/devtool/config/environment",
          },
        ],
      },
      {
        title: "Manage Users",
        path: "/devtool/user-management",
        icon: "ph:user-circle-gear",
        child: [
          {
            title: "User List",
            path: "/devtool/user-management/user",
            icon: "",
            child: [],
          },
          {
            title: "Role List",
            path: "/devtool/user-management/role",
            icon: "",
            child: [],
          },
        ],
      },
      {
        title: "Content",
        icon: "mdi:pencil-ruler",
        child: [
          {
            title: "Editor",
            path: "/devtool/content-editor",
          },
          {
            title: "Template",
            path: "/devtool/content-editor/template",
          },
        ],
      },
      {
        title: "API Editor",
        path: "/devtool/api-editor",
        icon: "material-symbols:api-rounded",
        child: [],
      },
      {
        title: "Code Playground",
        path: "/devtool/code-playground",
        icon: "mdi:code-braces",
        child: [],
      },
    ],
    meta: {
      auth: {
        role: ["Developer"],
      },
    },
  },
  {
    header: "Process Builder",
    description: "Build and manage your processes",
    child: [
      {
        title: "Process Management",
        icon: "mdi:sitemap",
        child: [
          {
            title: "Process Builder",
            path: "/process-builder",
            icon: "material-symbols:network-node",
            child: [],
          },
          {
            title: "Process List",
            path: "/process-builder/manage",
            icon: "mdi:format-list-bulleted",
            child: [],
          },
        ],
      },
      {
        title: "Form Builder",
        path: "/form-builder/manage",
        icon: "mdi:form-select",
        child: [],
      },
    ],
  },
  {
    header: "Process Execution",
    description: "Execute and manage process workflows",
    child: [
      {
        title: "Execution Dashboard",
        path: "/execution",
        icon: "ic:outline-dashboard",
        child: [],
      },
      {
        title: "New Case",
        path: "/execution/new-case",
        icon: "material-symbols:add-circle-outline",
        child: [],
      },
      {
        title: "Task Inbox",
        path: "/execution/inbox",
        icon: "material-symbols:inbox",
        child: [],
      },
      {
        title: "Case History",
        path: "/execution/history",
        icon: "material-symbols:history",
        child: [],
      },
    ],
  },
];
