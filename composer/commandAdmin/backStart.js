const { Composer, Markup } = require("telegraf");
const composer = new Composer();
const {Person,Appointment,Service,Purchase,Message} = require("../connection/model/people");

// // Клавиатура стартового экрана
const startKeyboard = require("../action/start/startKeyboard");

const {deleteMessage} = require("../utils/deleteMessageText")
const {editStartMenu} = require('../action/start/startMenu')


// Кнопка выхода из категории добавление товаров по команде /add
composer.action("cancelSession", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
    const deletionSuccess = await deleteMessage(ctx, user.id, "messageYesNo");
    if (deletionSuccess) {
      // Обновление медиа-контента, подписи и клавиатуры
      await editStartMenu(ctx, user);
    } else {
      ctx.reply("Сообщение устарело или не найдено. Попробуйте обновить бота /start");
    }
  } catch (e) {
    console.log("Произошла ошибка:", e);
    ctx.reply("Произошла ошибка. Попробуйте обновить бота /start");
  }
});


module.exports = composer;
