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
    obj.user_id == ctx.chat.id
  );
 
  if (is_a_participant) return "isMember"; //check if entry already existed
  return "exists";
};
const start_up = (bot, db) => {
  bot.start(async (ctx) => {
   // const admins = ["5063512825","5337899216","6898037633","6923978105"];
   const admins = ["jjelo"]
    const payload = ctx.payload;
    const is_Admin = admins.includes(ctx.message.from.id.toString());
    if (is_Admin) ctx.reply("Hey admin welcome to Raffle bot by Gaup. Create a raffle using /createRaffle");
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
