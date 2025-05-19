# Process Builder Documentation

## Overview

The Process Builder is a visual workflow designer that allows you to create, edit, and manage business processes using the BPMN (Business Process Model and Notation) standard. With an intuitive drag-and-drop interface, you can design complex workflows that model your organization's business processes.

## Getting Started

### Accessing the Process Builder
1. Navigate to `/process-builder` in your browser
2. You'll see a three-panel interface:
   - Left: Component Palette
   - Middle: Process Canvas
   - Right: Properties Panel

### Quick Start Guide
1. **Create a New Process**
   - Click "New Process" in the header
   - Enter a process name and description
   - Start adding components

2. **Add Process Elements**
   - Drag components from the left panel onto the canvas
   - Components include Start/End events, Tasks, Gateways, etc.
   - Connect elements by dragging from one node's handle to another
   - Handles appear when hovering over nodes:
     - Top handle: Input connection point
     - Bottom handle: Output connection point

3. **Configure Elements**
   - Click any element in the canvas to select it
   - Use the right panel to configure its properties
   - Changes are previewed in real-time

4. **Save and Deploy**
   - Click "Save Process" to store your changes
   - Once ready, you can deploy the process for execution

## Process Components

### Events
Events represent something that happens during the course of a process:

- **Start Event** (Green Icon)
  - Indicates where a process begins
  - Only has output handle (bottom)
  - Properties: Description, triggers

- **End Event** (Red Icon)
  - Indicates where a process path ends
  - Only has input handle (top)
  - Properties: Description, result types

### Activities
Activities represent work performed in a process:

- **Task** (Blue Icon)
  - A simple atomic activity within the process
  - Has both input and output handles
  - Properties: Assignee, description

- **Form Task** (Purple Icon)
  - A task that requires form data
  - Has both input and output handles
  - Properties: Form selection, description
  - Connects to forms created in the Form Builder

- **Script Task** (Grey Icon)
  - Automated task that executes code
  - Has both input and output handles
  - Properties: Language, description, script content

### Gateways
Decision points control flow divergence and convergence:

- **Decision Point** (Orange Diamond Icon)
  - Creates alternative paths based on conditions
  - Has both input and output handles
  - Shows the number of configured paths in a badge
  - Displays path names within the diamond
  - Properties: Conditions, default path, description
  - Connection labels automatically match condition paths

## Working with the Process Canvas

### Navigation
- **Pan**: Click and drag the canvas background or use middle mouse button
- **Zoom**: Use mouse wheel or zoom controls in top-right
- **Reset View**: Use the fit-view button in controls

### Element Manipulation
- **Select**: Click on an element
- **Multi-select**: Hold Shift while clicking elements
- **Move**: Drag selected elements
- **Delete**: Press Delete key, double-click element, or use the Delete button in the properties panel
- **Connect**: Drag from one node's handle to another's

### Keyboard Shortcuts
- **Delete**: Remove selected elements
- **Shift**: Enable node selection
- **Control**: Multi-select nodes

### Connection Points
- **Input Handle**: Located at the top of nodes (except Start)
- **Output Handle**: Located at the bottom of nodes (except End)
- **Creating Connections**:
  1. Hover over a node to see handles
  2. Click and drag from a handle
  3. Drop on another node's handle
  4. Connection automatically styles based on type

## Process Properties

### Basic Settings
- Process name and description
- Version information
- Start conditions
- Process timeouts

### Variables
- Process data variables
- Input and output parameters
- Data types and validation

### Participants
- User assignments
- Role-based assignments
- Group assignments

## Form Integration

The Process Builder integrates with the Form Builder to allow forms to be attached to process tasks:

1. **Adding a Form Task**
   - Drag a Form Task component onto the canvas
   - Select the task to open its properties

2. **Selecting a Form**
   - In the properties panel, use the Form Selector to choose a form
   - Forms are listed from those created in the Form Builder
   - Selected forms will be displayed to users when they reach this task

3. **Form Data in Process**
   - Form submissions become available as process variables
   - Data can be referenced in gateway conditions
   - Form fields can be pre-populated with process data

## Best Practices

### Process Design
1. Start with a Start event and end with End event(s)
2. Use clear, descriptive labels for all elements
3. Connect nodes in a logical flow
4. Use gateways to manage decision points
5. Keep the process layout organized and clear

### Flow Control
1. Ensure all paths lead to an End event
2. Validate connections make logical sense
3. Use appropriate node types for each step
4. Consider the process flow direction (typically top to bottom)

### Visual Organization
1. Maintain consistent spacing between nodes
2. Align nodes for better readability
3. Use the auto-arrange feature when available
4. Keep related elements grouped together

## Troubleshooting

### Common Issues
1. **Can't Create Connection**
   - Verify you're dragging from a handle
   - Check that source and target are compatible
   - Ensure you're connecting to a handle, not the node body

2. **Node Won't Delete**
   - Make sure the node is selected
   - Try using the Delete key
   - Use the Delete button in the properties panel
   - Double-click the node to remove it

3. **Connection Looks Wrong**
   - Try repositioning nodes for better flow
   - Check that connections are made to correct handles
   - Consider using different connection types

4. **Form Not Showing in Selector**
   - Verify the form was saved in the Form Builder
   - Check that you have permission to access the form
   - Refresh the page to update the form list

### Getting Help
- Use the control panel hints in top-right
- Review this documentation
- Contact support team for additional assistance

---

For technical details about implementation and integration, please refer to the [Process Builder Technical Documentation](PROCESS_BUILDER_TECHNICAL_APPENDIX.md).

Last updated: June 10, 2024 