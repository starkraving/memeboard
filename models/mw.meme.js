var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

module.exports = (function(){
	var memeModel = mongoose.model('memeItem', new Schema({
		'screen_name': String,
		'image_url': String,
		'image_created': Date,
		'image_title': String,
		'image_faves': Number
	}));

	var perPage = 12;

	return {
		byMember: function(scope, propName) {
			return function(req, res, next) {
				var pageN = req.params.p || 1;
				memeModel.find({screen_name: req[scope][propName]}).sort('image_created', 1).skip(pageN * perPage).limit(perPage).exec(function(err, results){
					if ( err || !results ) results = [];
					res.memeByMember = results;
					next();
				});
			};
		},
		byFaves: function(req, res, next) {
			var pageN = req.params.p || 1;
			memeModel.find().sort('image_faves', 1).skip(pageN * perPage).limit(perPage).exec(function(err, results){
				if ( err || !results ) results = [];
				res.memeByFaves = results;
				next();
			});
		}
	};
	
})();