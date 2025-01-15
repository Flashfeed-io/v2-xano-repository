// Function to load D3.js script if not already loaded
export async function loadD3() {
    if (window.d3) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://d3js.org/d3.v7.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load D3.js'));
        document.head.appendChild(script);
    });
}

// Re-export createGaugeChart from co-pilot-gauge.js for backward compatibility
export { createGaugeChart } from './copilot-gauge.js';
