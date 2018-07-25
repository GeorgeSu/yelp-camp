var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Homepage Route
router.get("/", function(req, res) {
    res.render("landing");
});

// ==============
// AUTH ROUTES
// ==============

// show register form
router.get("/register", function(req, res) {
    res.render("register");
})
// Sign Up Logic
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/campgrounds");
        })
    })
})

// show login form
router.get("/login", function(req, res) {
    res.render("login");
})

// Login Logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req, res) {
})

// Logout Route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have been logged out.");
    res.redirect("/campgrounds");
})


// Middleware for Checking Login Status
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();	// next() simply continues to callback function and runs it
    }
    res.redirect("/login");	// Redirect somewhere if not logged in
}

module.exports = router;