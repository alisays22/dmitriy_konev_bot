const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const {  Person,Message, Appointment,Service,Purchase} =require("../connection/model/people");
const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число
const { restartServer } = require("../../plugin/serverUtils"); // Импортируем функцию

//!!! удаление кскадно всех таблиц и данных
composer.command("drop", async (ctx) => {
  const isAdmin = ctx.from.id === ENGINEER || ctx.message.from.username === "all2now";
  if (!isAdmin) {return ctx.reply("Команда доступна только администратору.")} {
    try {
      // Удаление таблиц
      // await Service.drop({ cascade: true });
      // await Appointment.drop({ cascade: true });
      // await Purchase.drop({ cascade: true });
      await Message.drop({ cascade: true });
      // await Person.drop({ cascade: true });
      // Ответ пользователю после удаления
      ctx.reply("Все таблицы были успешно удалены.");
        //Перезапуск сервера pm2 restart 3
      await restartServer(3);
    } catch (error) {
      console.error("Ошибка при удалении таблиц:", error);
      ctx.reply(
        "При удалении таблиц произошла ошибка. Пожалуйста, попробуйте еще раз."
      );
    }
  }
});
  


module.exports = composer;  