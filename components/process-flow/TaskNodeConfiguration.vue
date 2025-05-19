<template>
  <div class="task-node-configuration">
    <h3 class="text-lg font-semibold mb-4">Task Configuration</h3>
    
    <!-- <div class="form-group mb-4">
      <label for="nodeLabel" class="form-label">Task Name</label>
      <input
        id="nodeLabel"
        v-model="localNodeData.label"
        type="text"
        class="form-control"
        placeholder="Task Name"
        @blur="saveChanges"
      />
    </div> -->
    
    <!-- <div class="form-group mb-4">
      <label for="nodeDescription" class="form-label">Description</label>
      <textarea
        id="nodeDescription"
        v-model="localNodeData.description"
        class="form-control"
        placeholder="Task description"
        rows="2"
        @blur="saveChanges"
      ></textarea>
    </div> -->
    
    <!-- Assignment Type Selector -->
    <div class="form-group mb-4">
      <label class="form-label">Assignment Type</label>
      <div class="flex flex-wrap gap-2">
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="localNodeData.assignmentType" 
            value="user" 
            class="form-radio" 
            @change="saveChanges"
          />
          <span class="ml-2">User</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="localNodeData.assignmentType" 
            value="role" 
            class="form-radio" 
            @change="saveChanges"
          />
          <span class="ml-2">Role</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="localNodeData.assignmentType" 
            value="variable" 
            class="form-radio" 
            @change="saveChanges"
          />
          <span class="ml-2">Process Variable</span>
        </label>
      </div>
    </div>
    
    <!-- User Assignment -->
    <div v-if="localNodeData.assignmentType === 'user'" class="form-group mb-4">
      <label class="form-label">Assign to Users</label>
      <div v-if="loading.users" class="py-2 text-gray-500 text-sm">
        Loading users...
      </div>
      <div v-else-if="users.length === 0" class="py-2 text-gray-500 text-sm">
        No users available
      </div>
      <div v-else class="max-h-60 overflow-y-auto border rounded-md divide-y">
        <div 
          v-for="user in users" 
          :key="user.userID"
          class="p-2 hover:bg-gray-50 flex items-center justify-between"
        >
          <div class="flex items-center">
            <input 
              type="checkbox" 
              :id="`user-${user.userID}`"
              :value="user.userID"
              v-model="localNodeData.assignedUsers"
              class="form-checkbox"
              @change="saveChanges"
            />
            <label :for="`user-${user.userID}`" class="ml-2 cursor-pointer flex-1">
              <div class="font-medium text-sm">{{ user.userFullName || user.userUsername }}</div>
              <div class="text-xs text-gray-500">{{ user.userEmail }}</div>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Role Assignment -->
    <div v-if="localNodeData.assignmentType === 'role'" class="form-group mb-4">
      <label class="form-label">Assign to Roles</label>
      <div v-if="loading.roles" class="py-2 text-gray-500 text-sm">
        Loading roles...
      </div>
      <div v-else-if="roles.length === 0" class="py-2 text-gray-500 text-sm">
        No roles available
      </div>
      <div v-else class="max-h-60 overflow-y-auto border rounded-md divide-y">
        <div 
          v-for="role in roles" 
          :key="role.roleID"
          class="p-2 hover:bg-gray-50 flex items-center justify-between"
        >
          <div class="flex items-center">
            <input 
              type="checkbox" 
              :id="`role-${role.roleID}`"
              :value="role.roleID"
              v-model="localNodeData.assignedRoles"
              class="form-checkbox"
              @change="saveChanges"
            />
            <label :for="`role-${role.roleID}`" class="ml-2 cursor-pointer flex-1">
              <div class="font-medium text-sm">{{ role.roleName }}</div>
              <div class="text-xs text-gray-500">{{ role.roleDescription }}</div>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Variable Assignment -->
    <div v-if="localNodeData.assignmentType === 'variable'" class="form-group mb-4">
      <label class="form-label">Assignee Variable</label>
      <select
        v-model="localNodeData.assigneeVariable"
        class="form-control"
        @change="saveChanges"
      >
        <option value="" disabled>Select a variable</option>
        <option
          v-for="variable in availableVariables"
          :key="variable.name"
          :value="variable.name"
        >
          {{ variable.label }}
        </option>
      </select>
      <small class="text-gray-500 text-xs mt-1 block">
        The selected variable should contain a user ID or a role ID.
      </small>
    </div>
    
    <!-- Additional Task Settings -->
    <div class="border-t border-gray-200 my-4 pt-4">
      <h4 class="text-base font-medium mb-2">Additional Settings</h4>
      
      <!-- Due Date -->
      <div class="form-group mb-4">
        <label class="form-label">Due Date</label>
        <div class="grid grid-cols-2 gap-3">
          <select
            v-model="localNodeData.dueDateType"
            class="form-control"
            @change="saveChanges"
          >
            <option value="none">No due date</option>
            <option value="fixed">Fixed duration</option>
            <option value="variable">From variable</option>
          </select>
          
          <div v-if="localNodeData.dueDateType === 'fixed'">
            <input
              type="number"
              v-model="localNodeData.dueDateDays"
              class="form-control"
              placeholder="Days"
              min="0"
              @blur="saveChanges"
            />
          </div>
          
          <div v-if="localNodeData.dueDateType === 'variable'">
            <select
              v-model="localNodeData.dueDateVariable"
              class="form-control"
              @change="saveChanges"
            >
              <option value="" disabled>Select a variable</option>
              <option
                v-for="variable in availableVariables"
                :key="variable.name"
                :value="variable.name"
              >
                {{ variable.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Priority -->
      <div class="form-group mb-4">
        <label class="form-label">Priority</label>
        <select
          v-model="localNodeData.priority"
          class="form-control"
          @change="saveChanges"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <!-- Instructions -->
      <div class="form-group mb-4">
        <label class="form-label">Task Instructions</label>
        <textarea
          v-model="localNodeData.instructions"
          class="form-control"
          rows="3"
          placeholder="Instructions for the assignee"
          @blur="saveChanges"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useVariableStore } from '@/stores/variableStore';

const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update']);

// Local state
const users = ref([]);
const roles = ref([]);
const loading = ref({
  users: false,
  roles: false
});

// Local state for node data
const localNodeData = ref({
  label: 'Task',
  description: '',
  assignmentType: 'user', // 'user', 'role', or 'variable'
  assignedUsers: [],
  assignedRoles: [],
  assigneeVariable: '',
  dueDateType: 'none', // 'none', 'fixed', or 'variable'
  dueDateDays: 3,
  dueDateVariable: '',
  priority: 'medium',
  instructions: ''
});

// Get the variable store for variables
const variableStore = useVariableStore();

// Watch for changes from parent props
watch(() => props.nodeData, (newNodeData) => {
  if (newNodeData) {
    // Create a deep copy to break reactivity chains with parent
    localNodeData.value = {
      label: newNodeData.label || 'Task',
      description: newNodeData.description || '',
      assignmentType: newNodeData.assignmentType || 'user',
      assignedUsers: Array.isArray(newNodeData.assignedUsers) ? [...newNodeData.assignedUsers] : [],
      assignedRoles: Array.isArray(newNodeData.assignedRoles) ? [...newNodeData.assignedRoles] : [],
      assigneeVariable: newNodeData.assigneeVariable || '',
      dueDateType: newNodeData.dueDateType || 'none',
      dueDateDays: newNodeData.dueDateDays || 3,
      dueDateVariable: newNodeData.dueDateVariable || '',
      priority: newNodeData.priority || 'medium',
      instructions: newNodeData.instructions || ''
    };
  }
}, { immediate: true, deep: true });

// Fetch users and roles when component is mounted
onMounted(async () => {
  await fetchUsers();
  await fetchRoles();
});

// Fetch users from API
async function fetchUsers() {
  loading.value.users = true;
  
  try {
    const response = await fetch('/api/users');
    const result = await response.json();
    
    if (result.success && Array.isArray(result.users)) {
      users.value = result.users;
    } else {
      console.error('Error fetching users:', result.error || 'Unknown error');
      users.value = [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    users.value = [];
  } finally {
    loading.value.users = false;
  }
}

// Fetch roles from API
async function fetchRoles() {
  loading.value.roles = true;
  
  try {
    const response = await fetch('/api/roles');
    const result = await response.json();
    
    if (result.success && Array.isArray(result.roles)) {
      roles.value = result.roles;
    } else {
      console.error('Error fetching roles:', result.error || 'Unknown error');
      roles.value = [];
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    roles.value = [];
  } finally {
    loading.value.roles = false;
  }
}

// Save changes by emitting them to parent
function saveChanges() {
  // Create a clean copy of the data to avoid reactivity issues
  const nodeDataCopy = JSON.parse(JSON.stringify(localNodeData.value));
  
  // Emit the updated data to parent
  emit('update', nodeDataCopy);
}
</script>

<style scoped>
.task-node-configuration {
  padding: 1rem;
  background-color: #f8f8f8;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.form-radio {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}
</style> 