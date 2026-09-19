const scanDetails = document.getElementById("scanDetails");
const backBtn = document.getElementById("backBtn");

const scan = JSON.parse(localStorage.getItem("selectedScan"));

backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

if (!scan) {
    scanDetails.innerHTML = `
        <p>No scan was selected.</p>
    `;
} else {
    scanDetails.innerHTML = `
        <div class="detail-section">
            <h2>Original Message</h2>
            <p>${scan.message}</p>
        </div>

        <div class="detail-section">
            <h2>Risk Score</h2>
            <p>${scan.score}/100</p>
        </div>

        <div class="detail-section">
            <h2>Risk Level</h2>
            <p id="detailRiskLevel">${scan.riskLevel || "N/A"}</p>
        </div>

        <div class="detail-section">
            <h2>Scam Type</h2>
            <p>${scan.type}</p>
        </div>

        <div class="detail-section">
            <h2>Scan Time</h2>
            <p>${scan.time}</p>
        </div>

        <div class="detail-section">
            <h2>Detection Confidence</h2>
            <p>${scan.confidence || "N/A"}</p>
        </div>

        <div class="detail-section">
            <h2>Why?</h2>
            <p>${scan.reasons && scan.reasons.length
                ? scan.reasons.join("\n")
                : "No suspicious indicators detected."}</p>
        </div>

        <div class="detail-section">
            <h2>🛡️ What should you do?</h2>
            <p>${scan.advice || "No advice available."}</p>
        </div>

    `;
}

const riskLevelElement = document.getElementById("detailRiskLevel");

if (riskLevelElement) {
    if (scan.score >= 90) {
        riskLevelElement.style.background = "#8e0000";
    } else if (scan.score >= 70) {
        riskLevelElement.style.background = "#e74c3c";
    } else if (scan.score >= 41) {
        riskLevelElement.style.background = "#f39c12";
    } else if (scan.score >= 21) {
        riskLevelElement.style.background = "#f1c40f";
        riskLevelElement.style.color = "#222";
    } else {
        riskLevelElement.style.background = "#27ae60";
    }
}