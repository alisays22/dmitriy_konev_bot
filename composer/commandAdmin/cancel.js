const { Composer, Markup } = require("telegraf");
const composer = new Composer();


//Кнопка выхода из категориюю добавление товаров по команде /add
composer.action("cancel", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithHTML("<i>Добавление услуги отменено</i>")
  await ctx.deleteMessage(); // Удаляет сообщение с кнопками
  return ctx.scene.leave();
});



module.exports = composer;  