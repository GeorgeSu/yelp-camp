var express =	require("express"), // import Express package
    app =		express(), // store Express package in app Object
    bodyParser =	require("body-parser"), // BodyParser package for receiving user post form info
    request =		require("request"), // Request package for making HTTP requests for API calls
    mongoose =	require("mongoose"), // Mongoose package for interacting with MongoDB
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    expressSession = require("express-session"),
    flash = require("connect-flash"),
    Campground = require("./models/campground"),
    Comment =   require("./models/comment"),
    User = require("./models/user"),
    seedDB  =   require("./seeds.js");

// Require Routes
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

// Connect and Seed DB, Setup Boilerplate/Public Directory/View Engine
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true})); // Boilerplate for using BodyParser
app.use(express.static(__dirname + "/public")); // tells view files to use “public” folder as root node for linking to other files (such as stylesheets)
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();   // Seed Database

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
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp Server Running!");
});