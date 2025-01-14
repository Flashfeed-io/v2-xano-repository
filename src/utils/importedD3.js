// Function to load D3.js script if not already loaded
export function loadD3() {
    return new Promise((resolve, reject) => {
        if (window.d3) {
            resolve(window.d3);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://d3js.org/d3.v7.min.js';
        script.async = true;

        script.onload = () => {
            console.log('D3.js loaded successfully');
            resolve(window.d3);
        };

        script.onerror = (error) => {
            console.error('Error loading D3.js:', error);
            reject(error);
        };

        document.head.appendChild(script);
    });
}

// Helper function to lighten a color
function lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const lighterR = Math.min(Math.round(r + (255 - r) * amount), 255);
    const lighterG = Math.min(Math.round(g + (255 - g) * amount), 255);
    const lighterB = Math.min(Math.round(b + (255 - b) * amount), 255);

    return '#' + 
        (lighterR.toString(16).padStart(2, '0')) +
        (lighterG.toString(16).padStart(2, '0')) +
        (lighterB.toString(16).padStart(2, '0'));
}

// Create gauge chart
export function createGaugeChart(element, value, avgScore, topScore) {
    // Get the current value from the element if it exists
    const currentValue = element.querySelector('.gauge-value') ? 
        parseFloat(element.querySelector('.gauge-value').textContent) : value;

    // Clear any existing content
    element.innerHTML = '';
    
    const config = {
        size: 300,
        margin: 10,
        minValue: 0,
        maxValue: 100,
        currentValue: currentValue, // Start from current value
        targetValue: value,
        animationDuration: 1000,
        arcPadding: 3,
        cornerRadius: 5,
        gaugeWidth: 25,
        dialWidth: 1,
        dialGap: 2,
        sections: [
            { 
                min: 0, max: 40, 
                color: '#F35353', 
                tooltip: 'Poor (0-40)'
            },
            { 
                min: 41, max: 79, 
                color: '#FD9059', 
                tooltip: 'Good (41-79)'
            },
            { 
                min: 80, max: 100, 
                color: '#30C455',  
                tooltip: 'Excellent (80-100)'
            },
        ]
    };

    // Calculate radius and angles
    const radius = (config.size - config.margin * 2) / 2;
    const startAngle = -Math.PI / 2;     // -90 degrees
    const endAngle = Math.PI / 2;        // 90 degrees

    // Create SVG
    const svg = d3.select(element)
        .append('svg')
        .attr('viewBox', `0 0 ${config.size} ${config.size}`)
        .style('width', '100%')
        .style('height', '100%')
        .style('max-width', '300px')
        .style('max-height', '300px');

    // Create tooltip div if it doesn't exist
    const tooltip = d3.select('body').selectAll('.gauge-tooltip').data([0])
        .join('div')
        .attr('class', 'gauge-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '14px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('font-family', 'Arial, sans-serif')
        .style('opacity', '0')
        .style('transition', 'opacity 0.3s ease');

    const g = svg.append('g')
        .attr('transform', `translate(${config.size/2},${config.size/2})`);

    // Create arc generator
    const arc = d3.arc()
        .innerRadius(radius - config.gaugeWidth)
        .outerRadius(radius)
        .cornerRadius(config.cornerRadius);

    // Function to update the gauge
    function updateGauge(value) {
        config.currentValue = Math.round(value); // Round the value for display
        
        // Remove all existing elements
        g.selectAll('*').remove();

        // Add hidden span to store current value
        if (!element.querySelector('.gauge-value')) {
            const valueSpan = document.createElement('span');
            valueSpan.className = 'gauge-value';
            valueSpan.style.display = 'none';
            element.appendChild(valueSpan);
        }
        element.querySelector('.gauge-value').textContent = Math.round(value);

        // Redraw the gauge with new value
        config.sections.forEach((section, i) => {
            const startAngleArc = startAngle + (section.min / 100) * (endAngle - startAngle);
            const endAngleArc = startAngle + (section.max / 100) * (endAngle - startAngle);
            
            if (value >= section.min && value <= section.max) {
                const valueAngle = startAngle + (value / 100) * (endAngle - startAngle);
                
                // Draw colored part
                g.append('path')
                    .datum({endAngle: valueAngle - config.dialGap / radius})
                    .style('fill', section.color)
                    .style('transition', 'opacity 0.3s ease')
                    .attr('d', arc({
                        startAngle: startAngleArc + (i === 0 ? 0 : config.arcPadding / radius),
                        endAngle: valueAngle - config.dialGap / radius
                    }))
                    .on('mouseover', function(event) {
                        d3.select(this).style('opacity', '0.55');
                        tooltip.style('visibility', 'visible')
                            .style('opacity', '1')
                            .text(section.tooltip);
                    })
                    .on('mousemove', function(event) {
                        tooltip.style('top', (event.pageY - 10) + 'px')
                            .style('left', (event.pageX + 10) + 'px');
                    })
                    .on('mouseout', function() {
                        d3.select(this).style('opacity', '1');
                        tooltip.style('opacity', '0')
                            .style('visibility', 'hidden');
                    });
                
                // Draw lighter colored part
                g.append('path')
                    .datum({endAngle: endAngleArc})
                    .style('fill', lightenColor(section.color, 0.9))
                    .style('transition', 'opacity 0.3s ease')
                    .attr('d', arc({
                        startAngle: valueAngle + config.dialGap / radius,
                        endAngle: endAngleArc - (i === config.sections.length - 1 ? 0 : config.arcPadding / radius)
                    }))
                    .on('mouseover', function(event) {
                        d3.select(this).style('opacity', '0.55');
                        tooltip.style('visibility', 'visible')
                            .style('opacity', '1')
                            .text(section.tooltip);
                    })
                    .on('mousemove', function(event) {
                        tooltip.style('top', (event.pageY - 10) + 'px')
                            .style('left', (event.pageX + 10) + 'px');
                    })
                    .on('mouseout', function() {
                        d3.select(this).style('opacity', '1');
                        tooltip.style('opacity', '0')
                            .style('visibility', 'hidden');
                    });
            } else {
                g.append('path')
                    .datum({endAngle: endAngleArc})
                    .style('fill', value > section.max ? section.color : lightenColor(section.color, 0.9))
                    .style('transition', 'opacity 0.3s ease')
                    .attr('d', arc({
                        startAngle: startAngleArc + (i === 0 ? 0 : config.arcPadding / radius),
                        endAngle: endAngleArc - (i === config.sections.length - 1 ? 0 : config.arcPadding / radius)
                    }))
                    .on('mouseover', function(event) {
                        d3.select(this).style('opacity', '0.55');
                        tooltip.style('visibility', 'visible')
                            .style('opacity', '1')
                            .text(section.tooltip);
                    })
                    .on('mousemove', function(event) {
                        tooltip.style('top', (event.pageY - 10) + 'px')
                            .style('left', (event.pageX + 10) + 'px');
                    })
                    .on('mouseout', function() {
                        d3.select(this).style('opacity', '1');
                        tooltip.style('opacity', '0')
                            .style('visibility', 'hidden');
                    });
            }
        });

        // Calculate the angle for the current value
        const valueAngle = startAngle + (value / 100) * (endAngle - startAngle);

        // Add the dial line
        const dialExtension = config.gaugeWidth * 0.4; // How much to extend beyond the gauge
        const dialGap = config.dialGap; // Use the config value for consistency
        const dialColor = '#120F23';

        g.append('line')
            .attr('class', 'dial')
            .attr('x1', 0)
            .attr('y1', -radius - dialExtension)
            .attr('x2', 0)
            .attr('y2', -radius + config.gaugeWidth + dialExtension)
            .attr('transform', `translate(0,${dialGap}) rotate(${(valueAngle * 180 / Math.PI)})`)
            .style('stroke', dialColor)
            .style('stroke-width', '4px')
            .style('stroke-linecap', 'round')
            .style('transition', `transform ${config.animationDuration}ms ease-in-out`);

        // Add value text
        const valueText = g.append('text')
            .attr('class', 'gauge-value')
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Circularstd book,sans-serif')
            .style('font-weight', '600');

        valueText.append('tspan')
            .text(Math.round(value))
            .style('font-size', '46px')
            .style('font-weight', '600')
            .style('fill', '#120F23');

        valueText.append('tspan')
            .text('/100')
            .style('font-size', '26px')
            .style('font-weight', '300')
            .style('fill', '#8A8C93');

        // Add scores text
        const scoresText = g.append('text')
            .attr('class', 'scores')
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Circularstd book,sans-serif')
            .style('font-size', '14px')
            .style('fill', '#666');

        scoresText.append('tspan')
            .text(`Avg ≠ ${avgScore}`)
            .attr('x', -40);

        scoresText.append('tspan')
            .text(`Top ↑ ${topScore}`)
            .attr('x', 40);
    }

    // Start the animation
    const startValue = currentValue;
    const endValue = config.targetValue;
    const duration = config.animationDuration;
    const start = Date.now();

    function animate() {
        const now = Date.now();
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        // Use easeInOutQuad for smooth animation
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        const currentValue = startValue + (endValue - startValue) * easeProgress;
        updateGauge(currentValue);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    // Only animate if values are different
    if (startValue !== endValue) {
        animate();
    } else {
        updateGauge(endValue);
    }
}
