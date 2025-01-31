const { Composer, Markup } = require("telegraf");
const composer = new Composer();
const {  Person,Appointment,Service} = require("../../../../connection/model/people");

const {  generateDateKeyboard,updateMediaAndKeyboard} = require("./choiceDayKeyboard");
const {updateOrCreateBooking} = require("../../../../utils/updateOrCreateBooking");
const{handleError} = require("../../../../../plugin/handleError")

// Назад из карточки выбора дней => 
  composer.action(/^backDay_(\d+)/, async (ctx) => {
  try{
    await ctx.answerCbQuery(`Назад`);
    const productId = ctx.match[1];
    // Загрузка данных пользователя и услуги
  // Загрузка данных пользователя и услуги
  const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
  const product = await Service.findOne({ where: { id: productId } });

  // Используем функцию updateOrCreateBooking для обновления или создания записи
  const booking = await updateOrCreateBooking(user, product.id, null);


  // Обновление медиа-контента, подписи и клавиатуры
  await updateMediaAndKeyboard(ctx, booking.serviceId, ctx.session.slider);
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
  ctx.reply("Клавиатура устарела попробуйте обновить бота /start")
}
  });



module.exports = composer;


