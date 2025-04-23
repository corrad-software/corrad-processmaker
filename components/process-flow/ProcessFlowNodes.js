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
        :style="{ background: '#555' }"
      />
      
      <div class="custom-node-header">
        <div class="custom-node-icon">
          <slot name="icon"></slot>
        </div>
        <div class="custom-node-title">{{ label }}</div>
        <div class="custom-node-badge" v-if="showBadge">
          <slot name="badge"></slot>
        </div>
      </div>
      <div class="custom-node-content">
        <slot></slot>
      </div>

      <Handle
        v-if="type !== 'end'"
        type="source"
        position="bottom"
        :style="{ background: '#555' }"
      />
    </div>
  `,
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
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
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'task',
      label: this.label,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons' }, 'assignment'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Task node'),
        h('div', { class: 'node-assignee' }, [
          h('span', { class: 'node-assignee-label' }, 'Assigned to: '),
          h('span', { class: 'node-assignee-value' }, this.data?.assignee || 'Unassigned')
        ])
      ])
    });
  }
});

// Start node
export const StartNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'start',
      label: this.label || 'Start',
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons' }, 'play_circle_filled'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Process starts here')
      ])
    });
  }
});

// End node
export const EndNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'end',
      label: this.label || 'End',
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons' }, 'stop_circle'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Process ends here')
      ])
    });
  }
});

// Decision/Gateway node
export const GatewayNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'gateway',
      label: this.label || 'Decision',
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons' }, 'call_split'),
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Decision point'),
        h('div', { class: 'node-conditions' }, [
          h('span', { class: 'node-conditions-label' }, 'Conditions: '),
          h('span', { class: 'node-conditions-value' }, this.data?.conditions?.length || '0')
        ])
      ])
    });
  }
});

// Form node
export const FormNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'form',
      label: this.label || 'Form',
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons' }, 'description'),
      badge: () => this.data?.formId ? h('span', { class: 'node-badge' }, 'F') : null,
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Form submission'),
        h('div', { class: 'node-form-info' }, [
          h('span', { class: 'node-form-label' }, 'Form: '),
          h('span', { class: 'node-form-value' }, this.data?.formName || 'None selected')
        ])
      ])
    });
  }
});

// Script node
export const ScriptNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  render() {
    return h(CustomNode, {
      id: this.id,
      type: 'script',
      label: this.label || 'Script',
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons' }, 'code'),
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
  border-radius: 6px;
  padding: 12px;
  color: #333;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 200px;
  font-size: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.custom-node.selected {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.custom-node-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.custom-node-icon {
  margin-right: 8px;
}

.custom-node-icon .material-icons {
  font-size: 20px;
}

.custom-node-title {
  font-weight: 500;
  flex-grow: 1;
}

.custom-node-content {
  font-size: 12px;
  color: #666;
}

.node-details {
  margin-top: 8px;
}

.node-description {
  margin-bottom: 4px;
  color: #666;
}

.node-assignee,
.node-form-info,
.node-script-info,
.node-conditions {
  font-size: 11px;
  color: #888;
  display: flex;
  gap: 4px;
}

.node-badge {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

/* Node type specific styles */
.node-start .custom-node-icon .material-icons {
  color: #4CAF50;
}

.node-end .custom-node-icon .material-icons {
  color: #f44336;
}

.node-task .custom-node-icon .material-icons {
  color: #2196F3;
}

.node-form .custom-node-icon .material-icons {
  color: #9C27B0;
}

.node-gateway .custom-node-icon .material-icons {
  color: #FF9800;
}

.node-script .custom-node-icon .material-icons {
  color: #607D8B;
}
`; 