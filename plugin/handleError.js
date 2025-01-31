const { Composer, Markup } = require("telegraf");
const composer = new Composer();
const chalk = require("chalk");
const path = require('path');

// Функция для обработки ошибок и выдача в консоль с указанием пути
async function handleError(e, ctx, errorType, modulePath) {
  const filename = path.resolve(modulePath);
  if (errorType === 'critical') {
    console.error(chalk.bold.red(`Ошибка в файле ${filename}:\n${e}`));
  } else if (errorType === 'ignore') {
    console.error(chalk.gray(`Ошибка в файле ${filename}:\n${e}`));
  } else {
    console.error('Ошибка:', e); // Без цвета, если тип не задан
  }
}


module.exports = {handleError}


