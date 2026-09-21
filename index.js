const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const TOKEN = process.env.TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;
const FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;

let waitingForRename = {}; // ذخیره چت‌هایی که منتظر اسم جدید هستند

// تابع ارسال پیام
async function sendMessage(chatId, text) {
    await axios.post(`${API}/sendMessage`, {
        chat_id: chatId,
        text
    });
}

// تابع ارسال فایل
async function sendDocument(chatId, fileUrl, newName) {
    await axios.post(`${API}/sendDocument`, {
        chat_id: chatId,
        document: fileUrl,
        caption: `فایل با نام جدید آماده شد مشتی: ${newName}`
    });
}

app.post("/", async (req, res) => {
    try {
        const msg = req.body.message;
        if (!msg || !msg.chat || !msg.chat.id) return res.sendStatus(200);

        const chatId = msg.chat.id;

        // اگر کاربر فایل فرستاده
        if (msg.document) {
            const fileId = msg.document.file_id;

            // گرفتن لینک فایل
            const fileInfo = await axios.get(`${API}/getFile?file_id=${fileId}`);
            const filePath = fileInfo.data.result.file_path;
            const fileUrl = `${FILE_API}/${filePath}`;

            // ذخیره فایل برای این چت
            waitingForRename[chatId] = {
                fileUrl,
                originalName: msg.document.file_name
            };

            await sendMessage(chatId, "مشتی اسم جدید فایل رو بفرست 😎");
            return res.sendStatus(200);
        }

        // اگر کاربر اسم جدید را فرستاد
        if (waitingForRename[chatId]) {
            const newName = msg.text;

            const { fileUrl } = waitingForRename[chatId];

            // ارسال فایل با نام جدید
            await sendDocument(chatId, fileUrl, newName);

            delete waitingForRename[chatId]; // پاک کردن حالت انتظار

            return res.sendStatus(200);
        }

        // اگر پیام معمولی بود → جواب هوشمند بده
        const text = msg.text?.toLowerCase() || "";
        let reply = "مشتی الان نیستم، بیاد جوابتو میده ❤️";

        if (text.includes("سلام")) reply = "سلام مشتی، فعلاً نیستم ولی پیام‌تو دیدم 😎";
        if (text.includes("?")) reply = "داش فعلاً نیستم، بعداً جواب میدم 🤝";
        if (text.length > 40) reply = "پیام طولانی بود مشتی، بعداً کامل جواب میدم 😅";

        await sendMessage(chatId, reply);

        res.sendStatus(200);
    } catch (err) {
        console.log("Error:", err);
        res.sendStatus(200);
    }
});

app.get("/", (req, res) => {
    res.send("Bot is running");
});

app.listen(3000, () => console.log("Bot running"));
