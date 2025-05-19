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
        h('div', { class: 'node-assignee' }, [
          h('span', { class: 'node-assignee-label' }, 'Assigned to:'),
          h('span', { class: 'node-assignee-value' }, this.data?.assignee || 'Unassigned')
        ])
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
    }
  },
  render() {
    // Create the badge content
    const badgeContent = h('span', { 
      class: 'node-badge bg-orange-100 text-orange-600 px-1 text-xs rounded absolute -top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap'
    }, `${this.totalPaths} path${this.totalPaths !== 1 ? 's' : ''}`);

    return h(CustomNode, {
      id: this.id,
      type: 'gateway',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-orange-500' }, 'call_split'),
      badge: () => badgeContent,
      default: () => h('div', { class: 'gateway-details' }, [
        h('div', { class: 'node-conditions-value' }, this.conditionSummary)
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
    const badgeContent = this.hasForm ? 
      h('span', { class: 'node-badge bg-purple-100 text-purple-600 px-1 text-xs rounded' }, 'Form') : 
      null;
    
    return h(CustomNode, {
      id: this.id,
      type: 'form',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-purple-500' }, 'description'),
      badge: () => badgeContent,
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Form submission task'),
        h('div', { class: 'node-form-info' }, [
          h('span', { class: 'node-form-label' }, 'Form: '),
          h('span', { 
            class: this.hasForm ? 'node-form-value text-purple-600 font-medium' : 'node-form-value text-gray-400 italic' 
          }, this.formName)
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
      icon: () => h('i', { class: 'material-icons script-icon' }, 'code'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Script execution'),
        h('div', { class: 'node-script-info' }, [
          h('span', { class: 'node-script-label' }, 'Language: '),
          h('span', { class: 'node-script-value' }, this.data?.language || 'Not specified')
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
  script: ScriptNode
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
.node-task, .node-form, .node-script {
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
  width: 100%;
  height: 100%;
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
.node-script .custom-node-title {
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
.node-conditions {
  display: flex;
  font-size: 10px;
  color: #666;
  align-items: center;
}

.node-assignee-label,
.node-form-label,
.node-script-label {
  font-weight: 500;
  margin-right: 4px;
}

.node-form-value,
.node-script-value,
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
.handle-gateway-input {
  top: -5px !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
}

.handle-task-output,
.handle-form-output,
.handle-script-output,
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

.node-gateway .node-badge {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  background-color: #fff7ed;
  border: 1px solid #fdba74;
  z-index: 10;
  font-size: 11px;
  padding: 2px 8px;
  white-space: nowrap;
  margin-top: 8px;
}

.node-gateway .material-icons {
  font-size: 24px;
  color: #f97316;
  margin-bottom: 4px;
}
`; 