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
            color: '#0C6BA7',            // Dark blue text
            backgroundColor: '#E8F7FF',   // Light blue background
            boxShadow: '#C5ECFF',      // Blue box shadow
            radarLineColor: '#9ADDFF',   // Light blue line
            radarFillColor: '#E8F7FF'    // Light blue fill
        });
    }

    if (directResponseElement) {
        createRadarChart(directResponseElement, directResponseData, {
            color: '#5f3699',            // Dark purple text
            backgroundColor: '#F4F0FF',   // Light purple background
            boxShadow: '#4e06b021',      // Purple box shadow
            radarLineColor: '#DABFFF',   // Light purple line
            radarFillColor: '#F4F0FF'    // Light purple fill
        });
    }
}
