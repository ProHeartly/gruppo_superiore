// Energy Management System Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', function() {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Speed control buttons
    const speedButtons = document.querySelectorAll('.speed-btn');
    speedButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            speedButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const speed = this.getAttribute('data-speed');
            console.log(`Speed changed to: ${speed}X`);
            // Here you would implement the actual speed change logic
        });
    });
    
    // Play button functionality
    const playButton = document.querySelector('.play-btn');
    if (playButton) {
        playButton.addEventListener('click', function() {
            const isPlaying = this.classList.contains('playing');
            
            if (isPlaying) {
                this.classList.remove('playing');
                this.innerHTML = `
                    <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Start</span>
                `;
                console.log('Simulation paused');
            } else {
                this.classList.add('playing');
                this.innerHTML = `
                    <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    <span>Pause</span>
                `;
                console.log('Simulation started');
            }
        });
    }
    
    // Initialize chart
    initializeChart();
    
    // Province map interaction
    initializeMapInteraction();
});

// Chart initialization using Canvas API
function initializeChart() {
    const canvas = document.getElementById('energyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set responsive canvas size
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart configuration
    const chartConfig = {
        padding: { top: 50, right: 50, bottom: 80, left: 80 },
        colors: {
            background: 'rgba(59, 130, 246, 0.15)',
            line: '#3B82F6',
            grid: 'rgba(130, 136, 152, 0.5)',
            text: '#828898'
        }
    };
    
    // Calculate chart area
    const chartWidth = width - chartConfig.padding.left - chartConfig.padding.right;
    const chartHeight = height - chartConfig.padding.top - chartConfig.padding.bottom;
    
    // Draw background
    ctx.fillStyle = chartConfig.colors.background;
    ctx.fillRect(chartConfig.padding.left, chartConfig.padding.top, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = chartConfig.colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 2]);
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = chartConfig.padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(chartConfig.padding.left, y);
        ctx.lineTo(chartConfig.padding.left + chartWidth, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 7; i++) {
        const x = chartConfig.padding.left + (chartWidth / 7) * i;
        ctx.beginPath();
        ctx.moveTo(x, chartConfig.padding.top);
        ctx.lineTo(x, chartConfig.padding.top + chartHeight);
        ctx.stroke();
    }
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Sample data points (you would replace this with real data)
    const dataPoints = [
        { x: 0, y: 50 },
        { x: 3, y: 120 },
        { x: 6, y: 80 },
        { x: 9, y: 150 },
        { x: 12, y: 100 },
        { x: 15, y: 180 },
        { x: 18, y: 140 },
        { x: 21, y: 200 }
    ];
    
    // Draw data line
    ctx.strokeStyle = chartConfig.colors.line;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    dataPoints.forEach((point, index) => {
        const x = chartConfig.padding.left + (point.x / 21) * chartWidth;
        const y = chartConfig.padding.top + chartHeight - (point.y / 200) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = chartConfig.colors.line;
    ctx.lineWidth = 2;
    
    dataPoints.forEach(point => {
        const x = chartConfig.padding.left + (point.x / 21) * chartWidth;
        const y = chartConfig.padding.top + chartHeight - (point.y / 200) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });
    
    // Draw Y-axis labels
    ctx.fillStyle = chartConfig.colors.text;
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    
    const yLabels = ['0', '50', '100', '150', '200'];
    yLabels.forEach((label, index) => {
        const y = chartConfig.padding.top + chartHeight - (index / 4) * chartHeight;
        ctx.fillText(label, chartConfig.padding.left - 10, y + 4);
    });
    
    // Draw X-axis labels
    ctx.textAlign = 'center';
    const xLabels = ['0.00', '3.00', '6.00', '9.00', '12.00', '15.00', '18.00', '21.00'];
    xLabels.forEach((label, index) => {
        const x = chartConfig.padding.left + (index / 7) * chartWidth;
        const y = chartConfig.padding.top + chartHeight + 20;
        ctx.fillText(label, x, y);
    });
}

// Map interaction functionality
function initializeMapInteraction() {
    const mapImage = document.querySelector('.nepal-map');
    if (!mapImage) return;
    
    // Add click event listener to the map
    mapImage.addEventListener('click', function(event) {
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calculate relative position (0-1)
        const relativeX = x / rect.width;
        const relativeY = y / rect.height;
        
        console.log(`Map clicked at position: (${relativeX.toFixed(3)}, ${relativeY.toFixed(3)})`);
        
        // Here you would implement province detection based on coordinates
        // For now, we'll just show a simple alert
        showProvinceInfo('Province clicked at coordinates: ' + relativeX.toFixed(3) + ', ' + relativeY.toFixed(3));
    });
    
    // Add hover effects
    mapImage.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });
}

// Show province information
function showProvinceInfo(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #8400EC;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        z-index: 10000;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Utility function to update data values
function updateDataValues(currentLoad, demand, supplyCapacity) {
    const currentLoadElement = document.querySelector('.data-card:nth-child(1) .data-value');
    const demandElement = document.querySelector('.data-card:nth-child(2) .data-value');
    const supplyCapacityElement = document.querySelector('.data-card:nth-child(3) .data-value');
    
    if (currentLoadElement) currentLoadElement.textContent = currentLoad + ' MW';
    if (demandElement) demandElement.textContent = demand + ' MW';
    if (supplyCapacityElement) supplyCapacityElement.textContent = supplyCapacity + ' MW';
}

// Export functions for external use
window.EMS = {
    updateDataValues,
    showProvinceInfo,
    initializeChart
};
