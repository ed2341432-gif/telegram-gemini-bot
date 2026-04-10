import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const TG_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.get("/health", (req, res) => res.send("OK"));

app.post("/webhook", async (req, res) => {
  const msg = req.body?.message;
  if (!msg?.text) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    const gemini = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      { contents: [{ parts: [{ text }] }] },
      { params: { key: GEMINI_API_KEY } }
    );

    const reply =
      gemini.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini не ответил.";

    await axios.post(`${TG_API}/sendMessage`, {
      chat_id: chatId,
      text: reply
    });
  } catch (e) {
    console.error("Ошибка:", e.message);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Bot running on 3000"));
