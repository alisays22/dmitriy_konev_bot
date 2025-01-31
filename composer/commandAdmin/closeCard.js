const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const {Service} =require("../connection/model/people");

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

// Просмотр карточки сохраненного товара
composer.action("close", async (ctx) => {
  await ctx.answerCbQuery();
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
  await ctx.deleteMessage();
});

module.exports = composer;  