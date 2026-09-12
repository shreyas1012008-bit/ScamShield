const analyzeBtn = document.getElementById("analyzeBtn");
const messageInput = document.getElementById("message");

const result = document.getElementById("result");
const riskBadge = document.getElementById("riskBadge");
const riskScore = document.getElementById("riskScore");
const riskBar = document.getElementById("riskBar");
const reasons = document.getElementById("reasons");
const adviceText = document.getElementById("adviceText");
const scamType = document.getElementById("scamType");
const confidence = document.getElementById("confidence");

analyzeBtn.addEventListener("click", analyzeMessage);

function analyzeMessage() {

    const message = messageInput.value.trim().toLowerCase();

    if (message === "") {
        alert("Please paste a message first.");
        return;
    }

    let score = 0;
    let riskFactors = 0;
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
    if (
        message.includes("verify your account") ||
        message.includes("verify account") ||
        message.includes("account details")
    ) {
        score += 10;
        detectedReasons.push(
            "Requests account verification or account details."
        );
    }

    // OTP / Password
    if (
        message.includes("otp") ||
        message.includes("one time password") ||
        message.includes("verification code") ||
        message.includes("password") ||
        message.includes("pin")
    ) {
        score += 25;
        detectedReasons.push(
            "Requests sensitive authentication information."
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
        message.includes(".xyz") ||
        message.includes(".top") ||
        message.includes(".click") ||
        message.includes(".link");

    const hasNormalLink =
        message.includes("http://") ||
        message.includes("https://");
    
    const hasTrustedLink =
        message.includes("google.com") ||
        message.includes("microsoft.com") ||
        message.includes("apple.com") ||
        message.includes("amazon.com");

    if (hasShortenedLink) {

        score += 30;

        detectedReasons.push(
            "Contains a suspicious or shortened link that may lead to a fraudulent website."
        );

    } else if (hasNormalLink && !hasTrustedLink) {

        score += 10;

        detectedReasons.push(
            "Contains a link. Verify the website before opening it."
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
        message.includes("return") ||
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
}


function showResult(score, detectedReasons, type) {

    result.classList.remove("hidden");

    riskScore.textContent = score + "/100";

    scamType.textContent = type;

    const calculatedConfidence = Math.min(
        95,
        Math.max(30, score + detectedReasons.length * 5)
    );

    confidence.textContent = calculatedConfidence + "%";

    riskBar.style.width = score + "%";

    reasons.innerHTML = "";


    if (detectedReasons.length === 0) {

        const li = document.createElement("li");

        li.textContent =
            "No obvious scam indicators were detected.";

        reasons.appendChild(li);

    } else {

        detectedReasons.forEach(function(reason) {

            const li = document.createElement("li");

            li.textContent = reason;

            reasons.appendChild(li);
        });
    }


    if (score >= 90) {

        riskBadge.textContent = "EXTREMELY DANGEROUS";
        riskBadge.style.background = "#8e0000";

        adviceText.textContent =
            "Do not click links, send money, or share OTPs, passwords, or personal information. Stop the interaction and verify through an official source.";

    } else if (score >= 70) {

        riskBadge.textContent = "DANGEROUS";
        riskBadge.style.background = "#e74c3c";

        adviceText.textContent =
            "Do not click links, send money, or share sensitive information. Verify the sender through an official source.";

    } else if (score >= 41) {

        riskBadge.textContent = "SUSPICIOUS";
        riskBadge.style.background = "#f39c12";

        adviceText.textContent =
            "Be careful. Do not provide sensitive information or send money until you independently verify the sender and request.";

    } else if (score >= 21) {

        riskBadge.textContent = "SLIGHTLY SUSPICIOUS";
        riskBadge.style.background = "#f1c40f";

        adviceText.textContent =
            "Be cautious and verify the message before taking any action.";

    } else {

        riskBadge.textContent = "LOW RISK";
        riskBadge.style.background = "#27ae60";

        adviceText.textContent =
            "No major warning signs were detected, but always verify unexpected requests before taking action.";
    }
}


function detectScamType(message) {

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

    // Phishing Scam
    if (
        message.includes("bit.ly") ||
        message.includes("tinyurl") ||
        message.includes("t.co") ||
        message.includes(".xyz") ||
        message.includes(".top") ||
        message.includes(".click") ||
        message.includes(".link")
    ) {
        return "Phishing Scam";
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

    // KYC Scam
    if (
        message.includes("kyc") ||
        message.includes("kyc verification") ||
        message.includes("update your kyc")
    ) {
        return "KYC Scam";
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

    // Banking / OTP
    if (
        message.includes("otp") ||
        message.includes("one time password") ||
        message.includes("verification code") ||
        message.includes("password") ||
        message.includes("pin") ||
        message.includes("upi") ||
        message.includes("bank account")
    ) {
        return "Banking / OTP Scam";
    }


    // Job
    if (
        message.includes("job") ||
        message.includes("work from home") ||
        message.includes("salary") ||
        message.includes("registration fee") ||
        message.includes("earn money")
    ) {
        return "Job Scam";
    }


    // Prize
    if (
        message.includes("you won") ||
        message.includes("you have won") ||
        message.includes("winner") ||
        message.includes("lottery") ||
        message.includes("prize") ||
        message.includes("reward") ||
        message.includes("processing fee") ||
        message.includes("claim fee")
    ) {
        return "Prize / Lottery Scam";
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


    return "No Scam Detected";
}