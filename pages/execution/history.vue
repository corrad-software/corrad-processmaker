<script setup>
definePageMeta({
  title: "Case History",
  layout: "default",
  middleware: ["auth"],
  requiresAuth: true,
});

// Case history data
const cases = ref([
  {
    id: "PO-2024-0098",
    process: "Purchase Order Approval",
    started: "Apr 10, 2024",
    completed: "Apr 12, 2024",
    duration: "2 days",
    status: "COMPLETED",
    action: { id: "PO-2024-0098" }
  },
  {
    id: "LR-2024-0034",
    process: "Leave Request",
    started: "Apr 05, 2024",
    completed: "Apr 06, 2024",
    duration: "1 day",
    status: "COMPLETED",
    action: { id: "LR-2024-0034" }
  },
  {
    id: "BM-2024-0045",
    process: "Budget Management",
    started: "Mar 28, 2024",
    completed: "Apr 02, 2024",
    duration: "5 days",
    status: "COMPLETED",
    action: { id: "BM-2024-0045" }
  },
  {
    id: "IP-2024-0022",
    process: "Invoice Processing",
    started: "Mar 15, 2024",
    completed: "Apr 15, 2024",
    duration: "30 days",
    status: "COMPLETED",
    action: { id: "IP-2024-0022" }
  },
  {
    id: "PO-2024-0056",
    process: "Purchase Order Approval",
    started: "Mar 02, 2024",
    completed: "Mar 05, 2024",
    duration: "3 days",
    status: "CANCELLED",
    action: { id: "PO-2024-0056" }
  }
]);

// Filters
const searchQuery = ref("");
const selectedProcess = ref("");
const selectedStatus = ref("");
const selectedTimeframe = ref("");

// Process filter options
const processOptions = [
  { value: "", label: "All Processes" },
  { value: "Purchase Order Approval", label: "Purchase Order" },
  { value: "Leave Request", label: "Leave Request" },
  { value: "Budget Management", label: "Budget" },
  { value: "Invoice Processing", label: "Invoice" }
];

// Status filter options
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ERROR", label: "Error" }
];

// Timeframe filter options
const timeframeOptions = [
  { value: "", label: "All Time" },
  { value: "week", label: "Past Week" },
  { value: "month", label: "Past Month" },
  { value: "quarter", label: "Past Quarter" },
  { value: "year", label: "Past Year" }
];

// Filtered cases
const filteredCases = computed(() => {
  return cases.value.filter(caseItem => {
    const matchesSearch = searchQuery.value === "" || 
      caseItem.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      caseItem.process.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesProcess = selectedProcess.value === "" || 
      caseItem.process === selectedProcess.value;
    
    const matchesStatus = selectedStatus.value === "" || 
      caseItem.status === selectedStatus.value;
    
    // Timeframe filtering would require actual date parsing
    // Simplified for the example
    const matchesTimeframe = selectedTimeframe.value === "";
    
    return matchesSearch && matchesProcess && matchesStatus && matchesTimeframe;
  });
});

// Table options
const tableOptions = {
  striped: true,
  hover: true,
  bordered: false,
  responsive: true
};

// Advanced table options
const optionsAdvanced = {
  sortable: true,
  filterable: false,
  responsive: true,
  outsideBorder: false
};

// Refresh cases
const refreshCases = () => {
  // In a real app, this would fetch updated case data from the server
  console.log("Refreshing cases...");
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb />
    <!-- Filters and Search -->
    <rs-card class="mb-6">
      <template #body>
        <div class="p-5 flex flex-wrap gap-4">
          <div class="w-full md:w-1/2 lg:w-1/4">
            <FormKit
              type="text"
              name="search"
              placeholder="Search cases..."
              prefix-icon="search"
              v-model="searchQuery"
            />
          </div>
          <div class="w-full md:w-1/2 lg:w-1/4">
            <FormKit
              type="select"
              name="process"
              placeholder="Select process"
              :options="processOptions"
              v-model="selectedProcess"
            />
          </div>
          <div class="w-full md:w-1/2 lg:w-1/4">
            <FormKit
              type="select"
              name="status"
              placeholder="Select status"
              :options="statusOptions"
              v-model="selectedStatus"
            />
          </div>
          <div class="w-full md:w-1/2 lg:w-1/4">
            <FormKit
              type="select"
              name="timeframe"
              placeholder="Select timeframe"
              :options="timeframeOptions"
              v-model="selectedTimeframe"
            />
          </div>
        </div>
      </template>
    </rs-card>

    <!-- Case History Table -->
    <rs-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Your Cases</h2>
          <div class="flex items-center space-x-2">
            <rs-button 
              variant="text" 
              icon="material-symbols:refresh" 
              @click="refreshCases"
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
            :data="filteredCases"
            :options="tableOptions"
            :options-advanced="optionsAdvanced"
            advanced
          >
            <!-- Status column with custom rendering -->
            <template v-slot:status="{ value }">
              <div class="inline-flex">
                <rs-badge
                  :variant="
                    value.status === 'COMPLETED'
                      ? 'success'
                      : value.status === 'CANCELLED'
                      ? 'warning'
                      : 'danger'
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
                View Details
              </rs-button>
            </template>
          </rs-table>
        </div>
      </template>
    </rs-card>
  </div>
</template>
