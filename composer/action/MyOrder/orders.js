const { Composer } = require("telegraf");
const composer = new Composer();
const {  Person,Appointment,Service, Purchase} = require("../../connection/model/people")
const {emoji} = require("./orderFunction")
const {orderkeyboard} = require("./ordersKeyboard")
const {formatBookingTimes} = require("../../utils/dateUtils")
const {handleError} = require("../../../plugin/handleError")


composer.action("orders", async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const pendingOrders = await Purchase.findAll({ where: { personId: user.id, status: 'confirmed' } });

  const lastOrders =  await Purchase.findAll({ where: { personId: user.id}, limit: 5,    
    include: [
    { model: Service, attributes: ["name", "time"] },
    { model: Appointment, attributes: ["serviceId"]}
  ],
  order: [['createdAt', 'DESC']] // Сортировка по createdAt в порядке убывания  
  })

    if (lastOrders.length > 0) {
      const orderDetails = await Promise.all(lastOrders.map(async (order, index) => {
        const orderEmoji = emoji[index % emoji.length];
        const { formattedDate, formattedStartTime, formattedEndTime } = formatBookingTimes(order);

        let orderStatus = '';
// Проверка статуса из модели Purchase
        if(order && order.status === 'confirmed') {
 orderStatus = '<code>🟢 статус: </code>Подтверждён' 
        }else if(order && order.status === 'cancelled'){
          orderStatus = '<code>🔴 статус: </code>Отклонён'
        }else{
          orderStatus ='<code>🟡 статус: </code>Ожидание' 
        }
     
        if (order.serviceId === 1) {
          return `${orderEmoji} <b>${order.Service.name}</b>\n<code> 30 мин</code>\n${orderStatus}`;
        } else {
          return `${orderEmoji} <b>${order.Service.name}</b>\n<code>${order.Service.time} мин</code>\n${orderStatus}\n<code>Дата записи:</code> ${formattedDate}\n<code>Время записи:</code> ${formattedStartTime}-${formattedEndTime}`;
        }
      }));

      await ctx.editMessageMedia({
        type: "photo",
        media: { source: "images/order.jpg" },
        caption: `<b>Мои записи:</b>\n\n${orderDetails.join("\n\n")}`,
        parse_mode: "HTML",
      }, orderkeyboard(lastOrders.length, pendingOrders.length > 0));//очистка мои заказы если их больше 5

    } else {
      await ctx.editMessageCaption("У вас пока нет совершенных заказов",orderkeyboard(lastOrders.length, pendingOrders.length > 0));
    }
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename) 
  }
  });


module.exports = composer;
