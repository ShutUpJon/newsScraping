var mongoose = require("mongoose");

//Create a Schema
var Schema = mongoose.Schema;

//Make LibrarySchema a Schema
var ArticleSchema = new Schema({
     title: {
          type: String,
          unique: true
     },
     link: {
          type: String
     },
     note: [{
          type: Schema.Types.ObjectId,
          ref: "Note"
     }]
});

//Save the model
var Article = mongoose.model("Article", ArticleSchema);

//Export model
module.exports = Article;