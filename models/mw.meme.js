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

	var getPropFromScope = function(scope, propName) {
		var propNames = propName.split('.');
		if ( propNames.length === 1 ) {
			return ( propName.length > 0 ) ? scope[propName] : scope;
		} else {
			newPropName = propNames.shift();
			return getPropFromScope(scope[newPropName], propNames.join('.'));
		}

	}

	var perPage = 12;

	return {
		byMember: function(scope, propName) {
			return function(req, res, next) {
				var pageN = req.params.p || 1;
				memeModel.find({screen_name: getPropFromScope(req[scope], propName)})
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
			memeModel.find().sort({image_faves: -1})
					.skip((pageN - 1) * perPage).limit(perPage)
					.exec(function(err, results) {
						if ( err || !results ) results = [];
						res.memesByFaves = results;
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
		},
		addToFaves: function(id, memberInfo, callback) {
			memeModel.findOne({_id: id}).exec(function(err, result){
				if ( err || !result ) {
					callback();
				} else {
					result.image_faves++;
					result.save(function(err, doc, rowsaffected){
						if ( err ) {
							callback();
						} else {
							memberInfo.faves.push(id);
							memberInfo.save(function(err, doc, rowsaffected){
								callback();
							});
						}
					});
				}
			});
		},
		addToMember: function(imageData, screenName, callback) {
			memeModel.findOne({screen_name: screenName, image_url: imageData.image_url}).exec(function(err, result){
				if ( err || !screenName || result ) {
					callback();
				} else {
					var meme = new memeModel({
						screen_name: screenName,
						image_url: imageData.image_url,
						image_title: imageData.image_title,
						image_faves: 0
					}).save(function(err, doc, rowsaffected){
						callback();
					});
				}
			});
		},
	};
	
})();