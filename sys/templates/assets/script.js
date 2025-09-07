
document.addEventListener('DOMContentLoaded', function () {
  // Initialize all charts
  initializeCharts();

  // Map interaction
  initializeMapInteraction();

  // Control buttons functionality
  initializeControls();
});

// ======== Shared state ========
let liveTimer = null;
let activeProvince = null;
let liveIntervalMs = 1500; // default live speed

// ======== Helpers ========
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(len, min, max) {
  return Array.from({ length: len }, () => randInt(min, max));
}

function randomArrayFloat(len, min, max) {
  return Array.from({ length: len }, () => +(min + Math.random() * (max - min)).toFixed(2));
}

function withJitter(value, jitter) {
  const delta = (Math.random() * 2 - 1) * jitter;
  return Math.max(0, +(value + delta).toFixed(2));
}

// ======== Chart initialization ========
function initializeCharts() {
  // Line Chart - Energy Consumption Trend (Monthly)
  const lineCtx = document.getElementById('lineChart').getContext('2d');
  const lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: 'Energy Consumption (MW)',
        data: randomArray(12, 420, 760),
        borderColor: '#8400EC',
        backgroundColor: 'rgba(132, 0, 236, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Monthly Energy Consumption' }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: 'rgba(130, 136, 152, 0.1)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Line Chart 2 - Hourly
  const line2Ctx = document.getElementById('lineChart2').getContext('2d');
  const hours = Array.from({ length: 25 }, (_, i) => i.toString().padStart(2,'0') + '.00');
  const line2Chart = new Chart(line2Ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Energy Consumption (MW)',
        data: randomArray(25, 420, 760),
        borderColor: '#8400EC',
        backgroundColor: 'rgba(132, 0, 236, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Hourly Energy Consumption' }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: 'rgba(130, 136, 152, 0.1)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Bar Chart - Energy Production by Source
  const barCtx = document.getElementById('barChart').getContext('2d');
  const barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Hydro', 'Solar', 'Wind', 'Thermal', 'Biomass'],
      datasets: [{
        label: 'Energy Production (MW)',
        data: randomArray(5, 20, 500),
        backgroundColor: [
          'rgba(132, 0, 236, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(132, 0, 236, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Monthly Energy Production' }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(130, 136, 152, 0.1)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Pie Chart - Energy Distribution
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Public'],
      datasets: [{
        data: randomArray(5, 5, 40),
        backgroundColor: [
          'rgba(132, 0, 236, 0.7)',
          'rgba(71, 46, 147, 0.7)',
          'rgba(34, 140, 98, 0.7)',
          'rgba(32, 137, 88, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(132, 0, 236, 1)',
          'rgba(71, 46, 147, 1)',
          'rgba(34, 140, 98, 1)',
          'rgba(32, 137, 88, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Monthly Energy Consumption' }
      }
    }
  });

  // Radar Chart - Regional Comparison
  const radarCtx = document.getElementById('radarChart').getContext('2d');
  const radarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Production', 'Transmission', 'Distribution', 'Consumption', 'Efficiency', 'Renewable %'],
      datasets: [
        {
          label: 'Benchmark',
          data: randomArray(6, 50, 95),
          backgroundColor: 'rgba(132, 0, 236, 0.2)',
          borderColor: 'rgba(132, 0, 236, 1)',
          pointBackgroundColor: 'rgba(132, 0, 236, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(132, 0, 236, 1)'
        },
        {
          label: 'Province',
          data: randomArray(6, 50, 95),
          backgroundColor: 'rgba(34, 140, 98, 0.2)',
          borderColor: 'rgba(34, 140, 98, 1)',
          pointBackgroundColor: 'rgba(34, 140, 98, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(34, 140, 98, 1)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Monthly Energy Consumption' }
      },
      scales: {
        r: {
          angleLines: { display: true, color: 'rgba(130, 136, 152, 0.2)' },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });

  // keep references globally for updates on province click
  window.allCharts = { lineChart, line2Chart, barChart, pieChart, radarChart };

  // Chart tab functionality (unchanged)
  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      const chartType = this.getAttribute('data-chart');
      const chartContainer = this.closest('.chart-section');
      const chartId = chartContainer.querySelector('canvas').id;
      const currentChart = Chart.getChart(chartId);

      currentChart.config.type = chartType;
      currentChart.update();

      chartContainer.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ======== Province -> Live charts ========
function startLiveUpdates() {
  if (liveTimer) clearInterval(liveTimer);

  // Determine speed from any active speed button (if present)
  const activeSpeed = document.querySelector('.speed-btn.active');
  if (activeSpeed) {
    const speed = parseFloat(activeSpeed.getAttribute('data-speed') || '1');
    // Lower interval for higher speed
    liveIntervalMs = Math.max(400, Math.round(1500 / speed));
  }

  liveTimer = setInterval(() => {
    // Line charts: push new value, drop first to keep window size
    ['lineChart', 'line2Chart'].forEach(key => {
      const chart = window.allCharts[key];
      chart.data.datasets.forEach(ds => {
        const base = Math.max(200, (ds.data.at(-1) ?? 500));
        const next = withJitter(base, 40 + Math.random() * 60);
        // keep integers for MW display
        ds.data.push(Math.round(next));
        // keep length consistent with labels
        while (ds.data.length > chart.data.labels.length) ds.data.shift();
      });
      chart.update();
    });

    // Bar chart: jitter each bar a little
    const bar = window.allCharts.barChart;
    bar.data.datasets.forEach(ds => {
      ds.data = ds.data.map(v => Math.round(withJitter(v, 20)));
    });
    bar.update();

    // Pie chart: randomize slices softly
    const pie = window.allCharts.pieChart;
    pie.data.datasets.forEach(ds => {
      ds.data = ds.data.map(v => Math.max(1, Math.round(withJitter(v, 5))));
    });
    pie.update();

    // Radar chart: jitter province dataset more than benchmark
    const radar = window.allCharts.radarChart;
    if (radar.data.datasets[1]) {
      radar.data.datasets[1].data = radar.data.datasets[1].data.map(v => Math.round(withJitter(v, 4)));
    }
    if (radar.data.datasets[0]) {
      radar.data.datasets[0].data = radar.data.datasets[0].data.map(v => Math.round(withJitter(v, 2)));
    }
    radar.update();
  }, liveIntervalMs);
}

function setChartsForProvince(provinceName) {
  activeProvince = provinceName;

  // Update dataset labels to include province name & randomize initial data
  const { lineChart, line2Chart, barChart, pieChart, radarChart } = window.allCharts;

  lineChart.data.datasets[0].label = `Energy Consumption (MW) — ${provinceName}`;
  lineChart.data.datasets[0].data = randomArray(12, 420, 780);
  lineChart.update();

  line2Chart.data.datasets[0].label = `Energy Consumption (MW) — ${provinceName}`;
  line2Chart.data.datasets[0].data = randomArray(25, 420, 780);
  line2Chart.update();

  barChart.data.datasets[0].label = `Energy Production (MW) — ${provinceName}`;
  barChart.data.datasets[0].data = randomArray(5, 20, 520);
  barChart.update();

  pieChart.data.datasets[0].data = randomArray(5, 5, 40);
  pieChart.update();

  if (radarChart.data.datasets[1]) {
    radarChart.data.datasets[1].label = provinceName;
    radarChart.data.datasets[1].data = randomArray(6, 50, 95);
  }
  if (radarChart.data.datasets[0]) {
    radarChart.data.datasets[0].label = 'Benchmark';
    radarChart.data.datasets[0].data = randomArray(6, 50, 95);
  }
  radarChart.update();

  // Kick off / restart live updates
  startLiveUpdates();
}

// ======== Map interaction functionality ========
function initializeMapInteraction() {
  const provinceAreas = document.querySelectorAll('.province-area');

  provinceAreas.forEach(area => {
    area.addEventListener('click', function () {
      const provinceId = this.id;
      const provinceName = getProvinceName(provinceId);

      // Update province name
      document.querySelector('.province-name').textContent = provinceName;

      // Update top KPI cards (random)
      updateDataValues(
        randInt(400, 650),
        randInt(450, 700),
        randInt(550, 800)
      );

      // Highlight selected province
      provinceAreas.forEach(a => { a.style.opacity = 0.6; a.style.filter = 'brightness(1)'; });
      this.style.opacity = 1;
      this.style.filter = 'brightness(1.3)';

      // Update charts & go LIVE for this province
      setChartsForProvince(provinceName);

      showProvinceInfo(`Live data streaming for ${provinceName}`);
    });

    area.addEventListener('mouseenter', function () {
      this.style.cursor = 'pointer';
      this.style.filter = 'brightness(1.2)';
    });

    area.addEventListener('mouseleave', function () {
      this.style.filter = 'brightness(1)';
    });
  });
}

// ======== Province name resolver ========
function getProvinceName(provinceId) {
  const provinceNames = {
    'province1': 'Karnali Province',
    'province2': 'Koshi Province',
    'province3': 'Gandaki Province',
    'province4': 'Sudurpaschim Province',
    'province5': 'Bagmati Province',
    'province6': 'Lumbini Province',
    'province7': 'Madhesh Province'
  };
  return provinceNames[provinceId] || 'Nepal Province';
}

// ======== Controls (unchanged except speed affects live interval) ========
function initializeControls() {
  // Speed control buttons
  const speedButtons = document.querySelectorAll('.speed-btn');
  speedButtons.forEach(button => {
    button.addEventListener('click', function () {
      speedButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const speed = this.getAttribute('data-speed');
      // If a stream is already running, restart with new interval right away
      if (liveTimer) startLiveUpdates();
      console.log(`Speed changed to: ${speed}X`);
    });
  });

  // Play button functionality
  const playButton = document.getElementById('playButton');
  let isPlaying = true; // start live by default on first province click
  if (playButton) {
    playButton.addEventListener('click', function () {
      isPlaying = !isPlaying;
      if (isPlaying) {
        this.innerHTML = `
            <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
            <span>Pause</span>
          `;
        // resume
        if (activeProvince) startLiveUpdates();
      } else {
        this.innerHTML = `
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Start</span>
          `;
        // pause
        if (liveTimer) clearInterval(liveTimer);
      }
    });
  }
}

// ======== Utility to update KPI values ========
function updateDataValues(currentLoad, demand, supplyCapacity) {
  const cards = document.querySelectorAll('.data-card .data-value');
  if (cards[0]) cards[0].textContent = currentLoad + ' MW';
  if (cards[1]) cards[1].textContent = demand + ' MW';
  if (cards[2]) cards[2].textContent = supplyCapacity + ' MW';
}

// ======== Tiny toast ========
function showProvinceInfo(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-purple, #8400EC);
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

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => { if (notification && notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
  }, 2000);
}
