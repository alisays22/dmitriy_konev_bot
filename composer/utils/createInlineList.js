const { Composer, Markup } = require("telegraf");
const composer = new Composer();


// Функция для создания inline списка
function createInlineList(url, id, title, description, messageText) {
  return {
    type: "article",
    thumb_url: url,
    id: id.toString(),
    title,
    description,
    input_message_content: {
      message_text: `${messageText}`,
      parse_mode: "HTML",
    },
  };
}

// Функция для создания кнопки "Назад"
function createBackButton() {
  return createInlineList(
    "https://static.vecteezy.com/system/resources/previews/015/096/355/original/back-button-3d-rendering-png.png",
    999,
    "Назад",
    "Нажмите чтобы вернуться назад",
    `<code>отменить</code>`
  );
}


module.exports = {createInlineList,createBackButton};
