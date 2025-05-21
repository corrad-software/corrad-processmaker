<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Task Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-wrap justify-between items-start">
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ task.name }}</h2>
          <div class="mt-1 text-sm text-gray-600">
            <span>Process: {{ task.process }}</span>
            <span class="mx-2">•</span>
            <span>Case #{{ task.caseId }}</span>
          </div>
        </div>
        <div class="flex items-center mt-2 sm:mt-0">
          <span 
            :class="[
              'px-2 py-1 text-xs font-medium rounded-full mr-3',
              task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              task.status === 'overdue' ? 'bg-red-100 text-red-800' : 
              'bg-green-100 text-green-800'
            ]"
          >
            {{ task.status.charAt(0).toUpperCase() + task.status.slice(1) }}
          </span>
          <span class="text-sm text-gray-600">
            Due: {{ task.dueDate }}
          </span>
        </div>
      </div>
    </div>

    <!-- Task Instructions -->
    <div class="p-6 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-medium text-gray-700 mb-2">Instructions</h3>
      <div class="text-gray-600">
        {{ task.instructions }}
      </div>
    </div>

    <!-- Form -->
    <div class="p-6">
      <FormKit 
        type="form" 
        :actions="false"
        v-if="formSchema"
        :value="formData"
        @submit="submitForm"
      >
        <!-- Rendered dynamically based on formSchema -->
        <FormKitSchema :schema="formSchema" />
      </FormKit>

      <!-- Placeholder for when we don't have actual form data -->
      <div v-else class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Purchase Order Number</label>
          <input type="text" value="PO-2024-0123" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Department</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            <option>IT Department</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>Finance</option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Amount</label>
          <input type="text" value="$5,250.00" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Vendor</label>
          <input type="text" value="Acme Computing Supplies" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Request Reason</label>
          <textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
Purchase of new developer workstations for the expanding engineering team.
          </textarea>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Review Comments</label>
          <textarea rows="3" placeholder="Enter your review comments here..." class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="p-6 border-t border-gray-200 flex justify-end space-x-4">
      <button class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        Save Draft
      </button>
      <button class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
        Reject
      </button>
      <button class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
        Approve
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    default: () => ({
      id: 'task-123',
      name: 'Complete Purchase Order Review',
      process: 'Purchase Order Approval',
      caseId: 'PO-2024-0123',
      status: 'pending',
      dueDate: 'Apr 30, 2024',
      instructions: 'Please review the purchase order details and either approve or reject the request. If rejecting, please provide a reason in the comments section.'
    })
  },
  formSchema: {
    type: Array,
    default: null
  }
});

const formData = ref({});

const submitForm = (data) => {
  console.log('Form submitted:', data);
  // Here would go the code to submit the form data to the backend
};
</script> 