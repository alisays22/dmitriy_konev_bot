const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const { Person, Appointment,Purchase } = require("../../connection/model/people");
const startKeyboard = require("../start/startKeyboard");
const{handleError} = require("../../../plugin/handleError")
const {editStartMenu} = require('../start/startMenu')


composer.action("clearBooking", async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  if (!user.firstName) {
user.firstName = ctx.update.callback_query.from.first_name
user.save()
  }
  const booking = await Appointment.findOne({ where: { personId: user.id, status: 'free' } });
    if (!booking) {
    await ctx.answerCbQuery("⚠️ Нет свободных записей для удаления.");
  } else {
    await booking.destroy();
    await ctx.answerCbQuery("❌ Запись удалена");
      // Обновление медиа-контента, подписи и клавиатуры
      await editStartMenu(ctx, user);
    }} catch (error) {
      await handleError(error, ctx, 'critical', __filename) 
    }
  
})

module.exports = composer;
