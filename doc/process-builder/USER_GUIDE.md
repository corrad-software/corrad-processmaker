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

- **Form Task** (Emerald Icon)
  - A task that requires form data
  - Has both input and output handles
  - Step-by-step configuration workflow
  - Properties: Form selection, data mapping
  - Connects to forms created in the Form Builder
  - Visualizes bidirectional data flow

- **API Task** (Indigo Icon)
  - Automated task that makes API calls
  - Has both input and output handles
  - Step-by-step configuration workflow
  - Properties: Endpoint, method, headers, request/response mapping

- **Business Rule Task** (Purple Icon)
  - Executes custom business rules and logic
  - Has both input and output handles
  - Step-by-step configuration workflow
  - Properties: Rule conditions, actions, and variables

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
  - Enhanced configuration with visual flow indicators
  - Properties: Conditions, default path, description
  - Connection labels automatically match condition paths

## Node Configuration UI

All node configuration components follow a consistent design pattern for improved usability:

### Common UI Elements
- **Modal Headers**: Clear titles with descriptive text and appropriate icons
- **Step Indicators**: Numbered workflow steps for complex configurations
- **Quick Reference**: Help text and examples for common use cases
- **Color-Coding**: Consistent color themes for each node type
  - Purple for Business Rules
  - Indigo for API Tasks
  - Emerald for Form Tasks
  - Blue for Variables

### Form Task Configuration
1. **Form Selection**: Choose from available forms or create a new one
2. **Data Mapping**: Bidirectional mapping between process variables and form fields
3. **Options**: Configure submission behavior and user experience

### Business Rule Configuration
1. **Rule Definition**: Create conditions based on process variables
2. **Actions**: Define what happens when conditions are met
3. **Testing**: Validate rules against sample data

### API Task Configuration
1. **Endpoint Definition**: Configure API URL, method, and authentication
2. **Request Mapping**: Map process variables to API request parameters
3. **Response Mapping**: Extract data from API responses into process variables

### Decision Point Configuration
1. **Path Creation**: Add multiple decision paths
2. **Condition Building**: Create boolean conditions for each path
3. **Default Path**: Configure fallback path when no conditions are met

## Working with Variables

The Variable Manager provides a central location to define and manage global process variables:

- **Variable Types**: String, Int, Decimal, Object, DateTime, Date, Boolean
- **Search**: Quickly find variables with the search functionality
- **Organization**: Variables displayed in cards with type indicators
- **Editing**: Easily edit or delete variables as needed
- **Empty State**: Clear guidance when no variables exist

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

For technical details about implementation and integration, please refer to the [Process Builder Technical Documentation](TECHNICAL_GUIDE.md).

Last updated: July 10, 2024 

## Working with Business Rules

Business Rules allow you to implement conditional logic in your process flows without writing code. They are essential for creating dynamic, data-driven processes.

### Creating Business Rules

To add business rule logic to your process:

1. **Add a Business Rule Node**
   - Drag the Business Rule component (purple icon) from the palette onto the canvas
   - Connect it to the appropriate nodes in your process flow

2. **Configure the Business Rule**
   - Click on the Business Rule node to open its configuration panel
   - Follow the three-step configuration process:

#### Step 1: Select Variables
- Choose which process variables will be used in your rule conditions
- These variables must be defined in the Variable Manager before use
- You can filter and search for variables by name or type
- If you need a new variable, you can create one directly from this screen

#### Step 2: Create Rule Conditions
- Add one or more rules, each with its own set of conditions
- For each condition, specify:
  - The variable to evaluate
  - The operator (equals, not equals, greater than, etc.)
  - The comparison value
- Multiple conditions within a rule are combined with AND logic
- Multiple rules are evaluated independently (OR logic between rules)

#### Step 3: Define Actions
- For each rule, specify the action to take when its conditions are met
- Action types include:
  - Setting variable values
  - Executing predefined functions
  - Triggering process events
- Configure action parameters based on the selected action type
- Actions execute in the order they are defined

### Testing Business Rules

Before saving your business rules, you can test them with sample data:

1. Click the "Test Rules" button at the bottom of the configuration panel
2. Enter test values for each variable used in your conditions
3. See which rules would trigger with the provided values
4. Review the actions that would execute

### Best Practices for Business Rules

1. **Keep Rules Simple**
   - Create multiple simple rules instead of one complex rule
   - Name rules clearly to describe their purpose

2. **Use Consistent Naming**
   - Follow a naming convention for your variables
   - Use descriptive names that indicate the variable's purpose

3. **Document Your Logic**
   - Add descriptions to rules to explain their business purpose
   - Comment on complex conditions to clarify the logic

4. **Test Thoroughly**
   - Validate rules with various test cases
   - Check edge cases and boundary conditions

5. **Consider Performance**
   - Rules are evaluated in the order they appear
   - Place frequently triggered rules at the top for efficiency

### Example Use Cases

Business rules are useful in many scenarios, including:

1. **Customer Segmentation**
   - Route customers to different paths based on attributes like account size or loyalty status

2. **Data Validation**
   - Verify that data meets specific criteria before proceeding

3. **Dynamic Assignment**
   - Assign tasks to different teams based on request category, priority, or workload

4. **Automated Decisions**
   - Automatically approve or reject requests based on predefined criteria

5. **Conditional Notifications**
   - Send notifications only when specific conditions are met 