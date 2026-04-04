const MongoDBProvider  = require('./MongoDBProvider');
const SupabaseProvider = require('./SupabaseProvider');

function createDatabaseProvider() {
  const type = process.env.DB_TYPE;

  if (type === 'mongodb') {
    return new MongoDBProvider();
  } else if (type === 'supabase') {
    return new SupabaseProvider();
  } else {
    throw new Error(
      `Unknown DB_TYPE: "${type}". Set DB_TYPE to "mongodb" or "supabase" in .env`
    );
  }
}

module.exports = createDatabaseProvider;