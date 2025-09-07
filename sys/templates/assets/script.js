document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();

  initializeMapInteraction();

  initializeControls();
});

function initializeCharts() {
  const lineCtx = document.getElementById("lineChart").getContext("2d");
  const lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Energy Consumption (MW)",
          data: [520, 530, 548, 542, 565, 587, 602, 615, 598, 572, 543, 525],
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
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Energy Consumption",
        },
      },
      scales: {
        y: {
          beginAtZero: false,
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

  const line2Ctx = document.getElementById("lineChart2").getContext("2d");
  const line2Chart = new Chart(line2Ctx, {
    type: "line",
    data: {
      labels: [
        "0.00",
        "1.00",
        "2.00",
        "3.00",
        "4.00",
        "5.00",
        "6.00",
        "7.00",
        "8.00",
        "9.00",
        "10.00",
        "11.00",
        "12.00",
        "13.00",
        "14.00",
        "15.00",
        "16.00",
        "17.00",
        "18.00",
        "19.00",
        "20.00",
        "21.00",
        "22.00",
        "23.00",
        "24.00",
      ],
      datasets: [
        {
          label: "Energy Consumption (MW)",
          data: [520, 530, 548, 542, 565, 587, 602, 615, 598, 572, 543, 525],
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
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Hourly Energy Consumption",
        },
      },
      scales: {
        y: {
          beginAtZero: false,
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
        title: {
          display: true,
          text: "Monthly Energy Production",
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
        title: {
          display: true,
          text: "Monthly Energy Consumption",
        },
      },
    },
  });

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
        title: {
          display: true,
          text: "Monthly Energy Consumption",
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

  document.querySelectorAll(".chart-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const chartType = this.getAttribute("data-chart");
      const chartContainer = this.closest(".chart-section");
      const chartId = chartContainer.querySelector("canvas").id;
      const currentChart = Chart.getChart(chartId);

      currentChart.config.type = chartType;
      currentChart.update();

      chartContainer.querySelectorAll(".chart-tab").forEach((t) => {
        t.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
}

function initializeMapInteraction() {
  const provinceAreas = document.querySelectorAll(".province-area");

  provinceAreas.forEach((area) => {
    area.addEventListener("click", function () {
      const provinceId = this.id;
      const provinceName = getProvinceName(provinceId);

      document.querySelector(".province-name").textContent = provinceName;

      updateDataValues(
        Math.floor(Math.random() * 200) + 400,
        Math.floor(Math.random() * 200) + 450,
        Math.floor(Math.random() * 200) + 550
      );

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

function initializeControls() {
  const speedButtons = document.querySelectorAll(".speed-btn");
  speedButtons.forEach((button) => {
    button.addEventListener("click", function () {
      speedButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const speed = this.getAttribute("data-speed");
      console.log(`Speed changed to: ${speed}X`);
    });
  });

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

function updateDataValues(currentLoad, demand, supplyCapacity) {
  document.querySelector(".data-card:nth-child(1) .data-value").textContent =
    currentLoad + " MW";
  document.querySelector(".data-card:nth-child(2) .data-value").textContent =
    demand + " MW";
  document.querySelector(".data-card:nth-child(3) .data-value").textContent =
    supplyCapacity + " MW";
}

function showProvinceInfo(message) {
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

  const style = document.createElement("style");
  style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
