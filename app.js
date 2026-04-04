require('dotenv').config();

const express      = require('express');
const { engine }   = require('express-handlebars');
const todoRoutes   = require('./routes/todos');
const createDatabaseProvider = require('./lib/database/createDatabaseProvider');

const app  = express();
const PORT = process.env.PORT || 3000;

// View engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Body parsing
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', todoRoutes);

// Connect DB first, then start server
async function start() {
  try {
    const db = createDatabaseProvider();
    await db.connect();
    app.locals.db = db;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Using database: ${process.env.DB_TYPE}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();