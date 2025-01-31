const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const {Person,Cycle,Timer} =  require("../connection/model/people");
const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число


composer.command("user", async (ctx) => {
  const id = ctx.from.id
  const username = ctx.message.from.username;
  if (id === ENGINEER || username === "all2now") {
    try {
      const userCount = await Person.count(); 
      await ctx.reply(`Кол-во пользователей: ${userCount}`); 
    } catch (error) {
      console.error("Ошибка при подсчете пользователей:", error);
      ctx.reply("Произошла ошибка при подсчете пользователей.");
    }
  } else {
    ctx.reply("Команда доступна только администратору");
  }
});

module.exports = composer;
