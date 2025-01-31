const { Composer, Markup, Extra } = require("telegraf");
const composer = new Composer();

const {Person,Appointment,Purchase} = require("../../connection/model/people");
const {orderkeyboard} = require("./ordersKeyboard")
const {handleError} = require("../../../plugin/handleError")


// Очистка записей юзера в меню Мои записи
composer.action("deleteOrder", async (ctx) => {
  try {
    const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
    if (!user) {
      return await ctx.answerCbQuery("Не удалось найти пользователя.");
    }

    const completedOrders = await Appointment.findAll({where: { status: "booked", personId: user.id },});

    // Удаление самих заказов
    for (const order of completedOrders) {
      await Purchase.update({ appointmentId: null }, { where: { appointmentId: order.id }})
      await order.destroy();}

    const totalCompletedOrders = completedOrders.length;
    if (totalCompletedOrders > 0) {
      await ctx.answerCbQuery(`Все ваши записи (${totalCompletedOrders} шт) были успешно удалены.`, {show_alert:true});

       await ctx.editMessageCaption("У вас пока нет совершенных заказов", {
         parse_mode: "HTML",
         ...orderkeyboard(0)
       });
    } else {
      await ctx.answerCbQuery("У вас нет завершенных заказов.");
    }
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename) 
  }
});


module.exports = composer;
