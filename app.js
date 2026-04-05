require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { engine } = require('express-handlebars');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const createDatabaseProvider = require('./lib/database/createDatabaseProvider');

const PORT = process.env.PORT || 3000;

function createApp(db) {
  const app = express();

  // View engine
  app.engine('handlebars', engine());
  app.set('view engine', 'handlebars');
  app.set('views', './views');

  // Static files
  app.use(express.static('public'));

  // Body parsing
  app.use(express.urlencoded({ extended: false }));
  app.use(session({
    secret: process.env.SESSION_SECRET || 'development-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));

  app.locals.db = db;

  app.use(async (req, res, next) => {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.locals.currentUser = null;
      return next();
    }

    try {
      const user = await req.app.locals.db.getUserById(sessionUser.id);
      if (!user) {
        delete req.session.user;
        res.locals.currentUser = null;
      } else {
        req.session.user = user;
        res.locals.currentUser = user;
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  app.use('/', authRoutes);
  app.use('/', todoRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).send('Internal Server Error');
  });

  return app;
}

async function start() {
  try {
    const db = createDatabaseProvider();
    await db.connect();
    const app = createApp(db);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Using database: ${process.env.DB_TYPE}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { createApp, start };
