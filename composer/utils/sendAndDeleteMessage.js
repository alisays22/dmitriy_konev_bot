const {sleep} = require("../../plugin/sleep")

async function sendAndDeleteMessage(ctx, text, delay) {
  const message = await ctx.reply(text);
  await sleep(delay);
  await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
}

module.exports = {sendAndDeleteMessage}