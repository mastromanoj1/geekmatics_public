const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const _ = require('lodash');
const fs = require('fs');

let student = { 
    name: 'MAnoj',
    age: 23, 
    gender: 'Male',
    department: 'English',
    car: 'Honda' 
};
 
let data = JSON.stringify(student);
fs.writeFileSync('student-2.json', data);

//Event data from files
const live_msg = require('./data/live_updates')
const Event_details = require('./data/event_details')
const menu_list = require('./data/menu_list')
const result = require('./data/result')

const app = express();

const token = '6113276151:AAHKwQTJ9T2rirPgcKKlCdm1Z_sRA-WFOCE';
const bot = new TelegramBot(token, {polling: true});


let live_limit = 2

let Event_keybord = [], menu_command =[], Result_keybord = [] ;

const Alpha_Event_keyboard = _.sortBy(Event_details,['event_name'])
const Alpha_Result_keyboard = _.sortBy(result,['event_name'])

Event_details.forEach((ele)=>{
    menu_command.push(ele.event_name)
})
menu_list.forEach((ele) => {
    menu_command.push(ele.command)
})
result.forEach((ele) => {
    menu_command.push(ele.event_name)
})


Alpha_Event_keyboard.forEach((ele)=>{
    Event_keybord.push([ele.event_name])   
})
Alpha_Result_keyboard.forEach((ele) => {
    Result_keybord.push([ele.event_name])
})


console.log(menu_command,"menu")

bot.on('message',async (msg) => { 


    console.log(msg.from.first_name,msg.from.username,msg.text,"Name")
    let text = msg.text;
    let chat_id = msg.chat.id;


    if(!menu_command.includes(msg.text)){
        console.log(msg.text,"texttt")
        bot.sendMessage(chat_id," 😞 Ooops This command is not recognized by the bot")
    }
    
    const match_command = menu_list.find((ele) => ele.command === msg.text)
    if(Boolean(match_command))
    {
        if(match_command.command === '/events'){
            bot.sendMessage(msg.chat.id,match_command.reply,{reply_markup : {keyboard : Event_keybord}} )
        }
        
        if(match_command.command === '/live'){ 
            let length = live_msg.length - 1
            for(let i= length ; i > length - live_limit ; i-- ){
                await bot.sendMessage(msg.chat.id,live_msg[i],{reply_markup:{remove_keyboard: true},parse_mode: 'HTML'} )
            }
        }
        if(match_command.command === '/result'){     
            bot.sendMessage(msg.chat.id,match_command.reply,{reply_markup : {keyboard : Result_keybord}} )
        }

        if(match_command.command === '/start'){ 
            bot.sendMessage(msg.chat.id,match_command.reply,{reply_markup:{remove_keyboard: true}} )
        }
        if(match_command.command === '/feedback'){ 
            bot.sendMessage(msg.chat.id,match_command.reply,{reply_markup:{remove_keyboard: true}} )
        }
    }

    const match_data = Event_details.find((list) => list.event_name === msg.text);
    if(Boolean(match_data)){

        await bot.sendPhoto(chat_id,match_data.event_sponser)
        await bot.sendMessage(chat_id,match_data.event_details,{parse_mode: 'HTML'})
        match_data.event_manager.forEach(async (contact) => {
                bot.sendContact(chat_id,contact.host_number,contact.host_name)
                .catch(async (err) =>{
                    await bot.sendMessage(chat_id,'<b>'+ contact.host_name + '</b>'+'\n'+ "<a>"+ contact.host_number + "</a>",{parse_mode: 'HTML'})
                    // bot.sendMessage(chat_id,contact.host_name)
                })
        })
    }

    const result_publish = result.find((list) => list.event_name === msg.text);
    if(Boolean(result_publish)){
        await bot.sendMessage(chat_id,result_publish.event_result)
    }


 });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serverr started on port ${PORT}`))
