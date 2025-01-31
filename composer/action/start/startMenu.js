const {handleError} = require("../../../plugin/handleError")
const {Appointment,Purchase} = require("../../connection/model/people")
const startKeyboard = require("./startKeyboard")

async function startMenu(ctx, user) {
  try{
  const hasBookedAppointments = await Appointment.count({ where: { personId: user.id, status: 'booked' } });
  const hasFreeConsultation = await Purchase.count({ where: { personId: user.id, serviceId: 1, status: ["pending", "confirmed"] } });

  const caption = user.firstName ? `<b>${user.firstName},</b> Выберите категорию:` : "Выберите категорию:";

  await ctx.replyWithPhoto({ source: "images/start.jpg" },
    {
      caption: caption,
      parse_mode: "HTML",
      reply_markup: startKeyboard(hasBookedAppointments, hasFreeConsultation),
    });
} catch (error) {
  await handleError(error, ctx, 'critical', __filename) 
}
}

async function editStartMenu(ctx, user, messageId) {
  try {
    const hasBookedAppointments = await Appointment.count({ where: { personId: user.id, status: 'booked' } });
    const hasFreeConsultation = await Purchase.count({ where: { personId: user.id, serviceId: 1, status: ["pending", "confirmed"] } });

    const caption = user.firstName ? `<b>${user.firstName},</b> Выберите категорию:` : "Выберите категорию:";

    await ctx.editMessageMedia({
      type: "photo",
      media: { source: "images/start.jpg" },
      caption: caption,
      parse_mode: "HTML",
    });

    await ctx.editMessageReplyMarkup(startKeyboard(hasBookedAppointments, hasFreeConsultation));
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename);
  }
}


module.exports = {startMenu,editStartMenu}