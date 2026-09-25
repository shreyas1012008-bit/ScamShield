require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        const response = await axios.post(
            "https://api.sarvam.ai/v1/chat/completions",
            {
                model: "sarvam-105b",
                messages: [
                    {
                        role: "user",
                        content: `
        You are a scam detection assistant.

        The message may have been extracted from a screenshot using OCR.
        OCR can introduce spelling mistakes, missing characters, or random-looking text.
        Treat obvious OCR errors as noise unless they clearly affect the meaning.
        Focus on meaningful scam indicators such as suspicious links, requests for money,
        OTPs, passwords, account threats, urgency, impersonation, and requests for
        sensitive information.
        Do not increase the risk level merely because of unusual or garbled text.

        Distinguish between warning signs and proof of a scam.
        Do not label a message as definitely fraudulent based only on a shortened URL,
        urgency, a promotional offer, or a request to claim a reward.
        Legitimate organizations may also use promotional messages, coupons, and
        shortened links.
        If the message contains suspicious indicators but there is not enough evidence
        to establish fraud, clearly state that the message should be independently
        verified rather than claiming certainty.
        Consider the overall context of the message when choosing the risk level.

        Base explanations only on evidence actually present in the message.
        Do not assume that a reward is unrealistic, a sender is impersonating an organization,
        or a link is fraudulent unless the message provides evidence supporting that conclusion.

        Analyze the following message for possible scam indicators.

        Message:
        ${message}

        Return exactly 4 lines in this format:

        Risk level: LOW, MEDIUM, HIGH, or EXTREME
        Scam type: [scam type]
        Short explanation: [short explanation]
        Recommended action: [recommended action]

        Be factual and do not claim certainty when the evidence is unclear.
        Do not use Markdown, asterisks, bold formatting, or special formatting.
        Return plain text only.
        `
                    }
                ],
                max_tokens: 500,
                reasoning_effort: null
            },
            {
                headers: {
                    "api-subscription-key": process.env.SARVAM_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            analysis: response.data.choices[0].message.content
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI analysis failed"
        });

    }

});

app.listen(3000, () => {
    console.log("ScamShield AI server running on http://localhost:3000");
});