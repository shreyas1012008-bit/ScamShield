function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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
            <p>${escapeHTML(scan.message)}</p>
        </div>

        <div class="detail-section">
            <h2>Risk Score</h2>
            <p>${escapeHTML(scan.score)}/100</p>
        </div>

        <div class="detail-section">
            <h2>Risk Level</h2>
            <p id="detailRiskLevel">${escapeHTML(scan.riskLevel || "N/A")}</p>
        </div>

        <div class="detail-section">
            <h2>Scam Type</h2>
            <p>${escapeHTML(scan.type)}</p>
        </div>

        <div class="detail-section">
            <h2>Scan Time</h2>
            <p>${escapeHTML(scan.time)}</p>
        </div>

        <div class="detail-section">
            <h2>Detection Confidence</h2>
            <p>${escapeHTML(scan.confidence || "N/A")}</p>
        </div>

        <div class="detail-section">
            <h2>Why?</h2>
            <p>${scan.reasons && scan.reasons.length
                ? escapeHTML(scan.reasons.join("\n"))
                : "No suspicious indicators detected."}</p>
        </div>

        <div class="detail-section">
            <h2>🛡️ What should you do?</h2>
            <p>${escapeHTML(scan.advice || "No advice available.")}</p>
        </div>

        <div class="detail-section ai-history-section">
            <h2>🤖 AI Analysis</h2>
            <div id="historyAIAnalysis"></div>
        </div>

    `;
}

const historyAIAnalysis = document.getElementById("historyAIAnalysis");

if (historyAIAnalysis && scan && scan.aiAnalysis) {

    const aiText = scan.aiAnalysis.trim();

    const risk = aiText.match(/^Risk level:\s*(.*)$/im);
    const type = aiText.match(/^Scam type:\s*(.*)$/im);
    const explanation = aiText.match(/^Short explanation:\s*(.*)$/im);
    const action = aiText.match(/^Recommended action:\s*(.*)$/im);

    historyAIAnalysis.innerHTML = `
        <div class="ai-history-row">
            <strong>🔴 Risk Level</strong>
            <span>${escapeHTML(risk ? risk[1] : "")}</span>
        </div>

        <div class="ai-history-row">
            <strong>🎯 Scam Type</strong>
            <span>${escapeHTML(type ? type[1] : "")}</span>
        </div>

        <div class="ai-history-row">
            <strong>📝 Explanation</strong>
            <span>${escapeHTML(explanation ? explanation[1] : "")}</span>
        </div>

        <div class="ai-history-row">
            <strong>🛡️ Recommended Action</strong>
            <span>${escapeHTML(action ? action[1] : "")}</span>
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