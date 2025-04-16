require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
// const fs = require("fs");
// const path = require("path");
const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.status(200).send("OK - Bot is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

function keepAlive() {
  const url = "https://general-retreat-bot.onrender.com/health";
  setInterval(() => {
    fetch(url)
      .then(() => console.log("Ping successful"))
      .catch((err) => console.error("Ping failed:", err));
  }, 13 * 60 * 1000); // Every 13 minutes (Render times out after 15 min of inactivity)
}

// Call this function when the app starts
keepAlive();

// Create bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

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
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

console.log("Bot is running...");
