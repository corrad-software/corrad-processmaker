import { h, markRaw } from 'vue';
import { Handle, Position } from '@vue-flow/core';

// Custom node renderer
const CustomNode = markRaw({
  template: `
    <div 
      :class="['custom-node', 'node-' + type, selected ? 'selected' : '']"
      @click="onClick"
    >
      <Handle
        v-if="type !== 'start'"
        type="target"
        position="top"
        :class="'handle-' + type + '-input'"
      />
      
      <div class="custom-node-content">
        <template v-if="type === 'task' || type === 'form' || type === 'script'">
          <div class="flex items-center mb-1">
            <div class="custom-node-icon">
              <slot name="icon"></slot>
            </div>
            <div class="custom-node-title">{{ nodeLabel }}</div>
            <div class="custom-node-badge" v-if="showBadge">
              <slot name="badge"></slot>
            </div>
          </div>
          <slot></slot>
        </template>
        
        <template v-else>
          <div class="custom-node-icon" v-if="type !== 'gateway'">
            <slot name="icon"></slot>
          </div>
          <div class="custom-node-title">{{ nodeLabel }}</div>
          <slot></slot>
        </template>
      </div>

      <Handle
        v-if="type !== 'end'"
        type="source"
        position="bottom"
        :class="'handle-' + type + '-output'"
      />
    </div>
  `,
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // First try the label prop, then try data.label, then provide a default
      return this.label || (this.data && this.data.label) || this.type || 'Node';
    },
    showBadge() {
      return this.$slots.badge;
    }
  },
  methods: {
    onClick() {
      this.$emit('node-click', this.id);
    }
  },
  components: {
    Handle
  }
});

// Task node
export const TaskNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'Task';
    },
    
    // Helper method to get assignment display text
    assignmentText() {
      if (!this.data) return 'Unassigned';
      
      const { assignmentType, assignedUsers, assignedRoles, assigneeVariable } = this.data;
      
      if (assignmentType === 'user' && Array.isArray(assignedUsers) && assignedUsers.length > 0) {
        return `${assignedUsers.length} User${assignedUsers.length > 1 ? 's' : ''}`;
      }
      
      if (assignmentType === 'role' && Array.isArray(assignedRoles) && assignedRoles.length > 0) {
        return `${assignedRoles.length} Role${assignedRoles.length > 1 ? 's' : ''}`;
      }
      
      if (assignmentType === 'variable' && assigneeVariable) {
        return `Variable: ${assigneeVariable}`;
      }
      
      return 'Unassigned';
    },
    
    // Helper to determine priority class
    priorityClass() {
      if (!this.data || !this.data.priority) return '';
      
      const priorityColors = {
        low: 'text-green-500',
        medium: 'text-blue-500',
        high: 'text-orange-500',
        urgent: 'text-red-500'
      };
      
      return priorityColors[this.data.priority] || '';
    },
    
    // Helper to get priority label
    priorityLabel() {
      if (!this.data || !this.data.priority) return 'None';
      return this.data.priority.charAt(0).toUpperCase() + this.data.priority.slice(1);
    },
    
    // Helper for due date
    dueLabel() {
      if (!this.data || !this.data.dueDateType || this.data.dueDateType === 'none') {
        return 'Not set';
      }
      
      if (this.data.dueDateType === 'fixed') {
        return `${this.data.dueDateDays || 0} days`;
      }
      
      return `Variable: ${this.data.dueDateVariable || 'none'}`;
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'task',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-blue-500' }, 'assignment'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'A general task'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Assigned:'),
          h('span', { class: 'node-rule-detail-value ml-1 font-medium text-blue-600' }, this.assignmentText)
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Priority:'),
          h('span', { 
            class: `node-rule-detail-value ml-1 font-medium ${this.priorityClass}` 
          }, this.priorityLabel)
        ]),
        this.data?.dueDateType !== 'none' && this.data?.dueDateType ?
          h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
            h('span', { class: 'node-rule-detail-label' }, 'Due:'),
            h('span', { class: 'node-rule-detail-value ml-1 font-medium text-blue-600' }, this.dueLabel)
          ]) : null
      ])
    });
  }
});

// Start node
export const StartNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'Start';
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'start',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-green-600' }, 'play_arrow'),
      default: () => null
    });
  }
});

// End node
export const EndNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'End';
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'end',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-red-600' }, 'stop'),
      default: () => null
    });
  }
});

// Decision/Gateway node
export const GatewayNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      return this.label || (this.data && this.data.label) || 'Decision Point';
    },
    
    totalPaths() {
      return Array.isArray(this.data?.conditions) ? this.data.conditions.length : 0;
    },
    
    totalConditions() {
      if (!Array.isArray(this.data?.conditions)) return 0;
      
      return this.data.conditions.reduce((total, group) => {
        return total + (Array.isArray(group.conditions) ? group.conditions.length : 0);
      }, 0);
    },
    
    conditionSummary() {
      if (this.totalPaths === 0) return 'No paths';
      
      const paths = this.data.conditions
        .map(group => group.output || 'Unlabeled')
        .filter(Boolean)
        .join(', ');
        
      return paths || 'Unconfigured paths';
    },
    
    defaultPath() {
      return this.data?.defaultPath || 'Default';
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'gateway',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-orange-500' }, 'call_split'),
      default: () => h('div', { class: 'gateway-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Decision based on conditions'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Paths:'),
          h('span', { class: 'node-rule-detail-value ml-1 font-medium text-orange-600' }, 
            this.totalPaths === 0 ? 'None' : this.totalPaths
          )
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Default:'),
          h('span', { class: 'node-rule-detail-value ml-1 font-medium text-orange-600' }, 
            this.defaultPath
          )
        ])
      ])
    });
  }
});

// Form node
export const FormNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'Form Task';
    },
    formName() {
      return this.data?.formName || 'None selected';
    },
    hasForm() {
      return !!(this.data?.formId && this.data?.formName);
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'form',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-purple-500' }, 'description'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Form submission task'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Form:'),
          h('span', { 
            class: this.hasForm ? 'node-rule-detail-value ml-1 font-medium text-purple-600' : 'node-rule-detail-value ml-1 italic text-gray-400' 
          }, this.formName)
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Status:'),
          h('span', { 
            class: 'node-rule-detail-value ml-1 font-medium text-purple-600' 
          }, this.hasForm ? 'Configured' : 'Not configured')
        ])
      ])
    });
  }
});

// Script node
export const ScriptNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'Script';
    },
    scriptLanguage() {
      return this.data?.language || 'Not specified';
    },
    hasScript() {
      return !!this.data?.script;
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'script',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-gray-500' }, 'code'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Script execution'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Language:'),
          h('span', { class: 'node-rule-detail-value ml-1 font-medium text-gray-600' }, this.scriptLanguage)
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Script:'),
          h('span', { 
            class: 'node-rule-detail-value ml-1 font-medium text-gray-600' 
          }, this.hasScript ? 'Defined' : 'Not defined')
        ])
      ])
    });
  }
});

// API Call node
export const ApiCallNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      return this.label || (this.data && this.data.label) || 'API Call';
    },
    apiUrl() {
      return this.data?.apiUrl || 'No URL specified';
    },
    apiMethod() {
      return this.data?.apiMethod || 'GET';
    },
    isConfigured() {
      return !!this.data?.apiUrl;
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'api',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-indigo-500' }, 'api'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'External API call'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Method:'),
          h('span', { 
            class: 'node-rule-detail-value ml-1 font-medium text-indigo-600' 
          }, this.apiMethod)
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'URL:'),
          h('span', { 
            class: this.isConfigured ? 'node-rule-detail-value ml-1 font-medium text-indigo-600' : 'node-rule-detail-value ml-1 italic text-gray-400',
            style: 'max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'
          }, this.apiUrl)
        ])
      ])
    });
  }
});

// Business Rule node
export const BusinessRuleNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'Business Rule';
    },
    
    ruleConditionSummary() {
      // First try to use the new ruleGroups structure
      if (this.data && this.data.ruleGroups && Array.isArray(this.data.ruleGroups)) {
        // Count total conditions across all rule groups
        const totalConditions = this.data.ruleGroups.reduce((count, group) => {
          return count + (Array.isArray(group.conditions) ? group.conditions.length : 0);
        }, 0);
        
        return totalConditions === 0 ? 'No conditions' : 
               totalConditions === 1 ? '1 condition' : 
               `${totalConditions} conditions`;
      }
      
      // Fallback to old structure for backward compatibility
      if (this.data && this.data.conditions && Array.isArray(this.data.conditions)) {
        const count = this.data.conditions.length;
        return count === 1 ? '1 condition' : `${count} conditions`;
      }
      
      return 'No conditions defined';
    },
    
    ruleActionSummary() {
      // First try to use the new ruleGroups structure
      if (this.data && this.data.ruleGroups && Array.isArray(this.data.ruleGroups)) {
        // Count total actions across all rule groups
        const totalActions = this.data.ruleGroups.reduce((count, group) => {
          return count + (Array.isArray(group.actions) ? group.actions.length : 0);
        }, 0);
        
        return totalActions === 0 ? 'No actions' : 
               totalActions === 1 ? '1 action' : 
               `${totalActions} actions`;
      }
      
      // Fallback to old structure for backward compatibility
      if (this.data && this.data.actions && Array.isArray(this.data.actions)) {
        const count = this.data.actions.length;
        return count === 1 ? '1 action' : `${count} actions`;
      }
      
      return 'No actions defined';
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'business-rule',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-purple-600' }, 'rule'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Applies business rules to process data'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Conditions:'),
          h('span', { class: 'node-rule-detail-value ml-1 font-medium text-purple-600' }, this.ruleConditionSummary)
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Actions:'),
          h('span', { class: 'node-rule-detail-value ml-1 font-medium text-purple-600' }, this.ruleActionSummary)
        ])
      ])
    });
  }
});

// Notification node
export const NotificationNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      // Get label from either prop or data, with fallback
      return this.label || (this.data && this.data.label) || 'Notification';
    },
    notificationType() {
      return this.data?.notificationType || 'info';
    },
    notificationTypeIcon() {
      const types = {
        info: 'material-symbols:info-outline',
        success: 'material-symbols:check-circle-outline',
        warning: 'material-symbols:warning-outline',
        error: 'material-symbols:error-outline'
      };
      return types[this.notificationType] || types.info;
    },
    notificationTypeColor() {
      const colors = {
        info: 'text-blue-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        error: 'text-red-500'
      };
      return colors[this.notificationType] || colors.info;
    },
    recipientType() {
      return this.data?.recipientType || 'user';
    },
    recipientLabel() {
      const types = {
        user: 'User',
        role: 'Role',
        variable: 'Variable',
        email: 'Email'
      };
      return types[this.recipientType] || 'User';
    },
    isConfigured() {
      // Check if notification has required fields
      return !!(this.data?.subject && this.data?.message);
    }
  },
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'notification',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: `material-icons ${this.notificationTypeColor}` }, 'notifications'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Send notification'),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Type:'),
          h('span', { 
            class: `node-rule-detail-value ml-1 font-medium ${this.notificationTypeColor}` 
          }, this.notificationType.charAt(0).toUpperCase() + this.notificationType.slice(1))
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Recipient:'),
          h('span', { 
            class: 'node-rule-detail-value ml-1 font-medium text-blue-600' 
          }, this.recipientLabel)
        ]),
        h('div', { class: 'node-rule-detail flex items-center justify-between text-xs mt-1' }, [
          h('span', { class: 'node-rule-detail-label' }, 'Status:'),
          h('span', { 
            class: this.isConfigured ? 'node-rule-detail-value ml-1 font-medium text-green-600' : 'node-rule-detail-value ml-1 font-medium text-red-600'
          }, this.isConfigured ? 'Configured' : 'Not configured')
        ])
      ])
    });
  }
});

// Export the node types object to use with Vue Flow
export const nodeTypes = markRaw({
  task: TaskNode,
  start: StartNode,
  end: EndNode,
  gateway: GatewayNode,
  form: FormNode,
  script: ScriptNode,
  'business-rule': BusinessRuleNode,
  api: ApiCallNode,
  notification: NotificationNode
});

// Default CSS for the nodes to be imported where needed
export const nodeStyles = `
.custom-node {
  position: relative;
  color: #333;
  font-size: 12px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.custom-node.selected {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

/* Base styles for different node types */
.node-task, .node-form, .node-script, .node-api {
  width: 180px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid #e0e0e0;
}

.node-gateway {
  width: 120px !important;
  height: 120px !important;
  background: white;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #f97316;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-start, .node-end {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node-start {
  background: #e8f5e9;
  border: 1px solid #4CAF50;
}

.node-end {
  background: #ffebee;
  border: 1px solid #f44336;
}

/* Content positioning */
.custom-node-content {
  padding: 8px;
  position: relative;
  z-index: 2;
}

.node-gateway .custom-node-content {
  position: absolute;
  transform: rotate(-45deg);
  width: 120%;
  height: 120%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.node-start .custom-node-content,
.node-end .custom-node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0;
}

.custom-node-icon {
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
}

.node-start .custom-node-icon,
.node-end .custom-node-icon {
  margin: 0;
}

.custom-node-icon .material-icons {
  font-size: 16px;
}

.node-start .material-icons, 
.node-end .material-icons {
  font-size: 14px;
}

.node-task .custom-node-title,
.node-form .custom-node-title,
.node-script .custom-node-title,
.node-api .custom-node-title {
  font-weight: 500;
  font-size: 11px;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.node-end .custom-node-title {
  position: absolute;
  width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  bottom: -29px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 500;
  text-align: center;
}

.node-start .custom-node-title {
  position: absolute;
  width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  bottom: 51px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 500;
  text-align: center;
}

.node-gateway .custom-node-title {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin: 0;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.node-details {
  margin-top: 4px;
}

.node-description {
  margin-bottom: 2px;
  color: #666;
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 10px;
}

.node-assignee,
.node-form-info,
.node-script-info,
.node-api-info,
.node-api-method-info,
.node-conditions {
  display: flex;
  font-size: 10px;
  color: #666;
  align-items: center;
}

.node-assignee-label,
.node-form-label,
.node-script-label,
.node-api-label,
.node-api-method-label {
  font-weight: 500;
  margin-right: 4px;
}

.node-form-value,
.node-script-value,
.node-api-value,
.node-api-method-value,
.node-assignee-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-conditions-value {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.2;
}

.node-form-id {
  font-size: 9px;
  color: #999;
}

.gateway-details {
  width: 100%;
  text-align: center;
  margin-top: 4px;
}

.handle-task-input,
.handle-form-input,
.handle-script-input,
.handle-api-input,
.handle-gateway-input {
  top: -5px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
}

.handle-task-output,
.handle-form-output,
.handle-script-output,
.handle-api-output,
.handle-gateway-output {
  bottom: -5px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
}

.handle-start-output {
  bottom: -5px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
}

.handle-end-input {
  top: -5px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
}

/* Position handles correctly for gateway node */
.handle-gateway-input {
  transform: translateY(-42px) !important;
  background-color: #f97316 !important;
  border: 2px solid white !important;
  width: 12px !important;
  height: 12px !important;
}

.handle-gateway-output {
  transform: translateY(42px) !important;
  background-color: #f97316 !important;
  border: 2px solid white !important;
  width: 12px !important;
  height: 12px !important;
}

/* Badge style */
.node-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 4px;
}

/* Gateway specific styles */
.node-gateway:hover {
  border-color: #ea580c;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.node-gateway .node-description {
  text-align: center;
  margin-bottom: 4px;
  font-size: 10px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 90px;
}

.node-gateway .node-rule-detail {
  display: flex;
  font-size: 10px;
  color: #666;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 3px;
}

.node-gateway .node-rule-detail-label {
  font-weight: 500;
  margin-right: 4px;
}

.node-gateway .node-rule-detail-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  max-width: 60px;
  text-align: center;
}

.node-gateway .material-icons {
  font-size: 18px;
  color: #f97316;
  margin-bottom: 4px;
}

/* Update node-specific styles to be more consistent */
.node-form {
  width: 180px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid #ddd;
  border-left: 4px solid #9333ea;  /* Purple border to match icon color */
}

.node-api {
  width: 180px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid #ddd;
  border-left: 4px solid #6366f1;  /* Indigo border to match icon color */
}

/* Node details styles for consistency */
.node-rule-detail {
  display: flex;
  font-size: 10px;
  color: #666;
  align-items: center;
  margin-bottom: 2px;
}

.node-rule-detail-label {
  font-weight: 500;
  margin-right: 4px;
}

.node-rule-detail-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Add task node specific styling to be consistent with business rule */
.node-task {
  width: 180px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid #ddd;
  border-left: 4px solid #3b82f6;  /* Blue border to match icon color */
}

/* Script node styling */
.node-script {
  width: 180px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid #ddd;
  border-left: 4px solid #6b7280;  /* Gray border to match icon color */
}
`; 