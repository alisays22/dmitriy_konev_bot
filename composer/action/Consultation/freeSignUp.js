const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {Person,Appointment,Service,Purchase} = require("../../connection/model/people");
const moment = require("moment"); // Подключаем библиотеку moment.js
const { Sequelize} = require('sequelize');
const Op = Sequelize.Op;
const ADMIN = process.env.ADMIN_ID;
const {handleError} = require("../../../plugin/handleError")


composer.action("freeSignUp", async (ctx) => {
  try{
  const existingUser = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const purchase = await Purchase.findOne({where: {personId: existingUser.id,serviceId:1, status: {[Op.or]: ["pending", "confirmed"]}}});

if (purchase) {
  const message = purchase.status === 'pending' ? "Вы уже записаны на консультацию. Дождитесь ответа специалиста"
    : "Вы уже записаны на консультацию";
  await ctx.answerCbQuery(message, { show_alert: true });
  return;
}

  await ctx.answerCbQuery();
  const booking = await Appointment.create({ personId: existingUser.id, serviceId: 1, status: "booked" });
  const currentDate = moment().format('YYYY-MM-DD');
  const time = moment().format('HH:MM:SS');

  const newPurchase = await Purchase.create({
    personId: existingUser.id,
    serviceId: 1,
    appointmentId: booking.id,
    date: currentDate,
    time: time,
    totalPrice: 0
  });
  await newPurchase.save();

  const message2 = await ctx.replyWithHTML("Вы записаны на БЕСПЛАТНУЮ КОНСУЛЬТАЦИЮ, пожалуйста дождитесь подтверждения", {
    reply_markup:{
      inline_keyboard: [
        [{ text: "Отменить", callback_data: "cancelFree" }],
      ],
    },
  });

  const message = await ctx.telegram.sendMessage(
    ADMIN,
    `#БЕСПЛАТНАЯКОНСУЛЬТАЦИЯ\n\nК вам записался клиент <b><a href="t.me/${existingUser.userName}">${existingUser.firstName} ${existingUser.lastName}</a></b>. Потвердите запись, а затем свяжитесь с ним`,
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

  newPurchase.messageId = message.message_id;
  newPurchase.messageId2 = message2.message_id;
  await newPurchase.save();
  } catch (error) {
  await handleError(error, ctx, 'critical', __filename);
}
});



module.exports = composer;
