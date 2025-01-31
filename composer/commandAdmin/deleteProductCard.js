const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const {Service} =require("../connection/model/people");
const {sleep} = require("../../plugin/sleep")

const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число

async function createKeyboard() {
  const services = await Service.findAll();
  const inline_keyboard = services.map((service, index) => {
    const callbackData = `product_${service.id}`;
    return [{ text: `${index + 1}. ${service.name}`, callback_data: callbackData }];
  });

  // Добавить кнопки "Добавить" и "Выйти"
  inline_keyboard.push([{ text: "✅ Добавить", callback_data: "addService" }]);
  inline_keyboard.push([{ text: "Выйти", callback_data: "back" }]);

  return {
    reply_markup: {
      inline_keyboard
    }
  };
}
  
// Удаление карточки товара
composer.action(/^delete_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();

  const serviceId = ctx.match[1];
  if (ctx.from.id === ENGINEER) {
    try {
      const service = await Service.findByPk(serviceId);

      if (service) {
        await Service.destroy({where: { id: service.id,},});
       await  ctx.replyWithHTML(`Продукт <b>${service.name}</b> с <b>ID: ${service.id}</b> удален.`);
await sleep(500)
        // Удаляем сообщение с карточкой и клавишами продукта
        const keyboard = await createKeyboard();
        const messageId = ctx.callbackQuery.message.message_id; // Получить ID сообщения
        const chatId = ctx.callbackQuery.message.chat.id; // Получить ID чата
      
        await ctx.telegram.editMessageMedia(
          chatId,
          messageId,
          null, // Необходимо указать индекс инлайн-кнопки, который нужно изменить. Если вам нужно изменить все кнопки, оставьте значение null.
          {
            type: "photo",
            media: { source: "images/admin.jpg" },
            caption: "Выберите действие",
            parse_mode: "HTML",
          },
          keyboard
        );
        await sleep(500)
        // await ctx.deleteMessage();
      } else {
        ctx.reply("Товар не найден.");
      }
    } catch (error) {
      console.error("Ошибка удаления продукта:", error);
      ctx.reply("Ошибка удаления продукта.");
    }
  } else {
    ctx.reply("Команда доступна только администратору.");
  }
});

module.exports = composer;  