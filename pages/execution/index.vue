<script setup>
definePageMeta({
  title: "Process Execution Dashboard",
  layout: "default",
  middleware: ["auth"],
  requiresAuth: true,
});

// Mock data for pending tasks
const pendingTasks = ref(12);
const activeCases = ref(7);
const completedCases = ref(23);
const overdueTasks = ref(5);

// Mock data for recent tasks
const recentTasks = ref([
  {
    name: "Complete Purchase Order Review",
    process: "Purchase Order Approval",
    dueDate: "Apr 30, 2024",
    status: "PENDING",
    action: { id: "task-123" },
  },
  {
    name: "Review Leave Request",
    process: "Leave Approval",
    dueDate: "May 2, 2024",
    status: "PENDING",
    action: { id: "task-124" },
  },
  {
    name: "Approve Budget Increase",
    process: "Budget Management",
    dueDate: "Apr 28, 2024",
    status: "OVERDUE",
    action: { id: "task-125" },
  },
]);

// Mock data for recent processes
const recentProcesses = ref([
  {
    name: "Purchase Order Approval",
    started: "Apr 25, 2024",
    status: "ACTIVE",
    action: { id: "case-123" },
  },
  {
    name: "Leave Approval",
    started: "Apr 29, 2024",
    status: "ACTIVE",
    action: { id: "case-124" },
  },
  {
    name: "Invoice Processing",
    started: "Apr 15, 2024",
    status: "COMPLETED",
    action: { id: "case-125" },
  },
]);

// Table options
const tableOptions = {
  striped: true,
  hover: true,
  responsive: true,
  search: false,
  pagination: false,
};

// Advanced table options
const optionsAdvanced = {
  sortable: true,
  filterable: false,
  responsive: true,
  outsideBorder: false,
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />

    <!-- Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-x-6 mb-6">
      <!-- Pending Tasks -->
      <rs-card>
        <template #body>
          <div class="pt-5 flex items-center gap-4">
            <div
              class="p-5 flex justify-center items-center bg-yellow-100 rounded-2xl"
            >
              <Icon
                class="text-yellow-500"
                name="material-symbols:inbox"
              ></Icon>
            </div>
            <div class="flex-1 truncate">
              <span class="block font-semibold text-xl leading-tight">{{
                pendingTasks
              }}</span>
              <span class="text-base font-semibold text-gray-500"
                >Pending Tasks</span
              >
            </div>
          </div>
        </template>
      </rs-card>

      <!-- Active Cases -->
      <rs-card>
        <template #body>
          <div class="pt-5 flex items-center gap-4">
            <div
              class="p-5 flex justify-center items-center bg-blue-100 rounded-2xl"
            >
              <Icon
                class="text-blue-500"
                name="material-symbols:play-circle-outline"
              ></Icon>
            </div>
            <div class="flex-1 truncate">
              <span class="block font-semibold text-xl leading-tight">{{
                activeCases
              }}</span>
              <span class="text-base font-semibold text-gray-500"
                >Active Cases</span
              >
            </div>
          </div>
        </template>
      </rs-card>

      <!-- Completed Cases -->
      <rs-card>
        <template #body>
          <div class="pt-5 flex items-center gap-4">
            <div
              class="p-5 flex justify-center items-center bg-green-100 rounded-2xl"
            >
              <Icon
                class="text-green-500"
                name="material-symbols:check-circle-outline"
              ></Icon>
            </div>
            <div class="flex-1 truncate">
              <span class="block font-semibold text-xl leading-tight">{{
                completedCases
              }}</span>
              <span class="text-base font-semibold text-gray-500"
                >Completed Cases</span
              >
            </div>
          </div>
        </template>
      </rs-card>

      <!-- Overdue Tasks -->
      <rs-card>
        <template #body>
          <div class="pt-5 flex items-center gap-4">
            <div
              class="p-5 flex justify-center items-center bg-red-100 rounded-2xl"
            >
              <Icon
                class="text-red-500"
                name="material-symbols:warning-outline"
              ></Icon>
            </div>
            <div class="flex-1 truncate">
              <span
                class="block font-semibold text-xl leading-tight text-red-500"
                >{{ overdueTasks }}</span
              >
              <span class="text-base font-semibold text-gray-500"
                >Overdue Tasks</span
              >
            </div>
          </div>
        </template>
      </rs-card>
    </div>

    <!-- Recent Tasks -->
    <rs-card class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Recent Tasks</h2>
          <rs-button variant="primary" size="sm" to="/execution/inbox">
            View All Tasks
          </rs-button>
        </div>
      </template>
      <template #body>
        <div class="">
          <rs-table
            :data="recentTasks"
            :options="tableOptions"
            :options-advanced="optionsAdvanced"
            advanced
          >
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
                  Open
                </nuxt-link>
              </rs-button>
            </template>
          </rs-table>
        </div>
      </template>
    </rs-card>

    <!-- Recent Processes -->
    <rs-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Recent Processes</h2>
          <rs-button variant="primary" size="sm" to="/execution/history">
            View All Processes
          </rs-button>
        </div>
      </template>
      <template #body>
        <div class="">
          <rs-table
            :data="recentProcesses"
            :options="tableOptions"
            :options-advanced="optionsAdvanced"
            advanced
          >
            <!-- Status column with custom rendering -->
            <template v-slot:status="{ value }">
              <div class="inline-flex">
                <rs-badge
                  :variant="
                    value.status === 'ACTIVE'
                      ? 'primary'
                      : value.status === 'COMPLETED'
                        ? 'success'
                        : 'warning'
                  "
                >
                  {{ value.status }}
                </rs-badge>
              </div>
            </template>

            <!-- Action column with custom rendering -->
            <template v-slot:action="{ text }">
              <rs-button
                variant="secondary"
                size="sm"
                class="px-3 inline-flex items-center justify-center"
                :to="`/execution/case/${text.id}`"
              >
                View
              </rs-button>
            </template>
          </rs-table>
        </div>
      </template>
    </rs-card>
  </div>
</template>
