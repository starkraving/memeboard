var express = require('express');
var router = express.Router();


/**
 *Redirects to Twitter authorization screen
 */
router.get('/login', function(req, res){
	
	res.redirect("/member/auth");
});

/**
 *Fetches authentication token from Twitter and stores
 */
router.get('/auth', function(req, res){
	
	res.redirect("/board/:member");
});

/**
 *Form to change a member's profile information
 */
router.get('/profile', function(req, res){
	res.render("member_profile", {title: " profile"});
});

/**
 *Updates a member's profile
 */
router.post('/profile', function(req, res){
	
	res.redirect("/board/:member");
});

/**
 *Destroys a member's session
 */
router.get('/logout', function(req, res){
	
	res.redirect("/board/public");
});

module.exports = router;