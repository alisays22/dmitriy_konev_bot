const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();


const {Person,Appointment,Service}  =  require("../connection/model/people");
const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число


composer.command("list", async (ctx) => {
  const isAdmin = ctx.from.id === ENGINEER || ctx.message.from.username === "all2now";
  if (!isAdmin) {return ctx.reply("Команда доступна только администратору.")}
  const services = await Service.findAll({ order: [['id', 'ASC']] });// Указываем сортировку по id по возрастанию
    const text = services.map((service, index) => {
      return `${index + 1}. <b>${service.name}</b> (<code>${service.time}мин</code>) — ${service.price} ₽ `;
    }).join('\n');
    await ctx.replyWithHTML(text);
});


module.exports = composer;  