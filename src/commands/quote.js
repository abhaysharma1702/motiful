const Command = require('../structures/Command');
const { RichEmbed, Collection } = require('discord.js');
const moment = require('moment');

class QuoteCommand extends Command {
	constructor() {
		super({
			name: 'quote',
			description: 'Quote a message (Out of the last 100 overall messages)',
			args: [
				{
					type: 'user',
					name: 'user'
				},
				{
					type: 'string',
					name: 'input',
					defaultVal: ''
				}
			]
		});
	}

	async run(message, args) {
		let snippet, response;
		if (message.content.includes('|')) {
			snippet = args.input.substring(0, args.input.indexOf('|') - 1).trim();
			response = args.input.substring(args.input.indexOf('|') + 1).trim();
		}
		else {
			snippet = args.input.trim();
		}
		await message.delete();
		message.channel.fetchMessages({ limit: 100 }).then(messages => {
			const quoteMsg = messages.filter(msg => msg.author.id === args.user.id && msg.content.toLowerCase().includes(snippet)).first();
			if (!quoteMsg) return message.channel.send('Message not found!').then(msg => msg.delete(3000));
			const date = moment(quoteMsg.createdTimestamp).format('Do MMM YYYY'), time = moment(quoteMsg.createdTimestamp).format('HH:mm:ss');
			const name = quoteMsg.author.username, avatar = quoteMsg.author.avatarURL();
			const embed = new RichEmbed()
				.setColor('RANDOM')
				.setAuthor(`${name} wrote on the ${date} at ${time}:`, avatar)
				.setDescription(quoteMsg.content);
			return message.channel.send({ embed }).then(msg => {
				if (response) msg.channel.send(response);
			});
		});
	}
}

module.exports = QuoteCommand;