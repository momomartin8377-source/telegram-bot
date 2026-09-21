const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const TOKEN = process.env.TOKEN;
const URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

app.post("/", async (req, res) => {
    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    await axios.post(URL, {
        chat_id: chatId,
        text: "پیامت رسید: " + text
    });

    res.sendStatus(200);
});

app.get("/", (req, res) => {
    res.send("Bot is running");
});

app.listen(3000, () => console.log("Bot running"));
