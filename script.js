const analyzeBtn = document.getElementById("analyzeBtn");
const messageInput = document.getElementById("message");
const clearBtn = document.getElementById("clearBtn");

const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyList = document.getElementById("historyList");

const result = document.getElementById("result");
const riskBadge = document.getElementById("riskBadge");
const riskScore = document.getElementById("riskScore");
const riskBar = document.getElementById("riskBar");
const reasons = document.getElementById("reasons");
const adviceText = document.getElementById("adviceText");
const scamType = document.getElementById("scamType");
const confidence = document.getElementById("confidence");

analyzeBtn.addEventListener("click", analyzeMessage);
clearBtn.addEventListener("click", clearAnalysis);
clearHistoryBtn.addEventListener("click", clearHistory);

function clearAnalysis() {
    messageInput.value = "";
    result.classList.add("hidden");

    riskScore.textContent = "0/100";
    scamType.textContent = "Unknown";
    confidence.textContent = "0%";

    riskBar.style.width = "0%";
    riskBar.style.background = "linear-gradient(90deg, #4f6df5, #6c8cff)";
    riskBar.style.boxShadow = "0 0 12px rgba(108, 140, 255, 0.45)";

    reasons.innerHTML = "";
}

function clearHistory() {
    localStorage.removeItem("scamHistory");
    localStorage.removeItem("selectedScan");

    historyList.innerHTML =
        '<p class="empty-history">No scans yet.</p>';
    
    updateDashboardStats();
}

function saveToHistory(
    message,
    score,
    type,
    detectedReasons,
    confidence,
    advice
) {
    const scan = {
        message: message,
        score: score,
        type: type,
        riskLevel:
            score >= 90 ? "EXTREMELY DANGEROUS" :
            score >= 70 ? "DANGEROUS" :
            score >= 41 ? "SUSPICIOUS" :
            score >= 21 ? "SLIGHTLY SUSPICIOUS" :
            "LOW RISK",
        reasons: detectedReasons,
        confidence: confidence,
        advice: advice,
        time: new Date().toLocaleTimeString()
    };

    const history = JSON.parse(localStorage.getItem("scamHistory")) || [];

    history.unshift(scan);

    localStorage.setItem("scamHistory", JSON.stringify(history));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem("scamHistory")) || [];

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-history">No scans yet.</p>';
        return;
    }

    historyList.innerHTML = "";

    history.forEach(scan => {
        const item = document.createElement("div");
        item.className = "history-item";

        item.style.cursor = "pointer";

        item.addEventListener("click", () => {
            localStorage.setItem("selectedScan", JSON.stringify(scan));
            window.location.href = "history.html";
        });

    item.innerHTML = `
        <strong>${scan.type}</strong>
        <span>${scan.score}/100</span>
        <small>${scan.time}</small>
    `;

        historyList.appendChild(item);
    });
}

function analyzeMessage() {

    analyzeBtn.textContent = "🔄 Analyzing...";
    analyzeBtn.disabled = true;

    const message = messageInput.value.trim().toLowerCase();

    if (message === "") {
        alert("Please paste a message first.");
        analyzeBtn.textContent = "🔍 Analyze Now";
        analyzeBtn.disabled = false;
        return;
    }

    let score = 0;
    let detectedReasons = [];

    // Common KYC Scam Phrases
    if (
        message.includes("kyc has expired") ||
        message.includes("kyc expired") ||
        message.includes("update your kyc") ||
        message.includes("kyc verification") ||
        message.includes("complete your kyc")
    ) {
        score += 20;

        detectedReasons.push(
            "Uses a common KYC-related request that may be used to pressure the recipient."
        );
    }

    // Account Verification
    const hasAccountVerification =
        message.includes("verify your account") ||
        message.includes("verify account") ||
        message.includes("account details") ||
        message.includes("confirm your account") ||
        message.includes("confirm account") ||
        message.includes("restore your account") ||
        message.includes("reactivate your account") ||
        message.includes("unlock your account");

    if (hasAccountVerification) {
        score += 10;

        detectedReasons.push(
            "Requests account verification or account details."
        );
    }

    const hasAccountThreat =
        message.includes("account blocked") ||
        message.includes("account suspended") ||
        message.includes("account will be closed") ||
        message.includes("account will be locked") ||
        message.includes("account has been locked") ||
        message.includes("account access will be removed");

    if (hasAccountVerification && hasAccountThreat) {
        score += 15;

        detectedReasons.push(
            "Combines account verification with a threat of losing account access."
        );
    }

    // OTP / Password
    const requestsSensitiveInfo =
        message.includes("otp") ||
        message.includes("one time password") ||
        message.includes("verification code") ||
        message.includes("password") ||
        message.includes("pin");

    if (requestsSensitiveInfo) {
        score += 25;

        detectedReasons.push(
            "Requests sensitive authentication information."
        );
    }

    const hasSensitiveAction =
        message.includes("share your otp") ||
        message.includes("send your otp") ||
        message.includes("tell me your otp") ||
        message.includes("provide your otp") ||
        message.includes("share the otp") ||
        message.includes("enter your otp") ||
        message.includes("share password") ||
        message.includes("send password") ||
        message.includes("share your pin") ||
        message.includes("send your pin");

    if (hasSensitiveAction) {
        score += 20;

        detectedReasons.push(
            "Explicitly asks the recipient to share an OTP, password, or PIN."
        );
    }

    // Refund / Reward Fee Scam
    if (
        (
            message.includes("refund") ||
            message.includes("reward")
        ) &&
        (
            message.includes("processing fee") ||
            message.includes("claim fee") ||
            message.includes("pay a fee") ||
            message.includes("small fee")
        )
    ) {
        score += 25;

        detectedReasons.push(
            "Requests an upfront fee to receive a refund or reward."
        );
    }

    // Pay to Receive Money Scam
    if (
        (
            message.includes("send money") ||
            message.includes("send ₹") ||
            message.includes("pay")
        ) &&
        (
            message.includes("receive money") ||
            message.includes("get money") ||
            message.includes("receive your money") ||
            message.includes("in your account")
        )
    ) {
        score += 30;

        detectedReasons.push(
            "Requests payment before the recipient can receive money."
        );
    }

    // Money / Payment
    if (
        message.includes("send money") ||
        message.includes("pay now") ||
        message.includes("payment") ||
        message.includes("upi") ||
        message.includes("transfer money") ||
        message.includes("bank account") ||
        message.includes("deposit")
    ) {
        score += 20;
        detectedReasons.push(
            "Requests or mentions a financial transaction."
        );
    }


    // Threats
    if (
        message.includes("account blocked") ||
        message.includes("account suspended") ||
        message.includes("account will be closed") ||
        message.includes("legal action") ||
        message.includes("arrest") ||
        message.includes("police")
    ) {
        score += 25;
        detectedReasons.push(
            "Uses threats or fear to pressure the recipient."
        );
    }


    // Urgency
    if (
        message.includes("urgent") ||
        message.includes("immediately") ||
        message.includes("act now") ||
        message.includes("claim now") ||
        message.includes("verify now") ||
        message.includes("reward now") ||
        message.includes("click now") ||
        message.includes("right now") ||
        message.includes("within 24 hours") ||
        message.includes("today only")
    ) {
        score += 10;
        detectedReasons.push(
            "Creates urgency or pressure to act quickly."
        );
    }


    // Prize / Lottery
    // Strong Prize Scam Phrases
    if (
        message.includes("congratulations! you have won") ||
        message.includes("you have won ₹") ||
        message.includes("you won ₹") ||
        message.includes("claim your prize") ||
        message.includes("claim your reward")
    ) {
        score += 15;

        detectedReasons.push(
            "Uses a common prize-scam phrase to make an unexpected reward appear legitimate."
        );
    }

    // Prize + Urgency
    if (
        (
            message.includes("prize") ||
            message.includes("reward") ||
            message.includes("you won") ||
            message.includes("you have won")
        ) &&
        (
            message.includes("now") ||
            message.includes("immediately") ||
            message.includes("urgent") ||
            message.includes("within 24 hours")
        )
    ) {
        score += 15;

        detectedReasons.push(
            "Combines an unexpected prize or reward with urgent pressure to claim it."
        );
    }

    if (
        (
            message.includes("you won") ||
            message.includes("you have won") ||
            message.includes("winner") ||
            message.includes("lottery") ||
            message.includes("prize")
        )
        &&
        (
            message.includes("claim") ||
            message.includes("congratulations") ||
            message.includes("fee") ||
            message.includes("reward")
        )
    ) {
        score += 25;

        detectedReasons.push(
            "Claims that the recipient has unexpectedly won a prize or reward."
        );
    }


    // Personal Information
    if (
        message.includes("aadhaar") ||
        message.includes("pan card") ||
        message.includes("date of birth") ||
        message.includes("personal details") ||
        message.includes("identity proof")
    ) {
        score += 15;
        detectedReasons.push(
            "Requests potentially sensitive personal information."
        );
    }


    // Suspicious Links

    const hasShortenedLink =
        message.includes("bit.ly") ||
        message.includes("tinyurl") ||
        message.includes("t.co") ||
        message.includes("t.jio") ||
        message.includes("is.gd") ||
        message.includes("ow.ly") ||
        message.includes(".xyz") ||
        message.includes(".top") ||
        message.includes(".click") ||
        message.includes(".link");

    const hasNormalLink =
        /https?:\/\/[^\s]+/i.test(message) ||
        /www\.[^\s]+/i.test(message);

    const hasSuspiciousUrlWords =
        message.includes("/verify") ||
        message.includes("/login") ||
        message.includes("/account") ||
        message.includes("/update") ||
        message.includes("/kyc") ||
        message.includes("/claim") ||
        message.includes("/reward") ||
        message.includes("/payment") ||
        message.includes("/secure") ||
        message.includes("/wallet");

    const hasEmail =
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(message);

    const hasSuspiciousEmail =
        /@[a-z0-9.-]+\.(xyz|top|click|link|online|site|support|info)\b/i.test(message);

    const hasPhoneNumber =
        /(?:\+91[\s-]?)?[6-9]\d{9}\b/.test(message);

    const hasCallPressure =
        message.includes("call now") ||
        message.includes("call immediately") ||
        message.includes("contact now") ||
        message.includes("call this number") ||
        message.includes("contact this number");

    const hasPaymentPressure =
        message.includes("scan qr") ||
        message.includes("scan this qr") ||
        message.includes("scan the qr") ||
        message.includes("pay via upi") ||
        message.includes("send via upi") ||
        message.includes("upi payment") ||
        message.includes("make the payment") ||
        message.includes("payment link");

    const hasQrRequest =
        message.includes("qr code") ||
        message.includes("qr scan") ||
        message.includes("scan qr") ||
        message.includes("scan this qr");

    const hasMoneyAmount =
        /(?:₹|rs\.?|inr)\s?\d{1,3}(?:,\d{2,3})*(?:\.\d+)?\b/i.test(message);

    if (
        hasMoneyAmount &&
        (
            message.includes("won") ||
            message.includes("prize") ||
            message.includes("reward") ||
            message.includes("refund") ||
            message.includes("guaranteed") ||
            message.includes("send money") ||
            message.includes("deposit") ||
            message.includes("processing fee") ||
            message.includes("claim fee") ||
            message.includes("registration fee") ||
            message.includes("urgent") ||
            message.includes("immediately") ||
            message.includes("claim")
        )
    ) {

        score += 10;

        detectedReasons.push(
            "Mentions a specific money amount together with a potentially suspicious request."
        );
    }

    const hasFakeSupportRequest =
        message.includes("customer care") ||
        message.includes("customer support") ||
        message.includes("support team") ||
        message.includes("call support") ||
        message.includes("contact support") ||
        message.includes("speak to our representative") ||
        message.includes("contact our representative");

    const hasAuthorityClaim =
        message.includes("from the bank") ||
        message.includes("from your bank") ||
        message.includes("from the government") ||
        message.includes("from cyber crime") ||
        message.includes("from cybercrime") ||
        message.includes("from income tax") ||
        message.includes("from the income tax department") ||
        message.includes("from the customs department") ||
        message.includes("official notice");

    if (
        hasAuthorityClaim &&
        (
            message.includes("otp") ||
            message.includes("password") ||
            message.includes("pin") ||
            message.includes("upi") ||
            message.includes("send money") ||
            message.includes("pay") ||
            message.includes("payment") ||
            message.includes("bank account") ||
            message.includes("personal details")
        )
    ) {

        score += 25;

        detectedReasons.push(
            "Claims to represent an authority or organization while requesting sensitive information or money."
        );
    }

    if (
        hasFakeSupportRequest &&
        (hasPhoneNumber || hasNormalLink)
    ) {

        score += 15;

        detectedReasons.push(
            "Directs the recipient to customer support through a phone number or link that should be independently verified."
        );
    }

    // Fake Customer Support + Sensitive Request
    if (
        hasFakeSupportRequest &&
        (
            message.includes("otp") ||
            message.includes("password") ||
            message.includes("pin") ||
            message.includes("payment") ||
            message.includes("pay") ||
            message.includes("upi") ||
            message.includes("bank account")
        )
    ) {

        score += 20;

        detectedReasons.push(
            "Impersonates customer support while requesting sensitive information or payment."
        );
    }

    if (hasQrRequest && (hasPaymentPressure || message.includes("pay") || message.includes("payment"))) {

        score += 15;

        detectedReasons.push(
            "Requests scanning a QR code in connection with a payment."
        );
    }

    // QR Code + Suspicious Request
    if (
        hasQrRequest &&
        (
            message.includes("verify") ||
            message.includes("account") ||
            message.includes("kyc") ||
            message.includes("reward") ||
            message.includes("prize") ||
            message.includes("refund") ||
            message.includes("claim") ||
            message.includes("receive")
        )
    ) {

        score += 15;

        detectedReasons.push(
            "Requests scanning a QR code in connection with an account, verification, reward, or refund request."
        );
    }

    if (hasPaymentPressure) {

        score += 15;

        detectedReasons.push(
            "Uses specific payment or UPI instructions that may pressure the recipient into sending money."
        );
    }

    if (hasPhoneNumber && hasCallPressure) {

        score += 15;

        detectedReasons.push(
            "Provides a phone number together with pressure to call or make contact."
        );
    }

    // Phone Number + Sensitive Request
    if (
        hasPhoneNumber &&
        (
            message.includes("otp") ||
            message.includes("password") ||
            message.includes("pin") ||
            message.includes("payment") ||
            message.includes("pay") ||
            message.includes("upi") ||
            message.includes("bank account") ||
            message.includes("account blocked") ||
            message.includes("account suspended")
        )
    ) {

        score += 15;

        detectedReasons.push(
            "Provides a phone number together with a request for sensitive information, account access, or payment."
        );
    }
    
    const hasTrustedLink =
        message.includes("https://google.com") ||
        message.includes("https://www.google.com") ||
        message.includes("https://microsoft.com") ||
        message.includes("https://www.microsoft.com") ||
        message.includes("https://apple.com") ||
        message.includes("https://www.apple.com") ||
        message.includes("https://amazon.com") ||
        message.includes("https://www.amazon.com");

    if (hasShortenedLink) {

        score += 30;

        detectedReasons.push(
            "Contains a suspicious or shortened link that may lead to a fraudulent website."
        );

    } else if (hasNormalLink && hasSuspiciousUrlWords && !hasTrustedLink) {

        score += 20;

        detectedReasons.push(
            "The link contains words commonly associated with account verification, payments, or reward scams."
        );

    } else if (hasNormalLink && !hasTrustedLink) {

        score += 10;

        detectedReasons.push(
            "Contains a link. Verify the website before opening it."
        );
    }

    if (hasSuspiciousEmail) {

        score += 20;

        detectedReasons.push(
            "Contains an email address using a domain commonly associated with suspicious messages."
        );
    }

    // Email + Scam Request
    if (
        hasEmail &&
        (
            message.includes("verify") ||
            message.includes("login") ||
            message.includes("account blocked") ||
            message.includes("account suspended") ||
            message.includes("payment") ||
            message.includes("pay") ||
            message.includes("otp") ||
            message.includes("password") ||
            message.includes("claim")
        )
    ) {

        score += 10;

        detectedReasons.push(
            "Contains an email address together with a request involving account access, payment, or sensitive information."
        );
    }

    // Link + Sensitive Action
    if (
        hasNormalLink &&
        (
            message.includes("verify") ||
            message.includes("login") ||
            message.includes("sign in") ||
            message.includes("password") ||
            message.includes("otp") ||
            message.includes("pin") ||
            message.includes("payment") ||
            message.includes("pay now") ||
            message.includes("account blocked") ||
            message.includes("account suspended")
        )
    ) {

        score += 20;

        detectedReasons.push(
            "Combines a link with a request to verify an account, provide sensitive information, or make a payment."
        );
    }

    // Link + urgency
    if (
        hasShortenedLink &&
        (
            message.includes("urgent") ||
            message.includes("immediately") ||
            message.includes("act now") ||
            message.includes("right now") ||
            message.includes("within 24 hours")
        )
    ) {

        score += 15;

        detectedReasons.push(
            "Combines a suspicious link with urgency or pressure."
        );
    }

    // Messaging Platform + Scam Request
    if (
        (
            message.includes("telegram") ||
            message.includes("whatsapp")
        ) &&
        (
            message.includes("pay") ||
            message.includes("payment") ||
            message.includes("send money") ||
            message.includes("otp") ||
            message.includes("verify") ||
            message.includes("urgent") ||
            message.includes("claim")
        )
    ) {

        score += 15;

        detectedReasons.push(
            "Directs the recipient to a messaging platform while making a payment, verification, or urgent request."
        );
    }

    // Gift Card / Voucher Scam
    if (
        (
            message.includes("gift card") ||
            message.includes("gift voucher") ||
            message.includes("voucher") ||
            message.includes("itunes card") ||
            message.includes("google play card")
        ) &&
        (
            message.includes("buy") ||
            message.includes("send") ||
            message.includes("pay") ||
            message.includes("code") ||
            message.includes("payment")
        )
    ) {

        score += 25;

        detectedReasons.push(
            "Requests a gift card, voucher, or gift-card code as a form of payment."
        );
    }

    // Prize + suspicious link
    if (
        (
            message.includes("you won") ||
            message.includes("you have won") ||
            message.includes("prize") ||
            message.includes("reward") ||
            message.includes("winner")
        ) &&
        hasShortenedLink
    ) {

        score += 15;

        detectedReasons.push(
            "Combines an unexpected prize or reward with a suspicious link."
        );
    }

    // Job + Upfront Payment Scam
    if (
        (
            message.includes("job") ||
            message.includes("job offer") ||
            message.includes("work from home")
        ) &&
        (
            message.includes("registration fee") ||
            message.includes("pay") ||
            message.includes("fee")
        )
    ) {
        score += 25;

        detectedReasons.push(
            "Requests an upfront payment or fee for a job opportunity."
        );
    }

    // Job Scam
    if (
        message.includes("job") ||
        message.includes("job offer")
    ) {
        score += 10;
        detectedReasons.push(
            "Mentions a job opportunity."
        );
    }

    if (message.includes("work from home")) {
        score += 10;
        detectedReasons.push(
            "Promotes a work-from-home opportunity."
        );
    }

    if (
        message.includes("earn ₹") ||
        message.includes("easy money")
    ) {
        score += 15;
        detectedReasons.push(
            "Promises unusually easy or high earnings."
        );
    }

    if (message.includes("registration fee")) {
        score += 20;
        detectedReasons.push(
            "Requests an upfront registration fee."
        );
    }

    if (
        message.includes("pay") &&
        message.includes("start")
    ) {
        score += 15;
        detectedReasons.push(
            "Requests payment before starting the opportunity."
        );
    }


    // Investment Scam
    const isInvestment =
        message.includes("investment") ||
        message.includes("invest") ||
        message.includes("crypto") ||
        message.includes("trading") ||
        message.includes("profit") ||
        message.includes("double your money") ||
        message.includes("guaranteed return") ||
        message.includes("guaranteed profit") ||
        message.includes("risk free investment");

    if (isInvestment) {

        score += 20;

        detectedReasons.push(
            "Promotes an investment opportunity or promises financial returns."
        );
    }


    // Investment + Money Request
    if (
        isInvestment &&
        (
            message.includes("send money") ||
            message.includes("pay") ||
            message.includes("deposit") ||
            message.includes("transfer") ||
            message.includes("upi") ||
            message.includes("bank account") ||
            message.includes("invest ₹") ||
            message.includes("invest rs") ||
            message.includes("invest inr")
        )
    ) {
        score += 25;

        detectedReasons.push(
            "Requests money or a financial deposit for the investment."
        );
    }


    // Guaranteed / High Profit
    if (
        message.includes("guaranteed profit") ||
        message.includes("guaranteed return") ||
        message.includes("double your money") ||
        message.includes("100% profit") ||
        message.includes("huge profit") ||
        message.includes("high profit")
    ) {
        score += 15;

        detectedReasons.push(
            "Promises unusually high or guaranteed investment returns."
        );
    }

    // Impersonation + Sensitive Request
    if (
        (
            message.includes("i am from your bank") ||
            message.includes("bank officer") ||
            message.includes("government officer") ||
            message.includes("police officer") ||
            message.includes("customs officer")
        ) &&
        (
            message.includes("otp") ||
            message.includes("password") ||
            message.includes("pin") ||
            message.includes("send money") ||
            message.includes("upi")
        )
    ) {
        score += 30;

        detectedReasons.push(
            "Combines impersonation with a request for sensitive information or money."
        );
    }

    // Delivery / Customs Scam
    if (
        (
            message.includes("parcel") ||
            message.includes("package") ||
            message.includes("delivery") ||
            message.includes("courier") ||
            message.includes("customs")
        ) &&
        (
            message.includes("pay") ||
            message.includes("payment") ||
            message.includes("fee") ||
            message.includes("₹") ||
            message.includes("rs")
        )
    ) {
        score += 20;

        detectedReasons.push(
            "Mentions a delivery or customs issue and requests payment."
        );
    }

    // Delivery Address Scam
    if (
        (
            message.includes("parcel") ||
            message.includes("package") ||
            message.includes("delivery") ||
            message.includes("courier")
        ) &&
        (
            message.includes("update address") ||
            message.includes("confirm address") ||
            message.includes("verify address") ||
            message.includes("change address") ||
            message.includes("delivery address")
        ) &&
        (
            message.includes("pay") ||
            message.includes("fee") ||
            message.includes("payment") ||
            message.includes("link") ||
            message.includes("click")
        )
    ) {

        score += 20;

        detectedReasons.push(
            "Requests an address update or confirmation together with a payment or link."
        );
    }

    // Delivery / Customs + Urgency
    if (
        (
            message.includes("parcel") ||
            message.includes("package") ||
            message.includes("delivery") ||
            message.includes("courier") ||
            message.includes("customs")
        ) &&
        (
            message.includes("urgent") ||
            message.includes("immediately") ||
            message.includes("act now") ||
            message.includes("right now") ||
            message.includes("within 24 hours")
        )
    ) {
        score += 10;

        detectedReasons.push(
            "Creates urgency or pressure regarding a delivery or customs issue."
        );
    }

    // Delivery / Customs Impersonation
    if (
        (
            message.includes("parcel") ||
            message.includes("package") ||
            message.includes("delivery") ||
            message.includes("courier") ||
            message.includes("customs")
        ) &&
        (
            message.includes("customs officer") ||
            message.includes("customs department") ||
            message.includes("delivery officer") ||
            message.includes("courier officer") ||
            message.includes("official")
        )
    ) {
        score += 20;

        detectedReasons.push(
            "May be impersonating a delivery, customs, or official organization."
        );
    }

    // Government / Legal Notice Scam
    if (
        (
            message.includes("aadhaar") ||
            message.includes("pan card") ||
            message.includes("government") ||
            message.includes("legal notice") ||
            message.includes("legal action") ||
            message.includes("penalty")
        ) &&
        (
            message.includes("pay") ||
            message.includes("payment") ||
            message.includes("fee") ||
            message.includes("fine") ||
            message.includes("₹")
        )
    ) {
        score += 25;

        detectedReasons.push(
            "Uses a government or legal-related claim to request money."
        );
    }

    // Government / Legal + Threat
    if (
        (
            message.includes("aadhaar") ||
            message.includes("government") ||
            message.includes("legal notice") ||
            message.includes("legal action") ||
            message.includes("penalty")
        ) &&
        (
            message.includes("blocked") ||
            message.includes("suspended") ||
            message.includes("arrest") ||
            message.includes("police") ||
            message.includes("will be closed")
        )
    ) {
        score += 20;

        detectedReasons.push(
            "Uses threats or fear involving government or legal consequences."
        );
    }

    // Impersonation
    if (
        message.includes("i am from your bank") ||
        message.includes("bank officer") ||
        message.includes("government officer") ||
        message.includes("police officer") ||
        message.includes("customs officer")
    ) {
        score += 20;

        detectedReasons.push(
            "May be impersonating an official or trusted organization."
        );
    }


    // Balanced risk score
    score = Math.min(score, 100);
    score = Math.round(score);

    const type = detectScamType(message);

    showResult(score, detectedReasons, type);

    saveToHistory(
        message,
        score,
        type,
        detectedReasons,
        confidence.textContent,
        adviceText.textContent
    );

    renderHistory();
    updateDashboardStats();

    analyzeBtn.textContent = "🔍 Analyze Now";
    analyzeBtn.disabled = false;
}


function showResult(score, detectedReasons, type) {

    result.classList.remove("hidden");

    result.style.animation = "none";
    result.offsetHeight;
    result.style.animation = "resultSlideIn 0.45s ease";

    riskScore.textContent = score + "/100";

    if (score >= 70) {
        riskScore.style.color = "#e74c3c";
    } else if (score >= 41) {
        riskScore.style.color = "#f39c12";
    } else if (score >= 21) {
        riskScore.style.color = "#f1c40f";
    } else {
        riskScore.style.color = "#27ae60";
    }

    scamType.textContent = type;

    const calculatedConfidence = Math.min(
        95,
        Math.max(30, score + detectedReasons.length * 5)
    );

    confidence.textContent = calculatedConfidence + "%";

    riskBar.style.width = score + "%";

    if (score >= 90) {
        riskBar.style.background = "linear-gradient(90deg, #8e0000, #e74c3c)";
        riskBar.style.boxShadow = "0 0 14px rgba(231, 76, 60, 0.5)";
    } else if (score >= 70) {
        riskBar.style.background = "linear-gradient(90deg, #e74c3c, #ff6b5a)";
        riskBar.style.boxShadow = "0 0 14px rgba(231, 76, 60, 0.45)";
    } else if (score >= 41) {
        riskBar.style.background = "linear-gradient(90deg, #f39c12, #f7c04a)";
        riskBar.style.boxShadow = "0 0 14px rgba(243, 156, 18, 0.45)";
    } else if (score >= 21) {
        riskBar.style.background = "linear-gradient(90deg, #f1c40f, #ffe45c)";
        riskBar.style.boxShadow = "0 0 14px rgba(241, 196, 15, 0.4)";
    } else {
        riskBar.style.background = "linear-gradient(90deg, #27ae60, #55d98a)";
        riskBar.style.boxShadow = "0 0 14px rgba(39, 174, 96, 0.4)";
    }

    reasons.innerHTML = "";


    if (detectedReasons.length === 0) {

        const li = document.createElement("li");

        li.textContent =
            "No obvious scam indicators were detected.";

        reasons.appendChild(li);

    } else {

        [...new Set(detectedReasons)].forEach(function(reason) {

            const li = document.createElement("li");

            li.textContent = reason;

            reasons.appendChild(li);
        });
    }


    if (score >= 90) {

        riskBadge.textContent = "EXTREMELY DANGEROUS";
        riskBadge.style.background = "#8e0000";
        riskBadge.style.boxShadow = "0 0 16px rgba(231, 76, 60, 0.25)";

        adviceText.textContent =
            "Do not click links, send money, or share OTPs, passwords, or personal information. Stop the interaction and verify through an official source.";

    } else if (score >= 70) {

        riskBadge.textContent = "DANGEROUS";
        riskBadge.style.background = "#e74c3c";
        riskBadge.style.boxShadow = "0 0 16px rgba(231, 76, 60, 0.2)";

        adviceText.textContent =
            "Do not click links, send money, or share sensitive information. Verify the sender through an official source.";

    } else if (score >= 41) {

        riskBadge.textContent = "SUSPICIOUS";
        riskBadge.style.background = "#f39c12";
        riskBadge.style.boxShadow = "0 0 16px rgba(243, 156, 18, 0.2)";

        adviceText.textContent =
            "Be careful. Do not provide sensitive information or send money until you independently verify the sender and request.";

    } else if (score >= 21) {

        riskBadge.textContent = "SLIGHTLY SUSPICIOUS";
        riskBadge.style.background = "#f1c40f";
        riskBadge.style.boxShadow = "0 0 16px rgba(241, 196, 15, 0.18)";

        adviceText.textContent =
            "Be cautious and verify the message before taking any action.";

    } else {

        riskBadge.textContent = "LOW RISK";
        riskBadge.style.background = "#27ae60";
        riskBadge.style.boxShadow = "0 0 16px rgba(39, 174, 96, 0.18)";

        adviceText.textContent =
            "No major warning signs were detected, but always verify unexpected requests before taking action.";
    }
}


function detectScamType(message) {

    if (message.trim() === "") {
        return "No Scam Detected";
    }

    // High-Risk Investment Scam
    if (
        (
            message.includes("investment") ||
            message.includes("invest") ||
            message.includes("crypto") ||
            message.includes("trading")
        ) &&
        (
            message.includes("guaranteed profit") ||
            message.includes("guaranteed return") ||
            message.includes("double your money") ||
            message.includes("send money") ||
            message.includes("deposit")
        )
    ) {
        return "Investment Scam";
    }

    // Investment
    if (
        message.includes("investment") ||
        message.includes("invest") ||
        message.includes("profit") ||
        message.includes("crypto") ||
        message.includes("trading") ||
        message.includes("double your money") ||
        message.includes("guaranteed return") ||
        message.includes("guaranteed profit")
    ) {
        return "Investment Scam";
    }

    // Delivery / Customs Scam
    if (
        message.includes("parcel") ||
        message.includes("package") ||
        message.includes("delivery") ||
        message.includes("courier") ||
        message.includes("customs")
    ) {
        return "Delivery / Customs Scam";
    }

    // Government / Legal Scam
    if (
        (
            message.includes("aadhaar") ||
            message.includes("pan card") ||
            message.includes("government") ||
            message.includes("legal notice") ||
            message.includes("legal action") ||
            message.includes("penalty")
        ) &&
        (
            message.includes("pay") ||
            message.includes("payment") ||
            message.includes("fee") ||
            message.includes("fine") ||
            message.includes("₹")
        )
    ) {
        return "Government / Legal Scam";
    }

    // KYC Scam
    if (
        message.includes("kyc") ||
        message.includes("kyc verification") ||
        message.includes("update your kyc")
    ) {
        return "KYC Scam";
    }

    // Pay to Receive Scam
    if (
        (
            message.includes("send money") ||
            message.includes("send ₹") ||
            message.includes("pay")
        ) &&
        (
            message.includes("receive money") ||
            message.includes("get money") ||
            message.includes("receive your money") ||
            message.includes("in your account")
        )
    ) {
        return "Pay to Receive Scam";
    }

    // QR Code Scam
    if (
        message.includes("qr code") ||
        message.includes("qr scan") ||
        message.includes("scan qr") ||
        message.includes("scan this qr")
    ) {
        return "QR Code Scam";
    }

    // Banking / OTP Scam
    if (
        message.includes("otp") ||
        message.includes("one time password") ||
        message.includes("verification code") ||
        message.includes("password") ||
        message.includes("pin")
    ) {
        return "Banking / OTP Scam";
    }

    // Banking / Payment Scam
    if (
        message.includes("upi") ||
        message.includes("bank account") ||
        message.includes("bank") ||
        message.includes("account blocked") ||
        message.includes("account suspended")
    ) {
        return "Banking / Payment Scam";
    }

    // Job Scam
    if (
        (
            message.includes("job") ||
            message.includes("job offer") ||
            message.includes("work from home")
        ) &&
        (
            message.includes("registration fee") ||
            message.includes("fee") ||
            message.includes("pay") ||
            message.includes("easy money") ||
            message.includes("earn money")
        )
    ) {
        return "Job Scam";
    }

    // Prize
    if (
        (
            message.includes("you won") ||
            message.includes("you have won") ||
            message.includes("winner") ||
            message.includes("lottery") ||
            message.includes("prize") ||
            message.includes("reward") ||
            message.includes("processing fee") ||
            message.includes("claim fee")
        ) &&
        !message.includes("refund")
    ) {
        return "Prize / Lottery Scam";
    }

    // Refund Fee Scam
    if (
        (
            message.includes("refund") ||
            message.includes("reward")
        ) &&
        (
            message.includes("processing fee") ||
            message.includes("claim fee") ||
            message.includes("pay a fee") ||
            message.includes("small fee")
        )
    ) {
        return "Refund / Fee Scam";
    }

    // Impersonation
    if (
        message.includes("police") ||
        message.includes("government officer") ||
        message.includes("bank officer") ||
        message.includes("customs officer")
    ) {
        return "Impersonation Scam";
    }

    // Phishing Scam
    if (
        message.includes("bit.ly") ||
        message.includes("tinyurl") ||
        message.includes("t.co") ||
        message.includes("t.jio") ||
        message.includes(".xyz") ||
        message.includes(".top") ||
        message.includes(".click") ||
        message.includes(".link")
    ) {
        return "Phishing Scam";
    }

    if (
        message.includes("http://") ||
        message.includes("https://")
    ) {
        return "Link Detected";
    }

    return "No Scam Detected";
}

renderHistory();

const totalScansElement = document.getElementById("totalScans");
const dangerousScansElement = document.getElementById("dangerousScans");
const suspiciousScansElement = document.getElementById("suspiciousScans");
const lowRiskScansElement = document.getElementById("lowRiskScans");

function updateDashboardStats() {
    const history = JSON.parse(localStorage.getItem("scamHistory")) || [];

    let dangerous = 0;
    let suspicious = 0;
    let lowRisk = 0;

    history.forEach(scan => {
        if (scan.score >= 70) {
            dangerous++;
        } else if (scan.score >= 21) {
            suspicious++;
        } else {
            lowRisk++;
        }
    });

    totalScansElement.textContent = history.length;
    dangerousScansElement.textContent = dangerous;
    suspiciousScansElement.textContent = suspicious;
    lowRiskScansElement.textContent = lowRisk;
}

updateDashboardStats();