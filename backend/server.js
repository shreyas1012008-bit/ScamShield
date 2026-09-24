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