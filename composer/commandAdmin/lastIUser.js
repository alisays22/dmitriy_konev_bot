const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const {Person,Cycle,Timer} =  require("../connection/model/people");
const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число

// Функция для получения последних пользователей
async function fetchAndReplyWithUsers(ctx, limit) {
  try {
    const users = await Person.findAll({limit: limit,order: [['createdAt', 'ASC']] });
    const usersList = users.map( u => `<b>id:${u.id}</b> ${u.firstName} ${u.userName ? '@' + u.userName : ''}`
    ).join('\n');

    await ctx.replyWithHTML(`Последние ${limit} пользователей:\n\n${usersList}`);
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    ctx.reply("Произошла ошибка при получении данных пользователей.");
  }
}

// Обработчик для команды получения последних 5 пользователей
composer.command("last5", async (ctx) => {
  const isAdmin = ctx.from.id === ENGINEER || ctx.message.from.username === "all2now";
  if (!isAdmin) {return ctx.reply("Команда доступна только администратору.")}
    await fetchAndReplyWithUsers(ctx, 5);
});

// Обработчик для команды получения последних 10 пользователей
composer.command("last10", async (ctx) => {
  const isAdmin = ctx.from.id === ENGINEER || ctx.message.from.username === "all2now";
  if (!isAdmin) {return ctx.reply("Команда доступна только администратору.")}
    await fetchAndReplyWithUsers(ctx, 10);
});



module.exports = composer;
