var express     = require('express');
var router      = express.Router();
var member      = require('../models/mw.member.js');
var meme        = require('../models/mw.meme.js');

/**
 *Shows a board with the most recent (n) memes
 */
router.get('/public/:p?', function(req, res){
	res.render("board_public_", {title: " public "});
});

/**
 *Shows images posted by a single member, with optional admin controls
 */
router.get('/:member/:p?', member.byScreenName('params', 'member'), meme.byMember('params', 'member'), function(req, res){
	var props = {
		memberInfo: res.memberInfo,
		memesByMember: res.memesByMember,
		title: req.params.member.charAt(0).toUpperCase()
					+req.params.member.slice(1)
					+"'s Board"
	}
	if ( false === res.memberInfo ) {
		res.render("board_member_notfound", props);
	} else if ( req.session.memberInfo && req.session.memberInfo.screen_name == res.memberInfo.screen_name ) {
		res.render("board_member_owner", props);
	} else {
		res.render("board_member_browsing", props);
	}
});

/**
 *Form to post new image to a member's board
 */
router.get('/image/new', function(req, res){
	res.render("board_image_new", {title: " image new"});
});

/**
 *Inserts a new image into a user's board
 */
router.post('/image/new', function(req, res){
	
	res.redirect("/board/:member");
});

/**
 *Removes an image from a member's board
 */
router.post('/image/:id/delete', function(req, res){
	
	res.redirect("/board/:member");
});

/**
 *Adds or subtracts a vote from an image
 */
router.post('/image/:id/vote/:direction', function(req, res){
	
	res.redirect("/board/:member");
});

/**
 *Adds a copy of the image to the member's board
 */
router.post('/image/:id/grab', function(req, res){
	
	res.redirect("/board/:member");
});

module.exports = router;