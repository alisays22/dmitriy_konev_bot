const { Composer, Markup } = require("telegraf");
const composer = new Composer();

function getYesButtonMarkup() {
  return {
    inline_keyboard: [
      [{ text: "Да", callback_data: "yes" },{ text: "Нет", callback_data: "no" }],
    ],
  };
}

function deleteButtonMarkup() {
  return {
    inline_keyboard: [
      [{ text: "Отменить", callback_data: "cancelSession" }],
    ],
  };
}

function choiceGuestName(guestNames) {
  return {
    inline_keyboard: [guestNames.map((name, i) => (
      { text: `${1 + i}. ${name}`, callback_data: `guest${i + 1}` }))],
  };
}


module.exports = {getYesButtonMarkup,deleteButtonMarkup,choiceGuestName};
