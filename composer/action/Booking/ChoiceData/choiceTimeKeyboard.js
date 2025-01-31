const { Composer, Markup,session} = require("telegraf");

const {workSchedule} = require("../../../utils/dateUtils")
const{handleError} = require("../../../../plugin/handleError")


async function generateTimeKeyboard(bookingsForSelectedDate, productId, selectedDate) {

  try{
  const timeList = [];
  const bookedTimesSet = new Set(bookingsForSelectedDate.filter(booking => booking.status === 'booked').map(booking => booking.time.slice(0, 5)));

  const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
  const schedule = workSchedule[selectedDay];

  if (schedule.start !== null && schedule.end !== null) {
    if (typeof schedule.start === 'string' && typeof schedule.end === 'string') {
      const startHour = parseInt(schedule.start.split(':')[0]);
      const endHour = parseInt(schedule.end.split(':')[0]);

      for (let hour = startHour; hour <= endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        timeList.push({
          text: bookedTimesSet.has(timeSlot) ? `❌ ${timeSlot}` : `✅ ${timeSlot}`,
          callback_data: `time_${timeSlot}`
        });
      }
    }
  }

  timeList.push({ text: "Назад ⬅️", callback_data: `backDay_${productId}` });

  const rows = [];
  for (let i = 0; i < timeList.length; i += 3) {
    rows.push(timeList.slice(i, i + 3));
  }

  return { reply_markup: { inline_keyboard: rows } };
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
}


module.exports = {generateTimeKeyboard};


