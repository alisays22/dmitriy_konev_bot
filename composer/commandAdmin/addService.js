const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {Service} =require("../connection/model/people");
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

// Добавление нового товара по команде /add
composer.command("add", async (ctx) => {
  const id = ctx.from.id;
  if (id === ENGINEER) {
    const keyboard = await createKeyboard();
    ctx.replyWithPhoto(
      { source: "images/admin.jpg" },
      {
        caption: `Выберите действие`,
        parse_mode: "HTML",...keyboard
      }
    );
  } else {
    ctx.reply("команда доступна только администратору");
  }
});


module.exports = composer;  