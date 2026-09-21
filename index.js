const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const app = express();

app.use(express.json());

const TOKEN = process.env.TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;
const FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;

let waitingForRename = {};

async function sendMessage(chatId, text) {
    await axios.post(`${API}/sendMessage`, { chat_id: chatId, text });
}

app.post("/", async (req, res) => {
    try {
        const msg = req.body.message;
        if (!msg || !msg.chat || !msg.chat.id) return res.sendStatus(200);

        const chatId = msg.chat.id;

        // کاربر فایل فرستاده
        if (msg.document) {
            const fileId = msg.document.file_id;

            // گرفتن لینک فایل
            const fileInfo = await axios.get(`${API}/getFile?file_id=${fileId}`);
            const filePath = fileInfo.data.result.file_path;
            const fileUrl = `${FILE_API}/${filePath}`;

            waitingForRename[chatId] = { fileUrl };

            await sendMessage(chatId, "مشتی اسم جدید فایل رو بفرست 😎");
            return res.sendStatus(200);
        }

        // کاربر اسم جدید را فرستاد
        if (waitingForRename[chatId]) {
            const newName = msg.text.trim();
            const { fileUrl } = waitingForRename[chatId];

            const tempPath = path.join(__dirname, newName);

            // دانلود فایل
            const fileData = await axios.get(fileUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(tempPath, fileData.data);

            // آپلود فایل با نام جدید
            const formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append("document", fs.createReadStream(tempPath));

            await axios.post(`${API}/sendDocument`, formData, {
                headers: formData.getHeaders()
            });

            fs.unlinkSync(tempPath);
            delete waitingForRename[chatId];

            return res.sendStatus(200);
        }

        // پیام معمولی
        await sendMessage(chatId, "مشتی الان نیستم، بیاد جوابتو میده ❤️");
        res.sendStatus(200);

    } catch (err) {
        console.log("Error:", err);
        res.sendStatus(200);
    }
});

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(3000, () => console.log("Bot running"));
