const { Composer } = require("telegraf");
const composer = new Composer();
const {handleError} = require("../../../plugin/handleError")

function orderkeyboard(totalOrder, showClearButton) {
  try {
    const keyboard = [
      // showClearButton ? [{ text: `🗒 Очистить историю записей`, callback_data: "deleteOrder" }] : [],
      [{ text: "⬅️ Назад", callback_data: "back" }],
    ];

    return { reply_markup: { inline_keyboard: keyboard } };
  } catch (error) {
    handleError(error, ctx, 'critical', __filename);
  }
}

module.exports = {orderkeyboard}
