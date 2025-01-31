const {handleError} = require("../../../plugin/handleError")


function startKeyboard(showOrdersButton,showrСonsultationButton) {
  try{
  const keyboard = [
    [{ text: "📅 Записаться на сеанс", callback_data: "choiceService" }],
    !showrСonsultationButton ? [{ text: "🎁 30 МИН КОНСУЛЬТАЦИЯ 🎁🆓", callback_data: "freeСonsultation" }] : [],
    showOrdersButton && showOrdersButton > 0 ? [{ text: "📋 Мои записи", callback_data: "orders" }] : [],
    [{ text: "🔍 Услуги", switch_inline_query_current_chat: "Услуги" }],
    [{ text: "❓ Обо мне", callback_data: "aboutMassage" }],
  ];
  return { inline_keyboard: keyboard };
} catch (error) {
handleError(error, ctx, 'critical', __filename) 
}

}

  

module.exports = startKeyboard