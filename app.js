var express =	require("express"), // import Express package
    app =		express(), // store Express package in app Object
    bodyParser =	require("body-parser"), // BodyParser package for receiving user post form info
    request =		require("request"), // Request package for making HTTP requests for API calls
    mongoose =	require("mongoose"), // Mongoose package for interacting with MongoDB
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    expressSession = require("express-session"),
    Campground = require("./models/campground"),
    Comment =   require("./models/comment"),
    User = require("./models/user"),
    seedDB  =   require("./seeds.js");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true})); // Boilerplate for using BodyParser
app.use(express.static(__dirname + "/public")); // tells view files to use “public” folder as root node for linking to other files (such as stylesheets)
app.set("view engine", "ejs");
seedDB();   // Seed Database

// PASSPORT CONFIGURATION
app.use(expressSession({
    secret: "I am a filthy Techies picker in Dota 2 and I deserve low prio.",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   next();
});

// Homepage Route
app.get("/", function(req, res) {
    res.render("landing");
});

// =================
// CAMPGROUNDS ROUTES
// =================

// Index Route for Campgrounds
app.get("/campgrounds", function(req, res) {
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    })
    // res.render("campgrounds", {campgrounds: campgrounds});
});

// New Route for Campgrounds
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new");
});

// Show Route for Specific Campground
app.get("/campgrounds/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, campgroundFound) {
        if (err) {
            console.log(err);
        } else {
            console.log(campgroundFound);
            res.render("campgrounds/show", {campground: campgroundFound});
        }
    });
});

// Create Route for Campgrounds
app.post("/campgrounds", function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name, image: image, description: description};
    // Create new campground and store it
    console.log("here");
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log("Error Here");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

// ================
// COMMENTS ROUTES
// ================

// New Route for Comments
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    })
})

// Create Route for Comments
app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    // redirect to campground show page
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    })
})

// ==============
// AUTH ROUTES
// ==============

// show register form
app.get("/register", function(req, res) {
    res.render("register");
})
// Sign Up Logic
app.post("/register", function(req, res) {
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

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp Server Running!");
});

// show login form
app.get("/login", function(req, res) {
    res.render("login");
})

// Login Logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req, res) {
})

// Logout Route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
})

// LoggedIn Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}