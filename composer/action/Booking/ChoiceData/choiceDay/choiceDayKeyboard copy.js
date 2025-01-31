// const { Composer, Markup } = require("telegraf");
// const composer = new Composer();

// const {days,addLeadingZero,addDaysSkipWeekend,isDayFullyBooked} = require("../../../../utils/dateUtils");
// const{handleError} = require("../../../../../plugin/handleError")


// // Клавиатура обновления кнопок с датами
// async function generateDateKeyboard(serviceId) {
//   try{
//   const dayObjects = { inline_keyboard: [] };
//   const now = new Date();
//   const startingDaysCount = now.getHours() < 6 ? 0 : 1; //Отображает сегоднюшню дату если время меньше 6:00,  стартуем цикл с 0, если время до 6:00, иначе стартуем с 1
  
//   for (let addedDays = startingDaysCount; addedDays < 10 + startingDaysCount; addedDays++) {
//     const currentDate = addDaysSkipWeekend(now, addedDays);
//     const formattedDate = `${addLeadingZero(currentDate.getDate())}.${addLeadingZero(currentDate.getMonth() + 1)}`;
//     const dayOfWeek = days[currentDate.getDay()];
//     const formattedCallbackDate = `${currentDate.getFullYear()}-${addLeadingZero(currentDate.getMonth() + 1)}-${addLeadingZero(currentDate.getDate())}`;

//     dayObjects.inline_keyboard.push([{ text: `${dayOfWeek} ${formattedDate}`, callback_data: `date_${formattedCallbackDate}` }]);
//   }

//   const updatedKeyboard = await Promise.all(
//     dayObjects.inline_keyboard.map(async (row) => {
//       return Promise.all(
//         row.map(async (button) => {
//           if (button.callback_data.startsWith("date_")) {
//             const date = button.callback_data.substring("date_".length);
//             const isFullyBooked = await isDayFullyBooked(date);
//             return { ...button, text: isFullyBooked ? `❌ ${button.text}` : button.text };
//           }
//           return button;
//         })
//       );
//     })
//   );

//   return { reply_markup: { inline_keyboard: [...updatedKeyboard, [{ text: "", callback_data: `backMassage_${serviceId}` },] ] } };

//   } catch (error) {
//   await handleError(error, ctx, 'critical', __filename) 
// }
// }



// module.exports = {generateDateKeyboard};

