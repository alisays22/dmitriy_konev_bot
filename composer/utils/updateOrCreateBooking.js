const { Composer, Markup } = require("telegraf");

const {Appointment,} = require("../connection/model/people");

/*
Обновляет или создает новую запись бронирования для пользователя.
Используется для управления записями в модулях бронирования и планирования.
*/
async function updateOrCreateBooking(user, serviceId, date) {
  // Ищем свободное время для записи у пользователя
  let booking = await Appointment.findOne({ where: { personId: user.id, status: "free" } });
  // Если свободного времени нет, создаем новую запись
  if (!booking) {
    booking = await Appointment.create({ personId: user.id, serviceId, date });
  } else {
    // Обновляем id услуги в записи, если передан новый serviceId
    if (serviceId) booking.serviceId = serviceId;
    // Обновляем дату в записи, если передана новая дата
    if (date) booking.date = date;
    await booking.save();
  }

  return booking;
}

module.exports = {updateOrCreateBooking}

