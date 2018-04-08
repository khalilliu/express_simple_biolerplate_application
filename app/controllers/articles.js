

const mongoose = require('mongoose');
const {wrap: async} = require('co');
const only = require('only');
const {respond, respondOrRedirect} = require('../utils');
const Article = mongoose.model('Article');
const assign = Object.assign;


//respond(res, tpl, obj, status)
//respondOrRedirect({req,res},url,obj,flash)

exports.load = async( function* (req,res,next){
	try{
    req.article = yield Article.load(id);
    if(!req.article)return next(new Error('Article not found'))
	}catch(e){
		return next(e)
	}
})


exports.index  = async(function* (req, res){
	const page = (req.query.page > 0 ? req.query.page : 1) - 1;
	const _id = req.query.item;
	const limit = 30;
	const options = {
		limit: limit,
		page: page
	};
	if(_id)options.criteria = {_id};
	const articles = yield Article.list(options);
	const count = yield Article.count();

	respond(res, 'articles/index', {
		title: 'Articles',
		articles: articles,
		page: page+1,
		pages: Math.ceil(count/limit)
	});
});


exports.new = function(req,res){
	res.render('articles/new',{
		title:'New Article',
		article: new Article()
	});
};

//create an article 
//upload an image

exports.create = async(function* (req,res){
	const article = new Article(req.body, 'title body tags');
	article.user = req.user;
	try{
		yield article.uploadAndSave(req.file);
		respondOrRedirect({req,res}, `/articles/${article._id}`,article,{
			type:'success',
			text: 'Successfully created article!'
		})
	}catch(err){
		respond(res, 'articles/new', {
			title: article.title || 'New Article',
			errors: [err.toString()],
			article
		}, 422);
	}
})

//edit an article
exports.edit = async(function* (req,res){
	res.render('articles/edit',{
		title: 'Edit '+req.article.title,
		article: req.article
	})
})


//update article
exports.update = async(function* (req,res){
	const article = req.article;
	assign(article, only(req.body, 'title body tags'));
	try{
		yield article.uploadAndSave(req.file);
		respondOrRedirect({res},`/articles/${article._id}`,article);
	}catch(err){
		respond(res, 'articles/edit',{
			title:'Edit' +article.title,
			errors: [err.toString()],
			article
		}, 422)
	}
});

exports.show = function(req,ers){
	respond(res, 'articles/show',{
		title: req.article.title,
		body: req.article
	})
}


exports.destroy = async(function* (req,res){
	yield req.article.remove();
	respondOrRedirect({req,res},'/articles',{},{
		type: 'info',
		text: 'Deleted Successfully'
	})
})

