const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {Service,Person, Purchase} = require("../../connection/model/people");
const {handleError} = require("../../../plugin/handleError")



composer.hears(/service_(\d+)/, async (ctx) => {
  try{
  const serviceId = ctx.match[1];
  const service = await Service.findOne({ where: { id: serviceId } }); // Находим услугу с указанным именем

  if (!service) {
    await ctx.reply('Услуга не найдена.');
    return;
  }

  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const hasFreeConsultation = await Purchase.count({ where: { personId: user.id, serviceId: 1, status: ["pending", "confirmed"] } });

  await ctx.deleteMessage();
  const { id, name, description, imageURL, price } = service;

  let inlineKeyboard = [];


  if (serviceId === '1') {
    if (hasFreeConsultation > 0) {
      inlineKeyboard.push([]);
    } else {
      inlineKeyboard.push([{ text: "📅 Записаться на БЕСПЛАТНУЮ КОНСУЛЬТАЦИЮ", callback_data: `freeSignUp` }]);
    }
  } else {
    inlineKeyboard.push([{ text: '🖊 Записаться', callback_data: `day_${id}` }, { text: '💆‍♀️ Услуги', switch_inline_query_current_chat: 'Услуги' }]);
  }

  inlineKeyboard.push([{ text: 'Закрыть', callback_data: `closeList` }]);

  ctx.replyWithPhoto({ url: imageURL }, {
    caption: `<b>${name}</b>\n\n<i>${description}</i>\n\n<b>Цена: ${price} ₽</b>\n\n`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});
module.exports = composer;


