import enter_raffle from "../helper/enter_raffle.js";
import { getDoc, doc } from "firebase/firestore";
const check_raffle = async (payload, db, ctx) => {
  const docRef = doc(db, "raffle", payload);
  const docSnap = await getDoc(docRef);
  const snapshot = docSnap.data();

  if (!docSnap.exists()) return false;
  if (snapshot.ended) return "ended"; //raffle has ended
  const is_a_participant = snapshot.entries?.some(
    (obj) =>
    obj.username == ctx.chat.username || obj.user_id == ctx.chat.id
  );
  console.log(is_a_participant);
  if (is_a_participant) return "isMember"; //check if entry already existed
  return "exists";
};
const start_up = (bot, db) => {
  bot.start(async (ctx) => {
    const admins = ["506351282"];

    const payload = ctx.payload;
    const is_Admin = admins.includes(ctx.chat.id.toString());
    if (is_Admin) ctx.reply("Hey admin welcome to Raffle bot by Gaup.");
    else if (payload == "") ctx.reply("Error! Invalid raffle id");
    else {
      const exists = await check_raffle(payload, db, ctx);
      //send raffle details if raffle id exists
      switch (exists) {
        case "isMember":
          ctx.reply("Already a participant, please wait for results!");
          break;
        case "exists":
          enter_raffle(payload, ctx, db);
          break;
        case "ended":
          ctx.reply("Raffle has ended, please wait for another");
          break;
        default:
          ctx.reply("Error! Invalid raffle id");
          break;
      }
    }
  });
 
  
};

export default start_up;
