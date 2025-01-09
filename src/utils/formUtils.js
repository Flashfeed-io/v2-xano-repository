// Function to sync form values with store fields
export function syncFormWithStore(store, formFieldMapping) {
  // Run on next tick to ensure DOM is ready
  setTimeout(() => {
    Object.entries(formFieldMapping).forEach(([formField, storeField]) => {
      const input = document.querySelector(`[name="${formField}"]`);
      if (input && input.value && store.fields) {
        store.fields[storeField] = input.value;
      }
    });
  }, 100);

  // Add input listeners
  Object.entries(formFieldMapping).forEach(([formField, storeField]) => {
    const input = document.querySelector(`[name="${formField}"]`);
    if (input) {
      input.addEventListener('input', (e) => {
        if (store.fields) {
          store.fields[storeField] = e.target.value;
        }
      });
    }
  });
}
