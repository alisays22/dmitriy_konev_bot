const rateLimit = require('telegraf-ratelimit');

const {sleep} = require("./sleep")

// Set limit to 1 message per 3 seconds
const limitConfig = {
  window: 1000,
  limit: 3,
  onLimitExceeded: async(ctx, next) => {
    const message = await ctx.reply('⚠️ Слишком много запросов подождите..')
    await sleep(3000) // Wait for 3 seconds
    await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id)
      .catch((err) => {
        console.log(`Error while deleting message: ${err}`)
      })
  }
}

module.exports = { limitConfig };
