const TABLE_NAME = 'todos';

// Normalizes a Supabase row to match the shape
// returned by MongoDBProvider for consistent view rendering
function formatTodo(row) {
  return {
    id:        row.id,
    text:      row.text,
    completed: row.completed,
    createdAt: row.created_at
  };
}

module.exports = { TABLE_NAME, formatTodo };