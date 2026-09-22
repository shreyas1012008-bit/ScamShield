require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/analyze", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        const response = await client.responses.create({
            model: "gpt-5.6-luna",
            input: `
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
Do not use Markdown, asterisks, bold formatting, or special formatting. Return plain text only.
Put each of the 4 requested items on a separate line.
`
        });

        res.json({
            analysis: response.output_text
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