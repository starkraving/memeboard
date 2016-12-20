var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

module.exports = (function(){
	var memberModel = mongoose.model('memeMember', new Schema({
		'screen_name': String,
		'id': Number,
		'profile_image_url_https': String,
		''
	}));

	return {
		findOrCreate: function(userData, callback) {
			memberModel.findOne({screen_name: userData.screen_name, id: userData.id}).exec(function(err, result){
				if ( err ) return;
				if ( !result ) {
					var member = new memberModel(userData).save(function(err, doc, rowsaffected){
						return callback(doc);
					});
				} else {
					return callback(result);
				}
			});
		},

		getByScreenName: function(scope, propName) {
			return function(req, res, next) {
				memberModel.findOne({screen_name: req[scope][propName]}).exec(function(err, result){
					if ( err || !result ) result = {};
					res.memberInfo = result;
					next();
				});
			}
		}
	}
	
})();