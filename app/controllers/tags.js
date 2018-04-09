


const mongoose = require('mongoose');
const {wrap: async} = require('co');
const only = require('only');
const {respond, respondOrRedirect} = require('../utils');
const Article = mongoose.model('Article');
const assign = Object.assign;


exports.index = async(function* (req,res){
	const criteria = {tags: req.params.tag};
	const page = (req.params.page>0 ? req.params.page : 1) - 1;
	const limit = 8;
	const options = {
		criteria,
		page,
		limit
	};

	const articles = yield Article.list(options);
	const count = yield Article.count(criteria);

	respond(res, 'articles/index',{
		title: 'Articles tagged ' + req.params.tag,
		articles,
		page: page+1,
		pages: Math.ceil(count/limit)
	})
})
