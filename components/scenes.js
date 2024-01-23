import { Scenes, session, Input } from "telegraf";
import { message } from "telegraf/filters";
import toTime from "to-time";
import { Markup } from "telegraf";
import send_raffle from "../helper/send_raffle.js";
const store = new Map();
const buttons = Markup.inlineKeyboard([
  Markup.button.callback("Send Raffle", "send"),
  Markup.button.callback("Restart", "restart"),
]);

const scenes = (bot,db) => {
  const [title, winners, endTime, image] = [
    new Scenes.BaseScene("title"),
    new Scenes.BaseScene("winners"),
    new Scenes.BaseScene("endTime"),
    new Scenes.BaseScene("image"),
  ];
  title.enter((ctx) => {
    ctx.reply("Hello please provide a title for Raffle:");
  });
  winners.enter((ctx) => {
    ctx.reply("Please provide no of winners:");
  });
  endTime.enter((ctx) => {
    ctx.replyWithMarkdownV2(
      "Please provide a ending time for Raffle \n*\\(D days H hours or just D days or just H hours\\) format*:"
    );
  });
  image.enter((ctx) => {
    ctx.reply("Please provide a image for raffle: ");
  });
  title.on(message("text"), (ctx) => {
    const title = ctx.message.text;
    ctx.session.title = title;
    ctx.scene.enter("winners");
  });
  winners.on(message("text"), (ctx) => {
    const no = ctx.message.text;
    if (isNaN(no)) {
      ctx.reply("Winners must be in numbers!");
      ctx.reply("Please restart /createRaffle again!");
      ctx.session = null;
      store.clear();
      return;
    }
    ctx.session.winners = no;
    ctx.scene.enter("endTime");
  });
  endTime.on(message("text"), async (ctx) => {
    try {
      const time = toTime(ctx.message.text).ms();
      ctx.session.timeString = ctx.message.text;
      ctx.session.time = time;
      ctx.scene.enter("image");
    } catch (err) {
      await ctx.reply("Invalid format!");
      ctx.reply("Please restart /createRaffle again!");
      ctx.session = null;
      store.clear();
      return;
    }
  });
  image.on(message("photo"), async (ctx) => {
    const photo = ctx.message.photo;
    const fileId = photo[photo.length - 1].file_id;
    ctx.session.image = fileId;
    const message = `
 *🚀 ${ctx.session.title}🚀*\n\n
 *No of winners* - ${ctx.session.winners}\n
 *Ends at* - ${ctx.session.timeString}\n
 @everyone
 `;
    await ctx.replyWithPhoto(fileId, {
      caption: message,
      parse_mode: "Markdown",
      reply_markup: buttons.reply_markup,
    });

    ctx.reply(
      "This is what Raffle would look like: \n If you missed something you can click restart"
    );
  });

  const stage = new Scenes.Stage([title, winners, endTime, image]);
  bot.use(session({ store }));
  bot.use(stage.middleware());
  bot.action("send", (ctx) => {
    try {
      ctx.deleteMessage()
      send_raffle(ctx,bot,db)
      return ctx.reply("👍");
    } catch (err) {}
  });
  bot.action("restart", (ctx) => {
    ctx.deleteMessage()
    ctx.session = null;
    store.clear();
    ctx.reply("Start over using /createRaffle");
  });
  bot.command("createRaffle", (ctx) => {
    const chatId = ctx.message.from.id.toString();
    const admins = ["5063512825","5337899216","6898037633","6923978105"];
    if (!admins.includes(chatId)) {
      ctx.reply("Not a admin error");
      return;
    }
    ctx.scene.enter("title");
  });
};

export default scenes;
