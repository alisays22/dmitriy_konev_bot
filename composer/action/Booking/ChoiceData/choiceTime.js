const { Composer, Markup } = require("telegraf");
const composer = new Composer();
const { Sequelize,DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const {Person,Appointment} = require("../../../connection/model/people");
const {generateTimeKeyboard} = require("./choiceTimeKeyboard");
const {updateOrCreateBooking} = require("../../../utils/updateOrCreateBooking");
const {isDayFullyBooked} = require("../../../utils/dateUtils")

const{handleError} = require("../../../../plugin/handleError")

// / Обработчик для выбора даты
composer.action(/date_(.+)/, async (ctx) => {
  try{
  // Извлекаем дату и находим пользователя
  const selectedDate = ctx.match[1];
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });

  // Проверяем, занят ли выбранный день
  const isFullyBooked = await isDayFullyBooked(selectedDate);
  if (isFullyBooked) {
    await ctx.answerCbQuery(`❌ День занят`, { show_alert: true });
    return;
  }

  // Ищем свободное время для записи у пользователя
  const booking = await updateOrCreateBooking(user, null, selectedDate);
  const productId = booking.serviceId;

  const bookingsForSelectedDate = await Appointment.findAll({
    where: { date: selectedDate, [Op.or]: [{ status: 'booked' }, { status: 'free' }] },
  });

await ctx.editMessageMedia(
    {
      type: "photo",
      media: { source: "images/time.jpg" },
      caption: "<b>Выбери время записи:</b>",
      parse_mode: "HTML",
    },
    await generateTimeKeyboard(bookingsForSelectedDate, productId, selectedDate)
  );
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});


module.exports = composer;


