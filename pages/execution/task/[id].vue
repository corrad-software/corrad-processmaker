<template>
  <div>
    <LayoutsBreadcrumb />

    <!-- Task Form -->
    <!-- <rs-card class="mb-6">
      <template #body>
        <div class="p-5">
          <TaskForm :task="currentTask" />
        </div>
      </template>
    </rs-card> -->
    <div class="mb-6">
      <TaskForm :task="currentTask" />
    </div>

    <!-- Case Information Accordion -->
    <rs-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Case Information</h2>
          <button
            @click="toggleCaseInfo"
            class="text-gray-500 hover:text-gray-700 p-2"
          >
            <Icon
              :name="
                showCaseInfo
                  ? 'material-symbols:expand-less'
                  : 'material-symbols:expand-more'
              "
            />
          </button>
        </div>
      </template>

      <template #body v-if="showCaseInfo">
        <div class="">
          <!-- Case Variables -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-3">
              Case Variables
            </h3>
            <div class="border border-gray-200 rounded-md overflow-hidden">
              <rs-table
                :data="caseVariables"
                :columns="variableColumns"
                :options="tableOptions"
                :options-advanced="optionsAdvanced"
                advanced
              />
            </div>
          </div>

          <!-- Case Timeline -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3">
              Case Timeline
            </h3>
            <div class="flow-root">
              <ul class="mb-2">
                <li v-for="(event, index) in timeline" :key="index">
                  <div class="relative pb-8" v-if="index < timeline.length - 1">
                    <span
                      class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    ></span>
                    <div class="relative flex space-x-3">
                      <div>
                        <span
                          class="h-8 w-8 rounded-full flex items-center justify-center"
                          :class="eventColorClass(event.type)"
                        >
                          <Icon
                            :name="eventIcon(event.type)"
                            class="text-white text-sm"
                          />
                        </span>
                      </div>
                      <div
                        class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4"
                      >
                        <div>
                          <p
                            class="text-sm text-gray-700"
                            v-html="event.description"
                          ></p>
                        </div>
                        <div
                          class="text-right text-sm whitespace-nowrap text-gray-500"
                        >
                          {{ event.date }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="relative" v-else>
                    <div class="relative flex space-x-3">
                      <div>
                        <span
                          class="h-8 w-8 rounded-full flex items-center justify-center"
                          :class="eventColorClass(event.type)"
                        >
                          <Icon
                            :name="eventIcon(event.type)"
                            class="text-white text-sm"
                          />
                        </span>
                      </div>
                      <div
                        class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4"
                      >
                        <div>
                          <p
                            class="text-sm text-gray-700"
                            v-html="event.description"
                          ></p>
                        </div>
                        <div
                          class="text-right text-sm whitespace-nowrap text-gray-500"
                        >
                          {{ event.date }}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </rs-card>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Task Details",
  layout: "default",
  middleware: ["auth"],
  requiresAuth: true,
});

// Mock task data (would come from API in real implementation)
const currentTask = ref({
  id: "task-123",
  name: "Complete Purchase Order Review",
  process: "Purchase Order Approval",
  caseId: "PO-2024-0123",
  status: "pending",
  dueDate: "Apr 30, 2024",
  instructions:
    "Please review the purchase order details and either approve or reject the request. If rejecting, please provide a reason in the comments section.",
});

// Toggle case information section
const showCaseInfo = ref(true);
const toggleCaseInfo = () => {
  showCaseInfo.value = !showCaseInfo.value;
};

// Case variables
const caseVariables = ref([
  {
    name: "purchaseOrderNumber",
    value: "PO-2024-0123",
    type: "String",
  },
  {
    name: "amount",
    value: "5250.00",
    type: "Number",
  },
  {
    name: "department",
    value: "IT Department",
    type: "String",
  },
  {
    name: "vendor",
    value: "Acme Computing Supplies",
    type: "String",
  },
  {
    name: "approvalRequired",
    value: "true",
    type: "Boolean",
  },
]);

// Variable columns for table
const variableColumns = [
  { key: "name", label: "Name" },
  { key: "value", label: "Value" },
  { key: "type", label: "Type" },
];

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

// Case timeline
const timeline = ref([
  {
    type: "start",
    description:
      'Process started by <span class="font-medium">John Smith</span>',
    date: "Apr 25, 2024",
  },
  {
    type: "complete",
    description:
      'Form <span class="font-medium">"New Purchase Order"</span> completed',
    date: "Apr 25, 2024",
  },
  {
    type: "assign",
    description:
      'Task <span class="font-medium">"Manager Review"</span> assigned to <span class="font-medium">Jane Doe</span>',
    date: "Apr 25, 2024",
  },
  {
    type: "current",
    description:
      'Task <span class="font-medium">"Complete Purchase Order Review"</span> waiting',
    date: "Current",
  },
]);

// Helper functions for timeline
const eventColorClass = (type) => {
  switch (type) {
    case "start":
      return "bg-blue-500";
    case "complete":
      return "bg-green-500";
    case "assign":
    case "current":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const eventIcon = (type) => {
  switch (type) {
    case "start":
      return "material-symbols:play-arrow";
    case "complete":
      return "material-symbols:task-alt";
    case "assign":
    case "current":
      return "material-symbols:pending";
    default:
      return "material-symbols:info";
  }
};
</script>
