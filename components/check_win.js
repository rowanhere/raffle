import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import pickRandom from "pick-random";
import cron from "node-cron";
const check_win = async (bot, db) => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running winner check again");
    try {
      const d = doc;
      const q = query(collection(db, "raffle"), where("ended", "==", false));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const messageID = doc.data().message_id;
        const entries = doc.data().entries;
        const winnerNo = doc.data().winner_no;
        const date = Date.now();
        if (doc.data().end_at > date) return;
        if (!messageID) return;
        if (!entries) return;
        if (parseInt(winnerNo) > entries.length) {
          const message = `Raffle ID *${doc.id}* abandoned due to insufficient participants. Stay tuned for the next one!`;
          bot.telegram.deleteMessage("-1002040907710", parseInt(messageID));
          bot.telegram.sendMessage("-1002040907710", message, {
            message_thread_id: 2,
            parse_mode: "Markdown",
          });
          await deleteDoc(d(db, "raffle", doc.id));
          return;
        }
        const randomWinners = pickRandom(entries, {
          count: parseInt(winnerNo),
        });
        const winners = randomWinners.map((el) => el.username || el.user_id);
        const winnerMessage = `🚀*${doc.data().title}*🚀\n\nWinners are - @${winners.join(" @")}\nRaffle id - *${doc.id}*
        `
        await bot.telegram.deleteMessage("-1002040907710", parseInt(messageID));
        await bot.telegram.sendMessage("-1002040907710", winnerMessage, {
          message_thread_id: 2,
          parse_mode: "Markdown",
        });
       
        await updateDoc(d(db, "raffle", doc.id),{
          ended:true
        });
      });
    } catch (err) {}
  });
};

export default check_win;
