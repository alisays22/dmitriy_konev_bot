const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {choiseServiceKeyboard} = require("./choiseServiceKeyboard");
const{handleError} = require("../../../plugin/handleError")

      // Выбор категории с массажем
composer.action("choiceService", async (ctx) => {
  try{
await ctx.answerCbQuery();
 // Обновление медиа-контента, подписи и клавиатуры
 await ctx.editMessageMedia(
  {
    type: "photo",
    media: { source: "images/choice.jpg" },
    caption: "<b>Выберите с чем бы вы хотели поработать?</b>",
    parse_mode: "HTML",
  },
  await choiseServiceKeyboard()
);
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}

})



module.exports = composer;


