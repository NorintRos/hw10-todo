const express = require('express');
const router  = express.Router();

// GET / — display all todos
router.get('/', async (req, res) => {
  try {
    const todos = await req.app.locals.db.getTodos();
    res.render('index', { todos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching todos');
  }
});

// POST /todos — create a new todo
router.post('/todos', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.redirect('/');
    await req.app.locals.db.createTodo(text.trim());
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating todo');
  }
});

// POST /todos/:id/complete — toggle completed status
router.post('/todos/:id/complete', async (req, res) => {
  try {
    const { id }        = req.params;
    const { completed } = req.body;
    await req.app.locals.db.updateTodo(id, {
      completed: completed === 'true'
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating todo');
  }
});

// POST /todos/:id/edit — update todo text
router.post('/todos/:id/edit', async (req, res) => {
  try {
    const { id }   = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.redirect('/');
    await req.app.locals.db.updateTodo(id, { text: text.trim() });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error editing todo');
  }
});

// POST /todos/:id/delete — delete a todo
router.post('/todos/:id/delete', async (req, res) => {
  try {
    await req.app.locals.db.deleteTodo(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting todo');
  }
});

module.exports = router;