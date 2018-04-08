'use strict'

const Notifier = require('notifier');
const jade = require('jade');
const config = require('../../config');

Notifier.prototype.processTemplate = function (tplPath, locals){
	locals.filename = tplPath;
	return jade.renderFile(tplPath, locals);
}	

module.exports = {
	comment: function(options, cb){
		const article = options.article;
		const author = article.user;
		const user = options.currentUser;
		const notifier = new Notifier(config.notifier);

		const obj = {
			to: author.email,
			from: 'your@product.com',
			subject: user.name + ' added a comment on your article ' + article.title,
			alert: user.name + 'says: "' + options.comment,
			locals: {
				to: author.name,
				from: user.name,
				body: options.comment,
				article: article.name
			}
		};

		try {
			notifier.send('comment', obj, cb);
		} catch(e) {
			// statements
			console.log(e);
		}

	}
}