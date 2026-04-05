const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const DatabaseProvider = require('./DatabaseProvider');
const { AuthError } = require('../auth/errors');
const { normalizeEmail } = require('../auth/validation');
const { User, Todo } = require('./models/mongoModels');

class MongoDBProvider extends DatabaseProvider {
  async connect() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
  }

  async registerUser({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AuthError('An account with that email already exists.', 409, 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash
    });

    return {
      id: user.id,
      email: user.email
    };
  }

  async authenticateUser({ email, password }) {
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email
    };
  }

  async getUserById(userId) {
    if (!mongoose.isValidObjectId(userId)) {
      return null;
    }

    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email
    };
  }

  async getTodos(userId) {
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    return todos.map(t => t.toObject()); // includes virtual 'id'
  }

  async createTodo(userId, text) {
    const todo  = new Todo({ userId, text });
    const saved = await todo.save();
    return saved.toObject();
  }

  async updateTodo(userId, id, updates) {
    const updated = await Todo.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    return updated ? updated.toObject() : null;
  }

  async deleteTodo(userId, id) {
    return await Todo.findOneAndDelete({ _id: id, userId });
  }
}

module.exports = MongoDBProvider;
