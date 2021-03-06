var express     = require('express');
var app			= express();
var router      = express.Router();
var request     = require('request');
var qs          = require('querystring');
var auth        = require('../auth.js');
var member      = require('../models/mw.member.js');


/**
 *Redirects to Twitter authorization screen
 */
router.get('/login', function(req, res){
	request.post({
		url: 'https://api.twitter.com/oauth/request_token',
		oauth: {
			callback: process.env.TWITTER_API_CALLBACK,
			consumer_key: process.env.TWITTER_API_KEY,
			consumer_secret: process.env.TWITTER_API_SECRET
		}
	},
	function(err, resp, body){
		var respData = qs.parse(body);
		res.redirect('https://api.twitter.com/oauth/authenticate?'+qs.stringify({
			oauth_token: respData.oauth_token
		}));
	});
});

/**
 *Fetches authentication token from Twitter and stores
 */
router.get('/auth', function(req, res){
	request.post({
		url: 'https://api.twitter.com/oauth/access_token',
		oauth: {
			consumer_key: process.env.TWITTER_API_KEY,
			consumer_secret: process.env.TWITTER_API_SECRET,
			token: req.query.oauth_token,
			verifier: req.query.oauth_verifier
		}
	},
	function(err, resp, body){
		var respData = qs.parse(body);
		request.get({
			url: 'https://api.twitter.com/1.1/users/show.json',
			oauth: {
				consumer_key: process.env.TWITTER_API_KEY,
				consumer_secret: process.env.TWITTER_API_SECRET,
				token: respData.oauth_token,
				token_secret: respData.oauth_token_secret
			},
			qs: {
				screen_name: respData.screen_name,
				user_id: respData.user_id
			},
			json: true
		}, function(err, resp, user){
			member.findOrCreate(user, function(user){
				app.locals.memberRole = req.session.role = 'member';
				app.locals.memberInfo = req.session.memberInfo = user;
				res.redirect("/board/"+user.screen_name);
			});
		});
	});
});

/**
 *Form to change a member's profile information
 */
router.get('/profile', auth.requires('member'), function(req, res){
	res.render("member_profile", {title: "Member Profile"});
});

/**
 *Updates a member's profile
 */
router.post('/profile', auth.requires('member'), member.validateInputs, member.updateLocals(app), function(req, res){
	member.update(req.session.memberInfo.screen_name, {
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		city: req.body.city,
		state: req.body.state
	}, function(){
		res.redirect("/board/"+req.session.memberInfo.screen_name);
	});
});

/**
 *Destroys a member's session
 */
router.get('/logout', function(req, res){
	app.locals.memberRole = 'public';
	app.locals.memberInfo = {'screen_name': ''};
	req.session.destroy();
	res.redirect("/board/public");
});

module.exports = router;