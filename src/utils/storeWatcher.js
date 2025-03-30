import { toast } from './toastManager.js';
import * as petiteVue from 'petite-vue';

console.log('petitevue:', petiteVue);

// Debounce function
function debounce(func, wait) {
  console.log('Creating debounce function...');
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function createStoreWatcher(store) {
  console.log('Creating store watcher...');
  // Create debounced save function (2 second delay)
  const debouncedSave = debounce(async () => {
    console.log('Saving changes...');
    try {
      // In the future, replace this with actual API call
      // await fetch('your-api-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(store.sync)
      // });
      
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    }
  }, 3000);

  // Create and return the effect
  return effect(() => {
    console.log('Store sync updated');
    // This will run whenever store.sync changes
    const syncData = JSON.stringify(store.sync);
    console.log('Store sync updated');
    debouncedSave();
  });
}
