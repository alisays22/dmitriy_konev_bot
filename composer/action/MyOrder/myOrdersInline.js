const { Composer } = require("telegraf");
const composer = new Composer();

const { Person,Appointment,Service} = require("../../connection/model/people");
const {createInlineList} = require("../../utils/createInlineList")
const {emoji} = require("./orderFunction")
const {handleError} = require("../../../plugin/handleError")


// Inline меню завершенных записей в меню Мои записи
composer.inlineQuery("заказы", async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const orders = await Appointment.findAll({ where: { personId: user.id, status: 'booked' }, include: [Service] });
  // Если у пользователя нет заказов, возвращаем сообщение и предлагаем перейти в каталог
  if (!orders || orders.length === 0) {
    return ctx.answerInlineQuery([], {
      switch_pm_text: "У вас пока заказов",
      switch_pm_parameter: "catalog",
      cache_time: 1,
    });
  }

    const orderResults = orders.map((purchase) => {
      const emojiIndex = purchase.id % emoji.length;
      const currentEmoji = emoji[emojiIndex];
      return createInlineList(
        purchase.Service.imageURL,
        purchase.Service.id,
        `${currentEmoji} ${purchase.Service.name}`,
        `ID заказа: ${purchase.id}`,
        `<code>service_${purchase.Service.id}</code>`
      );
    });
       return ctx.answerInlineQuery(orderResults, { cache_time: 1 });
       
       } catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
});


module.exports = composer;
