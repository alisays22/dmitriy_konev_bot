// serverUtils.js
const { exec } = require('child_process');

function restartServer(serverId) {
  exec(`pm2 restart ${serverId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка при выполнении команды: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Ошибка: ${stderr}`);
      return;
    }
    console.log(`Результат: ${stdout}`);
  });
}

module.exports = {restartServer};