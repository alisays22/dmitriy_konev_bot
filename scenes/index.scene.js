const { Telegraf,Scenes, session } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);


const oneWizard = require("./addServices");
const twoWizard= require("./withOutName");


 const stage = new Scenes.Stage([oneWizard,twoWizard]);


bot.use(stage.middleware());


module.exports = bot
