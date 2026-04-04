const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text:      { type: String,  required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date,    default: Date.now }
});

// Maps _id to a plain string 'id' so Handlebars
// uses {{this.id}} the same way for both databases
todoSchema.virtual('id').get(function () {
  return this._id.toString();
});

todoSchema.set('toObject', { virtuals: true });

const Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo };