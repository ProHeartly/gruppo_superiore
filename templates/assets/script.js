document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();

  initializeMapInteraction();

  initializeControls();

  loadForecast();
});

async function loadForecast() {
  try {
    const res = await fetch("/api/forecast?period_hours=168");
    const payload = await res.json();
    if (!payload || payload.error) {
      console.error("Forecast error", payload);
      return;
    }

    const m = payload.metrics || {};
    const fmt = (v, unit = "") =>
      v === null || v === undefined || Number.isNaN(v)
        ? "—"
        : unit === "%"
        ? v.toFixed(1) + unit
        : v.toFixed(2);
    const maeEl = document.getElementById("metric-mae");
    if (maeEl) maeEl.textContent = fmt(m.MAE);
    const rmseEl = document.getElementById("metric-rmse");
    if (rmseEl) rmseEl.textContent = fmt(m.RMSE);
    const mapeEl = document.getElementById("metric-mape");
    if (mapeEl)
      mapeEl.textContent = m.MAPE == null ? "—" : m.MAPE.toFixed(1) + "%";
    const r2El = document.getElementById("metric-r2");
    if (r2El) r2El.textContent = fmt(m.R2);

    const hist = payload.history || [];
    const fc = payload.forecast || [];

    const histLabels = hist.map((d) => d.ds);
    const histY = hist.map((d) => d.y);
    const fcLabels = fc.map((d) => d.ds);
    const fcY = fc.map((d) => d.yhat);

    const labels = histLabels.concat(fcLabels);

    const chart = window.allCharts?.line2Chart;
    if (!chart) return;
    chart.data.labels = labels;

    chart.data.datasets = [
      {
        label: "Actual (last 14 days)",
        data: histY,
        borderColor: "#8400EC",
        backgroundColor: "rgba(132, 0, 236, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Prophet Forecast (next 7 days)",
        data: new Array(histY.length).fill(null).concat(fcY),
        borderColor: "rgba(34, 140, 98, 1)",
        backgroundColor: "rgba(34, 140, 98, 0.15)",
        borderDash: [6, 4],
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 0,
      },
    ];
    chart.update();

    window.forecastLoaded = true;
  } catch (e) {
    console.error("Failed loading forecast", e);
  }
}

let liveTimer = null;
let activeProvince = null;
let liveIntervalMs = 1500;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(len, min, max) {
  return Array.from({ length: len }, () => randInt(min, max));
}

function randomArrayFloat(len, min, max) {
  return Array.from(
    { length: len },
    () => +(min + Math.random() * (max - min)).toFixed(2)
  );
}

function withJitter(value, jitter) {
  const delta = (Math.random() * 2 - 1) * jitter;
  return Math.max(0, +(value + delta).toFixed(2));
}

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
          data: randomArray(12, 420, 760),
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
        legend: { position: "top" },
        title: { display: true, text: "Monthly Energy Consumption" },
      },
      scales: {
        y: { beginAtZero: false, grid: { color: "rgba(130, 136, 152, 0.1)" } },
        x: { grid: { display: false } },
      },
    },
  });

  const line2Ctx = document.getElementById("lineChart2").getContext("2d");
  const hours = Array.from(
    { length: 25 },
    (_, i) => i.toString().padStart(2, "0") + ".00"
  );
  const line2Chart = new Chart(line2Ctx, {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Energy Consumption (MW)",
          data: randomArray(25, 420, 760),
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
        legend: { position: "top" },
        title: { display: true, text: "Hourly Energy Consumption" },
      },
      scales: {
        y: { beginAtZero: false, grid: { color: "rgba(130, 136, 152, 0.1)" } },
        x: { grid: { display: false } },
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
          data: randomArray(5, 20, 500),
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
        legend: { position: "top" },
        title: { display: true, text: "Monthly Energy Production" },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(130, 136, 152, 0.1)" } },
        x: { grid: { display: false } },
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
          data: randomArray(5, 5, 40),
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
        legend: { position: "right" },
        title: { display: true, text: "Monthly Energy Consumption" },
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
          label: "Benchmark",
          data: randomArray(6, 50, 95),
          backgroundColor: "rgba(132, 0, 236, 0.2)",
          borderColor: "rgba(132, 0, 236, 1)",
          pointBackgroundColor: "rgba(132, 0, 236, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(132, 0, 236, 1)",
        },
        {
          label: "Province",
          data: randomArray(6, 50, 95),
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
        legend: { position: "top" },
        title: { display: true, text: "Monthly Energy Consumption" },
      },
      scales: {
        r: {
          angleLines: { display: true, color: "rgba(130, 136, 152, 0.2)" },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  });

  window.allCharts = { lineChart, line2Chart, barChart, pieChart, radarChart };

  document.querySelectorAll(".chart-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const chartType = this.getAttribute("data-chart");
      const chartContainer = this.closest(".chart-section");
      const chartId = chartContainer.querySelector("canvas").id;
      const currentChart = Chart.getChart(chartId);

      currentChart.config.type = chartType;
      currentChart.update();

      chartContainer
        .querySelectorAll(".chart-tab")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

function startLiveUpdates() {
  if (liveTimer) clearInterval(liveTimer);

  const activeSpeed = document.querySelector(".speed-btn.active");
  if (activeSpeed) {
    const speed = parseFloat(activeSpeed.getAttribute("data-speed") || "1");

    liveIntervalMs = Math.max(400, Math.round(1500 / speed));
  }

  liveTimer = setInterval(() => {
    ["lineChart", "line2Chart"].forEach((key) => {
      const chart = window.allCharts[key];
      chart.data.datasets.forEach((ds) => {
        const base = Math.max(200, ds.data.at(-1) ?? 500);
        const next = withJitter(base, 40 + Math.random() * 60);

        ds.data.push(Math.round(next));

        while (ds.data.length > chart.data.labels.length) ds.data.shift();
      });
      chart.update();
    });

    const bar = window.allCharts.barChart;
    bar.data.datasets.forEach((ds) => {
      ds.data = ds.data.map((v) => Math.round(withJitter(v, 20)));
    });
    bar.update();

    const pie = window.allCharts.pieChart;
    pie.data.datasets.forEach((ds) => {
      ds.data = ds.data.map((v) => Math.max(1, Math.round(withJitter(v, 5))));
    });
    pie.update();

    const radar = window.allCharts.radarChart;
    if (radar.data.datasets[1]) {
      radar.data.datasets[1].data = radar.data.datasets[1].data.map((v) =>
        Math.round(withJitter(v, 4))
      );
    }
    if (radar.data.datasets[0]) {
      radar.data.datasets[0].data = radar.data.datasets[0].data.map((v) =>
        Math.round(withJitter(v, 2))
      );
    }
    radar.update();
  }, liveIntervalMs);
}

function setChartsForProvince(provinceName) {
  activeProvince = provinceName;

  const { lineChart, line2Chart, barChart, pieChart, radarChart } =
    window.allCharts;

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
    radarChart.data.datasets[0].label = "Benchmark";
    radarChart.data.datasets[0].data = randomArray(6, 50, 95);
  }
  radarChart.update();

  startLiveUpdates();
}

function initializeMapInteraction() {
  const provinceAreas = document.querySelectorAll(".province-area");

  provinceAreas.forEach((area) => {
    area.addEventListener("click", function () {
      const provinceId = this.id;
      const provinceName = getProvinceName(provinceId);

      document.querySelector(".province-name").textContent = provinceName;

      updateDataValues(randInt(400, 650), randInt(450, 700), randInt(550, 800));

      provinceAreas.forEach((a) => {
        a.style.opacity = 0.6;
        a.style.filter = "brightness(1)";
      });
      this.style.opacity = 1;
      this.style.filter = "brightness(1.3)";

      setChartsForProvince(provinceName);

      showProvinceInfo(`Live data streaming for ${provinceName}`);
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
      if (liveTimer) startLiveUpdates();
      console.log(`Speed changed to: ${speed}X`);
    });
  });

  const playButton = document.getElementById("playButton");
  let isPlaying = true;
  if (playButton) {
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
        if (activeProvince) startLiveUpdates();
      } else {
        this.innerHTML = `
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Start</span>
          `;
        if (liveTimer) clearInterval(liveTimer);
      }
    });
  }
}

function updateDataValues(currentLoad, demand, supplyCapacity) {
  const cards = document.querySelectorAll(".data-card .data-value");
  if (cards[0]) cards[0].textContent = currentLoad + " MW";
  if (cards[1]) cards[1].textContent = demand + " MW";
  if (cards[2]) cards[2].textContent = supplyCapacity + " MW";
}

function showProvinceInfo(message) {
  const notification = document.createElement("div");
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
      if (notification && notification.parentNode)
        notification.parentNode.removeChild(notification);
    }, 300);
  }, 2000);
}



async function updateFromSim(){
  try {
    const dres = await fetch("/get-demand");
    const sres = await fetch("/get-supply");
    const djson = await dres.json();
    const sjson = await sres.json();
    if(djson && djson.latest){
      updateDataValues(djson.latest.residential, djson.latest.industrial, djson.latest.commercial);
    }
  } catch(e){
    console.error("Fetch sim data failed", e);
  }
}

setInterval(updateFromSim, 1500);
updateFromSim();

function sendMail(){
 console.log('sendMail called');
 // ... rest of function ...
}
 function sendMail() {
 const name = document.getElementById("name");
 const email = document.getElementById("email");
 const subject = document.getElementById("subject");
 const message = document.getElementById("message");
 const formMsg = document.getElementById("formMessage");

 // --- Basic validation ---
 if (!name.value.trim() || !email.value.trim() || !subject.value.trim() || !message.value.trim()) {
 formMsg.innerHTML = `
 <div class="error-msg">
 <i class="fa-solid fa-circle-xmark"></i>
 Please fill out all fields before sending.
 </div>
 `;
 return;
 }

 const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
 if (!email.value.match(emailPattern)) {
 formMsg.innerHTML = `
 <div class="error-msg">
 <i class="fa-solid fa-circle-xmark"></i>
 Please enter a valid email address.
 </div>
 `;
 return;
 }

 // --- Show loading state ---
 formMsg.innerHTML = `
 <div class="loading-msg">
 <i class="fa-solid fa-spinner fa-spin"></i>
 Sending your message...
 </div>
 `;

 // --- Send email via EmailJS ---
 const params = {
 name: name.value,
 email: email.value,
 subject: subject.value,
 message: message.value,
 };

 emailjs.send("service_q2crn67", "template_exjilfu", params)
 .then(() => {
 formMsg.innerHTML = `
 <div class="success-msg">
 <i class="fa-solid fa-circle-check"></i>
 Thanks for contacting us! We will review your message soon.
 </div>
 `;
 document.getElementById("contactForm").reset();
 })
 .catch((err) => {
 formMsg.innerHTML = `
 <div class="error-msg">
 <i class="fa-solid fa-circle-xmark"></i>
 Oops! Something went wrong. Please try again later.
 </div>
 `;
 console.error("EmailJS error:", err);
 });
}