const dashboardContent = document.getElementById("dashboardContent");
const backBtn = document.getElementById("backBtn");

const history = JSON.parse(localStorage.getItem("scamHistory")) || [];

backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

let totalScans = history.length;
let dangerousScans = 0;
let suspiciousScans = 0;
let lowRiskScans = 0;

history.forEach(scan => {
    if (scan.score >= 70) {
        dangerousScans++;
    } else if (scan.score >= 21) {
        suspiciousScans++;
    } else {
        lowRiskScans++;
    }
});

dashboardContent.innerHTML = `
    <div class="stats-grid">

        <div class="stat-box">
            <strong>${totalScans}</strong>
            <span>Total Scans</span>
        </div>

        <div class="stat-box">
            <strong>${dangerousScans}</strong>
            <span>Dangerous</span>
        </div>

        <div class="stat-box">
            <strong>${suspiciousScans}</strong>
            <span>Suspicious</span>
        </div>

        <div class="stat-box">
            <strong>${lowRiskScans}</strong>
            <span>Low Risk</span>
        </div>

    </div>
`;