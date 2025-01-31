const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();


const {Service} =require("../connection/model/people");


async function displayProduct(ctx, serviceId) {
  const service = await Service.findByPk(serviceId);
  if (!service) {
      await ctx.replyWithHTML("Не могу найти такой товар.");
      return;
  }

  await ctx.replyWithPhoto(
    { url: service.imageURL },
    {
      caption: `<b>${service.name}</b>\n<code>${service.time} мин</code>\n\n<i>${service.description}</i>\n\n<b>Цена:</b> ${service.price} ₽`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Удалить карточку", callback_data: `delete_${serviceId}` }],
          [{ text: "Добавить новый товар", callback_data: "addService" }],
          [{ text: "Закрыть", callback_data: "close" }],
        ],
      },
    }
  );
}

// Просмотр карточки сохраненного товара
composer.action(/^product_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  // Извлекаем ID из callback_data
  const serviceId = ctx.match[1];
  await displayProduct(ctx, serviceId);
});


module.exports = composer;  