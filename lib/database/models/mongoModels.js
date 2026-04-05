const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, { timestamps: true });

const todoSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text:      { type: String,  required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date,    default: Date.now }
});

// Maps _id to a plain string 'id' so Handlebars
// uses {{this.id}} the same way for both databases
todoSchema.virtual('id').get(function () {
  return this._id.toString();
});

userSchema.virtual('id').get(function () {
  return this._id.toString();
});

todoSchema.set('toObject', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
const Todo = mongoose.model('Todo', todoSchema);

module.exports = { User, Todo };
