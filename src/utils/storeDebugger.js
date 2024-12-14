/**
 * Simple store debugger for petite-vue
 */
export const StoreDebugger = {
  store: null,

  init(store) {
    this.store = store;
    this.setupKeyboardShortcut();
    return this;
  },

  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Check for Ctrl+Alt+S (S for Store)
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault(); // Prevent default browser behavior
        this.logStore();
      }
    });
  },

  logStore() {
    console.clear(); // Clear console for cleaner output
    
    // Log current store state
    console.group('📊 Store State (Ctrl+Alt+S)');
    console.log('Timestamp:', new Date().toISOString());
    Object.entries(this.store).forEach(([key, value]) => {
      console.log(`%c${key}:`, 'color: #2563eb; font-weight: bold;', value);
    });
    console.groupEnd();

    return this.store; // Return store for chaining
  }
};
