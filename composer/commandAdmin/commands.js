const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число

// Массив с объектами команд,
const adminCommands = [
  { command: "/user", description: "Количество пользователей", category: 'stat' },
  { command: "/last5", description: "Последние 5 пользователей", category: 'stat' },
  { command: "/last10", description: "Последние 10 пользователей", category: 'stat' },
  { command: "/add", description: "Добавить новую услугу", category: 'service' },
  { command: "/list", description: "Список услуг", category: 'service' },
  { command: "/delete", description: "Удаление последней услуги", category: 'service' }
];

composer.command("commands", async (ctx) => {
  const id = ctx.from.id
  const username = ctx.message.from.username;
  if (id === ENGINEER || username === "all2now") {
    // Группируем команды для разных категорий
    const statsCommands = adminCommands.filter(cmd => cmd.category === 'stat');
    const quoteCommands = adminCommands.filter(cmd => cmd.category === 'service');
    // Форматируем команды в строки 
    const statsCommandsText = statsCommands.map(cmd => `<b>${cmd.command}</b> - ${cmd.description}`).join('\n');
    const quoteCommandsText = quoteCommands.map(cmd => `<b>${cmd.command}</b> - ${cmd.description}`).join('\n');
    
    // Отправляем сформированный ответ
    ctx.replyWithHTML(`<b>🛠 Команды администратора:</b>\n\n<b>Услуги:</b>\n${quoteCommandsText}\n\n<b>Статистика:</b>\n ${statsCommandsText}`
    );
  } else {
    ctx.reply("Команда доступна только администратору.");
  }
});


module.exports = composer;
