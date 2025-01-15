export function createRadarChart(element, data, options = {}) {
    const d3 = window.d3;
    if (!d3) {
        console.error('D3 is not loaded');
        return;
    }

    const {
        width = 500,
        height = 500,
        margin = 100,
        title = '',
        maxValue = 5,
        levels = 5,
        valueFormat = d => d.toFixed(1),
        color = '#015283',
        backgroundColor = 'rgba(82, 220, 255, 0.1)',
        // Array of [top, right, bottom, left] offsets for each point
        offsets = [
            [24, 0, 0, 0],    // Top (Laughter)
            [0, 14, 0, 0],    // Top right (Shock)
            [0, 14, 0, 0],    // Bottom right (Amazement)
            [0, 0, 0, 0],    // Bottom (Sentimental)
            [0, 0, 0, 14],    // Bottom left (Agitation)
            [0, 0, 0, 14]     // Top left (Intrigue)
        ]
    } = options;

    const chartColor = color; // Use the provided color directly

    // Helper function to apply offsets
    const applyOffset = (x, y, pointIndex) => {
        const offset = offsets[pointIndex] || [0, 0, 0, 0];
        const [top, right, bottom, left] = offset;
        return {
            x: x + (right - left),
            y: y + (bottom - top)
        };
    };

    // Helper function to get position for labels and value boxes
    const getPosition = (i) => {
        const angle = angleSlice * i - Math.PI/2;
        let x = rScale(maxValue * 1.2) * Math.cos(angle);
        let y = rScale(maxValue * 1.2) * Math.sin(angle);
        return applyOffset(x, y, i);
    };

    // Clear any existing SVG
    d3.select(element).select('svg').remove();

    // Create SVG with viewBox for responsiveness
    const svg = d3.select(element)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', '100%')
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

    // Scales and angles
    const angleSlice = (Math.PI * 2) / data.length;
    const rScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, width/2 - margin]);

    // Draw background circles and labels
    const levels_data = d3.range(1, levels + 1).reverse();
    
    // Add the grid lines (only concentric rings, no radial lines)
    svg.selectAll('.gridCircle')
        .data(levels_data)
        .enter()
        .append('path')
        .attr('class', 'gridCircle')
        .attr('d', d => {
            const r = rScale(maxValue * d/levels);
            const points = data.map((_, i) => {
                const angle = angleSlice * i - Math.PI/2;
                return [r * Math.cos(angle), r * Math.sin(angle)];
            });
            return d3.line()
                .curve(d3.curveLinearClosed)(points);
        })
        .style('fill', 'none')
        .style('stroke', '#e2e8f0')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '4,4');

    // Draw the radar chart path
    const radarLine = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveCardinalClosed.tension(0.2));

    // Add radar area with gradient
    const gradientId = 'radarGradient-' + Math.random().toString(36).substr(2, 9);
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', chartColor)
        .attr('stop-opacity', 0.2);

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', chartColor)
        .attr('stop-opacity', 0.1);

    // Add radar area
    svg.append('path')
        .datum(data)
        .attr('class', 'radarArea')
        .attr('d', radarLine)
        .style('fill', `url(#${gradientId})`);

    // Add radar stroke
    svg.append('path')
        .datum(data)
        .attr('class', 'radarStroke')
        .attr('d', radarLine)
        .style('fill', 'none')
        .style('stroke', chartColor)
        .style('stroke-width', '2px');

    // Add dots at data points
    svg.selectAll('.radarDot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'radarDot')
        .attr('r', 4)
        .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI/2))
        .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI/2))
        .style('fill', '#fff')
        .style('stroke', chartColor)
        .style('stroke-width', '2px');

    // Add value labels with background
    const valueLabels = svg.selectAll('.valueLabel')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'valueLabel')
        .attr('transform', (d, i) => {
            const pos = getPosition(i);
            return `translate(${pos.x},${pos.y})`;
        });

    // Add value background
    valueLabels.append('rect')
        .attr('x', -20)  // 1px wider on left
        .attr('y', -17)
        .attr('width', 40)  // 2px wider total
        .attr('height', 34)
        .attr('rx', 6) 
        .style('fill', chartColor)
        .style('fill-opacity', 0.1);

    // Add value text
    valueLabels.append('text')
        .text(d => valueFormat(d.value))
        .attr('dy', '0.1em') 
        .style('font-family', 'circularstd,sans-serif')
        .style('font-size', '16px')
        .style('font-weight', '400')
        .style('fill', chartColor)
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('line-height', '1');

    // Add category labels
    const categoryLabels = svg.selectAll('.categoryLabel')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'categoryLabel')
        .attr('transform', (d, i) => {
            const pos = getPosition(i);
            return `translate(${pos.x},${pos.y})`;
        })
        .style('font-family', 'circularstd,sans-serif')
        .style('font-size', '17px')
        .style('font-weight', '400')
        .style('fill', '#1a202c')
        .attr('text-anchor', (d, i) => {
            const angle = angleSlice * i;
            if (angle < Math.PI/6 || Math.abs(angle - Math.PI) < Math.PI/6) return 'middle';
            return angle < Math.PI ? 'start' : 'end';
        })
        .attr('dy', '2em')
        .attr('dx', (d, i) => {
            const angle = angleSlice * i;
            if (angle < Math.PI/6 || Math.abs(angle - Math.PI) < Math.PI/6) return '0';
            return angle < Math.PI ? '-18px' : '18px';
        })
        .style('alignment-baseline', 'middle')
        .style('line-height', '1')
        .text(d => d.category);

    // Add title if provided
    if (title) {
        svg.append('text')
            .attr('x', 0)
            .attr('y', -height/2 + 30)
            .attr('text-anchor', 'middle')
            .style('font-family', 'system-ui')
            .style('font-size', '24px')
            .style('font-weight', '600')
            .style('fill', '#1a202c')
            .text(title);
    }

    return svg.node();
}
