require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

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
  // Add more files here as needed up to 6
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
  const welcomeMessage = `Welcome to the General Retreat Bot! 🎉\n\nI can help you access important retreat documents. Please select a file from the options below:`;

  bot.sendMessage(chatId, welcomeMessage, fileOptions);
});

// Handle callback queries (when user clicks a button)
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const fileId = query.data.split("_")[1];

  // Find the selected file
  const selectedFile = files.find((file) => file.id === fileId);

  if (selectedFile) {
    try {
      await bot.answerCallbackQuery(query.id);

      // Send the file
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
