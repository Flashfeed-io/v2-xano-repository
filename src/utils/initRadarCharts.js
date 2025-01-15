import { createRadarChart } from './radarChart.js';

export function initRadarCharts(viralityData, directResponseData) {
    const d3 = window.d3;
    if (!d3) {
        console.error('D3 is not loaded');
        return;
    }
    
    const viralityElement = document.querySelector('[cc_data="copilot-v-radar"]');
    const directResponseElement = document.querySelector('[cc_data="copilot-dr-radar"]');
    
    if (viralityElement) {
        createRadarChart(viralityElement, viralityData, {
            color: '#3182ce' // Blue
        });
    }

    if (directResponseElement) {
        createRadarChart(directResponseElement, directResponseData, {
            color: '#9F7AEA' // Purple
        });
    }
}
