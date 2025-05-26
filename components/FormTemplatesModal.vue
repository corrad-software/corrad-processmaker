<template>
  <RsModal v-model="showModal" title="Form Templates" size="xl" position="center">
    <div class="form-templates-container">
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
            <div v-if="imageExists(template.image)" class="w-full h-full flex items-center justify-center">
              <img :src="template.image" :alt="template.name" class="max-w-full max-h-full rounded">
            </div>
            <div v-else class="w-full h-full flex flex-col items-center justify-center">
              <img :src="getPlaceholderImage(template)" :alt="template.name" class="max-w-full max-h-full rounded">
              <div class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-70">
                <div class="template-icon-wrapper">
                  <svg v-if="template.category === 'business'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M20 7h-4a2 2 0 0 0-2 2v1H8V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11h20V9a2 2 0 0 0-2-2Z"></path>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <svg v-else-if="template.category === 'interactive'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                  </svg>
                  <svg v-else-if="template.category === 'surveys'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M2 12h5"></path>
                    <path d="M9 12h5"></path>
                    <path d="M16 12h6"></path>
                    <path d="M3 20h18"></path>
                    <path d="M3 4h18"></path>
                    <path d="M12 4v16"></path>
                  </svg>
                  <svg v-else-if="template.category === 'advanced'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <span class="text-sm text-gray-500 mt-2">{{ template.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="p-4">
            <h3 class="font-medium text-lg mb-1">{{ template.name }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ template.description }}</p>
            
            <div class="flex items-center text-xs text-gray-500 mb-4">
              <div class="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                  <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path>
                  <path d="M2 20h20"></path>
                  <path d="M14 12v.01"></path>
                </svg>
                <span>{{ template.hasScript ? 'With Script' : 'No Script' }}</span>
              </div>
              <div class="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                  <circle cx="13.5" cy="6.5" r="2.5"></circle>
                  <circle cx="19" cy="17" r="2"></circle>
                  <circle cx="6" cy="12" r="2"></circle>
                  <path d="M14 8.5V10a2 2 0 0 1-2 2h-1.5"></path>
                  <path d="M18 15.5v-2a2 2 0 0 0-2-2h-1.5"></path>
                </svg>
                <span>{{ template.hasCSS ? 'Custom CSS' : 'No CSS' }}</span>
              </div>
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>{{ template.componentCount }} components</span>
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
  { id: 'business', name: 'Business Forms' },
  { id: 'interactive', name: 'Interactive Forms' },
  { id: 'surveys', name: 'Surveys & Feedback' },
  { id: 'advanced', name: 'Advanced Examples' }
];

// Active category
const activeCategory = ref('all');

// Templates data
const templates = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'A modern contact form with optimized grid layout and smart field widths.',
    category: 'business',
    image: null,
    hasScript: false,
    hasCSS: false,
    componentCount: 8,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Contact Us',
          level: 2,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          type: 'text',
          label: 'Full Name',
          name: 'full_name',
          placeholder: 'Enter your full name',
          help: '',
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'email',
        name: 'Email',
        category: 'Basic Inputs',
        icon: 'material-symbols:mail-outline',
        defaultProps: {
          type: 'email',
          label: 'Email Address',
          name: 'email',
          placeholder: 'email@example.com',
          help: 'We\'ll never share your email with anyone else.',
          validation: 'required|email',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'tel',
        name: 'Phone Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:phone',
        defaultProps: {
          type: 'tel',
          label: 'Phone Number',
          name: 'phone',
          placeholder: '+1 (555) 123-4567',
          help: 'Optional - for urgent inquiries',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'url',
        name: 'URL Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:link',
        defaultProps: {
          type: 'url',
          label: 'Website (Optional)',
          name: 'website',
          placeholder: 'https://your-website.com',
          help: 'Your company or personal website',
          validation: 'url',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'textarea',
        name: 'Text Area',
        category: 'Basic Inputs',
        icon: 'material-symbols:article-outline',
        defaultProps: {
          type: 'textarea',
          label: 'Message',
          name: 'message',
          placeholder: 'Tell us how we can help you...',
          help: '',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Layout',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Send Message',
          name: 'submit_button',
          buttonType: 'submit',
          variant: 'primary',
          size: 'lg',
          disabled: false,
          onClick: '',
          width: '33%',
          gridColumn: 'span 4'
        }
      }
    ],
    script: '',
    css: ''
  },
  {
    id: 'customer-survey',
    name: 'Customer Satisfaction Survey',
    description: 'A comprehensive customer feedback form with modern selection components and smart grid layout.',
    category: 'surveys',
    image: null,
    hasScript: false,
    hasCSS: false,
    componentCount: 13,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Customer Satisfaction Survey',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Thank you for taking the time to provide your feedback. Your input helps us improve our services.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          type: 'text',
          label: 'Customer Name',
          name: 'customer_name',
          placeholder: 'Enter your name',
          help: '',
          validation: 'required',
          width: '33%',
          gridColumn: 'span 4'
        }
      },
      {
        type: 'email',
        name: 'Email',
        category: 'Basic Inputs',
        icon: 'material-symbols:mail-outline',
        defaultProps: {
          type: 'email',
          label: 'Email Address',
          name: 'email',
          placeholder: 'email@example.com',
          help: 'For follow-up questions if needed',
          validation: 'email',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'date',
        name: 'Date Picker',
        category: 'Date and Time',
        icon: 'material-symbols:calendar-month-outline',
        defaultProps: {
          type: 'date',
          label: 'Service Date',
          name: 'service_date',
          placeholder: '',
          help: 'When did you use our service?',
          validation: '',
          width: '25%',
          gridColumn: 'span 3'
        }
      },
      {
        type: 'divider',
        name: 'Divider',
        category: 'Layout',
        icon: 'material-symbols:horizontal-rule',
        defaultProps: {
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Rate Your Experience',
          level: 3,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'radio',
        name: 'Radio Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:radio-button-checked-outline',
        defaultProps: {
          label: 'Overall Satisfaction',
          name: 'satisfaction_rating',
          help: 'How would you rate your overall experience?',
          options: [
            { label: '⭐ Very Dissatisfied', value: '1' },
            { label: '⭐⭐ Dissatisfied', value: '2' },
            { label: '⭐⭐⭐ Neutral', value: '3' },
            { label: '⭐⭐⭐⭐ Satisfied', value: '4' },
            { label: '⭐⭐⭐⭐⭐ Very Satisfied', value: '5' }
          ],
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'range',
        name: 'Range Slider',
        category: 'Basic Inputs',
        icon: 'material-symbols:linear-scale',
        defaultProps: {
          label: 'Likelihood to Recommend (0-10)',
          name: 'nps_score',
          placeholder: '',
          help: 'How likely are you to recommend us to a friend?',
          min: 0,
          max: 10,
          step: 1,
          value: 5,
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'checkbox',
        name: 'Checkbox Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:check-box-outline',
        defaultProps: {
          label: 'What did you like most about our service?',
          name: 'liked_aspects',
          help: 'Select all that apply',
          options: [
            { label: 'Fast response time', value: 'fast_response' },
            { label: 'Professional staff', value: 'professional_staff' },
            { label: 'Quality of service', value: 'quality_service' },
            { label: 'Competitive pricing', value: 'competitive_pricing' },
            { label: 'Easy to use', value: 'easy_to_use' },
            { label: 'Good communication', value: 'good_communication' }
          ],
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'textarea',
        name: 'Text Area',
        category: 'Basic Inputs',
        icon: 'material-symbols:article-outline',
        defaultProps: {
          type: 'textarea',
          label: 'Additional Comments',
          name: 'additional_comments',
          placeholder: 'Please share any other feedback or suggestions...',
          help: 'Your detailed feedback helps us improve our services',
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'switch',
        name: 'Switch Toggle',
        category: 'Selection Inputs',
        icon: 'material-symbols:toggle-on',
        defaultProps: {
          label: 'Allow follow-up contact',
          name: 'allow_followup',
          help: 'We may contact you to discuss your feedback',
          value: false,
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Layout',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Submit Survey',
          name: 'submit_survey',
          buttonType: 'submit',
          variant: 'primary',
          size: 'lg',
          disabled: false,
          onClick: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      }
    ],
    script: '',
    css: ''
  },
  {
    id: 'dynamic-pricing',
    name: 'Dynamic Pricing Calculator',
    description: 'Interactive pricing calculator with real-time updates.',
    category: 'interactive',
    image: null, // Will use placeholder
    hasScript: true,
    hasCSS: true,
    componentCount: 11,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Product Pricing Calculator',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Use this calculator to estimate the cost of your product based on your specifications.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'select',
        name: 'Select Dropdown',
        category: 'Selection Inputs',
        icon: 'material-symbols:arrow-drop-down-circle-outline',
        defaultProps: {
          label: 'Product Type',
          name: 'product_type',
          placeholder: 'Select product type',
          help: 'Different products have different base prices',
          options: [
            { label: 'Basic', value: 'basic' },
            { label: 'Premium', value: 'premium' },
            { label: 'Enterprise', value: 'enterprise' }
          ],
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'color',
        name: 'Color Picker',
        category: 'Date and Time',
        icon: 'material-symbols:palette',
        defaultProps: {
          label: 'Product Color',
          name: 'product_color',
          value: '#3b82f6',
          help: 'Choose your preferred color',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'range',
        name: 'Range Slider',
        category: 'Date and Time',
        icon: 'material-symbols:linear-scale',
        defaultProps: {
          label: 'Quantity',
          name: 'quantity',
          min: 1,
          max: 100,
          step: 1,
          value: 10,
          help: 'How many items do you need?',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'switch',
        name: 'Switch Toggle',
        category: 'Selection Inputs',
        icon: 'material-symbols:toggle-on',
        defaultProps: {
          label: 'Rush Delivery (+20%)',
          name: 'rush_delivery',
          help: 'Enable rush delivery for faster processing',
          value: false,
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'switch',
        name: 'Switch Toggle',
        category: 'Selection Inputs',
        icon: 'material-symbols:toggle-on',
        defaultProps: {
          label: 'Extended Warranty (+$50)',
          name: 'extended_warranty',
          help: 'Add extended warranty coverage',
          value: false,
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'checkbox',
        name: 'Checkbox Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:check-box-outline',
        defaultProps: {
          label: 'Additional Options',
          name: 'add_options',
          help: 'Select all that apply (additional fees may apply)',
          options: [
            { label: 'Premium support (+$10)', value: 'premium_support' },
            { label: 'Custom packaging (+$5)', value: 'custom_packaging' },
            { label: 'Installation service (+$25)', value: 'installation' }
          ],
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'divider',
        name: 'Divider',
        category: 'Layout',
        icon: 'material-symbols:horizontal-rule',
        defaultProps: {
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Pricing Summary',
          level: 2,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Total Price',
          name: 'total_price',
          placeholder: '$0.00',
          help: 'This is the estimated total price based on your selections',
          validation: '',
          readonly: true,
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Advanced',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Get Quote',
          name: 'get_quote_button',
          help: 'Generate a detailed quote based on your selections',
          buttonType: 'button',
          variant: 'primary',
          size: 'lg',
          disabled: false,
          onClick: 'alert("Quote generated! Total: " + this.getField("total_price"));',
          width: '50%',
          gridColumn: 'span 6'
        }
      }
    ],
    script: `// Calculate total price based on quantity and options
this.onFieldChange(['quantity', 'product_type', 'add_options', 'rush_delivery', 'extended_warranty'], () => {
  const quantity = parseInt(this.getField('quantity')) || 0;
  const productType = this.getField('product_type');
  const addOptions = this.getField('add_options') || [];
  const rushDelivery = this.getField('rush_delivery') || false;
  const extendedWarranty = this.getField('extended_warranty') || false;
  
  // Base prices
  const prices = {
    'basic': 10,
    'premium': 25,
    'enterprise': 50
  };
  
  // Option prices
  const optionPrices = {
    'premium_support': 10,
    'custom_packaging': 5,
    'installation': 25
  };
  
  // Calculate base price
  let basePrice = prices[productType] || 0;
  
  // Add options
  let optionsTotal = 0;
  addOptions.forEach(option => {
    optionsTotal += optionPrices[option] || 0;
  });
  
  // Add extended warranty if selected
  if (extendedWarranty) {
    optionsTotal += 50;
  }
  
  // Calculate subtotal
  let subtotal = (basePrice + optionsTotal) * quantity;
  
  // Apply rush delivery surcharge (20%)
  if (rushDelivery) {
    subtotal *= 1.2;
  }
  
  // Update total field
  this.setField('total_price', '$' + subtotal.toFixed(2));
});

// Initialize calculation on form load
this.onLoad(() => {
  // Trigger initial calculation
  this.setField('quantity', 10);
  this.setField('product_type', 'basic');
});`,
    css: `.form-field[data-name="total_price"] {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  padding: 16px;
  font-size: 1.2em;
  font-weight: bold;
}`
  },
  {
    id: 'job-application',
    name: 'Job Application Form',
    description: 'Comprehensive job application with conditional fields and validation.',
    category: 'business',
    image: null, // Will use placeholder
    hasScript: true,
    hasCSS: false,
    componentCount: 15,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Job Application Form',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Please complete all required fields in this application form.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Full Name',
          name: 'full_name',
          placeholder: 'Enter your full name',
          help: '',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'email',
        name: 'Email',
        category: 'Basic Inputs',
        icon: 'material-symbols:mail-outline',
        defaultProps: {
          label: 'Email Address',
          name: 'email',
          placeholder: 'email@example.com',
          help: '',
          validation: 'required,email',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Phone Number',
          name: 'phone',
          placeholder: 'Enter your phone number',
          help: '',
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'select',
        name: 'Select Dropdown',
        category: 'Selection Inputs',
        icon: 'material-symbols:arrow-drop-down-circle-outline',
        defaultProps: {
          label: 'Highest Education Level',
          name: 'education_level',
          placeholder: 'Select your education level',
          help: '',
          options: [
            { label: 'High School', value: 'highschool' },
            { label: 'College Degree', value: 'college' },
            { label: 'Graduate Degree', value: 'graduate' },
            { label: 'Other', value: 'other' }
          ],
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'University/College Name',
          name: 'university_name',
          placeholder: 'Enter your university or college name',
          help: '',
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Degree/Certification',
          name: 'degree',
          placeholder: 'Enter your degree or certification',
          help: '',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Graduation Year',
          name: 'graduation_year',
          placeholder: 'YYYY',
          help: '',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'number',
        name: 'Number',
        category: 'Basic Inputs',
        icon: 'material-symbols:counter-1-outline',
        defaultProps: {
          label: 'Years of Experience',
          name: 'years_experience',
          placeholder: '0',
          help: 'Enter your years of professional experience',
          validation: 'required,min:0',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Previous Employer',
          name: 'previous_employer',
          placeholder: 'Enter your previous employer',
          help: '',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Job Title',
          name: 'job_title',
          placeholder: 'Enter your job title',
          help: '',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'checkbox',
        name: 'Checkbox Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:check-box-outline',
        defaultProps: {
          label: 'Skills',
          name: 'skills',
          help: 'Select all skills that apply',
          options: [
            { label: 'Communication', value: 'communication' },
            { label: 'Problem Solving', value: 'problem_solving' },
            { label: 'Teamwork', value: 'teamwork' },
            { label: 'Leadership', value: 'leadership' },
            { label: 'Technical', value: 'technical' }
          ],
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'textarea',
        name: 'Text Area',
        category: 'Basic Inputs',
        icon: 'material-symbols:article-outline',
        defaultProps: {
          label: 'Cover Letter / Additional Information',
          name: 'cover_letter',
          placeholder: 'Tell us why you are a good fit for this position...',
          help: '',
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'file',
        name: 'File Upload',
        category: 'Advanced',
        icon: 'material-symbols:upload-file-outline',
        defaultProps: {
          label: 'Resume Upload',
          name: 'resume',
          help: 'Upload your resume (PDF or Word document)',
          accept: '.pdf,.doc,.docx',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      }
    ],
    script: `// Show relevant education fields based on highest education
this.onFieldChange('education_level', (value) => {
  if (value === 'college' || value === 'graduate') {
    this.showField('university_name');
    this.showField('degree');
    this.showField('graduation_year');
  } else {
    this.hideField('university_name');
    this.hideField('degree');
    this.hideField('graduation_year');
  }
});

// Show relevant fields based on experience
this.onFieldChange('years_experience', (value) => {
  const years = parseInt(value) || 0;
  if (years > 0) {
    this.showField('previous_employer');
    this.showField('job_title');
  } else {
    this.hideField('previous_employer');
    this.hideField('job_title');
  }
});`,
    css: ''
  },
  {
    id: 'registration-form',
    name: 'Event Registration',
    description: 'Event registration form with dynamic pricing and session selection.',
    category: 'interactive',
    image: null, // Will use placeholder
    hasScript: true,
    hasCSS: true,
    componentCount: 10,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Event Registration Form',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Register for our upcoming event. Please fill out all required information below.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Full Name',
          name: 'full_name',
          placeholder: 'Enter your full name',
          help: '',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'email',
        name: 'Email',
        category: 'Basic Inputs',
        icon: 'material-symbols:mail-outline',
        defaultProps: {
          label: 'Email Address',
          name: 'email',
          placeholder: 'email@example.com',
          help: 'Registration confirmation will be sent to this email',
          validation: 'required,email',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'select',
        name: 'Select Dropdown',
        category: 'Selection Inputs',
        icon: 'material-symbols:arrow-drop-down-circle-outline',
        defaultProps: {
          label: 'Ticket Type',
          name: 'ticket_type',
          placeholder: 'Select ticket type',
          help: '',
          options: [
            { label: 'Standard ($99)', value: 'standard' },
            { label: 'Premium ($199)', value: 'premium' },
            { label: 'VIP ($299)', value: 'vip' }
          ],
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'checkbox',
        name: 'Checkbox Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:check-box-outline',
        defaultProps: {
          label: 'Workshop Sessions',
          name: 'workshops',
          help: 'Select the workshops you want to attend ($49 each)',
          options: [
            { label: 'Morning: Introduction to the Topic', value: 'workshop1' },
            { label: 'Afternoon: Advanced Techniques', value: 'workshop2' },
            { label: 'Evening: Networking Session', value: 'workshop3' }
          ],
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'radio',
        name: 'Radio Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:radio-button-checked-outline',
        defaultProps: {
          label: 'Meal Plan Included?',
          name: 'meal_plan',
          help: 'Would you like meals included with your registration?',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
          ],
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'textarea',
        name: 'Text Area',
        category: 'Basic Inputs',
        icon: 'material-symbols:article-outline',
        defaultProps: {
          label: 'Dietary Restrictions',
          name: 'dietary_restrictions',
          placeholder: 'Please list any dietary restrictions or allergies...',
          help: '',
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Total Cost ($)',
          name: 'total_cost',
          help: 'This is the calculated total cost based on your selections',
          readonly: true,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Payment will be collected separately after registration is complete.',
          width: '100%',
          gridColumn: 'span 12'
        }
      }
    ],
    script: `// Calculate registration cost
this.onFieldChange(['ticket_type', 'workshops'], () => {
  const ticketType = this.getField('ticket_type');
  const workshops = this.getField('workshops') || [];
  
  // Ticket prices
  const prices = {
    'standard': 99,
    'premium': 199,
    'vip': 299
  };
  
  // Workshop price (each)
  const workshopPrice = 49;
  
  // Calculate total
  let total = prices[ticketType] || 0;
  total += workshops.length * workshopPrice;
  
  this.setField('total_cost', total);
});

// Toggle dietary restrictions based on meal plan
this.onFieldChange('meal_plan', (value) => {
  if (value === 'yes') {
    this.showField('dietary_restrictions');
  } else {
    this.hideField('dietary_restrictions');
  }
});`,
    css: `.form-field[data-name="workshops"] {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
}

.form-field[data-name="total_cost"] {
  font-size: 1.5em;
  font-weight: bold;
  color: #0f172a;
  background: #f1f5f9;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}`
  },
  {
    id: 'multi-step-form',
    name: 'Multi-Step Wizard',
    description: 'Advanced multi-step form with progress tracking and validation.',
    category: 'advanced',
    image: null, // Will use placeholder
    hasScript: true,
    hasCSS: true,
    componentCount: 17,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Multi-Step Form Wizard',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'This is a multi-step form with progress tracking. Complete each step to continue.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'info-display',
        name: 'Info Display',
        category: 'Layout',
        icon: 'material-symbols:info-outline',
        defaultProps: {
          title: 'Progress',
          name: 'progress_display',
          fields: [
            { label: 'Current Step', value: 'Step 1 of 4', key: 'step_indicator' }
          ],
          layout: 'vertical',
          showBorder: true,
          backgroundColor: '#f1f5f9',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      // Step 1: Personal Information
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Step 1: Personal Information',
          name: 'step1_heading',
          level: 2,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Full Name',
          name: 'step1.full_name',
          placeholder: 'Enter your full name',
          help: '',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'email',
        name: 'Email',
        category: 'Basic Inputs',
        icon: 'material-symbols:mail-outline',
        defaultProps: {
          label: 'Email Address',
          name: 'step1.email',
          placeholder: 'email@example.com',
          help: '',
          validation: 'required,email',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Phone Number',
          name: 'step1.phone',
          placeholder: 'Enter your phone number',
          help: '',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      // Step 2: Address Information
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Step 2: Address Information',
          name: 'step2_heading',
          level: 2,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'Street Address',
          name: 'step2.street',
          placeholder: 'Enter your street address',
          help: '',
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'City',
          name: 'step2.city',
          placeholder: 'Enter your city',
          help: '',
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          label: 'State/Province',
          name: 'step2.state',
          placeholder: 'Enter your state or province',
          help: '',
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      // Step 3: Additional Information
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Step 3: Additional Information',
          name: 'step3_heading',
          level: 2,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'select',
        name: 'Select Dropdown',
        category: 'Selection Inputs',
        icon: 'material-symbols:arrow-drop-down-circle-outline',
        defaultProps: {
          label: 'How did you hear about us?',
          name: 'step3.referral_source',
          placeholder: 'Select an option',
          help: '',
          options: [
            { label: 'Search Engine', value: 'search' },
            { label: 'Social Media', value: 'social' },
            { label: 'Friend or Colleague', value: 'referral' },
            { label: 'Advertisement', value: 'ad' },
            { label: 'Other', value: 'other' }
          ],
          validation: 'required',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'textarea',
        name: 'Text Area',
        category: 'Basic Inputs',
        icon: 'material-symbols:article-outline',
        defaultProps: {
          label: 'Additional Comments',
          name: 'step3.comments',
          placeholder: 'Please share any additional information...',
          help: '',
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      // Step 4: Review and Submit
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Step 4: Review and Submit',
          name: 'step4_heading',
          level: 2,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Please review your information before submitting the form.',
          name: 'step4.review_text',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      // Navigation Buttons
      {
        type: 'divider',
        name: 'Divider',
        category: 'Layout',
        icon: 'material-symbols:horizontal-rule',
        defaultProps: {
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Advanced',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Previous Step',
          name: 'prev_button',
          help: 'Go to previous step',
          buttonType: 'button',
          variant: 'secondary',
          size: 'md',
          disabled: false,
          width: '33%',
          gridColumn: 'span 4'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Advanced',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Next Step',
          name: 'next_button',
          help: 'Go to next step',
          buttonType: 'button',
          variant: 'primary',
          size: 'md',
          disabled: false,
          width: '33%',
          gridColumn: 'span 4'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Advanced',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Submit Form',
          name: 'submit_button',
          help: 'Submit the completed form',
          buttonType: 'submit',
          variant: 'success',
          size: 'md',
          disabled: false,
          width: '33%',
          gridColumn: 'span 4'
        }
      }
    ],
    script: `// Multi-step form navigation
let currentStep = 1;
const totalSteps = 4;

// Initialize - hide all steps except first
this.hideField('step2');
this.hideField('step3');
this.hideField('step4');
this.hideField('prev_button');

// Next button handler
this.onFieldChange('next_button', () => {
  if (currentStep < totalSteps) {
    // Hide current step
    this.hideField('step' + currentStep);
    
    // Show next step
    currentStep++;
    this.showField('step' + currentStep);
    
    // Update navigation
    this.showField('prev_button');
    if (currentStep === totalSteps) {
      this.hideField('next_button');
      this.showField('submit_button');
    }
    
    // Update progress
    updateProgress();
  }
});

// Previous button handler
this.onFieldChange('prev_button', () => {
  if (currentStep > 1) {
    // Hide current step
    this.hideField('step' + currentStep);
    
    // Show previous step
    currentStep--;
    this.showField('step' + currentStep);
    
    // Update navigation
    if (currentStep === 1) {
      this.hideField('prev_button');
    }
    if (currentStep < totalSteps) {
      this.showField('next_button');
      this.hideField('submit_button');
    }
    
    // Update progress
    updateProgress();
  }
});

// Update progress indicator
function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.querySelector('.progress-bar').style.width = progress + '%';
  document.querySelector('.step-indicator').textContent = 'Step ' + currentStep + ' of ' + totalSteps;
}

// Initial progress setup
updateProgress();`,
    css: `.form-container {
  position: relative;
}

.progress-container {
  margin-bottom: 24px;
}

.progress-bar-bg {
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  transition: width 0.3s ease;
  width: 25%;
}

.step-indicator {
  text-align: center;
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

[data-name^="step"] {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}`
  },
  {
    id: 'modern-registration',
    name: 'Modern User Registration',
    description: 'Comprehensive registration form showcasing all new input types and grid layout optimization.',
    category: 'business',
    image: null,
    hasScript: false,
    hasCSS: true,
    componentCount: 16,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Create Your Account',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'paragraph',
        name: 'Paragraph',
        category: 'Layout',
        icon: 'material-symbols:text-snippet-outline',
        defaultProps: {
          value: 'Please fill in your information to get started. All fields marked with * are required.',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          type: 'text',
          label: 'First Name *',
          name: 'first_name',
          placeholder: 'John',
          help: '',
          validation: 'required',
          width: '33%',
          gridColumn: 'span 4'
        }
      },
      {
        type: 'text',
        name: 'Text Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:text-fields',
        defaultProps: {
          type: 'text',
          label: 'Last Name *',
          name: 'last_name',
          placeholder: 'Doe',
          help: '',
          validation: 'required',
          width: '33%',
          gridColumn: 'span 4'
        }
      },
      {
        type: 'date',
        name: 'Date Picker',
        category: 'Date and Time',
        icon: 'material-symbols:calendar-month-outline',
        defaultProps: {
          type: 'date',
          label: 'Birth Date *',
          name: 'birth_date',
          placeholder: '',
          help: 'Must be 18 or older',
          validation: 'required',
          width: '33%',
          gridColumn: 'span 4'
        }
      },
      {
        type: 'email',
        name: 'Email',
        category: 'Basic Inputs',
        icon: 'material-symbols:mail-outline',
        defaultProps: {
          type: 'email',
          label: 'Email Address *',
          name: 'email',
          placeholder: 'john.doe@example.com',
          help: 'This will be your login username',
          validation: 'required|email',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'tel',
        name: 'Phone Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:phone',
        defaultProps: {
          type: 'tel',
          label: 'Phone Number',
          name: 'phone',
          placeholder: '+1 (555) 123-4567',
          help: 'Optional - for account recovery',
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'password',
        name: 'Password',
        category: 'Basic Inputs',
        icon: 'material-symbols:password',
        defaultProps: {
          type: 'password',
          label: 'Password *',
          name: 'password',
          placeholder: 'Enter a strong password',
          help: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
          validation: 'required|min:8',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'password',
        name: 'Password',
        category: 'Basic Inputs',
        icon: 'material-symbols:password',
        defaultProps: {
          type: 'password',
          label: 'Confirm Password *',
          name: 'password_confirmation',
          placeholder: 'Re-enter your password',
          help: 'Must match the password above',
          validation: 'required|confirmed:password',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'divider',
        name: 'Divider',
        category: 'Layout',
        icon: 'material-symbols:horizontal-rule',
        defaultProps: {
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Profile Information',
          level: 3,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'url',
        name: 'URL Field',
        category: 'Basic Inputs',
        icon: 'material-symbols:link',
        defaultProps: {
          type: 'url',
          label: 'Website/Portfolio',
          name: 'website',
          placeholder: 'https://your-website.com',
          help: 'Optional - your personal or business website',
          validation: 'url',
          width: '75%',
          gridColumn: 'span 9'
        }
      },
      {
        type: 'color',
        name: 'Color Picker',
        category: 'Basic Inputs',
        icon: 'material-symbols:palette-outline',
        defaultProps: {
          type: 'color',
          label: 'Favorite Color',
          name: 'favorite_color',
          placeholder: '',
          help: 'For profile customization',
          validation: '',
          value: '#3b82f6',
          width: '25%',
          gridColumn: 'span 3'
        }
      },
      {
        type: 'select',
        name: 'Select Dropdown',
        category: 'Selection Inputs',
        icon: 'material-symbols:arrow-drop-down-circle-outline',
        defaultProps: {
          label: 'Country *',
          name: 'country',
          placeholder: 'Select your country',
          help: '',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'UK' },
            { label: 'Germany', value: 'DE' },
            { label: 'France', value: 'FR' },
            { label: 'Australia', value: 'AU' },
            { label: 'Other', value: 'other' }
          ],
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'checkbox',
        name: 'Checkbox Group',
        category: 'Selection Inputs',
        icon: 'material-symbols:check-box-outline',
        defaultProps: {
          label: 'Interests',
          name: 'interests',
          help: 'Select all that apply to personalize your experience',
          options: [
            { label: '💻 Technology', value: 'technology' },
            { label: '🎨 Design', value: 'design' },
            { label: '📈 Business', value: 'business' },
            { label: '🏃 Sports', value: 'sports' },
            { label: '🎵 Music', value: 'music' },
            { label: '📚 Reading', value: 'reading' }
          ],
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'switch',
        name: 'Switch Toggle',
        category: 'Selection Inputs',
        icon: 'material-symbols:toggle-on',
        defaultProps: {
          label: 'Email notifications',
          name: 'email_notifications',
          help: 'Receive updates and newsletters',
          value: true,
          validation: '',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'switch',
        name: 'Switch Toggle',
        category: 'Selection Inputs',
        icon: 'material-symbols:toggle-on',
        defaultProps: {
          label: 'Terms and Conditions *',
          name: 'agree_terms',
          help: 'I agree to the terms and conditions',
          value: false,
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Layout',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Create Account',
          name: 'create_account',
          buttonType: 'submit',
          variant: 'primary',
          size: 'lg',
          disabled: false,
          onClick: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      }
    ],
    script: '',
    css: `.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.form-field {
  background: rgba(255,255,255,0.95);
  border-radius: 8px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.form-field label {
  font-weight: 600;
  color: #1f2937;
}

.form-field input, .form-field select, .form-field textarea {
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.form-field input:focus, .form-field select:focus, .form-field textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}`
  },
  {
    id: 'advanced-showcase',
    name: 'Advanced Components Showcase',
    description: 'Demonstrates all advanced components including OTP, masked input, file uploads, and info displays.',
    category: 'advanced',
    image: null,
    hasScript: true,
    hasCSS: true,
    componentCount: 12,
    components: [
      {
        type: 'heading',
        name: 'Heading',
        category: 'Layout',
        icon: 'material-symbols:title',
        defaultProps: {
          value: 'Advanced Components Demo',
          level: 1,
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'info-display',
        name: 'Info Display',
        category: 'Layout',
        icon: 'material-symbols:info-outline',
        defaultProps: {
          title: 'User Information',
          fields: [
            { label: 'Name', value: 'John Doe', key: 'user_name' },
            { label: 'Email', value: 'john@example.com', key: 'user_email' },
            { label: 'Status', value: 'Active Member', key: 'user_status' }
          ],
          layout: 'horizontal',
          showBorder: true,
          backgroundColor: '#f8fafc',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'mask',
        name: 'Masked Input',
        category: 'Advanced',
        icon: 'material-symbols:input',
        defaultProps: {
          type: 'mask',
          label: 'Phone Number',
          name: 'phone_mask',
          placeholder: '(000) 000-0000',
          help: 'US phone number format',
          mask: '(999) 999-9999',
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'otp',
        name: 'OTP Input',
        category: 'Advanced',
        icon: 'material-symbols:pin-outline',
        defaultProps: {
          type: 'otp',
          label: 'Verification Code',
          name: 'otp_code',
          placeholder: '',
          help: 'Enter the 6-digit code sent to your phone',
          length: 6,
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'file',
        name: 'File Upload',
        category: 'Advanced',
        icon: 'material-symbols:upload-file-outline',
        defaultProps: {
          type: 'file',
          label: 'Profile Picture',
          name: 'profile_picture',
          placeholder: '',
          help: 'Upload a profile picture (max 2MB)',
          accept: 'image/*',
          maxSize: '2MB',
          validation: '',
          width: '75%',
          gridColumn: 'span 9'
        }
      },
      {
        type: 'range',
        name: 'Range Slider',
        category: 'Basic Inputs',
        icon: 'material-symbols:linear-scale',
        defaultProps: {
          label: 'Experience Level',
          name: 'experience_level',
          placeholder: '',
          help: 'Years of experience (0-20)',
          min: 0,
          max: 20,
          step: 1,
          value: 5,
          validation: '',
          width: '25%',
          gridColumn: 'span 3'
        }
      },
      {
        type: 'dropzone',
        name: 'File Drop Zone',
        category: 'Advanced',
        icon: 'material-symbols:cloud-upload-outline',
        defaultProps: {
          type: 'dropzone',
          label: 'Document Upload',
          name: 'documents',
          placeholder: 'Drag and drop files here or click to browse',
          help: 'Upload multiple documents (PDF, DOC, DOCX)',
          accept: '.pdf,.doc,.docx',
          multiple: true,
          maxSize: '10MB',
          validation: '',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'datetime-local',
        name: 'Date & Time',
        category: 'Date and Time',
        icon: 'material-symbols:schedule',
        defaultProps: {
          type: 'datetime-local',
          label: 'Appointment Time',
          name: 'appointment_time',
          placeholder: '',
          help: 'Select your preferred appointment date and time',
          validation: 'required',
          width: '50%',
          gridColumn: 'span 6'
        }
      },
      {
        type: 'time',
        name: 'Time Picker',
        category: 'Date and Time',
        icon: 'material-symbols:access-time',
        defaultProps: {
          type: 'time',
          label: 'Reminder Time',
          name: 'reminder_time',
          placeholder: '',
          help: 'Daily reminder time',
          validation: '',
          width: '25%',
          gridColumn: 'span 3'
        }
      },
      {
        type: 'number',
        name: 'Number',
        category: 'Basic Inputs',
        icon: 'material-symbols:counter-1-outline',
        defaultProps: {
          type: 'number',
          label: 'Budget',
          name: 'budget',
          placeholder: '1000',
          help: 'Project budget in USD',
          min: 0,
          max: 100000,
          step: 100,
          validation: 'required|min:100',
          width: '25%',
          gridColumn: 'span 3'
        }
      },
      {
        type: 'hidden',
        name: 'Hidden Field',
        category: 'Advanced',
        icon: 'material-symbols:visibility-off-outline',
        defaultProps: {
          type: 'hidden',
          name: 'form_id',
          value: 'advanced-demo-form',
          width: '100%',
          gridColumn: 'span 12'
        }
      },
      {
        type: 'button',
        name: 'Button',
        category: 'Layout',
        icon: 'material-symbols:smart-button',
        defaultProps: {
          label: 'Submit Form',
          name: 'submit_advanced',
          buttonType: 'submit',
          variant: 'primary',
          size: 'lg',
          disabled: false,
          onClick: 'console.log("Advanced form submitted!")',
          width: '50%',
          gridColumn: 'span 6'
        }
      }
    ],
    script: `// Real-time budget formatting
this.onFieldChange('budget', (value) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
  
  // Update display somewhere in the form
  console.log('Budget formatted:', formatted);
});

// OTP validation
this.onFieldChange('otp_code', (value) => {
  if (value.length === 6) {
    // Simulate OTP verification
    setTimeout(() => {
      if (value === '123456') {
        this.showSuccess('OTP verified successfully!');
      } else {
        this.showError('Invalid OTP code. Try 123456 for demo.');
      }
    }, 1000);
  }
});`,
    css: `.form-container {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.form-field[data-name="info_display"] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.form-field[data-name="dropzone"] {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.form-field[data-name="dropzone"]:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.form-field[data-name="otp_code"] input {
  text-align: center;
  font-family: monospace;
  font-size: 1.2rem;
  letter-spacing: 0.5rem;
}`
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

// Get placeholder image based on category
const getPlaceholderImage = (template) => {
  return `/images/form-template-placeholder.svg`;
};

// Helper function to check if image exists
const imageExists = (path) => {
  if (!path) return false;
  
  // For demo purposes, assume paths with '/images/templates/' exist
  // In a real app, this could be improved with actual image checks
  return path.startsWith('/images/templates/');
};

// Template image with fallback
const getTemplateImage = (template) => {
  if (imageExists(template.image)) {
    return template.image;
  }
  return getPlaceholderImage(template);
};

// Get icon based on category
const getCategoryIcon = (category) => {
  const icons = {
    'business': 'material-symbols:business-center-outline',
    'interactive': 'material-symbols:touch-app-outline',
    'surveys': 'material-symbols:poll-outline',
    'advanced': 'material-symbols:code-blocks-outline'
  };
  
  return icons[category] || 'material-symbols:description-outline';
};
</script>

<style scoped>
.form-templates-container {
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

.template-preview img {
  max-height: 100%;
  object-fit: cover;
}

.template-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style> 