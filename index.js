const { Telegraf, session } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const rateLimit = require("telegraf-ratelimit");
const db = require("./composer/connection/db.connection");
bot.use(session());
// COMAND
bot.use(require("./composer/action/start/start"));

// //ACTION
bot
  .use(require("./composer/action/Booking/choiceService"))
  .use(require("./composer/action/Booking/massageCard"))
  .use(require("./composer/action/Booking/backCard"))
  .use(require("./composer/action/Booking/ChoiceData/choiceTime"))
  .use(require("./composer/action/Booking/ChoiceData/choiceDay/choiceDay"))
  .use(require("./composer/action/Booking/ChoiceData/choiceDay/backDayButton"))
  .use(require("./composer/action/Booking/aceptBooking"))
  .use(require("./composer/action/Booking/clearBooking"))

  // раздел Мои записи
  .use(require("./composer/action/MyOrder/orders"))
  .use(require("./composer/action/MyOrder/myOrdersInline"))
  .use(require("./composer/action/MyOrder/deleteCompleteOrder"))

  // раздел Бесплатная консультация
  .use(require("./composer/action/Consultation/freeConsultation"))
  .use(require("./composer/action/Consultation/freeSignUp"))
  .use(require("./composer/action/Consultation/ConfirmAdmin"))
  .use(require("./composer/action/Consultation/cancelFree"))

  // раздел Услуги
  .use(require("./composer/action/Services/servicesInline"))
  .use(require("./composer/action/Services/servicesCard"))
  .use(require("./composer/action/Services/close"))
  .use(require("./composer/action/Services/cancel"))

  // раздел О терапию
  .use(require("./composer/action/About/aboutMassage"))

  .use(require("./composer/action/back"));

// // SCENES и middleware для работы с сессией
bot.use(require("./scenes/index.scene"));

// // // HEARS
bot.use(require("./composer/hears/one.hears"));
bot.use(require("./composer/hears/two.hears"));
// bot.use(require("./composer/hears/three.hears"));

// // ON
// bot.use(require("./composer/on/productCard"));

// // ADMIN comand
bot.use(require("./composer/commandAdmin/commands"));
bot.use(require("./composer/commandAdmin/numberUsers"));
bot.use(require("./composer/commandAdmin/lastIUser"));

bot.use(require("./composer/commandAdmin/addService"));

bot.use(require("./composer/commandAdmin/backStart"));

bot.use(require("./composer/commandAdmin/cancel"));

bot.use(require("./composer/commandAdmin/viewCard"));
bot.use(require("./composer/commandAdmin/closeCard"));
bot.use(require("./composer/commandAdmin/deleteProductCard"));
bot.use(require("./composer/commandAdmin/deleteProduct"));

bot.use(require("./composer/commandAdmin/deletePurhshare"));
//!!! удаление кскадно всех таблиц и данных
bot.use(require("./composer/commandAdmin/dropTable"));
bot.use(require("./composer/commandAdmin/serviceList"));

const { limitConfig } = require("./plugin/ralteLimit");
bot.use(rateLimit(limitConfig));


const chalk = require("chalk");

// // Cинхронизация модели с базой данных
db.sync({ alter: true })
  .then(() => {
    console.log(chalk.italic("База данных и модели синхронизированы."));
  })
  .catch((error) => {
    console.error(chalk.red("Ошибка синхронизации моделей:", error));
  });

// Запуск бота
bot
  .launch({ dropPendingUpdates: true })
  .then(() => console.log("Бот запущен!"))
  .catch((error) => console.error("Ошибка при запуске бота:", error));
