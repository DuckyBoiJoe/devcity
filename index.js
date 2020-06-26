const Discord = require('discord.js')
const client = new Discord.Client()
const prefix = ','
const token = 'NzA3MzIzMDc2MzE2MTAyNzQ3.XrQ6FQ.BvZORx9lOieixtoFUivxlWae-kk'
const fs = require('fs')
const ms = require('ms')
var editlog = false
var count = 0
const db = JSON.parse(fs.readFileSync("./database.json", "utf8"))
const warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"))








client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  const args = msg.content.slice(prefix.length).trim().split(/ +/g)

  if (msg.author.bot) return


  if(!db[msg.author.id]) db[msg.author.id] = {
    xp: 0,
    level: 1,
    cash: 0
  }

  db[msg.author.id].xp = db[msg.author.id].xp + 12
  const userInfo = db[msg.author.id]
  if (userInfo.xp >= 100 * userInfo.level) {
    userInfo.level++
    userInfo.xp = 0
    msg.reply("Congratulations, you leveled up!").then(m => {
      m.delete({ timeout: 3000 })
    })
  }

  fs.writeFile("./database.json", JSON.stringify(db), (x) => {
    if (x) console.error(x)
  })

  if (msg.content == `${prefix}ticket`) {
    count = count + 1
    const staffrole = msg.guild.roles.cache.find(r => r.name == 'Staff Team')
    const trialrole = msg.guild.roles.cache.find(r => r.name == 'Temporary Staff')
    const category = msg.guild.channels.cache.find(c => c.name == 'Tickets' && c.type == 'category')
    msg.guild.channels.create(`${msg.author.username}-${count}`, {
      type: 'text',
      permissionOverwrites: [
        {
          id: msg.guild.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: msg.author.id,
          allow: ['VIEW_CHANNEL']
        },
        {
          id: staffrole.id,
          allow: ['VIEW_CHANNEL']
        },
        {
          id: trialrole.id,
          allow: ['VIEW_CHANNEL']
        }
      ],
      parent: category

    }).then(c => {
      c.send(`Hello <@${msg.author.id}>, please state your problem. If you would like to close your ticket, click/tap the reaction.`).then(m => {
        m.react('❌')
        m.pin()
        const filter = user => user.id !== client.user.id
        const collector = m.createReactionCollector(filter)
        collector.on('collect', (reaction, user) => {
          if (user.id !== client.user.id) {
            c.delete()
          }
        })
      })
    })

  }

  if (msg.content.startsWith(`${prefix}purge`)) {
    if (!msg.member.permissions.has('MANAGE_MESSAGES')) return msg.channel.send('You do not have the required permissions!')
    if (!args[1]) return msg.channel.send('Invalid Arguments')
    if(args[1] > 100) args[1] = 100
    msg.channel.bulkDelete(args[1])

    const lgchann = msg.guild.channels.cache.find(c => c.name === "logs" && c.type === "text")
    const embed = new Discord.MessageEmbed()
      .setTitle(msg.author.tag)
      .addField(`Messages Purged in ${msg.channel.name}`, args[1])
      .setThumbnail(msg.author.displayAvatarURL)
    lgchann.send(embed)
  }

  if(msg.content == `${prefix}getroles`){
    if(userInfo.level >= 5) {
      const role = msg.guild.roles.cache.find(r => r.name == 'Regular')
      if(!role) return msg.channel.send('The regular role was not found, please contact a staff member.')
      msg.member.roles.add(role)
      
    }
  }

  if(msg.content == `${prefix}userinfo`) {
    const embed = new Discord.MessageEmbed()
    .setTitle(`${msg.author.username}'s Info`)
    .addField('XP', `${userInfo.xp}/${100 * userInfo.level}`)
    .addField('Level', userInfo.level)
    .addField('Cash', userInfo.cash)
    
    .setColor(0x3498DB)
    .setThumbnail(msg.author.displayAvatarURL())

    msg.channel.send(embed)
  }

  if(msg.content.startsWith(`${prefix}avatar`)) {
    var user = msg.mentions.members.first()
    if(!user) user = msg.author
    const member = msg.guild.member(user)
    if(!member) return msg.channel.send('Invalid Member')
    const attach = new Discord.MessageEmbed()
    .setImage(member.user.displayAvatarURL())
    msg.channel.send(attach)
  }
  
  if(msg.content == `${prefix}gamble`) {
    const pick = Math.random()

    if(pick >= 0.5){
      userInfo.cash = userInfo.cash + 200
      msg.channel.send('You have won $200!')
    }else{
      userInfo.cash = userInfo.cash - 200
      msg.channel.send('You have lost, better luck next time!')
    }

    
    
  }

  if(msg.content == `${prefix}lock`) {
    msg.channel.updateOverwrite(msg.guild.roles.everyone, { SEND_MESSAGES: false })
    msg.channel.send('Successfully locked ' + msg.channel.name)
  }

  if(msg.content.startsWith(`${prefix}warn`)) {
    if(!msg.member.permissions.has('MANAGE_MESSAGES')) return msg.channel.send('You do not have the required permissions')
    const user = msg.mentions.members.first()
    if(!user) return msg.channel.send('You need to mention somebody')
    const member = msg.guild.member(user)
    if(!member) return msg.channel.send('That is an invalid Member.')
    if(!warns[user.id]) warns[user.id] = {
      warnings: 0
    }

    warns[user.id].warnings = warns[user.id].warnings + 1

    msg.channel.send(`**${user.displayName} Was Warned, Warnings: ${warns[user.id].warnings}**`)

    fs.writeFile("./warnings.json", JSON.stringify(warns), (x) => {
      if (x) console.error(x)
    })
  }

  if(msg.content.includes('discord.gg')) {
    msg.delete()

    if(!warns[msg.author.id]) warns[msg.author.id] = {
      warnings: 0
    }

    warns[msg.author.id].warnings = warns[msg.author.id].warnings + 1

    msg.channel.send(`**${msg.member.displayName} Was Warned, Warnings: ${warns[msg.author.id].warnings}**`)

    fs.writeFile("./warnings.json", JSON.stringify(warns), (x) => {
      if (x) console.error(x)
    })
  }

  if(msg.content.includes('https')) {
    msg.delete()

    if(!warns[msg.author.id]) warns[msg.author.id] = {
      warnings: 0
    }

    warns[msg.author.id].warnings = warns[msg.author.id].warnings + 1

    msg.channel.send(`**${msg.member.displayName} Was Warned, Warnings: ${warns[msg.author.id].warnings}**`)

    fs.writeFile("./warnings.json", JSON.stringify(warns), (x) => {
      if (x) console.error(x)
    })
  }





})

client.on('messageDelete', msg => {
  const channel = msg.guild.channels.cache.find(c => c.name == 'logs' && c.type == 'text')
  const embed = new Discord.MessageEmbed()
    .setTitle(`Message Deleted by ${msg.author.tag}`)
    .addField("Message", msg.content)
    .addField("ID", msg.id)
    .addField("Link", msg.url)

  channel.send(embed)
})


client.on('messageUpdate', (old, msg) => {
  if (!editlog) return
  const channel = msg.guild.channels.cache.find(c => c.name === 'logs' && c.type === 'text')
  const embed = new Discord.MessageEmbed()
    .setTitle(`Message Edited by ${msg.author.tag}`)
    .addField("Previous Text", old.content)
    .addField("New Text", msg.content)
    .addField("ID", msg.id)
    .addField("Link", msg.url)
  channel.send(embed)
})

client.login(token)
