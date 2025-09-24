// openai.ts
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import InfoAiModel from "../models/InfoAiModel.js";
dotenv.config();

const router = express.Router();

router.post("/ask", (req, res): void => {
  const { messages } = req.body;
  (async () => {
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    try {
      const storedInfos = await InfoAiModel.find().sort({ createdAt: -1 });
      const storedText = storedInfos.map((i) => i.info).join("\n");

      const contextMessage =
        storedText.trim().length > 0
          ? `Here is the known information:\n${storedText}`
          : "Манай мэдээллийн санд одоогоор мэдээлэл алга байна.";

      const fullMessages = [
        { role: "system", content: contextMessage },
        ...messages,
      ];

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1",
            messages: fullMessages,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("/ask error:", err);
      res.status(500).json({ error: "OpenAI-рүү илгээхэд алдаа гарлаа." });
    }
  })();
});

export default router;
