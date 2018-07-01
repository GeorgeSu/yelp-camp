var express =	require("express"), // import Express package
    app =		express(), // store Express package in app Object
    bodyParser =	require("body-parser"), // BodyParser package for receiving user post form info
    request =		require("request"), // Request package for making HTTP requests for API calls
    mongoose =	require("mongoose"); // Mongoose package for interacting with MongoDB

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true})); // Boilerplate for using BodyParser
app.use(express.static("public")); // tells view files to use “public” folder as root node for linking to other files (such as stylesheets)
app.set("view engine", "ejs");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});
var Campground = mongoose.model("Campground", campgroundSchema);

// Create a Seed
// Campground.create(
//     {
//         name: "Yosemite",
//         image: "https://pixabay.com/get/e830b80f28f5023ed1584d05fb1d4e97e07ee3d21cac104496f0c37aa7e8bdb0_340.jpg",
//         description: "Best hiking spots in California."
//     }, function(err, createdCampground) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(createdCampground);
//         }
//     });

// Homepage Route
app.get("/", function(req, res) {
    res.render("landing");
});

// Index Route for Campgrounds
app.get("/campgrounds", function(req, res) {
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {campgrounds: allCampgrounds});
        }
    })
    // res.render("campgrounds", {campgrounds: campgrounds});
});

// New Route for Campgrounds
app.get("/campgrounds/new", function(req, res) {
    res.render("new");
});

// Show Route for Specific Campground
app.get("/campgrounds/:id", function(req, res) {
    Campground.findById(req.params.id, function(err, campgroundFound) {
        if (err) {
            console.log(err);
        } else {
            console.log(campgroundFound);
            res.render("show", {campground: campgroundFound});
        }
    });
});

// Post Route for Campgrounds
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

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp Server Running!");
});