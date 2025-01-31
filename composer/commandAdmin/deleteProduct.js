const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();


const {Service} =require("../connection/model/people");
  
const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число

// Удаление последней строки из таблицы Service командой /delete
composer.command("delete", async (ctx) => {
    const id = ctx.from.id;
    if (id === ENGINEER) {
      try {
        const lastProduct = await Service.findOne({
          order: [["id", "DESC"]],
        });
  
        if (lastProduct) {
          await Service.destroy({where: {id: lastProduct.id,},});
          console.log(`Последний продукт ${lastProduct.name} с ID=${lastProduct.id} удален.`);
          ctx.replyWithHTML(
            `Последний продукт <b>${lastProduct.name}</b> с <b>ID: ${lastProduct.id}</b> удален.`
          );
  
          // Удаление всех записей таблицы достигнуто
          const remainingProducts = await Service.count();
          if (remainingProducts === 0) {
            // Сбросить счетчик Service ID
            try {
              await sequelize.query('ALTER SEQUENCE "Products_id_seq" RESTART WITH 1;');
            } catch (error) {
              console.error("Ошибка сброса последовательности Product ID:", error);
            }
            console.log("Счетчик ID обнулен.");
          }
        } else {
          console.log("Таблица товаров пуста.");
          ctx.reply("Таблица товаров пуста.");
        }
      } catch (error) {
        console.error("Ошибка удаления последнего продукта:", error);
        ctx.reply("Ошибка удаления последнего продукта.");
      }
    } else {
      ctx.reply("Команда доступна только администратору.");
    }
  });
  


module.exports = composer;  