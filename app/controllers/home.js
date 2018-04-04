

exports.index = function (req,res) {
	// body... 
	res.render('home/index',{
		title: 'Node Express Mongoose Boilerplate'
	})
	//res.send('hello world')
}