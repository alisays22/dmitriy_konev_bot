const { Composer, Markup } = require("telegraf");
const composer = new Composer();


const {Service} = require("../../connection/model/people");
const{handleError} = require("../../../plugin/handleError")

const choiceKeyboard = (productId) => ({
  inline_keyboard: [
    [{ text: "📅 Записаться на сеанс", callback_data: `day_${productId}` }],
    [{ text: "⬅️ Назад", callback_data: "choiceService" }]
  ],
});
    // Карточка терапим
composer.action(/^backMassage_(\d+)/, async (ctx) => {
  try{
  await ctx.answerCbQuery("Назад");

const productId = ctx.match[1];
const product = await Service.findOne({where:{id:productId}})
  // Обновление медиа-контента, подписи и клавиатуры
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { url: `${product.imageURL}` },
      caption: `<b>${product.name}</b>\n<code>${product.time} мин</code>\n\n<i>${product.description}</i>\n\n<b>Цена:</b> ${product.price} ₽`,
      parse_mode: "HTML",
    },
  );
  // Обновление клавиатуры
  await ctx.editMessageReplyMarkup(choiceKeyboard(product.id));
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});

module.exports = composer;


