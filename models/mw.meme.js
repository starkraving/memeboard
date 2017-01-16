var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

module.exports = (function(){
	var memeModel = mongoose.model('memeItem', new Schema({
		'screen_name': String,
		'image_url': String,
		'image_created': {type: Date, required: true, default: Date.now},
		'image_title': String,
		'image_faves': Number
	}));

	var perPage = 12;

	return {
		byMember: function(scope, propName) {
			return function(req, res, next) {
				var pageN = req.params.p || 1;
				memeModel.find({screen_name: req[scope][propName]})
						.sort({image_created: 1}).skip((pageN - 1) * perPage).limit(perPage)
						.exec(function(err, results) {
							if ( err || !results ) results = [];
							res.memesByMember = results;
							next();
						});
			};
		},
		byFaves: function(req, res, next) {
			var pageN = req.params.p || 1;
			memeModel.find().sort({image_faves: 1})
					.skip((pageN - 1) * perPage).limit(perPage)
					.exec(function(err, results) {
						if ( err || !results ) results = [];
						res.memeByFaves = results;
						next();
					});
		},
		byId: function(scope, propName) {
			return function(req, res, next) {
				memeModel.findOne({_id: req[scope][propName]}).exec(function(err, result) {
					res.memeById = ( err || !result ) ? null : result;
					next();
				});
			}
		},
		insert: function(screen_name, image_url, image_title, callback) {
			if ( !screen_name ) {
				callback();
			} else {
				var meme = new memeModel({
					screen_name: screen_name,
					image_url: image_url,
					image_title: image_title,
					image_faves: 0
				}).save(function(err, doc, rowsaffected) {
					callback();
				});
			}
		},
		delete: function(id, callback) {
			memeModel.findOne({_id: id}).exec(function(err, result) {
				if ( err || !result ) {
					callback();
				} else {
					result.remove(function(err, doc, rowsaffected) {
						callback();
					});
				}
			});
		}
	};
	
})();