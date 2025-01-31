const { Composer, Markup } = require("telegraf");

const {Appointment,} = require("../connection/model/people");
const moment = require("moment"); 


// массив с днями недели
const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];


function addDays(date, daysToAdd) {
  const newDate = new Date(date.valueOf());
  newDate.setDate(newDate.getDate() + daysToAdd);
  return newDate;
}

// функция добавляет 0 если число(месяц,день) <10
function addLeadingZero(d) {
  return d < 10 ? "0" + d : d;
}


// Функция для форматирования даты в формате DD.MM.YYYY (день недели)
function getUserTime(t) {
  const date = moment(t);
  const formattedDate = date.format('DD.MM.YYYY');
  const dayOfWeek = days[date.day()];
  return `${formattedDate} (${dayOfWeek})`;
}


// Функция для конвертации миллисекунд в часы
function msToHours(ms) { 
  return ms / (1000 * 60 * 60)
}

// Функция для добавления указанного количества дней к дате, пропуская выходные дни
function addDaysSkipWeekend(date, daysToAdd) {
  const newDate = new Date(date.valueOf());
  while (daysToAdd > 0) {
    newDate.setDate(newDate.getDate() + 1);
    const day = newDate.getDay();
    if (day !== 0) { // Пропускаем воскресенье (0)
      daysToAdd--;
    }
  }
  return newDate;
}


const workSchedule = {
  Monday: { start: "14:00", end: "19:00" },
  Tuesday: { start: "12:00", end: "19:00" },
  Wednesday: { start: "14:00", end: "19:00" },
  Thursday: { start: "12:00", end: "19:00" },
  Friday: { start: "14:00", end: "19:00" },
  Saturday: { start: "12:00", end: "16:00" },
  Sunday: { start: null, end: null } // Выходной
};


// Функция для проверки, полностью ли забронирован день
async function isDayFullyBooked(date) {
  const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const schedule = workSchedule[selectedDay];

  if (schedule.start !== null && schedule.end !== null) {
    const startHour = parseInt(schedule.start.split(':')[0]);
    const endHour = parseInt(schedule.end.split(':')[0]);

    for (let hour = startHour; hour <= endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00:00`;
      const bookedTimeSlot = await Appointment.findOne({ where: { date, time: timeSlot, status: 'booked' } });

      if (!bookedTimeSlot) {
        return false;
      }
    }
  }

  return true;
}

// Функция форматирует дату и время бронирования для удобного использования в сообщениях.
const formatBookingTimes = (booking) => {
  if (booking.serviceId === 1) {
    return { formattedDate: '', formattedStartTime: '', formattedEndTime: '' };
  }

  const formattedDate = getUserTime(new Date(booking.date)); // Преобразует дату бронирования в пользовательский формат
  const formattedStartTime = booking.time.slice(0, 5); 
  const formattedEndTime = moment(booking.time, 'HH:mm:ss').add(1, 'hours').format('HH:mm'); 
  return { formattedDate, formattedStartTime, formattedEndTime };
};

module.exports = {days,addDays,addLeadingZero,getUserTime,addDaysSkipWeekend, isDayFullyBooked,formatBookingTimes,workSchedule}

