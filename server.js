var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var methodOveride = require("method-override");

var Note = require("./models/note.js");
var Article = require("./models/article.js");

var request = require("request");
var Article = require("cheerio");

mongoose.promise = Promise;

//Initialize Express
var app = express();
var PORT = process.env.port || 3000;

app.use(bodyParser.urlencoded({
     extended: false
}));

app.use(methodOverride('_method'));

app.use(express.static("./public"));

var exphbs = require("express-handlebars");

app.set('views', __dirname + '/views');
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: __dirname + "/views/layout" }));
app.set("view engine", "handlebars");

// Database Configuration

var databaseUri = "mongodb://localhost/nhlscrape";
if (process.env.MONGODB_URI) {
     mongoose.connect(process.env.MONGODB_URI);
} else {
     mongoose.connect(databaseUri);
}
var db = mongoose.connection;

//show mongoose errors

db.on("error", function (error) {
     console.log("Mongoose Error: ", error);
});

db.once("open", function () {
     console.log("Mongoose Connection Succesful.");
});

//ROUTES

app.get("/", function (req, res) {
     Article.find({})
          .exec(function (error, data) {
               if (error) {
                    res.send(error)
               }
               else {
                    var newsObj = {
                         Article: data
                    };
                    res.render("index", newsObj);
               }
          });
});

// A GET Request to scrape the NHL/Oilers Website
app.get("/scrape", function (req, res) {
     //first grab the body of the html
     request("https://www.nhl.com/oilers/", function (error, response, html) {
          //then we load it into Cheerio
          var $ = cheerio.load(html);
          //Now we grab every H2 within the article tag
          $("h4.headline-link").each(function (i, element) {
               //Save an empty result object
               var result = {};
               //add the text and href on every link
               result.title = $(this).text();
               result.link = $(this).parent("a").attr("href");

               //Using Article create a new entry
               var entry = new Article(result);

               //save that entry to the DB
               entry.save(function (err, doc) {
                    if (err) {
                         console.log(err);
                    }
                    else {
                         console.log(doc);
                    }
               });
          });
          res.redirect("/");
          console.log("Successfully Scraped");
     });
});

app.post("/notes/:id", function (req, res) {
     var newNote = new Note(req.body);
     newNote.save(function (error, doc) {
          if (error) {
               console.log(error);
          }
          else {
               console.log("this is the DOC " + doc);
               Article.findOneAndUpdate({
                    "_id": req.params.id
               },
                    { $push: { "note": doc._id } }, { new: true }, function (err, doc) {
                         if (err) {
                              console.log(err);
                         } else {
                              console.log("note saved: " + doc);
                              res.redirect("/notes/" + req.params.id);
                         }
                    });
          }
     });
});

app.get("/notes/:id", function (req, res) {
     console.log("This is the req.params: " + req.params.id);
     Article.find({
          "_id": req.params.id
     }).populate("note")
          .exec(function (error, doc) {
               if (error) {
                    console.log(error);
               }
               else {
                    var notesObj = {
                         Article: doc
                    };
                    console.log(notesObj);
                    res.render("notes", notesObj);
               }
          });
});

app.get("/delete/:id", function (req, res) {
     Note.remove({
          "_id": req.params.id
     }).exec(function (error, doc) {
          if (error) {
               console.log(error);
          }
          else {
               console.log("note deleted");
               res.redirect("/");
          }
     });
});

// Listen on port 3000
app.listen(PORT, function () {
     console.log("App running on PORT" + PORT + "!");
});






