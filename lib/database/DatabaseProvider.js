class DatabaseProvider {
  async connect() {
    throw new Error('connect() not implemented');
  }

  async getTodos() {
    throw new Error('getTodos() not implemented');
  }

  async createTodo(text) {
    throw new Error('createTodo() not implemented');
  }

  async updateTodo(id, updates) {
    throw new Error('updateTodo() not implemented');
  }

  async deleteTodo(id) {
    throw new Error('deleteTodo() not implemented');
  }
}

module.exports = DatabaseProvider;