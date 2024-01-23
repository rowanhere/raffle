import { doc, updateDoc, arrayUnion,getDoc } from "firebase/firestore";
import { Markup } from "telegraf";
const enter_raffle = async (id,ctx,db) => {
    const raffle = doc(db, "raffle", id.toString());
  try{
    const [firstName,user_id] = [ctx.chat.first_name || "", ctx.chat.id.toString()];
   await updateDoc(raffle, {
        entries: arrayUnion({firstName,user_id})
    });
    await ctx.replyWithMarkdown(`Your entry was captured! \n\n*Raffle id - ${id.toString()}*`)
    ctx.reply('🎉')
    getDoc(raffle).then(r=>{
      const ss = r.data()
     const message = `
     *🚀 \\${ss.title.split(".").join("\\.")}🚀*\n
     *Participants* \\- ${ss.entries.length}
     *No of winners* \\- ${ss.winner_no}
     *Ends in* \\- ${ss.string_date} \\(utc\\)
     *Raffle id* \\- ${ss.id}
     ||@everyone||`

     const buttons = Markup.inlineKeyboard([
      Markup.button.url('Enter Raffle', `https://t.me/guapRaffle_bot?start=${ss.id}`),
  ]) 
  ctx.telegram.editMessageCaption(-1002040907710,ss.message_id,undefined,message,{
    parse_mode:"MarkdownV2",
    reply_markup: buttons.reply_markup
})
    })
  }catch(err){
    console.log(err);
  }
  
}

export default enter_raffle
