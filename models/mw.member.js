var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

module.exports = (function(){
	var memberModel = mongoose.model('memeMember', new Schema({
		'screen_name': String,
		'id': Number,
		'profile_image_url_https': String,
		'firstname': {type: String, default: ''},
		'lastname': {type: String, default: ''},
		'city': {type: String, default: ''},
		'state': {type: String, default: ''},
		'faves': {type: Array, default: []}
	}));

	objReturn = {
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

		byScreenName: function(scope, propName) {
			return function(req, res, next) {
				memberModel.findOne({screen_name: req[scope][propName]}).exec(function(err, result){
					if ( err || !result ) result = false;
					res.memberInfo = result;
					next();
				});
			}
		},

		locals: function(app) {
			return function(req, res, next) {
				app.locals.memberRole = 'public';
				app.locals.memberInfo = {'screen_name':''};
				if ( req.session.role ) {
					app.locals.memberRole = req.session.role;
					app.locals.memberInfo = req.session.memberInfo;
				}
				next();
			};
		},

		update: function(screenName, userData, callback) {
			memberModel.findOne({screen_name: screenName}).exec(function(err, result){
				if ( err || !result ) {
					callback();
				} else {
					for ( var key in userData ) {
						result[key] = userData[key];
					}
					result.save(function(err, doc, rowsaffected){
						callback();
					});
				}
			});
		},

		validateInputs: function(req, res, next) {
			var illegalChars = /[^a-zA-Z0-9 -'\.]/;
			var found = false;
			for ( var field in req.body ) {
				if ( req.body[field].match(illegalChars) ) {
					found = true;
				}
			}
			if ( found ) {
				res.redirect('/board/public');
			} else {
				next();
			}
		}
	};

	objReturn.updateLocals = function(app) {
		return function(req, res, next) {
			req.session.memberInfo.firstname = req.body.firstname;
			req.session.memberInfo.lastname = req.body.lastname;
			req.session.memberInfo.city = req.body.city;
			req.session.memberInfo.state = req.body.state;

			var updateLocals = objReturn.locals(app);
			updateLocals(req, res, next);
		};
	};

	return objReturn;
	
})();