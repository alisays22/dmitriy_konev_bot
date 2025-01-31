const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const { People, OrderItem,Order } = require("../../connection/model/people");
const {handleError} = require("../../../plugin/handleError")

composer.action("clearCart", async (ctx) => {
  try {
    // Найти пользователя
    const user = await People.findOne({ where: { telegramId: ctx.from.id } });
    let totalQuantity = 0;
    if (!user) {
      await ctx.reply("Произошла ошибка: пользователь не найден.");
    } else {
      // Найти активную корзину/заказ
      const activeCart = await Order.findOne({where: { personId: user.id, status: "in_cart" },});

      if (!activeCart) {
        await ctx.answerCbQuery("В вашей корзине ничего нет.");
      } else {
        totalQuantity = await OrderItem.sum("quantity", {where: { orderId: activeCart.id },});

        // Удалить все элементы заказа, связанные с этим заказом
        await OrderItem.destroy({ where: { orderId: activeCart.id } });

        // Обновление totalQuantity
        totalQuantity = 0;
      }

      // Отправить ответ пользователю
      await ctx.answerCbQuery("Корзина успешно очищена.",{show_alert:true});

      // Обновление разметки клавиатуры после очистки корзины
      const replyMarkup = {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "back" }],
        ],
      };

      await ctx.editMessageCaption("У вас нет товаров", { parse_mode: "HTML", reply_markup: replyMarkup });
    }
  } catch (error) {
    await handleError(error, ctx, 'critical', __filename) 
  }
});


module.exports = composer;


