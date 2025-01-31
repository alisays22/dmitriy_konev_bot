const { Composer, Markup } = require("telegraf");
const composer = new Composer();
const moment = require("moment"); // Подключаем библиотеку moment.js

const { Person, Appointment, Service,Purchase } = require("../../connection/model/people");

const {formatBookingTimes} = require("../../utils/dateUtils");
const {sleep} = require("../../../plugin/sleep")
const{handleError} = require("../../../plugin/handleError")
const {startMenu} = require("../start/startMenu")
const ADMIN = process.env.ADMIN_ID;

function getCancelButtonMarkup() {
  return {
    inline_keyboard: [
      [{ text: "Отменить", callback_data: "cancelFree" }],
    ],
  };
}

composer.action("aceptBooking", async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const booking = await Appointment.findOne({ where: { personId: user.id, status: "free" } });
  const service = await Service.findOne({ where: { id: booking.serviceId } });

  const { formattedDate, formattedStartTime, formattedEndTime } = formatBookingTimes(booking);

  // Найти обе записи по времени и дате
  const bookingsToUpdate = await Appointment.findAll({where: {personId: user.id,date: booking.date,
      time: [
        booking.time,
        moment(booking.time, 'HH:mm:ss').add(1, 'hours').format('HH:mm:ss')
      ],
      status: "free"
    }
  });

  if (bookingsToUpdate.length === 2) {
    await ctx.answerCbQuery("🖊 Вы успешно записаны");

    user.visit++;
    await user.save();

    // Обновить статус для обеих записей
    for (const booking of bookingsToUpdate) {
      booking.status = "booked";
      await booking.save();
    }

    const purchase = await Purchase.create({ personId: user.id, serviceId: service.id, appointmentId: booking.id, date: booking.date, time: booking.time, status: "pending", totalPrice: service.price });
    purchase.save();
    const userName = user.guestName ? user.guestName : user.firstName;

    const textAcept = user.guestName ?   `` : `<b>${user.firstName} </b>,` 
    const message2 = await ctx.editMessageMedia(
      {
        type: "photo",
        media: { url: service.imageURL },
        caption: `<b>✅ Забронировано </b>\n\n${textAcept}жду Вас <b>${formattedDate}</b> в <b>${formattedStartTime}</b>\nна услугу: <b>"${service.name}"</b>\n\n<i>Дождитесь подтверждения администратора, как только ваша запись будет одобрена придет сообщение.\n\n*Просим не удалять данное сообщение</i>`,
        parse_mode: "HTML",
      },
      { reply_markup: getCancelButtonMarkup() }
    );

    const textSendAdmin = user.guestName ?   `<b><a href="t.me/${user.userName}">клиент</a></b> под гостевым именем <b>${userName}</b>` : `<b><a href="t.me/${user.userName}">${userName}</a></b>` 

    // Пересыллка администратору
    const message = await ctx.telegram.sendMessage(
      ADMIN,
      `#КОНСУЛЬТАЦИЯ\n\nК вам записался ${textSendAdmin} в <b>${formattedDate}</b> <b>${formattedStartTime}-${formattedEndTime}</b>\nна услугу: <b>"${service.name}"</b>\nтелефон для связи: <b>${user.phone}</b>.\n\n<i>Подтвердите запись, а затем свяжитесь с ним</i>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Потвердить", callback_data: `yes_${ctx.from.id}` }],
            [{ text: "❌ Отменить", callback_data: `no_${ctx.from.id}` }]
          ],
        },
      }
    );

    // Сохраняем messageId в базе данных
    purchase.messageId = message.message_id;
    purchase.messageId2 = message2.message_id;
    await purchase.save();

    user.guestName = "";
    user.phone = "";
    await user.save();

    await sleep(1000);
    await startMenu(ctx, user);
  } else {
    await ctx.answerCbQuery("🥹 К сожалению кто-то записался раньше вас, попробуйте снова", { show_alert: true });
    await ctx.deleteMessage();

    await Appointment.destroy({ where: { personId: user.id, status: "free" } });
    await sleep(1000);
    await startMenu(ctx, user);
  }
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});



module.exports = composer;
