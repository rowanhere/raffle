import { Markup } from "telegraf";
import { collection, doc,setDoc, updateDoc } from "firebase/firestore"; 



const options = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'UTC'
};
const send_raffle = async (ctx,bot,db) => {
  const data = ctx.session
  const date = Date.now()
  const utcDate = new Date(date+ data.time);
 const sdate = utcDate.toLocaleString('en-US', options);
 try{
 const docRef = doc(collection(db,"raffle"))
await setDoc(docRef, {
  created_at: date,
  end_at:date+data.time,
  title:data.title.toUpperCase(),
  image:data.image,
  winner_no:data.winners,
  ended:false,
  string_date:sdate,
  
 })
 
    const buttons = Markup.inlineKeyboard([
        Markup.button.url('Enter Raffle', `https://t.me/blanksfillme_bot?start=${docRef.id}`),
    ])              
      const message2 = `
      *🚀 ${data.title.toUpperCase().split(".").join("\\.")}🚀*\n
      *Participants* \\- 0
      *No of winners* \\- ${data.winners}
      *Ends in* \\- ${sdate} \\(utc\\)
      *Raffle id* \\- ${docRef.id}
      ||@everyone||
      `
      const id = await bot.telegram.sendPhoto("-1002040907710",data.image,{
        caption:message2,
        parse_mode:'MarkdownV2',
        reply_markup:buttons.reply_markup,
        reply_to_message_id: 2, 
      })
      await updateDoc(doc(db,"raffle",docRef.id),{
        message_id:id.message_id,
        id:docRef.id
      })
    }catch(err){
      ctx.reply("Some error occured please restart the process usingg /createRaffle again.")
    }
}

export default send_raffle
