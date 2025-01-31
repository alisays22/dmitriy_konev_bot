const { Composer, Markup } = require("telegraf");

const {Appointment,Message} = require("../connection/model/people");

// async function deleteMessage(ctx, messageName) {
//     const message = await Message.findOne({ where: { nameMessage: messageName } });
//     if (message) {
//       await ctx.deleteMessage(message.messageId);
//     }
//   }

async function deleteMessage(ctx, userId, messageName) {
  const message = await Message.findOne({ where: { nameMessage: messageName, personId: userId } });
  if (message) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, message.messageId);
      return true; // Успешное удаление
    } catch (error) {
      if (error.response && error.response.error_code === 400 && error.response.description === 'Неверный запрос: сообщение для удаления не найдено') {
        console.warn(`Сообщение ${message.messageId} в чате не найдено или уже удалено.`);
      } else {
        console.error('Ошибка при удалении сообщения:');
      }
      return false; // Ошибка при удалении
    }
  } else {
    console.warn(`Сообщение с именем ${messageName} не найдено для пользователя ${userId}.`);
    return false; // Сообщение не найдено
  }
}



module.exports = {deleteMessage}

