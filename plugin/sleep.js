// Задержка сообщений sleep(3000) - задержка на 3 сек
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { sleep };
