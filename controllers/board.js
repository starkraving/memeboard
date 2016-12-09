var express = require('express');
var router = express.Router();


/**
 *Shows a board with the most recent (n) memes
 */
router.get('/public/:p?', function(req, res){
	res.render("board_public_", {title: " public "});
});

/**
 *Shows images posted by a single member, with optional admin controls
 */
router.get('/:member/:p?', function(req, res){
	res.render("board_member_", {title: " :member "});
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