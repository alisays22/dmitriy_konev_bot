const { Composer, Markup } = require("telegraf");
const composer = new Composer();

const {  Person,Appointment,Service} = require("../../connection/model/people");
const {handleError} = require("../../../plugin/handleError")

  // Обработка кнопки Назад в inline меню
composer.hears('отменить', async (ctx) => {
  try{
  await ctx.deleteMessage();
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
})


module.exports = composer;


