const { Composer, session } = require("telegraf");
const composer = new Composer();
const { Person, Appointment, Service } = require("../../../../connection/model/people");
const { updateMediaAndKeyboard } = require("./choiceDayKeyboard");
const { updateOrCreateBooking } = require("../../../../utils/updateOrCreateBooking");
const { handleError } = require("../../../../../plugin/handleError");


// Обработка выбор услуги
composer.action(/^day_(\d+)/, async (ctx) => {
  try {
    const serviceId = ctx.match[1];
    const user = await Person.findOne({ where: { telegramId: ctx.from.id } });
    const product = await Service.findOne({ where: { id: serviceId } });
    await ctx.answerCbQuery(`Вы выбрали: ${product.name}`, { show_alert: true });

    const booking = await updateOrCreateBooking(user, serviceId) || await Appointment.create({ personId: user.id, serviceId: product.id });
    booking.serviceId = product.id;
    await booking.save();

    ctx.session = { slider: 1 };
    await updateMediaAndKeyboard(ctx, booking.serviceId, ctx.session.slider);
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename);
  }
});


// Обработка слайдера
composer.action(/^(slider:description_([^_]+)|slider:([^_]+)_(\d+))$/, async (ctx) => {
  try {
    if (ctx.match[1].startsWith('slider:description_')) {
      const dateRange = ctx.match[2];
      return ctx.answerCbQuery(`${dateRange}`);
    } else {
      const action = ctx.match[3];
      const serviceId = ctx.match[4];

      if (action === "next") {
        ctx.answerCbQuery();
        ctx.session.slider = ctx.session.slider >= 5 ? 1 : ctx.session.slider + 1;
      } else if (action === "back") {
        ctx.answerCbQuery();
        ctx.session.slider = ctx.session.slider <= 1 ? 5 : ctx.session.slider - 1;
      }

      await updateMediaAndKeyboard(ctx, serviceId, ctx.session.slider);
    }
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename);
    ctx.reply("Клавиатура устарела попробуйте обновить бота /start")
  }
});

module.exports = composer;