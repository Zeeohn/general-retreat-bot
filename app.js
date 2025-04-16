require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const app = express();

const url = "https://general-retreat-bot.onrender.com";
const port = parseInt(process.env.PORT || "3000", 10);

// Create bot instance with webhook
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  webHook: {
    port: port,
  },
});

// Set the webhook
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

app.use(express.json());

// Handle webhook endpoint
app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK - Bot is running");
});

// Define available files
const files = [
  {
    id: "1",
    name: "Leadership Retreat 2025 Docket",
    path: "./Leadership Retreat 2025 Docket.pdf",
  },
  {
    id: "2",
    name: "Leadership Retreat 2025 Invitees",
    path: "./Leadership retreat 2025 invitees.pdf",
  },
];

// Create keyboard markup for file options
const fileOptions = {
  reply_markup: {
    inline_keyboard: files.map((file) => [
      { text: file.name, callback_data: `file_${file.id}` },
    ]),
  },
};

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `Welcome to the General Workers Retreat Bot! 🎉\n\nI can help you access important retreat documents. Please select a file from the options below:`;

  bot.sendMessage(chatId, welcomeMessage, fileOptions);
});

// Handle callback queries (when user clicks a button)
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const fileId = query.data.split("_")[1];

  const selectedFile = files.find((file) => file.id === fileId);

  if (selectedFile) {
    try {
      await bot.answerCallbackQuery(query.id);

      await bot.sendDocument(chatId, selectedFile.path, {
        caption: `Here's your requested file: ${selectedFile.name}`,
      });
    } catch (error) {
      console.error("Error sending file:", error);
      bot.sendMessage(
        chatId,
        "Sorry, there was an error sending the file. Please try again later."
      );
    }
  }
});

// Error handling
bot.on("error", (error) => {
  console.error("Bot error:", error);
});

// Update the listen configuration to bind to 0.0.0.0
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
