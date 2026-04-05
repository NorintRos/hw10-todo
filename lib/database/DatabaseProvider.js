class DatabaseProvider {
  async connect() {
    throw new Error('connect() not implemented');
  }

  async registerUser() {
    throw new Error('registerUser() not implemented');
  }

  async authenticateUser() {
    throw new Error('authenticateUser() not implemented');
  }

  async getUserById() {
    throw new Error('getUserById() not implemented');
  }

  async getTodos(userId) {
    throw new Error('getTodos() not implemented');
  }

  async createTodo(userId, text) {
    throw new Error('createTodo() not implemented');
  }

  async updateTodo(userId, id, updates) {
    throw new Error('updateTodo() not implemented');
  }

  async deleteTodo(userId, id) {
    throw new Error('deleteTodo() not implemented');
  }
}

module.exports = DatabaseProvider;
