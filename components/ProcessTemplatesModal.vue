<template>
  <RsModal v-model="showModal" title="Process Flow Templates" size="xl" position="center">
    <div class="process-templates-container">
      <!-- Templates Categories -->
      <div class="mb-6">
        <div class="flex space-x-2 mb-4 border-b border-gray-200">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-4 py-2 text-sm font-medium"
            :class="activeCategory === cat.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
      
      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="template in filteredTemplates" :key="template.id" class="template-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="template-preview bg-gray-50 p-4 border-b relative">
            <div class="w-full h-full flex flex-col items-center justify-center">
              <div class="template-icon-wrapper">
                <Icon :name="getTemplateIcon(template)" class="w-12 h-12 text-gray-400" />
              </div>
              <span class="text-sm text-gray-500 mt-2">{{ template.name }}</span>
            </div>
          </div>
          
          <div class="p-4">
            <h3 class="font-medium text-lg mb-1">{{ template.name }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ template.description }}</p>
            
            <div class="flex items-center text-xs text-gray-500 mb-4">
              <div class="flex items-center mr-4">
                <Icon name="material-symbols:account-tree" class="mr-1 w-3 h-3" />
                <span>{{ template.nodeCount }} nodes</span>
              </div>
              <div class="flex items-center mr-4">
                <Icon name="material-symbols:route" class="mr-1 w-3 h-3" />
                <span>{{ template.edgeCount }} connections</span>
              </div>
              <div class="flex items-center">
                <Icon name="material-symbols:timer" class="mr-1 w-3 h-3" />
                <span>{{ template.complexity }}</span>
              </div>
            </div>
            
            <RsButton @click="useTemplate(template)" variant="primary" size="sm" class="w-full">
              Use Template
            </RsButton>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
        <Icon name="material-symbols:category-outline" class="w-16 h-16 mb-4 text-gray-300" />
        <p class="text-base font-medium">No templates found</p>
        <p class="text-sm mt-1">Try selecting a different category</p>
      </div>
    </div>
  </RsModal>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'select-template']);

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Categories
const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'approval', name: 'Approval Workflows' },
  { id: 'onboarding', name: 'Onboarding' },
  { id: 'support', name: 'Support & Service' },
  { id: 'business', name: 'Business Operations' },
  { id: 'automation', name: 'Automation' }
];

// Active category
const activeCategory = ref('all');

// Process flow templates
const templates = [
  {
    id: 'simple-approval',
    name: 'Simple Approval Workflow',
    description: 'A basic approval process with form submission, review, and notification.',
    category: 'approval',
    complexity: 'Simple',
    nodeCount: 6,
    edgeCount: 5,
    variables: [
      {
        name: 'approval_status',
        type: 'string',
        scope: 'process',
        description: 'Status of the approval request (approved/rejected)',
        defaultValue: 'pending'
      },
      {
        name: 'requester_email',
        type: 'string',
        scope: 'process',
        description: 'Email address of the person who submitted the request',
        defaultValue: ''
      },
      {
        name: 'manager_email',
        type: 'string',
        scope: 'process',
        description: 'Email address of the approving manager',
        defaultValue: ''
      }
    ],
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 100 },
        data: {
          label: 'Start',
          description: 'Begin approval process'
        }
      },
      {
        id: 'form-1',
        type: 'form',
        position: { x: 300, y: 100 },
        data: {
          label: 'Submit Request',
          description: 'Employee submits approval request',
          formId: null,
          formName: 'Approval Request Form'
        }
      },
      {
        id: 'notification-1',
        type: 'notification',
        position: { x: 500, y: 100 },
        data: {
          label: 'Notify Manager',
          description: 'Send notification to manager',
          notificationType: 'info',
          recipientType: 'role',
          recipientRole: 'manager',
          subject: 'New approval request',
          message: 'A new approval request requires your review.',
          priority: 'medium'
        }
      },
      {
        id: 'form-2',
        type: 'form',
        position: { x: 700, y: 100 },
        data: {
          label: 'Manager Review',
          description: 'Manager reviews and approves/rejects',
          formId: null,
          formName: 'Manager Review Form'
        }
      },
      {
        id: 'gateway-1',
        type: 'gateway',
        position: { x: 900, y: 100 },
        data: {
          label: 'Approved?',
          description: 'Check if request was approved',
          conditions: [
            {
              variable: 'approval_status',
              operator: 'eq',
              value: 'approved',
              output: 'Approved'
            }
          ],
          defaultPath: 'Rejected'
        }
      },
      {
        id: 'notification-2',
        type: 'notification',
        position: { x: 1100, y: 50 },
        data: {
          label: 'Notify Approval',
          description: 'Send approval notification',
          notificationType: 'success',
          recipientType: 'variable',
          recipientVariable: 'requester_email',
          subject: 'Request Approved',
          message: 'Your request has been approved.',
          priority: 'high'
        }
      },
      {
        id: 'notification-3',
        type: 'notification',
        position: { x: 1100, y: 150 },
        data: {
          label: 'Notify Rejection',
          description: 'Send rejection notification',
          notificationType: 'warning',
          recipientType: 'variable',
          recipientVariable: 'requester_email',
          subject: 'Request Rejected',
          message: 'Your request has been rejected.',
          priority: 'medium'
        }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 1300, y: 100 },
        data: {
          label: 'End',
          description: 'Process completed'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'form-1', sourceHandle: 'start-1-bottom', targetHandle: 'form-1-top', type: 'smoothstep' },
      { id: 'e2', source: 'form-1', target: 'notification-1', sourceHandle: 'form-1-bottom', targetHandle: 'notification-1-top', type: 'smoothstep' },
      { id: 'e3', source: 'notification-1', target: 'form-2', sourceHandle: 'notification-1-bottom', targetHandle: 'form-2-top', type: 'smoothstep' },
      { id: 'e4', source: 'form-2', target: 'gateway-1', sourceHandle: 'form-2-bottom', targetHandle: 'gateway-1-top', type: 'smoothstep' },
      { id: 'e5', source: 'gateway-1', target: 'notification-2', sourceHandle: 'gateway-1-right', targetHandle: 'notification-2-left', type: 'smoothstep', label: 'Approved' },
      { id: 'e6', source: 'gateway-1', target: 'notification-3', sourceHandle: 'gateway-1-bottom', targetHandle: 'notification-3-left', type: 'smoothstep', label: 'Rejected' },
      { id: 'e7', source: 'notification-2', target: 'end-1', sourceHandle: 'notification-2-bottom', targetHandle: 'end-1-top', type: 'smoothstep' },
      { id: 'e8', source: 'notification-3', target: 'end-1', sourceHandle: 'notification-3-bottom', targetHandle: 'end-1-left', type: 'smoothstep' }
    ]
  },
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding',
    description: 'Complete employee onboarding process with multiple stages and notifications.',
    category: 'onboarding',
    complexity: 'Complex',
    nodeCount: 9,
    edgeCount: 8,
    variables: [
      {
        name: 'employee_name',
        type: 'string',
        scope: 'process',
        description: 'Full name of the new employee',
        defaultValue: ''
      },
      {
        name: 'employee_email',
        type: 'string',
        scope: 'process',
        description: 'Email address of the new employee',
        defaultValue: ''
      },
      {
        name: 'age',
        type: 'int',
        scope: 'process',
        description: 'Age of the employee',
        defaultValue: 18
      },
      {
        name: 'age_valid',
        type: 'boolean',
        scope: 'process',
        description: 'Whether the employee meets age requirements',
        defaultValue: false
      },
      {
        name: 'employee_account',
        type: 'object',
        scope: 'process',
        description: 'Employee account creation response data',
        defaultValue: {}
      }
    ],
    nodes: [
      {
        id: 'start-2',
        type: 'start',
        position: { x: 100, y: 200 },
        data: {
          label: 'Start',
          description: 'Begin onboarding process'
        }
      },
      {
        id: 'form-3',
        type: 'form',
        position: { x: 300, y: 200 },
        data: {
          label: 'Personal Info',
          description: 'Collect employee personal information',
          formId: null,
          formName: 'Employee Personal Information'
        }
      },
      {
        id: 'business-rule-1',
        type: 'business-rule',
        position: { x: 500, y: 200 },
        data: {
          label: 'Validate Info',
          description: 'Validate employee information',
          ruleGroups: [
            {
              name: 'Age Validation',
              conditions: [
                { 
                  variable: 'age', 
                  operator: 'gte', 
                  value: '18',
                  minValue: null,
                  maxValue: null
                }
              ],
              actions: [
                { 
                  type: 'set_variable', 
                  variable: 'age_valid', 
                  value: 'true' 
                }
              ]
            }
          ]
        }
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 700, y: 200 },
        data: {
          label: 'Create Account',
          description: 'Create employee account in system',
          apiMethod: 'POST',
          apiUrl: '/api/employees/create',
          requestBody: '{"name": "{{employee_name}}", "email": "{{employee_email}}"}',
          outputVariable: 'employee_account'
        }
      },
      {
        id: 'form-4',
        type: 'form',
        position: { x: 900, y: 200 },
        data: {
          label: 'Equipment Request',
          description: 'Request necessary equipment',
          formId: null,
          formName: 'Equipment Request Form'
        }
      },
      {
        id: 'notification-4',
        type: 'notification',
        position: { x: 1100, y: 200 },
        data: {
          label: 'Notify IT',
          description: 'Notify IT department about equipment',
          notificationType: 'info',
          recipientType: 'role',
          recipientRole: 'it_admin',
          subject: 'New employee equipment request',
          message: 'Please prepare equipment for new employee.',
          priority: 'medium'
        }
      },
      {
        id: 'form-5',
        type: 'form',
        position: { x: 1300, y: 200 },
        data: {
          label: 'Training Schedule',
          description: 'Schedule training sessions',
          formId: null,
          formName: 'Training Schedule Form'
        }
      },
      {
        id: 'notification-5',
        type: 'notification',
        position: { x: 1500, y: 200 },
        data: {
          label: 'Welcome Email',
          description: 'Send welcome email to employee',
          notificationType: 'success',
          recipientType: 'variable',
          recipientVariable: 'employee_email',
          subject: 'Welcome to the team!',
          message: 'Welcome to our company! Your onboarding is complete.',
          priority: 'high'
        }
      },
      {
        id: 'end-2',
        type: 'end',
        position: { x: 1700, y: 200 },
        data: {
          label: 'End',
          description: 'Onboarding completed'
        }
      }
    ],
    edges: [
      { id: 'e9', source: 'start-2', target: 'form-3', sourceHandle: 'start-2-bottom', targetHandle: 'form-3-top', type: 'smoothstep' },
      { id: 'e10', source: 'form-3', target: 'business-rule-1', sourceHandle: 'form-3-bottom', targetHandle: 'business-rule-1-top', type: 'smoothstep' },
      { id: 'e11', source: 'business-rule-1', target: 'api-1', sourceHandle: 'business-rule-1-bottom', targetHandle: 'api-1-top', type: 'smoothstep' },
      { id: 'e12', source: 'api-1', target: 'form-4', sourceHandle: 'api-1-bottom', targetHandle: 'form-4-top', type: 'smoothstep' },
      { id: 'e13', source: 'form-4', target: 'notification-4', sourceHandle: 'form-4-bottom', targetHandle: 'notification-4-top', type: 'smoothstep' },
      { id: 'e14', source: 'notification-4', target: 'form-5', sourceHandle: 'notification-4-bottom', targetHandle: 'form-5-top', type: 'smoothstep' },
      { id: 'e15', source: 'form-5', target: 'notification-5', sourceHandle: 'form-5-bottom', targetHandle: 'notification-5-top', type: 'smoothstep' },
      { id: 'e16', source: 'notification-5', target: 'end-2', sourceHandle: 'notification-5-bottom', targetHandle: 'end-2-top', type: 'smoothstep' }
    ]
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket Process',
    description: 'Customer support ticket workflow with escalation and resolution tracking.',
    category: 'support',
    complexity: 'Medium',
    nodeCount: 8,
    edgeCount: 9,
    variables: [
      {
        name: 'issue_type',
        type: 'string',
        scope: 'process',
        description: 'Type of issue reported (system_down, bug, feature_request, etc.)',
        defaultValue: 'general'
      },
      {
        name: 'priority',
        type: 'string',
        scope: 'process',
        description: 'Priority level of the ticket (high, medium, low)',
        defaultValue: 'medium'
      },
      {
        name: 'customer_email',
        type: 'string',
        scope: 'process',
        description: 'Email address of the customer who submitted the ticket',
        defaultValue: ''
      },
      {
        name: 'ticket_id',
        type: 'string',
        scope: 'process',
        description: 'Unique identifier for the support ticket',
        defaultValue: ''
      }
    ],
    nodes: [
      {
        id: 'start-3',
        type: 'start',
        position: { x: 100, y: 300 },
        data: {
          label: 'Start',
          description: 'Customer support request initiated'
        }
      },
      {
        id: 'form-6',
        type: 'form',
        position: { x: 300, y: 300 },
        data: {
          label: 'Submit Ticket',
          description: 'Customer submits support ticket',
          formId: null,
          formName: 'Support Ticket Form'
        }
      },
      {
        id: 'business-rule-2',
        type: 'business-rule',
        position: { x: 500, y: 300 },
        data: {
          label: 'Categorize Priority',
          description: 'Automatically set ticket priority',
          ruleGroups: [
            {
              name: 'High Priority',
              conditions: [
                { 
                  variable: 'issue_type', 
                  operator: 'eq', 
                  value: 'system_down',
                  minValue: null,
                  maxValue: null
                }
              ],
              actions: [
                { 
                  type: 'set_variable', 
                  variable: 'priority', 
                  value: 'high' 
                }
              ]
            },
            {
              name: 'Medium Priority',
              conditions: [
                { 
                  variable: 'issue_type', 
                  operator: 'eq', 
                  value: 'bug',
                  minValue: null,
                  maxValue: null
                }
              ],
              actions: [
                { 
                  type: 'set_variable', 
                  variable: 'priority', 
                  value: 'medium' 
                }
              ]
            }
          ]
        }
      },
      {
        id: 'gateway-2',
        type: 'gateway',
        position: { x: 700, y: 300 },
        data: {
          label: 'High Priority?',
          description: 'Check if ticket is high priority',
          conditions: [
            {
              variable: 'priority',
              operator: 'eq',
              value: 'high',
              output: 'High Priority'
            }
          ],
          defaultPath: 'Normal Priority'
        }
      },
      {
        id: 'notification-6',
        type: 'notification',
        position: { x: 900, y: 200 },
        data: {
          label: 'Escalate to Senior',
          description: 'Notify senior support team',
          notificationType: 'warning',
          recipientType: 'role',
          recipientRole: 'senior_support',
          subject: 'High priority ticket escalation',
          message: 'High priority support ticket requires immediate attention.',
          priority: 'high'
        }
      },
      {
        id: 'notification-7',
        type: 'notification',
        position: { x: 900, y: 400 },
        data: {
          label: 'Assign to Support',
          description: 'Assign to regular support team',
          notificationType: 'info',
          recipientType: 'role',
          recipientRole: 'support',
          subject: 'New support ticket assigned',
          message: 'New support ticket has been assigned to you.',
          priority: 'medium'
        }
      },
      {
        id: 'form-7',
        type: 'form',
        position: { x: 1100, y: 300 },
        data: {
          label: 'Resolve Ticket',
          description: 'Support agent resolves the ticket',
          formId: null,
          formName: 'Ticket Resolution Form'
        }
      },
      {
        id: 'notification-8',
        type: 'notification',
        position: { x: 1300, y: 300 },
        data: {
          label: 'Notify Customer',
          description: 'Send resolution notification to customer',
          notificationType: 'success',
          recipientType: 'variable',
          recipientVariable: 'customer_email',
          subject: 'Your support ticket has been resolved',
          message: 'Your support ticket has been resolved. Thank you for contacting us.',
          priority: 'medium'
        }
      },
      {
        id: 'end-3',
        type: 'end',
        position: { x: 1500, y: 300 },
        data: {
          label: 'End',
          description: 'Support ticket resolved'
        }
      }
    ],
    edges: [
      { id: 'e17', source: 'start-3', target: 'form-6', sourceHandle: 'start-3-bottom', targetHandle: 'form-6-top', type: 'smoothstep' },
      { id: 'e18', source: 'form-6', target: 'business-rule-2', sourceHandle: 'form-6-bottom', targetHandle: 'business-rule-2-top', type: 'smoothstep' },
      { id: 'e19', source: 'business-rule-2', target: 'gateway-2', sourceHandle: 'business-rule-2-bottom', targetHandle: 'gateway-2-top', type: 'smoothstep' },
      { id: 'e20', source: 'gateway-2', target: 'notification-6', sourceHandle: 'gateway-2-right', targetHandle: 'notification-6-left', type: 'smoothstep', label: 'High Priority' },
      { id: 'e21', source: 'gateway-2', target: 'notification-7', sourceHandle: 'gateway-2-bottom', targetHandle: 'notification-7-left', type: 'smoothstep', label: 'Normal Priority' },
      { id: 'e22', source: 'notification-6', target: 'form-7', sourceHandle: 'notification-6-bottom', targetHandle: 'form-7-left', type: 'smoothstep' },
      { id: 'e23', source: 'notification-7', target: 'form-7', sourceHandle: 'notification-7-bottom', targetHandle: 'form-7-top', type: 'smoothstep' },
      { id: 'e24', source: 'form-7', target: 'notification-8', sourceHandle: 'form-7-bottom', targetHandle: 'notification-8-top', type: 'smoothstep' },
      { id: 'e25', source: 'notification-8', target: 'end-3', sourceHandle: 'notification-8-bottom', targetHandle: 'end-3-top', type: 'smoothstep' }
    ]
  },
  {
    id: 'expense-reimbursement',
    name: 'Expense Reimbursement',
    description: 'Employee expense reimbursement with approval workflow and payment processing.',
    category: 'business',
    complexity: 'Medium',
    nodeCount: 7,
    edgeCount: 8,
    variables: [
      {
        name: 'total_amount',
        type: 'decimal',
        scope: 'process',
        description: 'Total amount of expenses claimed',
        defaultValue: 0
      },
      {
        name: 'auto_approve',
        type: 'boolean',
        scope: 'process',
        description: 'Whether expenses can be auto-approved',
        defaultValue: false
      },
      {
        name: 'employee_id',
        type: 'string',
        scope: 'process',
        description: 'ID of the employee submitting expenses',
        defaultValue: ''
      },
      {
        name: 'employee_email',
        type: 'string',
        scope: 'process',
        description: 'Email of the employee submitting expenses',
        defaultValue: ''
      },
      {
        name: 'payment_result',
        type: 'object',
        scope: 'process',
        description: 'Result of payment processing',
        defaultValue: {}
      }
    ],
    nodes: [
      {
        id: 'start-4',
        type: 'start',
        position: { x: 100, y: 400 },
        data: {
          label: 'Start',
          description: 'Begin expense reimbursement process'
        }
      },
      {
        id: 'form-8',
        type: 'form',
        position: { x: 300, y: 400 },
        data: {
          label: 'Submit Expenses',
          description: 'Employee submits expense report',
          formId: null,
          formName: 'Expense Report Form'
        }
      },
      {
        id: 'business-rule-3',
        type: 'business-rule',
        position: { x: 500, y: 400 },
        data: {
          label: 'Validate Expenses',
          description: 'Validate expense amounts and receipts',
          ruleGroups: [
            {
              name: 'Amount Check',
              conditions: [
                { 
                  variable: 'total_amount', 
                  operator: 'lte', 
                  value: '1000',
                  minValue: null,
                  maxValue: null
                }
              ],
              actions: [
                { type: 'set_variable', variable: 'auto_approve', value: 'true' }
              ]
            }
          ]
        }
      },
      {
        id: 'gateway-3',
        type: 'gateway',
        position: { x: 700, y: 400 },
        data: {
          label: 'Auto Approve?',
          description: 'Check if expenses can be auto-approved',
          conditions: [
            {
              variable: 'auto_approve',
              operator: 'eq',
              value: 'true',
              output: 'Auto Approve'
            }
          ],
          defaultPath: 'Needs Approval'
        }
      },
      {
        id: 'form-9',
        type: 'form',
        position: { x: 900, y: 300 },
        data: {
          label: 'Manager Approval',
          description: 'Manager reviews and approves expenses',
          formId: null,
          formName: 'Manager Approval Form'
        }
      },
      {
        id: 'api-2',
        type: 'api',
        position: { x: 1100, y: 400 },
        data: {
          label: 'Process Payment',
          description: 'Process reimbursement payment',
          apiMethod: 'POST',
          apiUrl: '/api/payments/reimburse',
          requestBody: '{"employee_id": "{{employee_id}}", "amount": "{{total_amount}}"}',
          outputVariable: 'payment_result'
        }
      },
      {
        id: 'notification-9',
        type: 'notification',
        position: { x: 1300, y: 400 },
        data: {
          label: 'Payment Confirmation',
          description: 'Notify employee of payment',
          notificationType: 'success',
          recipientType: 'variable',
          recipientVariable: 'employee_email',
          subject: 'Expense reimbursement processed',
          message: 'Your expense reimbursement has been processed and payment is on the way.',
          priority: 'medium'
        }
      },
      {
        id: 'end-4',
        type: 'end',
        position: { x: 1500, y: 400 },
        data: {
          label: 'End',
          description: 'Reimbursement completed'
        }
      }
    ],
    edges: [
      { id: 'e26', source: 'start-4', target: 'form-8', sourceHandle: 'start-4-bottom', targetHandle: 'form-8-top', type: 'smoothstep' },
      { id: 'e27', source: 'form-8', target: 'business-rule-3', sourceHandle: 'form-8-bottom', targetHandle: 'business-rule-3-top', type: 'smoothstep' },
      { id: 'e28', source: 'business-rule-3', target: 'gateway-3', sourceHandle: 'business-rule-3-bottom', targetHandle: 'gateway-3-top', type: 'smoothstep' },
      { id: 'e29', source: 'gateway-3', target: 'form-9', sourceHandle: 'gateway-3-right', targetHandle: 'form-9-left', type: 'smoothstep', label: 'Needs Approval' },
      { id: 'e30', source: 'gateway-3', target: 'api-2', sourceHandle: 'gateway-3-bottom', targetHandle: 'api-2-left', type: 'smoothstep', label: 'Auto Approve' },
      { id: 'e31', source: 'form-9', target: 'api-2', sourceHandle: 'form-9-bottom', targetHandle: 'api-2-top', type: 'smoothstep' },
      { id: 'e32', source: 'api-2', target: 'notification-9', sourceHandle: 'api-2-bottom', targetHandle: 'notification-9-top', type: 'smoothstep' },
      { id: 'e33', source: 'notification-9', target: 'end-4', sourceHandle: 'notification-9-bottom', targetHandle: 'end-4-top', type: 'smoothstep' }
    ]
  },
  {
    id: 'automated-backup',
    name: 'Automated Data Backup',
    description: 'Automated data backup process with validation and notification.',
    category: 'automation',
    complexity: 'Simple',
    nodeCount: 6,
    edgeCount: 6,
    variables: [
      {
        name: 'current_timestamp',
        type: 'datetime',
        scope: 'process',
        description: 'Current timestamp for backup operation',
        defaultValue: ''
      },
      {
        name: 'backup_result',
        type: 'object',
        scope: 'process',
        description: 'Result of backup operation',
        defaultValue: {}
      },
      {
        name: 'backup_valid',
        type: 'boolean',
        scope: 'process',
        description: 'Whether backup was successful',
        defaultValue: false
      },
      {
        name: 'log_result',
        type: 'object',
        scope: 'process',
        description: 'Result of logging operation',
        defaultValue: {}
      }
    ],
    nodes: [
      {
        id: 'start-5',
        type: 'start',
        position: { x: 100, y: 500 },
        data: {
          label: 'Start',
          description: 'Begin automated backup process'
        }
      },
      {
        id: 'api-3',
        type: 'api',
        position: { x: 300, y: 500 },
        data: {
          label: 'Backup Database',
          description: 'Perform database backup',
          apiMethod: 'POST',
          apiUrl: '/api/backup/database',
          requestBody: '{"timestamp": "{{current_timestamp}}"}',
          outputVariable: 'backup_result'
        }
      },
      {
        id: 'business-rule-4',
        type: 'business-rule',
        position: { x: 500, y: 500 },
        data: {
          label: 'Validate Backup',
          description: 'Validate backup completion',
          ruleGroups: [
            {
              name: 'Backup Success',
              conditions: [
                { 
                  variable: 'backup_result.status', 
                  operator: 'eq', 
                  value: 'success',
                  minValue: null,
                  maxValue: null
                }
              ],
              actions: [
                { type: 'set_variable', variable: 'backup_valid', value: 'true' }
              ]
            }
          ]
        }
      },
      {
        id: 'api-4',
        type: 'api',
        position: { x: 700, y: 500 },
        data: {
          label: 'Update Backup Log',
          description: 'Log backup status',
          apiMethod: 'POST',
          apiUrl: '/api/logs/backup',
          requestBody: '{"status": "{{backup_result.status}}", "timestamp": "{{current_timestamp}}"}',
          outputVariable: 'log_result'
        }
      },
      {
        id: 'notification-10',
        type: 'notification',
        position: { x: 900, y: 500 },
        data: {
          label: 'Notify Admin',
          description: 'Send backup status to administrator',
          notificationType: 'info',
          recipientType: 'role',
          recipientRole: 'system_admin',
          subject: 'Daily backup completed',
          message: 'Automated database backup has completed successfully.',
          priority: 'low'
        }
      },
      {
        id: 'end-5',
        type: 'end',
        position: { x: 1100, y: 500 },
        data: {
          label: 'End',
          description: 'Backup process completed'
        }
      }
    ],
    edges: [
      { id: 'e34', source: 'start-5', target: 'api-3', sourceHandle: 'start-5-bottom', targetHandle: 'api-3-top', type: 'smoothstep' },
      { id: 'e35', source: 'api-3', target: 'business-rule-4', sourceHandle: 'api-3-bottom', targetHandle: 'business-rule-4-top', type: 'smoothstep' },
      { id: 'e36', source: 'business-rule-4', target: 'api-4', sourceHandle: 'business-rule-4-bottom', targetHandle: 'api-4-top', type: 'smoothstep' },
      { id: 'e37', source: 'api-4', target: 'notification-10', sourceHandle: 'api-4-bottom', targetHandle: 'notification-10-top', type: 'smoothstep' },
      { id: 'e38', source: 'notification-10', target: 'end-5', sourceHandle: 'notification-10-bottom', targetHandle: 'end-5-top', type: 'smoothstep' }
    ]
  },
  {
    id: 'basic-linear',
    name: 'Basic Linear Process',
    description: 'Simple start-to-end process for learning the basics.',
    category: 'approval',
    complexity: 'Simple',
    nodeCount: 4,
    edgeCount: 3,
    variables: [
      {
        name: 'user_email',
        type: 'string',
        scope: 'process',
        description: 'Email address of the user submitting the form',
        defaultValue: ''
      },
      {
        name: 'submission_id',
        type: 'string',
        scope: 'process',
        description: 'Unique identifier for the form submission',
        defaultValue: ''
      }
    ],
    nodes: [
      {
        id: 'start-6',
        type: 'start',
        position: { x: 100, y: 600 },
        data: {
          label: 'Start',
          description: 'Process begins'
        }
      },
      {
        id: 'form-10',
        type: 'form',
        position: { x: 300, y: 600 },
        data: {
          label: 'Input Form',
          description: 'Collect user input',
          formId: null,
          formName: 'Basic Input Form'
        }
      },
      {
        id: 'notification-11',
        type: 'notification',
        position: { x: 500, y: 600 },
        data: {
          label: 'Send Notification',
          description: 'Send confirmation notification',
          notificationType: 'success',
          recipientType: 'variable',
          recipientVariable: 'user_email',
          subject: 'Form submitted successfully',
          message: 'Your form has been submitted successfully.',
          priority: 'medium'
        }
      },
      {
        id: 'end-6',
        type: 'end',
        position: { x: 700, y: 600 },
        data: {
          label: 'End',
          description: 'Process completed'
        }
      }
    ],
    edges: [
      { id: 'e39', source: 'start-6', target: 'form-10', sourceHandle: 'start-6-bottom', targetHandle: 'form-10-top', type: 'smoothstep' },
      { id: 'e40', source: 'form-10', target: 'notification-11', sourceHandle: 'form-10-bottom', targetHandle: 'notification-11-top', type: 'smoothstep' },
      { id: 'e41', source: 'notification-11', target: 'end-6', sourceHandle: 'notification-11-bottom', targetHandle: 'end-6-top', type: 'smoothstep' }
    ]
  }
];

// Filtered templates based on active category
const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') {
    return templates;
  }
  return templates.filter(template => template.category === activeCategory.value);
});

// Handle template selection
function useTemplate(template) {
  emit('select-template', template);
  showModal.value = false;
}

// Get icon based on template category/type
const getTemplateIcon = (template) => {
  const icons = {
    'approval': 'material-symbols:check-circle-outline',
    'onboarding': 'material-symbols:person-add-outline',
    'support': 'material-symbols:support-agent',
    'business': 'material-symbols:business-center-outline',
    'automation': 'material-symbols:precision-manufacturing-outline'
  };
  
  return icons[template.category] || 'material-symbols:account-tree';
};
</script>

<style scoped>
.process-templates-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem;
}

.template-card {
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
}

.template-preview {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.template-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid #e2e8f0;
}
</style> 