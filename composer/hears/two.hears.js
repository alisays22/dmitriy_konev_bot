const { Telegraf, session, Scenes, Markup,} = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);


bot.action(/time_(.+)/, async(ctx) => ctx.scene.enter("twoWizard"));

// Export the bot instance
module.exports = bot;
