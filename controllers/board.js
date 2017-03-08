var express     = require('express');
var router      = express.Router();
var member      = require('../models/mw.member.js');
var meme        = require('../models/mw.meme.js');
var auth        = require('../auth.js');

/**
 *Shows a board with the most recent (n) memes
 */
router.get('/public/:p?', meme.byFaves, function(req, res){
	res.render("board_public_", {
		title: "Most Popular Memes",
		memesByFaves: res.memesByFaves
	});
});

/**
 *Form to post new image to a member's board
 */
router.get('/image/new', auth.requires('member'), function(req, res){
	res.render("board_image_new", {title: "Post New Meme"});
});

/**
 *Inserts a new image into a user's board
 */
router.post('/image/new', auth.requires('member'), function(req, res){
	meme.insert(
		req.session.memberInfo.screen_name,
		req.body.image_url,
		req.body.image_title,
		function() {
			res.redirect("/board/"+req.session.memberInfo.screen_name);
		}
	);
});

/**
 *Removes an image from a member's board
 */
router.post('/image/:id/delete', auth.requires('member'), meme.byId('params', 'id'), function(req, res){
	if ( res.memeById.screen_name == req.session.memberInfo.screen_name ) {
		meme.delete(req.params.id, function() {
			res.redirect("/board/"+req.session.memberInfo.screen_name);
		});
	}
});

/**
 *Adds a vote to an image
 */
router.post('/:member/image/:id/fave', auth.requires('member'), meme.byId('params', 'id'), function(req, res){
	if ( req.session.memberInfo.faves.indexOf(req.params.id) === -1 ) {
		meme.addToFaves(req.params.id, res.memberInfo, function(){
			res.redirect("/board/"+req.params.member);
		});
	} else {
		res.redirect("/board/"+req.params.member);
	}
});

/**
 *Adds a copy of the image to the member's board
 */
router.post('/:member/image/:id/grab', auth.requires('member'), meme.byId('params', 'id'), function(req, res){
	meme.addToMember(res.memeById, req.session.memberInfo.screen_name, function(){
		res.redirect("/board/"+req.params.member);
	});
});

/**
 *Shows images posted by a single member, with optional admin controls
 */
router.get('/:member/:p?', member.byScreenName('params', 'member'), meme.byMember('params', 'member'), function(req, res){
	var props = {
		memberInfo: req.session.memberInfo,
		memberData: res.memberInfo,
		memberMemes: res.memesByMember,
		title: req.params.member.charAt(0).toUpperCase()
					+req.params.member.slice(1)
					+"'s Board"
	}
	if ( false === res.memberInfo ) {
		res.render("board_member_notfound", props);
	} else if ( req.session.memberInfo && req.session.memberInfo.screen_name == res.memberInfo.screen_name ) {
		res.render("board_member_owner", props);
	} else if ( req.session.memberInfo ) {
		res.render("board_member_browsing", props);
	} else {
		res.render("board_member_public", props);
	}
});

module.exports = router;