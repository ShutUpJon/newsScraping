var mongoose = require("mongoose");

//create schema with mongoose
var Schema = mongoose.Schema;

//make Note Schema
var NoteSchema = new Schema({
     note: {
          type: String
     }
});

var Note = mongoose.model("Note", NoteSchema);

//Export the model
module.exports = Note;

