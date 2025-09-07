
function demand(hour){
    fetch("/demand")
    .then(r => r.json())
    .then(data => {return data[`${hour}`];})
}

// Register Chart.js zoom plugin
Chart.register(ChartZoom);


document.addEventListener("DOMContentLoaded", function () {
  // Initialize all charts
  initializeCharts();

  // Map interaction
  initializeMapInteraction();

  // Control buttons functionality
  initializeControls();
});

// Chart initialization
function initializeCharts() {
  // Line Chart - Energy Consumption Trend (Hourly)
  const lineCtx = document.getElementById("lineChart").getContext("2d");

  // Init hourly labels (24 hours)
  const initialHours = Array.from(
    { length: 24 }
  );
  const initialValues = initialHours.map(
    () => supply(1)
  );

  const hourlyDataset = getDailyData(
    "sys_line_hourly",
    initialHours,
    initialValues
  );

  const lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: hourlyDataset.labels,
      datasets: [
        {
          label: "Energy Consumption (MW)",
          data: hourlyDataset.data,
          borderColor: "#8400EC",
          backgroundColor: "rgba(132, 0, 236, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        zoom: {
          pan: { enabled: true, mode: "x" },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
        },
        legend: { position: "top" },
        title: { display: true, text: "Hourly Energy Consumption" },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: "rgba(130, 136, 152, 0.1)" },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // Auto-update every 5s = simulate 1 new hour
  setInterval(() => {
    const dataset = getDailyData(
      "sys_line_hourly",
      lineChart.data.labels,
      lineChart.data.datasets[0].data
    );
    const nextHour =
      String(dataset.labels.length % 24).padStart(2, "0") + ":00";
    const nextValue = Math.floor(Math.random() * 200) + 400;

    dataset.labels.push(nextHour);
    dataset.data.push(nextValue);

    // Keep only last 24 hours
    if (dataset.labels.length > 24) {
      dataset.labels.shift();
      dataset.data.shift();
    }

    lineChart.data.labels = dataset.labels;
    lineChart.data.datasets[0].data = dataset.data;
    lineChart.update();
    saveDailyData("sys_line_hourly", dataset);
  }, 5000); // change to 3600000 (1hr) in real case

  // Bar Chart - Energy Production by Source
  const barCtx = document.getElementById("barChart").getContext("2d");
  const barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Hydro", "Solar", "Wind", "Thermal", "Biomass"],
      datasets: [
        {
          label: "Energy Production (MW)",
          data: [420, 85, 65, 120, 45],
          backgroundColor: [
            "rgba(132, 0, 236, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
          borderColor: [
            "rgba(132, 0, 236, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(130, 136, 152, 0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  // Pie Chart - Energy Distribution
  const pieCtx = document.getElementById("pieChart").getContext("2d");
  const pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: [
        "Residential",
        "Commercial",
        "Industrial",
        "Agricultural",
        "Public",
      ],
      datasets: [
        {
          data: [35, 25, 28, 8, 4],
          backgroundColor: [
            "rgba(132, 0, 236, 0.7)",
            "rgba(71, 46, 147, 0.7)",
            "rgba(34, 140, 98, 0.7)",
            "rgba(32, 137, 88, 0.7)",
            "rgba(255, 159, 64, 0.7)",
          ],
          borderColor: [
            "rgba(132, 0, 236, 1)",
            "rgba(71, 46, 147, 1)",
            "rgba(34, 140, 98, 1)",
            "rgba(32, 137, 88, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  });

  // Radar Chart - Regional Comparison
  const radarCtx = document.getElementById("radarChart").getContext("2d");
  const radarChart = new Chart(radarCtx, {
    type: "radar",
    data: {
      labels: [
        "Production",
        "Transmission",
        "Distribution",
        "Consumption",
        "Efficiency",
        "Renewable %",
      ],
      datasets: [
        {
          label: "Province 1",
          data: [85, 74, 78, 90, 82, 65],
          backgroundColor: "rgba(132, 0, 236, 0.2)",
          borderColor: "rgba(132, 0, 236, 1)",
          pointBackgroundColor: "rgba(132, 0, 236, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(132, 0, 236, 1)",
        },
        {
          label: "Bagmati",
          data: [92, 88, 94, 87, 90, 80],
          backgroundColor: "rgba(34, 140, 98, 0.2)",
          borderColor: "rgba(34, 140, 98, 1)",
          pointBackgroundColor: "rgba(34, 140, 98, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(34, 140, 98, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        r: {
          angleLines: {
            display: true,
            color: "rgba(130, 136, 152, 0.2)",
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  });

  // Chart tab functionality
  document.querySelectorAll(".chart-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const chartType = this.getAttribute("data-chart");
      const chartContainer = this.closest(".chart-section");
      const chartId = chartContainer.querySelector("canvas").id;
      const currentChart = Chart.getChart(chartId);

      // Change chart type
      currentChart.config.type = chartType;
      currentChart.update();

      // Update active tab
      chartContainer.querySelectorAll(".chart-tab").forEach((t) => {
        t.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
}

// Map interaction functionality
function initializeMapInteraction() {
  const provinceAreas = document.querySelectorAll(".province-area");

  provinceAreas.forEach((area) => {
    area.addEventListener("click", function () {
      const provinceId = this.id;
      const provinceName = getProvinceName(provinceId);

      // Update province name
      document.querySelector(".province-name").textContent = provinceName;

      // Update data values (simulated)
      updateDataValues(
        Math.floor(Math.random() * 200) + 400,
        Math.floor(Math.random() * 200) + 450,
        Math.floor(Math.random() * 200) + 550
      );

      // Highlight selected province
      provinceAreas.forEach((a) => {
        a.style.opacity = 0.6;
      });
      this.style.opacity = 1;
      this.style.filter = "brightness(1.3)";

      showProvinceInfo(`Data loaded for ${provinceName}`);
    });

    area.addEventListener("mouseenter", function () {
      this.style.cursor = "pointer";
      this.style.filter = "brightness(1.2)";
    });

    area.addEventListener("mouseleave", function () {
      this.style.filter = "brightness(1)";
    });
  });
}

// Get province name from ID
function getProvinceName(provinceId) {
  const provinceNames = {
    province1: "Karnali Province",
    province2: "Koshi Province",
    province3: "Gandaki Province",
    province4: "Sudurpaschim Province",
    province5: "Bagmati Province",
    province6: "Lumbini Province",
    province7: "Madhesh Province",
  };

  return provinceNames[provinceId] || "Nepal Province";
}

// Control buttons functionality
function initializeControls() {
  // Speed control buttons
  const speedButtons = document.querySelectorAll(".speed-btn");
  speedButtons.forEach((button) => {
    button.addEventListener("click", function () {
      speedButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const speed = this.getAttribute("data-speed");
      console.log(`Speed changed to: ${speed}X`);
    });
  });

  // Play button functionality
  const playButton = document.getElementById("playButton");
  let isPlaying = false;

  playButton.addEventListener("click", function () {
    isPlaying = !isPlaying;

    if (isPlaying) {
      this.innerHTML = `
                        <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"/>
                            <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                        <span>Pause</span>
                    `;
      console.log("Simulation started");
    } else {
      this.innerHTML = `
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Start</span>
                    `;
      console.log("Simulation paused");
    }
  });
}

// Utility function to update data values
function updateDataValues(currentLoad, demand, supplyCapacity) {
  document.querySelector(".data-card:nth-child(1) .data-value").textContent =
    currentLoad + " MW";
  document.querySelector(".data-card:nth-child(2) .data-value").textContent =
    demand + " MW";
  document.querySelector(".data-card:nth-child(3) .data-value").textContent =
    supplyCapacity + " MW";
}

// Show province information
function showProvinceInfo(message) {
  // Create a simple notification
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-purple);
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
  const style = document.createElement("style");
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
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
