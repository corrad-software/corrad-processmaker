import { useToast as useVueToast } from 'vue-toastification';

export const useToast = () => {
  const toast = useVueToast();

  return {
    success: (message, options = {}) => {
      toast.success(message, {
        timeout: 3000,
        position: 'top-right',
        ...options
      });
    },
    
    error: (message, options = {}) => {
      toast.error(message, {
        timeout: 5000,
        position: 'top-right',
        ...options
      });
    },
    
    warning: (message, options = {}) => {
      toast.warning(message, {
        timeout: 4000,
        position: 'top-right',
        ...options
      });
    },
    
    info: (message, options = {}) => {
      toast.info(message, {
        timeout: 3000,
        position: 'top-right',
        ...options
      });
    }
  };
}; 