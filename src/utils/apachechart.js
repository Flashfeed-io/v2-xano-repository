// Dynamic Script Loader for Apache ECharts
export function loadECharts(callback) {
    console.log('loadECharts called, checking if echarts exists:', !!window.echarts);
    if (window.echarts) {
        console.log('ECharts already loaded, calling callback directly');
        callback();
        return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.onload = () => {
        console.log('ECharts script loaded successfully');
        callback();
    };
    script.onerror = (error) => {
        console.error('Failed to load ECharts:', error);
    };
    console.log('Appending ECharts script to document head');
    document.head.appendChild(script);
}

// Initialize Gauge Chart
export function initGaugeChart(element, value) {
    console.log('initGaugeChart called with element:', element, 'and value:', value);
    
    if (!element) {
        console.error('Element is null or undefined');
        return;
    }

    // Set responsive dimensions with 2:3 aspect ratio
    element.style.width = '100%';
    element.style.aspectRatio = '2/3';
    element.style.display = 'block';

    console.log('Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);
    
    try {
        const myChart = echarts.init(element);
        console.log('Chart initialized');
        
        const gaugeData = [
            {
                value: value,
                name: 'Score'
            }
        ];

        const gaugeOption = {
            series: [
                {
                    data: gaugeData,
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    splitNumber: 3,
                    pointer: {
                        icon: 'circle',
                        length: '12%',
                        width: 50,
                        offsetCenter: [0, '-90%'],
                        itemStyle: {
                            color: '#FFFFFF',
                            borderColor: '#0a1f44',
                            borderWidth: 5,
                            shadowColor: 'rgba(10, 31, 68, 0.5)',
                            shadowBlur: 2,
                            shadowOffsetY: 1,
                        },
                    },
                    axisLine: {
                        show: true,
                        roundCap: true,
                        lineStyle: {
                            width: 14,
                            color: [
                                [0.48, '#e76262'],  // Red segment
                                [0.52, 'transparent'], // Gap
                                [0.64, '#f9cf4a'],  // Yellow segment
                                [0.68, 'transparent'], // Gap
                                [0.81, '#eca336'],  // Orange segment
                                [0.85, 'transparent'], // Gap
                                [1, '#3ece80'],     // Green segment
                            ],
                        },
                    },
                    axisTick: {
                        length: 2,
                        lineStyle: {
                            color: '#8a94a6',
                            width: 1,
                        },
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    title: {
                        show: false,
                    },
                    detail: {
                        rich: {
                            header: {
                                fontSize: 36,
                                fontWeight: 700,
                                fontFamily: 'Open Sans',
                                color: '#0a1f44',
                            },
                            subHeader: {
                                fontSize: 16,
                                fontWeight: 400,
                                fontFamily: 'Open Sans',
                                color: '#8a94a6',
                            },
                        },
                        formatter: ['{header|{value}}', '{subHeader|2025-01-13}'].join('\n'),
                        offsetCenter: [0, '-20%'],
                        valueAnimation: true
                    },
                },
            ],
        };

        myChart.setOption(gaugeOption);

        // Handle window resize
        window.addEventListener('resize', () => {
            myChart.resize();
        });

        return myChart;
    } catch (error) {
        console.error('Error initializing gauge chart:', error);
    }
}

// Initialize all gauge charts on the page
function initializeGauges() {
    const gaugeElements = document.querySelectorAll('[cc_data="copilot-gauge"]');
    const charts = [];

    gaugeElements.forEach(element => {
        // Ensure the element has a minimum height
        if (!element.style.height) {
            element.style.height = '300px';
        }
        
        // Get the value from the element's data attribute or default to 75
        const value = parseFloat(element.getAttribute('value')) || 75;
        
        charts.push(initGaugeChart(element, value));
    });

    return charts;
}

// Auto-initialize when the script loads
loadECharts(() => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGauges);
    } else {
        initializeGauges();
    }
});

// Export for manual initialization if needed
export const refreshGauges = initializeGauges;
