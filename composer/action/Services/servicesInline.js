const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {  Person,Appointment,Service,Purchase} = require("../../connection/model/people");
const {createInlineList,createBackButton} = require("../../utils/createInlineList")
const {handleError} = require("../../../plugin/handleError")


composer.inlineQuery('Услуги', async (ctx) => {
  try{
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const services = await Service.findAll({ order: [['id', 'ASC']] });
  const hasFreeConsultation = await Purchase.count({ where: { personId: user.id, serviceId: 1, status: ["pending","confirmed"] } });
  
  if (!services || services.length === 0) {
    return ctx.answerInlineQuery([], {
      switch_pm_text: "Услуг не найдено",
      switch_pm_parameter: "catalog",
      cache_time: 1,
    });
  }

  const serviceResult = hasFreeConsultation
  ? services.filter(service => service.id !== 1).map((service) => ({
    ...createInlineList(
      service.imageURL,
      service.id,
      `${service.name} ${service.price} ₽`,
      `${service.description}`,
      `<code>service_${service.id}</code>`
    ),
  }))
  : services.map((service) => ({
    ...createInlineList(
      service.imageURL,
      service.id,
      `${service.name} ${service.price} ₽`,
      `${service.description}`,
      `<code>service_${service.id}</code>`, 
    ),
  }));

  // Кнопка с Назад
  const backButton = createBackButton();
  ctx.answerInlineQuery([...serviceResult, backButton], { cache_time: 1 });
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}

});


module.exports = composer;


