const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const TOKEN = process.env.TOKEN;
const URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

// جواب‌های هوشمند با شخصیت مشتی
const smartReplies = {
    greetings: [
        "سلام مشتی، الان نیستم ولی پیام‌تو دیدم ❤️",
        "سلام رفیق، فعلاً نیستم، بعداً میام 🤝",
        "سلام داش، الان درگیرم، بعداً جواب میدم 😎"
    ],
    badwords: [
        "مشتی آروم باش، فحش نده 😅",
        "داش چرا فحش؟ آدم باش دیگه 😎",
        "رفیق فحش نزن، من رباتم ولی ناراحت میشم 😂"
    ],
    questions: [
        "الان نیستم، بعداً جواب میدم مشتی 🤝",
        "داش فعلاً نیستم، ولی پیام‌تو دیدم 👌",
        "رفیق الان در دسترس نیستم، بعداً میام 😎"
    ],
    emojis: [
        "ایموجی باحال بود مشتی 😂",
        "داش ایموجی فرستادی؟ خوشم اومد 😎",
        "ایموجی رسید، فعلاً نیستم ولی دیدم 😁"
    ],
    longText: [
        "داش چه پیام طولانی‌ای دادی 😅 الان نیستم ولی کامل می‌خونمش بعداً",
        "رفیق پیام بلند بود، فعلاً نیستم ولی رسید 👌",
        "مشتی طولانی نوشتی، بعداً کامل جواب میدم ❤️"
    ],
    shortText: [
        "باشه مشتی، فعلاً نیستم ولی رسید 👌",
        "داش کوتاه نوشتی، دیدم پیام‌تو 😎",
        "رفیق فعلاً نیستم، ولی پیام کوتاهت رسید ❤️"
    ],
    default: [
        "مشتی الان نیستم، بیاد جوابتو میده ❤️",
        "داش فعلاً نیستم، پیام‌تو دیدم 👌",
        "رفیق الان درگیرم، بعداً میام 😎"
    ]
};

// تابع انتخاب جواب تصادفی
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

app.post("/", async (req, res) => {
    try {
        const msg = req.body.message;
        if (!msg || !msg.chat || !msg.chat.id) return res.sendStatus(200);

        const chatId = msg.chat.id;
        const text = msg.text?.toLowerCase() || "";
        let reply = pick(smartReplies.default);

        // سلام
        if (text.includes("سلام") || text.includes("hi") || text.includes("hello")) {
            reply = pick(smartReplies.greetings);
        }

        // فحش
        if (text.includes("کس") || text.includes("کیر") || text.includes("جنده") || text.includes("fuck")) {
            reply = pick(smartReplies.badwords);
        }

        // سؤال
        if (text.includes("?") || text.includes("چرا") || text.includes("کجایی") || text.includes("هستی")) {
            reply = pick(smartReplies.questions);
        }

        // ایموجی
        if (/[😀😁😂🤣😍😎😅😢😭😡❤️💔🔥✨💀]/.test(text)) {
            reply = pick(smartReplies.emojis);
        }

        // پیام طولانی
        if (text.length > 40) {
            reply = pick(smartReplies.longText);
        }

        // پیام کوتاه
        if (text.length > 0 && text.length < 10) {
            reply = pick(smartReplies.shortText);
        }

        await axios.post(URL, { chat_id: chatId, text: reply });

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
