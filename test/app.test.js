const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createApp } = require('../app');

function createStubDb() {
  return {
    users: new Map(),
    todosByUser: new Map(),
    nextTodoId: 1,

    async getUserById(id) {
      const user = this.users.get(id);
      return user ? { id: user.id, email: user.email } : null;
    },

    async registerUser({ email, password }) {
      const duplicate = [...this.users.values()].some(user => user.email === email);
      if (duplicate) {
        const error = new Error('An account with that email already exists.');
        error.name = 'AuthError';
        error.statusCode = 409;
        throw error;
      }

      const user = {
        id: `user-${this.users.size + 1}`,
        email,
        password
      };
      this.users.set(user.id, user);
      this.todosByUser.set(user.id, []);
      return { id: user.id, email: user.email };
    },

    async authenticateUser({ email, password }) {
      const user = [...this.users.values()].find(candidate => (
        candidate.email === email && candidate.password === password
      ));

      return user ? { id: user.id, email: user.email } : null;
    },

    async getTodos(userId) {
      return this.todosByUser.get(userId) || [];
    },

    async createTodo(userId, text) {
      const todo = {
        id: `todo-${this.nextTodoId++}`,
        userId,
        text,
        completed: false
      };
      const todos = this.todosByUser.get(userId) || [];
      todos.unshift(todo);
      this.todosByUser.set(userId, todos);
      return todo;
    },

    async updateTodo(userId, todoId, updates) {
      const todos = this.todosByUser.get(userId) || [];
      const todo = todos.find(item => item.id === todoId);
      if (!todo) {
        return null;
      }

      Object.assign(todo, updates);
      return todo;
    },

    async deleteTodo(userId, todoId) {
      const todos = this.todosByUser.get(userId) || [];
      this.todosByUser.set(userId, todos.filter(todo => todo.id !== todoId));
    }
  };
}

test('unauthenticated homepage redirects to login', async () => {
  const response = await request(createApp(createStubDb())).get('/');
  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login');
});

test('signup creates a session and redirects to homepage', async () => {
  const db = createStubDb();
  const agent = request.agent(createApp(db));

  const signupResponse = await agent.post('/signup').type('form').send({
    email: 'user@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  });

  assert.equal(signupResponse.status, 302);
  assert.equal(signupResponse.headers.location, '/');

  const homeResponse = await agent.get('/');
  assert.equal(homeResponse.status, 200);
  assert.match(homeResponse.text, /Signed in as user@example.com/);
});

test('login fails with invalid credentials', async () => {
  const db = createStubDb();
  await db.registerUser({
    email: 'user@example.com',
    password: 'password123'
  });

  const response = await request(createApp(db)).post('/login').type('form').send({
    email: 'user@example.com',
    password: 'wrong-password'
  });

  assert.equal(response.status, 401);
  assert.match(response.text, /Invalid email or password/);
});

test('authenticated users are redirected away from login and signup', async () => {
  const db = createStubDb();
  const agent = request.agent(createApp(db));

  await agent.post('/signup').type('form').send({
    email: 'user@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const loginPage = await agent.get('/login');
  const signupPage = await agent.get('/signup');

  assert.equal(loginPage.status, 302);
  assert.equal(loginPage.headers.location, '/');
  assert.equal(signupPage.status, 302);
  assert.equal(signupPage.headers.location, '/');
});

test('logout clears the session', async () => {
  const db = createStubDb();
  const agent = request.agent(createApp(db));

  await agent.post('/signup').type('form').send({
    email: 'user@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const logoutResponse = await agent.post('/logout');
  assert.equal(logoutResponse.status, 302);
  assert.equal(logoutResponse.headers.location, '/login');

  const homeResponse = await agent.get('/');
  assert.equal(homeResponse.status, 302);
  assert.equal(homeResponse.headers.location, '/login');
});

test('todo operations are scoped to the authenticated user', async () => {
  const db = createStubDb();
  const userOne = await db.registerUser({
    email: 'one@example.com',
    password: 'password123'
  });
  const userTwo = await db.registerUser({
    email: 'two@example.com',
    password: 'password123'
  });
  await db.createTodo(userTwo.id, 'User two todo');

  const agent = request.agent(createApp(db));
  await agent.post('/login').type('form').send({
    email: userOne.email,
    password: 'password123'
  });

  await agent.post('/todos').type('form').send({ text: 'User one todo' });

  const homeResponse = await agent.get('/');
  assert.equal(homeResponse.status, 200);
  assert.match(homeResponse.text, /User one todo/);
  assert.doesNotMatch(homeResponse.text, /User two todo/);
});
