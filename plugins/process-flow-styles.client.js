import { nodeStyles } from '~/components/process-flow/ProcessFlowNodes';

export default defineNuxtPlugin(() => {
  // Create a style element
  const styleEl = document.createElement('style');
  styleEl.textContent = nodeStyles;
  
  // Append to document head
  document.head.appendChild(styleEl);
}); 