const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const { Service,Person,Purchase } = require("../../connection/model/people");
const {handleError} = require("../../../plugin/handleError")


// Карточка Бесплатной консультации
composer.action("freeСonsultation", async (ctx) => {
  try{
  const product = await Service.findOne({ where: { id: 1 } });
  
  await ctx.answerCbQuery();
  // Обновление медиа-контента, подписи и клавиатуры
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: { url: `${product.imageURL}` },
      caption: `<b>${product.name}</b>\n<code>${product.time} мин</code>\n\n${product.description}\n\n<b>Цена:</b> ${product.price} ₽`,
      parse_mode: "HTML",
    },
    {reply_markup: {
        inline_keyboard: [
          [{text: "📅 Записаться на БЕСПЛАТНУЮ КОНСУЛЬТАЦИЮ",callback_data: `freeSignUp`,},],
          [{ text: "⬅️ Назад", callback_data: "back" }],
        ],
      },
    }
  );
} catch (error) {
  await handleError(error, ctx, 'critical', __filename);
}
});


module.exports = composer;
