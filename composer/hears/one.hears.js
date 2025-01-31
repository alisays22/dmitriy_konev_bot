const { Telegraf} = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);


bot.action("addService", async(ctx) => ctx.scene.enter("oneWizard"));

// Export the bot instance
module.exports = bot;
