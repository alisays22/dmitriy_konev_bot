const { days, addLeadingZero, addDaysSkipWeekend, isDayFullyBooked, workSchedule } = require("../../../../utils/dateUtils");
const { handleError } = require("../../../../../plugin/handleError");

// Клавиатура обновления кнопок с датами
async function generateDateKeyboard(serviceId, page) {
  try {    
    const dayObjects = { inline_keyboard: [] };
    const now = new Date();
    const startingDaysCount = now.getHours() < 6 ? 0 : 1;
    const totalDays = 30; // Общее количество дней для отображения
    const daysPerPage = 6; // Количество дней на странице

    const startIndex = (page - 1) * daysPerPage;
    const endIndex = startIndex + daysPerPage;

    for (let addedDays = startIndex + startingDaysCount; addedDays < totalDays + startingDaysCount && addedDays < endIndex + startingDaysCount; addedDays++) {
      const currentDate = addDaysSkipWeekend(now, addedDays);
      const formattedDate = `${addLeadingZero(currentDate.getDate())}.${addLeadingZero(currentDate.getMonth() + 1)}`;
      const dayOfWeek = days[currentDate.getDay()];
      const formattedCallbackDate = `${currentDate.getFullYear()}-${addLeadingZero(currentDate.getMonth() + 1)}-${addLeadingZero(currentDate.getDate())}`;

      const selectedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const schedule = workSchedule[selectedDay];
      if (schedule.start !== null && schedule.end !== null) {
        dayObjects.inline_keyboard.push([{ text: `${dayOfWeek} ${formattedDate}`, callback_data: `date_${formattedCallbackDate}` }]);
      }
    }

    const updatedKeyboard = await Promise.all(
      dayObjects.inline_keyboard.map(async (row) => {
        return Promise.all(
          row.map(async (button) => {
            if (button.callback_data.startsWith("date_")) {
              const date = button.callback_data.substring("date_".length);
              const isFullyBooked = await isDayFullyBooked(date);
              return { ...button, text: isFullyBooked ? `❌ ${button.text}` : button.text };
            }
            return button;
          })
        );
      })
    );

    // Расчет общего количества страниц
    const totalPages = Math.round((totalDays + startingDaysCount) / daysPerPage);

    const startDate = addDaysSkipWeekend(now, startIndex + startingDaysCount);
    const endDate = addDaysSkipWeekend(now, endIndex + startingDaysCount - 1);
    const dateRange = `${addLeadingZero(startDate.getDate())}.${addLeadingZero(startDate.getMonth() + 1)}-${addLeadingZero(endDate.getDate())}.${addLeadingZero(endDate.getMonth() + 1)}`;

    const backButtonCallback = page === 1 ? `backMassage_${serviceId}` : `slider:back_${serviceId}`;

    return {
      reply_markup: {
        inline_keyboard: [
          ...updatedKeyboard,
          [
            { text: "<<", callback_data: backButtonCallback },
            { text: `${page}/${totalPages}`, callback_data: `slider:description_${dateRange}` },
            { text: ">>", callback_data: `slider:next_${serviceId}` }
          ]
        ]
      }
    };
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename);
  }
}

// Общая функция для обновления медиа-контента и клавиатуры
async function updateMediaAndKeyboard(ctx, serviceId, slider) {
  await ctx.editMessageMedia({
    type: "photo",
    media: { source: "images/calendar.jpg" },
    caption: "<b>Выбери день записи:</b>",
    parse_mode: "HTML",
  }, await generateDateKeyboard(serviceId, slider));
}

module.exports = { generateDateKeyboard, updateMediaAndKeyboard };