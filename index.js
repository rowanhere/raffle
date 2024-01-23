import { Telegraf } from "telegraf";
import start_up from "./components/start_up.js";
import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import scenes from "./components/scenes.js";
import check_win from "./components/check_win.js";
const bot = new Telegraf(process.env.BOT_TOKEN);
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
scenes(bot,db);
start_up(bot,db)
check_win(bot,db)

bot.launch({
  allowedUpdates: ['message', 'callback_query'],
});