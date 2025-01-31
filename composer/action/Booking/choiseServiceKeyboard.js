const {Service} = require("../../connection/model/people");
const{handleError} = require("../../../plugin/handleError")

// Формировапние клавиатуры с Услугами
async function choiseServiceKeyboard() {
  try{
  const services = await Service.findAll({ order: [['id', 'ASC']] });// Указываем сортировку по id по возрастанию
// Формирование клавиатуры Категорий по 2 столбца в ряд
  const keyboard = services.reduce((acc, service, index) => {
    if (service.price !== 0) {
      const button = { text: `${service.name}`, callback_data: `choice_${service.id}` };
    index % 1 === 0
      ? acc.push([button])
      : acc[acc.length - 1].push(button);
    }
    return acc;
  }, []);

//Добавляем кнопку Назад в конец
keyboard.push([{ text: "Назад", callback_data: "back" }]);
  return { reply_markup: { inline_keyboard: keyboard } };
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
}

module.exports = {choiseServiceKeyboard};


