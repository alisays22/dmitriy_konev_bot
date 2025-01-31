const { Composer } = require("telegraf");
const composer = new Composer();

const {  Person,Appointment,Service, Purchase} = require("../../connection/model/people");

// Создаем массив с emoji
const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

// Обновление кнопок, фото и подписи Заказы
async function getOrderItemsDescription(purchase) {
  const appointments = await Appointment.findAll({
    where: { personId: purchase.personId, status: 'booked', serviceId: purchase.serviceId },
    include: [Service],
  });

  const orderItemsDescription = appointments.map((item) => item.Service.time);
  return orderItemsDescription[0] || 'undefined'; // Возвращает значение time или 'undefined', если его нет
}

// Обновление кнопок, фото и подписи Заказы
async function getPrice(order) {
  const appointments = await Appointment.findAll({
    where: { personId: order.personId, serviceId: order.serviceId },  
    include: [Service],
  });

  const price = appointments.reduce((totalPrice, item) => {
    return totalPrice + item.Service.price;
  }, 0);

  return price;
};



module.exports = {emoji,getOrderItemsDescription,getPrice}
