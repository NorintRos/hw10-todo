const mongoose         = require('mongoose');
const DatabaseProvider = require('./DatabaseProvider');
const { Todo }         = require('./models/mongoModels');

class MongoDBProvider extends DatabaseProvider {
  async connect() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
  }

  async getTodos() {
    const todos = await Todo.find().sort({ createdAt: -1 });
    return todos.map(t => t.toObject()); // includes virtual 'id'
  }

  async createTodo(text) {
    const todo  = new Todo({ text });
    const saved = await todo.save();
    return saved.toObject();
  }

  async updateTodo(id, updates) {
    const updated = await Todo.findByIdAndUpdate(id, updates, { new: true });
    return updated ? updated.toObject() : null;
  }

  async deleteTodo(id) {
    return await Todo.findByIdAndDelete(id);
  }
}

module.exports = MongoDBProvider;