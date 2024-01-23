import {
  collection,
  query,
  where,
  getDocs,
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

      const winnerPromises = querySnapshot.docs.map(async (doc) => {
        const messageID = doc.data().message_id;
        const entries = doc.data().entries || [];
        const winnerNo = doc.data().winner_no;
        const date = Date.now();
        if (doc.data().end_at > date) return;

        if (!messageID) return;

        if (parseInt(winnerNo) > entries.length) {
          const message = `Raffle ID *${doc.id}* abandoned due to insufficient participants. Stay tuned for the next one!`;
          await bot.telegram.deleteMessage("-1002040907710", parseInt(messageID));
          await bot.telegram.sendMessage("-1002040907710", message, {
            message_thread_id: 2,
            parse_mode: "Markdown",
          });
          await updateDoc(d(db, "raffle", doc.id), {
            ended: true,
            abandoned:true
          });
          return;
        }

        const randomWinners = pickRandom(entries, {
          count: parseInt(winnerNo),
        });

        let winnersLink = randomWinners.map(el => {
          return `<a href="tg://user?id=${el.user_id}">${el.firstName}</a>`;
        });
       winnersLink =  winnersLink.map((item, index) => `${index + 1}# ${item}`);
        const winnerMessage = `🚀<b>${doc.data().title}</b>🚀\n\nWinners are - ${winnersLink.join("\n")}\nRaffle id - <b>${doc.id}</b>`;

        await bot.telegram.deleteMessage("-1002040907710", parseInt(messageID));
        await bot.telegram.sendMessage("-1002040907710", winnerMessage, {
          message_thread_id: 2,
          parse_mode: "html",
        });

        await updateDoc(d(db, "raffle", doc.id), {
          ended: true
        });
      });

      await Promise.all(winnerPromises);
    } catch (err) {
      console.error(err);
    }
  });
};

export default check_win;
