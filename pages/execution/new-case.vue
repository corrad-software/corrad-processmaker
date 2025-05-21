<template>
  <div>
    <LayoutsBreadcrumb />

    <!-- Search and Filter -->
    <rs-card>
      <div class="p-5 flex flex-wrap gap-4">
        <div class="w-full md:w-1/2">
          <FormKit
            type="text"
            name="search"
            placeholder="Search processes..."
            prefix-icon="search"
            v-model="searchQuery"
          />
        </div>
        <div class="w-full md:w-1/3">
          <FormKit
            type="select"
            name="category"
            placeholder="Select category"
            :options="categories"
            v-model="selectedCategory"
          />
        </div>
      </div>
    </rs-card>

    <!-- Process Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <rs-card
        v-for="process in filteredProcesses"
        :key="process.id"
        class="overflow-hidden hover:shadow-md transition-shadow duration-300"
      >
        <div :class="`h-3 bg-${process.color}-500`"></div>
        <template #body>
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold">{{ process.name }}</h3>
              <rs-badge
                :variant="
                  process.category === 'HR'
                    ? 'info'
                    : process.category === 'Finance'
                      ? 'success'
                      : 'warning'
                "
              >
                {{ process.category }}
              </rs-badge>
            </div>
            <p class="text-gray-600 text-sm mb-4">{{ process.description }}</p>
            <div class="text-xs text-gray-500 mb-4">
              <div class="flex items-center mb-1">
                <Icon
                  class="text-base mr-1"
                  name="material-symbols:schedule"
                ></Icon>
                <span>Average duration: {{ process.duration }}</span>
              </div>
              <div class="flex items-center">
                <Icon
                  class="text-base mr-1"
                  name="material-symbols:sync"
                ></Icon>
                <span>{{ process.steps }} steps</span>
              </div>
            </div>
            <div class="mt-4">
              <rs-button
                variant="primary"
                block
                @click="startProcess(process.id)"
              >
                Start Process
              </rs-button>
            </div>
          </div>
        </template>
      </rs-card>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Start New Case",
  layout: "default",
  middleware: ["auth"],
  requiresAuth: true,
});

// Mock data for processes
const processes = ref([
  {
    id: 1,
    name: "Purchase Order Approval",
    description:
      "Process for approving purchase orders submitted by departments.",
    category: "Finance",
    duration: "3 days",
    steps: 10,
    color: "blue",
  },
  {
    id: 2,
    name: "Leave Request",
    description:
      "Process for submitting and approving employee leave requests.",
    category: "HR",
    duration: "1 day",
    steps: 5,
    color: "green",
  },
  {
    id: 3,
    name: "Budget Request",
    description:
      "Process for requesting and approving department budget allocations.",
    category: "Finance",
    duration: "7 days",
    steps: 12,
    color: "purple",
  },
  {
    id: 4,
    name: "IT Service Request",
    description:
      "Process for submitting and handling IT service and support requests.",
    category: "Operations",
    duration: "2 days",
    steps: 7,
    color: "yellow",
  },
]);

// Search and filter
const searchQuery = ref("");
const selectedCategory = ref("");

// Categories for filter
const categories = [
  { value: "", label: "All Categories" },
  { value: "HR", label: "Human Resources" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
];

// Filtered processes
const filteredProcesses = computed(() => {
  return processes.value.filter((process) => {
    const matchesSearch =
      searchQuery.value === "" ||
      process.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      process.description
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());

    const matchesCategory =
      selectedCategory.value === "" ||
      process.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

// Start a process
const startProcess = (processId) => {
  // Logic to start a process would go here
  console.log("Starting process:", processId);
};
</script>
