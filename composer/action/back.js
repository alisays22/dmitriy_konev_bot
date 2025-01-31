const { Composer, Markup } = require("telegraf");
const composer = new Composer();
const {Person,Appointment,Service,Purchase,Message} = require("../connection/model/people");

// // Клавиатура стартового экрана
const startKeyboard = require("./start/startKeyboard");
const {handleError} = require("../../plugin/handleError")
const {editStartMenu} = require('./start/startMenu')

//Кнопка выхода из категориюю добавление товаров по команде /add
composer.action("back", async (ctx) => {
  await ctx.answerCbQuery();
try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  await editStartMenu(ctx, user);
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});

module.exports = composer;
