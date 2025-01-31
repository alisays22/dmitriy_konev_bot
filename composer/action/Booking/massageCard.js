const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {Service,Purchase,Person} = require("../../connection/model/people");
const{handleError} = require("../../../plugin/handleError")

async function choiceKeyboard (productId) {
  return {reply_markup: { inline_keyboard: [
    [{ text: "📅 Записаться на сеанс", callback_data: `day_${productId}` }],
    [{ text: "⬅️ Назад", callback_data: "choiceService" }]
  ],
  }
  }
}
    // Карточка массажа c описание и ценой
composer.action(/^choice_(\d+)/, async (ctx) => {
  try{
const productId = ctx.match[1];
const product = await Service.findOne({where:{id:productId}})

const existingUser = await Person.findOne({where: { telegramId: ctx.from.id },});
const purchase = await Purchase.findOne({where: {personId: existingUser.id, status: "pending"}})

if(purchase){
  await ctx.answerCbQuery("Вы уже записаны на консультацию, дождитесь ответа специалиста",{show_alert: true});
  return; 
}else{
  await ctx.answerCbQuery();
 // Обновление медиа-контента, подписи и клавиатуры
 await ctx.editMessageMedia(
  {
    type: "photo",
    media: { url: `${product.imageURL}` },
    caption: `<b>${product.name}</b>\n<code>${product.time} мин</code>\n\n<i>${product.description}</i>\n\n<b>Цена:</b> ${product.price} ₽`,
    parse_mode: "HTML",
  },
  await choiceKeyboard(product.id)
);
}
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});

module.exports = composer;


