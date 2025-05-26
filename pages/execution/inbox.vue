<script setup>
definePageMeta({
  title: "Task Inbox",
  layout: "default",
  middleware: ["auth"],
  requiresAuth: true,
});

// Task data
const tasks = ref([
  {
    id: "task-123",
    name: "Complete Purchase Order Review",
    process: "Purchase Order Approval",
    caseId: "PO-2024-0123",
    dueDate: "Apr 30, 2024",
    assignedDate: "Apr 25, 2024",
    status: "PENDING",
    action: { id: "task-123" },
  },
  {
    id: "task-124",
    name: "Review Leave Request",
    process: "Leave Approval",
    caseId: "LR-2024-0056",
    dueDate: "May 2, 2024",
    assignedDate: "Apr 29, 2024",
    status: "PENDING",
    action: { id: "task-124" },
  },
  {
    id: "task-125",
    name: "Approve Budget Increase",
    process: "Budget Management",
    caseId: "BM-2024-0078",
    dueDate: "Apr 28, 2024",
    assignedDate: "Apr 20, 2024",
    status: "OVERDUE",
    action: { id: "task-125" },
  },
  {
    id: "task-126",
    name: "Review IT Service Request",
    process: "IT Service Request",
    caseId: "IT-2024-0092",
    dueDate: "May 5, 2024",
    assignedDate: "Apr 28, 2024",
    status: "PENDING",
    action: { id: "task-126" },
  },
  {
    id: "task-127",
    name: "Complete Invoice Processing",
    process: "Invoice Processing",
    caseId: "IP-2024-0045",
    dueDate: "Apr 26, 2024",
    assignedDate: "Apr 24, 2024",
    status: "COMPLETED",
    action: { id: "task-127" },
  },
]);

// Filters
const searchQuery = ref("");
const selectedProcess = ref("");
const selectedStatus = ref("");

// Process filter options
const processOptions = [
  { value: "", label: "All Processes" },
  { value: "Purchase Order Approval", label: "Purchase Order" },
  { value: "Leave Approval", label: "Leave Request" },
  { value: "Budget Management", label: "Budget" },
  { value: "IT Service Request", label: "IT Service" },
  { value: "Invoice Processing", label: "Invoice" },
];

// Status filter options
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "COMPLETED", label: "Completed" },
];

// Filtered tasks
const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchesSearch =
      searchQuery.value === "" ||
      task.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.process.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.caseId.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesProcess =
      selectedProcess.value === "" || task.process === selectedProcess.value;

    const matchesStatus =
      selectedStatus.value === "" || task.status === selectedStatus.value;

    return matchesSearch && matchesProcess && matchesStatus;
  });
});

// Table options
const tableOptions = {
  striped: true,
  hover: true,
  bordered: false,
  responsive: true,
};

// Advanced table options
const optionsAdvanced = {
  sortable: true,
  filterable: false,
  responsive: true,
  outsideBorder: false,
};

// Refresh tasks
const refreshTasks = () => {
  // In a real app, this would fetch updated task data
  console.log("Refreshing tasks...");
};
</script>
<template>
  <div>
    <LayoutsBreadcrumb />

    <!-- Filters and Search -->
    <rs-card class="mb-6">
      <template #body>
        <div class="p-5 flex flex-wrap gap-4">
          <div class="w-full md:w-1/3">
            <FormKit
              type="text"
              name="search"
              placeholder="Search tasks..."
              prefix-icon="search"
              v-model="searchQuery"
            />
          </div>
          <div class="w-full md:w-1/3">
            <FormKit
              type="select"
              name="process"
              placeholder="Select process"
              :options="processOptions"
              v-model="selectedProcess"
            />
          </div>
          <div class="w-full md:w-1/3">
            <FormKit
              type="select"
              name="status"
              placeholder="Select status"
              :options="statusOptions"
              v-model="selectedStatus"
            />
          </div>
        </div>
      </template>
    </rs-card>

    <!-- Task List -->
    <rs-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Your Tasks</h2>
          <div class="flex items-center space-x-2">
            <rs-button
              variant="text"
              icon="material-symbols:refresh"
              @click="refreshTasks"
              title="Refresh"
            />
            <rs-button
              variant="text"
              icon="material-symbols:filter-list"
              title="Filter"
            />
          </div>
        </div>
      </template>
      <template #body>
        <div class="">
          <rs-table
            :data="filteredTasks"
            :options="tableOptions"
            :options-advanced="optionsAdvanced"
            advanced
          >
            <!-- Name column with custom rendering -->
            <template v-slot:name="{ value, text }">
              <div>
                <div class="font-medium">{{ value.caseId }}</div>
                <div class="text-sm text-gray-600">
                  Case #{{ value.caseId }}
                </div>
              </div>
            </template>

            <!-- Due Date column with custom rendering -->
            <template v-slot:dueDate="{ value, text }">
              <div v-if="value.status === 'COMPLETED'" class="text-gray-600">
                Completed: {{ value.dueDate }}
              </div>
              <div v-else>
                {{ value.dueDate }}
              </div>
            </template>

            <!-- Status column with custom rendering -->
            <template v-slot:status="{ value }">
              <div class="inline-flex">
                <rs-badge
                  :variant="
                    value.status === 'PENDING'
                      ? 'warning'
                      : value.status === 'OVERDUE'
                        ? 'danger'
                        : 'success'
                  "
                >
                  {{ value.status }}
                </rs-badge>
              </div>
            </template>

            <!-- Action column with custom rendering -->
            <template v-slot:action="{ value }">
              <rs-button
                variant="secondary"
                size="sm"
                class="px-3 inline-flex items-center justify-center"
              >
                <nuxt-link :to="`/execution/task/${value.id}`">
                  Open Task
                </nuxt-link>
              </rs-button>
            </template>
          </rs-table>
        </div>
      </template>
    </rs-card>
  </div>
</template>
