const { Markup, Composer, Scenes,session } = require("telegraf");
const { Sequelize, DataTypes } = require("sequelize");
const Op = Sequelize.Op;

const {Person,Appointment,Service,Message,} = require("../composer/connection/model/people");
const {formatBookingTimes,} = require("../composer/utils/dateUtils");

const {getYesButtonMarkup,deleteButtonMarkup,choiceGuestName,} = require("../composer/utils/sceneButton");
const { deleteMessage } = require("../composer/utils/deleteMessageText");
const {banWords} = require("../composer/utils/banWords")
const {handleError} = require("../plugin/handleError")
const {workSchedule} = require("../composer/utils/dateUtils");


// Сцена, если пользователь захотел изменить своё имя
const oneStep = new Composer();

oneStep.action(/time_(.+)/, async (ctx) => {
  try {
    const selectedTime = ctx.match[1]; // в формате HH:00:00

    const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
    const selectedDate = await Appointment.findOne({where: { personId: user.id, status: "free" },});

    if (!selectedDate) {
      console.log("Ошибка: дата не найдена");
      return;
    }

    const available = await Appointment.findOne({where: { date: selectedDate.date, time: selectedTime, status: "booked" },});

    if (available) {
      await ctx.answerCbQuery(`❌ Время ${selectedTime} занято`, {show_alert: true,});
      return;
    }

    // Проверяем время записи
    const currentTime = new Date();
    const appointmentTime = new Date(selectedDate.date);
    appointmentTime.setHours(parseInt(selectedTime.split(":")[0]));

    // Проверяем, осталось ли меньше 2 часов до записи
    const timeDifference = appointmentTime.getTime() - currentTime.getTime();
    const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;

    if (timeDifference < twoHoursInMilliseconds) {
      await ctx.answerCbQuery(`⬜️ Запись на 2ч невозможно`, {show_alert: true,});
      return;
    }

    // Получаем день недели
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(new Date(selectedDate.date));

    // Получаем рабочие часы для этого дня
    const workHours = workSchedule[dayOfWeek];

    // Проверяем рабочие часы
    if (!workHours.start || !workHours.end) {
      await ctx.answerCbQuery(`❌ В этот день мы не работаем`, { show_alert: true,});
      return;
    }

    const startTime = new Date(selectedDate.date + " " + workHours.start);
    const endTime = new Date(selectedDate.date + " " + workHours.end);

    if (appointmentTime < startTime || appointmentTime > endTime) {
      await ctx.answerCbQuery(`❌ Время ${selectedTime} не входит в рабочие часы`,{ show_alert: true });
      return;
    }

    // Проверяем следующие два часа на наличие записей
    const nextSlot1 = `${(parseInt(selectedTime.split(":")[0]) + 1)
      .toString()
      .padStart(2, "0")}:00:00`;
    const nextSlot2 = `${(parseInt(selectedTime.split(":")[0]) + 2)
      .toString()
      .padStart(2, "0")}:00:00`;

    const nextAvailable1 = await Appointment.findOne({
      where: { date: selectedDate.date, time: nextSlot1, status: "booked" },
    });
    const nextAvailable2 = await Appointment.findOne({
      where: { date: selectedDate.date, time: nextSlot2, status: "booked" },
    });

    // Если есть запись на следующий час или через час
    if (nextAvailable1 || nextAvailable2) {
      await ctx.answerCbQuery(`⬜️ Запись на 2ч невозможно`, {
        show_alert: true,
      });
      return;
    }

    // Создание записи
    await Appointment.upsert({
      id: selectedDate.id,
      personId: user.id,
      time: selectedTime,
      date: selectedDate.date,
      status: "free",
    });

    await Appointment.create({
      personId: user.id,
      serviceId: selectedDate.serviceId,
      date: selectedDate.date,
      time: nextSlot1,
      status: "free",
    });

    // Логика для получения имени пользователя
    if (!user.firstName || user.firstName === null) {
      ctx.replyWithHTML(`@${user.userName}, напишите <b>имя</b> того кто придет на терапию.`);
      return ctx.wizard.next();
    } else {
      try{
      // Если у пользователя нет старых записей, создаем новые записи
      const messageChoiceTime = await ctx.editMessageReplyMarkup(
        await deleteButtonMarkup()
      );
      const messageYesNo = await ctx.replyWithHTML(`Записать вас на терапию как <b>${user.firstName}</b>?`,
        {
          reply_markup: getYesButtonMarkup(),
        }
      );
      const oldMessages = await Message.findAll({where: { personId: user.id },});

      if (oldMessages.length > 0) {
        // Если у пользователя есть старые записи, обновляем их новыми данными
        await Promise.all(
          oldMessages.map(async (message) => {
            if (message.nameMessage === "messageChoiceTime") {
              await message.update({ messageId: messageChoiceTime.message_id });
            } else if (message.nameMessage === "messageYesNo") {
              await message.update({ messageId: messageYesNo.message_id });
            }
          })
        );
      } else {
        // Создаем сообщения и сохраняем их в базу данных
        await Promise.all([
          Message.create({
            nameMessage: "messageChoiceTime",
            messageId: messageChoiceTime.message_id,
            personId: user.id,
          }),
          Message.create({
            nameMessage: "messageYesNo",
            messageId: messageYesNo.message_id,
            personId: user.id,
          }),
        ]);
      }
      return ctx.wizard.next();
    }catch(e){
      ctx.replyWithHTML("Произошла ошибка при записи попробуйте перезапустить бота /start")
    }
    }
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename) 
  }
});

const twoStep = new Composer();

twoStep.action(["yes", "no"], async (ctx) => {
  // try{
  await ctx.answerCbQuery();
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const buttonText = ctx.match[0]; // Получаем текст кнопки

  if (buttonText === "yes") {
    await deleteMessage(ctx, user.id, "messageChoiceTime");
    await deleteMessage(ctx, user.id, "messageYesNo");
    if (user.phone) {

      const booking = await Appointment.findOne({where: { personId: user.id, status: "free" },});
      const service = await Service.findOne({where: { id: booking.serviceId },});

      const { formattedDate, formattedStartTime, formattedEndTime } =
        formatBookingTimes(booking);
      ctx.replyWithPhoto(
        { url: service.imageURL },
        {
          caption: `<b>☑️ Подтверждение</b>\n\n Вы записаны как <b>${user.firstName}</b> на <b>${formattedDate}</b> в <b>${formattedStartTime}</b>\nна услугу: <b><i>"${service.name}"</i></b> `,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Подтвердить", callback_data: "aceptBooking" }],
              [{ text: "Отменить", callback_data: "clearBooking" }],
            ],
          },
        }
      );
      return ctx.scene.leave();
    } else {
      ctx.replyWithHTML(
        `<b>${user.firstName}</b>, напишите свой телефон для связи в формате: <code>+7XXXXXXXXXX</code>\n\nили нажмите кнопку <b>Отправить номер телефона 👇</b>`,
        {
          reply_markup: {
            one_time_keyboard: true,
            keyboard: [
              [
                {
                  text: "✅ Отправить номер телефона",
                  request_contact: true,
                  resize_keyboard: true,
                  one_time_keyboard: true,
                },
              ],
            ],
            force_reply: true,
          },
        }
      );
      ctx.wizard.next();
    }
  } else {
    await ctx.answerCbQuery();
    await deleteMessage(ctx, user.id, "messageChoiceTime");
    await deleteMessage(ctx, user.id, "messageYesNo");

    await ctx.replyWithHTML(`Напишите имя того, кто придет на терапию`);
    ctx.wizard.selectStep(3) // переход в fourStep
    return;
  }
// } catch (error) {
//   await handleError(error, ctx, 'critical', __filename) 
// }
});

const threeStep = new Composer();

threeStep.on("contact", async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const booking = await Appointment.findOne({where: { personId: user.id, status: "free" },});
  const service = await Service.findOne({ where: { id: booking.serviceId } });

  const phoneNumber = ctx.message.contact.phone_number;
  await user.update({ phone: phoneNumber });

  const { formattedDate, formattedStartTime } = formatBookingTimes(booking);

  ctx.replyWithPhoto(
    { url: service.imageURL },
    {
      caption: `<b>☑️ Подтверждение</b>\n\n Вы записаны как <b>${user.firstName}</b> на <b>${formattedDate}</b> в <b>${formattedStartTime}</b>\nна услугу: <b><i>"${service.name}"</i></b> `,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Подтвердить", callback_data: "aceptBooking" }],
          [{ text: "Отменить", callback_data: "clearBooking" }],
        ],
      },
    }
  );
  return ctx.scene.leave();
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});


threeStep.on("text", async (ctx) => {
  try{
  const phone = ctx.message.text;
  let user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  let booking = await Appointment.findOne({ where: { personId: user.id } });
  const service = await Service.findOne({ where: { id: booking.serviceId } });

  const { formattedDate, formattedStartTime } = formatBookingTimes(booking);

  // регулярное выражение теперь соответствует следующим форматам:
// +7XXXXXXXXXX // +7 XXX XXX XX-XX // +7 (XXX) XXX-XX-XX // +7(XXX) XXX-XX-XX
const phoneRegex = /^\+7\d{10}$|^\+7\s\d{3}\s\d{3}\s\d{2}-\d{2}$|^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$|^\+7\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;

  const excludedNumbers = ["+7(999) 999-99-90", "+7(999) 999-99-99", "99999999999","+79999999999","+7(999)9999990",];

  if (excludedNumbers.includes(phone)) {
    ctx.replyWithHTML(`⚠️ Номер <b>${phone}</b> указан в качестве шаблона, используйте другой`);
    return
  } else if (phoneRegex.test(phone) === false) {
    ctx.replyWithHTML("⚠️ Номер телефона должен содержать только цифры и символы +/-.Поддерживаемые форматы:\n\n<code>+7XXXXXXXXXX;\n+7 XXX XXX XX-XX;\n+7 (XXX) XXX-XX-XX;</code>");
    return
  } else if (phone.length > 19) {
    ctx.replyWithHTML("⚠️ Телефон не должен превышать 19 символов, проверьте коректность данных или напишите в другом виде");
    return
  } else {
    user.phone = phone;
    await user.save();

    const userName = user.guestName ? user.guestName : user.firstName;

    ctx.replyWithPhoto(
      { url: service.imageURL },
      {
        caption: `<b>☑️ Подтверждение</b>\n\n Вы записаны как <b>${userName}</b> на <b>${formattedDate}</b> в <b>${formattedStartTime}</b>\nна услугу: <b><i>"${service.name}"</i></b> `,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Подтвердить", callback_data: "aceptBooking" }],
            [{ text: "Отменить", callback_data: "clearBooking" }],
          ],
        },
      }
    );
  }
  return ctx.scene.leave();
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});

const fourStep = new Composer();

//Запись гостевого имени
fourStep.on("text", async (ctx) => {
  try{
const name = ctx.message.text;

if (name.length > 19) {
  ctx.replyWithHTML("⚠️ Имя превышает количество символов, проверьте коректность данных или напишите в другом виде");
  return
} else if (!/^[a-zA-Zа-яА-Я]+$/.test(name)) {
  ctx.replyWithHTML("⚠️ Имя не должно содержать символов, кроме букв");
  return;
} else if (name.includes(" ")) {
  ctx.replyWithHTML("⚠️ Имя не должно содержать пробелов");
  return;
} else {
  // Проверка на запрещенные слова или символы
  banWords
  if (banWords.includes(name.toLowerCase())) {
    ctx.replyWithHTML("⚠️ Это являеться чем-то нецензурным");
    return;
  }

let user = await Person.findOne({ where: { telegramId: ctx.from.id } });
user.guestName = name
user.save()

  ctx.replyWithHTML(`Напишите телефон для связи в формате: <code>+7XXXXXXXXXX</code>`,);
  ctx.wizard.selectStep(2) // переход в threeStep
}
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
})


const twoScene = new Scenes.WizardScene(
  "twoWizard",
  oneStep,
  twoStep,
  threeStep,
  fourStep
);

module.exports = twoScene;
