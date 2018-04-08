

/*
* Module dependencies
*/

var mongoose = require('mongoose');
var notify =  require('../mailer');

var Schema = mongoose.Schema;

var getTags = tags => tags.join(',');
var setTags = tags => tags.split(',');

//user schema

var ArticleSchema = new Schema({
	title: { type: String, default: '', trim: true },
	body: { type: String, default: '', trim: true},
	user: { type: Schema.ObjectId, ref: 'User' },
	comments: [{
		body: { type: String, default: '', trim: true},
		user: { type: Schema.ObjectId, ref: 'User' },
		createAt: { type: Date, default: Date.now }
	}],
	tags: {type: [], get: getTags, set:setTags},
	image: {
		cdnUri: String,
		files: []
	},
	createAt: { type: Date, default: Date.now }
})

//Validation

ArticleSchema.path('title').required(true, 'Article title cannot be blank');
ArticleSchema.path('body').required(true, 'Article body cannot be blank');

//pre-remove hook
ArticleSchema.pre('remove',function(next) {
	// body... 
	next();
})


//user plugin

//ArticleSchema.plugin(userPlugin, {});

//add methods

ArticleSchema.method({
	/**
   * Save article and upload image
   *
   * @param {Object} images
   * @api private
   */

   uploadAndSave: function(image){
   	const err = this.validateSync();
   	if(err&&err.toString())throw new Error(err.toString());
   	return this.save();
   },

   addComment: function(user,comment){
   	this.comments.push({
   		body: comment.body,
   		user: user._id
   	});
   	if(!this.user.email)this.user.email = 'email@example.com';

   	notify.comment({
   		article:this,
   		currentUser: user,
   		comment: comment.body
   	});
   	return this.save();
   },

   removeComment: function(commentId){
   	const index = this.comments
   		.map(comment => comment.id)
   		.indexOf(commentId);

   	if(~index)this.comments.splice(index, 1);
   	else throw new Error('Comment not found');
   	return this.save();
   }
});

//static

ArticleSchema.static({
	load: function(_id){
		return this.findOne({_id})
			.populate('user','name email username')
			.populate('comment.user')
			.exec();
	},

	list: function(options){
		const criteria = options.criteria || {};
		const page = options.page || 0;
		const limit = options.limit || 30;
		return this.find(criteria)
			.populate('user', 'name username')
			.sort({ createAt: -1 })
			.limit({limit})
			.skip(limit*page)
			.exec();
	}
});

mongoose.model('Article',ArticleSchema);