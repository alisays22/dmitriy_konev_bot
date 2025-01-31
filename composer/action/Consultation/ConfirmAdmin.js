const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const { Service, Person, Purchase, Appointment } = require("../../connection/model/people");
const { formatBookingTimes } = require("../../utils/dateUtils");

const ADMIN = process.env.ADMIN_ID;
const {handleError} = require("../../../plugin/handleError")


async function sendMessageAndClearKeyboard(ctx, userId, message) {
  await ctx.telegram.sendMessage(userId, message, { parse_mode: "HTML" });
}

composer.action(/^no_(\d+)/, async (ctx) => {
  try{
  const userId = ctx.match[1]

    const user = await Person.findOne({ where: { telegramId: userId } });
    const purchase = await Purchase.findOne({ where: { personId: user.id, status: "pending" } });

    if (!purchase) {
      await sendMessageAndClearKeyboard(ctx, userId, `❌ <b>${user.firstName}</b>, Ваша запись не найдена. Пожалуйста, попробуйте снова или обратитесь в поддержку.`);
      return;
    }

    const booking = await Appointment.findOne({ where: { id: purchase.appointmentId } });

    if (!booking) {
      purchase.status = 'cancelled';
      await purchase.save();

      await sendMessageAndClearKeyboard(ctx, userId, `❌ Ваша запись была отменена.`);

      await ctx.telegram.editMessageText(ADMIN, ctx.callbackQuery.message.message_id, null, `❌ Клиент <b><a href="t.me/${user.userName}">${user.firstName} ${user.lastName}</a></b> отменил запись.`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [] // Пустой массив для удаления клавиатуры
        }
      });
      return;
    }

    let formattedDate, formattedStartTime, formattedEndTime;
    if (purchase.serviceId !== 1) {
      ({ formattedDate, formattedStartTime, formattedEndTime } = formatBookingTimes(booking));
    }

    //Собщение для пользователя об ОТМЕНЕ записи на БЕСПЛАТНУЮ или обычную консультацию
    const cancelMessage = purchase.serviceId === 1
      ? `❌ <b>${user.firstName}</b>, Ваша запись на БЕСПЛАТНУЮ КОНСУЛЬТАЦИЮ была отменена.`
      : `❌ <b>${user.firstName}</b>, Ваша запись на КОНСУЛЬТАЦИЮ была отменена.`;
//Собщение для админа об ОТМЕНЕ пользователем записи на БЕСПЛАТНУЮ или обычную консультацию
    const adminCancelMessage = purchase.serviceId === 1
      ? `❌ #БЕСПЛАТНАЯКОНСУЛЬТАЦИЯ\n\nЗапись клиента <b><a href="t.me/${user.userName}">${user.firstName} ${user.lastName}</a></b> была отменена.`
      : `❌ #КОНСУЛЬТАЦИЯ\n\nЗапись клиента <b><a href="t.me/${user.userName}">${user.firstName} ${user.lastName}</a></b> была отменена.`;

      purchase.status = 'cancelled';
      await purchase.save();

      const bookingsToDelete = await Appointment.findAll({
        where: {
          personId: user.id,
          serviceId: booking.serviceId,
          date: booking.date,
          time: [formattedStartTime, formattedEndTime],
          status: "booked",
        }
      });

      await Promise.all(bookingsToDelete.map(b => b.destroy()));


      await ctx.telegram.editMessageText(ADMIN, ctx.callbackQuery.message.message_id, null, adminCancelMessage, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [] // Пустой массив для удаления клавиатуры
        }
      });    
      // Удаление клавиатуры c "Отменить" у пользователя из message2
        await ctx.telegram.editMessageReplyMarkup(userId, purchase.messageId2, null, { inline_keyboard: [] });
      } catch (error) {
        if (error.response && error.response.error_code === 403 && error.response.description === 'Forbidden: bot was blocked by the user') {
          // Отправка сообщения администратору о том, что пользователь заблокировал бота
          await ctx.telegram.sendMessage(ADMIN, `⚠️ Пользователь <a href="t.me/${ctx.callbackQuery.from.username}">${ctx.callbackQuery.from.first_name} ${ctx.callbackQuery.from.last_name}</a> заблокировал бота, сообщение не доставлено.`, { parse_mode: 'HTML' });
        } else {
          // Обработка других ошибок
          await handleError(error, ctx, 'critical', __filename);
        }
      }
})


composer.action(/^yes_(\d+)/, async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.match[1];
    const user = await Person.findOne({ where: { telegramId: userId } });
    const purchase = await Purchase.findOne({ where: { personId: user.id, status: "pending" } });

    if (!purchase) {
      await sendMessageAndClearKeyboard(ctx, userId, `❌ <b>${user.firstName}</b>, Ваша запись не найдена. Пожалуйста, попробуйте снова или обратитесь в поддержку.`);
      return;
    }

    const booking = await Appointment.findOne({ where: { id: purchase.appointmentId } });

    if (!booking) {
      purchase.status = 'cancelled';
      await purchase.save();

      await sendMessageAndClearKeyboard(ctx, userId, `❌ Ваша запись была отменена.`);

      await ctx.telegram.editMessageText(ADMIN, ctx.callbackQuery.message.message_id, null, `❌ Клиент <b><a href="t.me/${user.userName}">${user.firstName} ${user.lastName}</a></b> отменил запись.`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [] // Пустой массив для удаления клавиатуры
        }
      });
      return;
    }

    const service = await Service.findOne({ where: { id: booking.serviceId } });

    let formattedDate, formattedStartTime, formattedEndTime;
    if (purchase.serviceId !== 1) {
      ({ formattedDate, formattedStartTime, formattedEndTime } = formatBookingTimes(booking));
    }

    // Сообщение для пользователя после записи на БЕСПЛАТНУЮ или обычную консультацию
    const confirmMessage = purchase.serviceId === 1
      ? `✅ <b>${user.firstName}</b>, Вы успешно записаны на БЕСПЛАТНУЮ КОНСУЛЬТАЦИЮ. В ближайшее время с вами свяжется специалист`
      : `✅ <b>${user.firstName}</b>, Вы успешно записаны на консультацию. В ближайшее время с вами свяжется специалист`;

    // Сообщение у администратора с подтверждением записи на БЕСПЛАТНУЮ или обычную консультацию
    const adminConfirmMessage = purchase.serviceId === 1
      ? `✅ #БЕСПЛАТНАЯКОНСУЛЬТАЦИЯ\n\nК вам записан клиент <b><a href="t.me/${user.userName}">${user.firstName} ${user.lastName}</a></b>.`
      : `✅ #КОНСУЛЬТАЦИЯ\n\nК вам записан клиент <b><a href="t.me/${user.userName}">${user.firstName}</a></b>, в <b>${formattedDate}</b> <b>${formattedStartTime}-${formattedEndTime}</b>\nна услугу: <b>"${service.name}"</b>\nтелефон для связи: <b>${user.phone}</b>.`;

    purchase.status = 'confirmed';
    await purchase.save();

    await sendMessageAndClearKeyboard(ctx, userId, confirmMessage);

    await ctx.telegram.editMessageText(ADMIN, ctx.callbackQuery.message.message_id, null, adminConfirmMessage, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [] // Пустой массив для удаления клавиатуры
      }
    });

    const textAcept = user.guestName ? `` : `<b>${user.firstName} </b>,`;

    // Удаление клавиатуры c "Отменить" у пользователя из message2
    await ctx.telegram.editMessageReplyMarkup(userId, purchase.messageId2, null, { inline_keyboard: [] });

    // Изменение текста в сообщении пользователя message2
    await ctx.telegram.editMessageCaption(
      userId,
      purchase.messageId2,
      null,
      `<b>✅ Забронировано </b>\n\n${textAcept}жду Вас <b>${formattedDate}</b> в <b>${formattedStartTime}</b>\nна услугу: <b>"${service.name}"</b>`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    if (error.response && error.response.error_code === 403 && error.response.description === 'Forbidden: bot was blocked by the user') {
      // Отправка сообщения администратору о том, что пользователь заблокировал бота
      await ctx.telegram.sendMessage(ADMIN, `⚠️ Пользователь <a href="t.me/${ctx.callbackQuery.from.username}">${ctx.callbackQuery.from.first_name} ${ctx.callbackQuery.from.last_name}</a> заблокировал бота, сообщение не доставлено.`, { parse_mode: 'HTML' });
    } else {
      // Обработка других ошибок
      await handleError(error, ctx, 'critical', __filename);
    }
  }
});


module.exports = composer;