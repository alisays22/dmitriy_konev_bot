const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const { Service,Person, Purchase, Appointment } = require("../../connection/model/people");

const ADMIN = process.env.ADMIN_ID;
const {handleError} = require("../../../plugin/handleError")

composer.action("cancelFree", async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
    // Проверка наличия заказа
    const purchase = await Purchase.findOne({ where: { personId: user.id, status: "pending" } });
    if (!purchase) {
      await ctx.deleteMessage();
      await ctx.replyWithHTML("<i>⚠️ Заказ не найден. Возможно, он уже был отменен или подтвержден.</i>");
      return;
    }

    // Проверка наличия бронирования
    const booking = await Appointment.findOne({ where: { id: purchase.appointmentId } });
    if (!booking) {
    await ctx.deleteMessage();
    
      await ctx.replyWithHTML("<i>⚠️ Заказ не найден.</i>");
      return;
    }

    // Удаляем сообщение с кнопками по messageId
    if (purchase.messageId) {
      await ctx.telegram.deleteMessage(ADMIN, parseInt(purchase.messageId));
    }

    // Удаляем сообщение с кнопками
    await ctx.deleteMessage();

    // Удаляем записи из базы данных
    await booking.destroy();
    await purchase.destroy();

    // Отправка уведомления администратору
    await ctx.telegram.sendMessage(
      ADMIN,
      `#ОТМЕНА\n\nклиент <b><a href="t.me/${user.userName}">${user.firstName} ${user.lastName}</a></b> - отменил консультацию`,
      { parse_mode: "HTML" }
    );

    // Уведомление пользователю
    await ctx.replyWithHTML("<i>Бесплатная консультация отменена</i>");
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename) 
  }
});

module.exports = composer;  