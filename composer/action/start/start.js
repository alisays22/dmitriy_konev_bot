const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {Person,Appointment,Service,Purchase} = require("../../connection/model/people")
const {handleError} = require("../../../plugin/handleError")
const startKeyboard = require("./startKeyboard")
const {startMenu} = require('./startMenu')

composer.command("start", async (ctx) => {
  try {
    const existingUser = await Person.findOne({ where: { telegramId: ctx.from.id } });

    if (existingUser) {
      // Найти и удалить строки со статусом "free"
      await Appointment.destroy({ where: { personId: existingUser.id, status: "free" } });
      await startMenu(ctx, existingUser);
    } else {
      const  firstName = ctx.message.from.first_name|| "";
      const lastName = ctx.message.from.last_name || "";
      const userName = ctx.message.from.username || "Anonymous";
      await Person.create({
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        telegramId: ctx.from.id,
      });
      ctx.replyWithPhoto(
        { source: "images/start.jpg" },
        {
          caption: "<b>Здравствуйте! Выберите категорию:</b>",
          parse_mode: "HTML",
          reply_markup: startKeyboard(false),
        },
      );
    }
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename) 
  }
});

module.exports = composer


