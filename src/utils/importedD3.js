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
    // Clear any existing content
    element.innerHTML = '';
    
    const config = {
        size: 300,
        margin: 10,
        minValue: 0,
        maxValue: 100,
        currentValue: value,
        arcPadding: 6,
        cornerRadius: 5,
        gaugeWidth: 25,
        dialWidth: 4,
        dialGap: 3,
        sections: [
            { 
                min: 0, max: 39, 
                gradient: {
                    start: '#ff206e',  // Pink
                    end: '#ff5d20'     // Deep red
                },
                tooltip: 'Needs Improvement (0-39)'
            },
            { 
                min: 40, max: 79, 
                gradient: {
                    start: '#ff740e',  // Reddish orange
                    end: '#FFD700'     // Golden yellow
                },
                tooltip: 'Good Progress (40-79)'
            },
            { 
                min: 80, max: 100, 
                gradient: {
                    start: '#33CC33',  // Bright green
                    end: '#00A5CF'     // Sky blue
                },
                tooltip: 'Excellent (80-100)'
            }
        ]
    };

    // Calculate radius and angles
    const radius = (config.size - config.margin * 2) / 2;
    const startAngle = -Math.PI / 2;     // -90 degrees
    const endAngle = Math.PI / 2;        // 90 degrees

    // Create SVG
    const svg = d3.select(element)
        .append('svg')
        .attr('width', config.size)
        .attr('height', config.size);

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

    // Define gradients
    const defs = svg.append('defs');
    config.sections.forEach((section, i) => {
        // Create gradient for active section
        const gradient = defs.append('linearGradient')
            .attr('id', `gradient-${i}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('gradientTransform', 'rotate(90)');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', section.gradient.start);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', section.gradient.end);

        // Create lighter gradient for inactive section
        const lightGradient = defs.append('linearGradient')
            .attr('id', `gradient-light-${i}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('gradientTransform', 'rotate(90)');

        lightGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', lightenColor(section.gradient.start, 0.9));

        lightGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', lightenColor(section.gradient.end, 0.9));
    });

    const g = svg.append('g')
        .attr('transform', `translate(${config.size/2},${config.size/2})`);

    // Create arc generator
    const arc = d3.arc()
        .innerRadius(radius - config.gaugeWidth)
        .outerRadius(radius)
        .cornerRadius(config.cornerRadius);

    // Create background arcs with splits
    config.sections.forEach((section, i) => {
        const startAngleArc = startAngle + (section.min / 100) * (endAngle - startAngle);
        const endAngleArc = startAngle + (section.max / 100) * (endAngle - startAngle);
        
        if (config.currentValue >= section.min && config.currentValue <= section.max) {
            // Active part of the section
            const valueAngle = startAngle + (config.currentValue / 100) * (endAngle - startAngle);
            
            // Draw colored part
            g.append('path')
                .datum({endAngle: valueAngle - config.dialGap / radius})
                .style('fill', `url(#gradient-${i})`)
                .style('transition', 'opacity 0.3s ease')
                .attr('d', arc({
                    startAngle: startAngleArc + (i === 0 ? 0 : config.arcPadding / radius),
                    endAngle: valueAngle - config.dialGap / radius
                }))
                .on('mouseover', function(event) {
                    d3.select(this)
                        .style('opacity', '0.55');
                    tooltip
                        .style('visibility', 'visible')
                        .style('opacity', '1')
                        .text(section.tooltip);
                })
                .on('mousemove', function(event) {
                    tooltip
                        .style('top', (event.pageY - 10) + 'px')
                        .style('left', (event.pageX + 10) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .style('opacity', '1');
                    tooltip
                        .style('opacity', '0')
                        .style('visibility', 'hidden');
                });
            
            // Draw lighter colored part
            g.append('path')
                .datum({endAngle: endAngleArc})
                .style('fill', `url(#gradient-light-${i})`)
                .style('transition', 'opacity 0.3s ease')
                .attr('d', arc({
                    startAngle: valueAngle + config.dialGap / radius,
                    endAngle: endAngleArc - (i === config.sections.length - 1 ? 0 : config.arcPadding / radius)
                }))
                .on('mouseover', function(event) {
                    d3.select(this)
                        .style('opacity', '0.55');
                    tooltip
                        .style('visibility', 'visible')
                        .style('opacity', '1')
                        .text(section.tooltip);
                })
                .on('mousemove', function(event) {
                    tooltip
                        .style('top', (event.pageY - 10) + 'px')
                        .style('left', (event.pageX + 10) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .style('opacity', '1');
                    tooltip
                        .style('opacity', '0')
                        .style('visibility', 'hidden');
                });
        } else {
            // Draw full section
            g.append('path')
                .datum({endAngle: endAngleArc})
                .style('fill', config.currentValue > section.max ? 
                    `url(#gradient-${i})` : 
                    `url(#gradient-light-${i})`)
                .style('transition', 'opacity 0.3s ease')
                .attr('d', arc({
                    startAngle: startAngleArc + (i === 0 ? 0 : config.arcPadding / radius),
                    endAngle: endAngleArc - (i === config.sections.length - 1 ? 0 : config.arcPadding / radius)
                }))
                .on('mouseover', function(event) {
                    d3.select(this)
                        .style('opacity', '0.55');
                    tooltip
                        .style('visibility', 'visible')
                        .style('opacity', '1')
                        .text(section.tooltip);
                })
                .on('mousemove', function(event) {
                    tooltip
                        .style('top', (event.pageY - 10) + 'px')
                        .style('left', (event.pageX + 10) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .style('opacity', '1');
                    tooltip
                        .style('opacity', '0')
                        .style('visibility', 'hidden');
                });
        }
    });

    // Add value text
    const valueText = g.append('text')
        .attr('class', 'gauge-value')
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-weight', '600');

    valueText.append('tspan')
        .text(config.currentValue)
        .style('font-size', '38px')
        .style('font-weight', '600')
        .style('fill', '#333');

    valueText.append('tspan')
        .text('/100')
        .style('font-size', '26px')
        .style('font-weight', '400')
        .style('fill', '#666');

    // Add scores text
    const scoresText = g.append('text')
        .attr('class', 'scores')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '14px')
        .style('fill', '#666');

    scoresText.append('tspan')
        .text(`Avg ≠ ${avgScore}`)
        .attr('x', -40);

    scoresText.append('tspan')
        .text(`Top ↑ ${topScore}`)
        .attr('x', 40);
}
