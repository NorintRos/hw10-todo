const { createClient }          = require('@supabase/supabase-js');
const DatabaseProvider           = require('./DatabaseProvider');
const { TABLE_NAME, formatTodo } = require('./models/supabaseModels');

class SupabaseProvider extends DatabaseProvider {
  async connect() {
    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    console.log('Connected to Supabase');
  }

  async getTodos() {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(formatTodo);
  }

  async createTodo(text) {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert([{ text }])
      .select()
      .single();
    if (error) throw error;
    return formatTodo(data);
  }

  async updateTodo(id, updates) {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return formatTodo(data);
  }

  async deleteTodo(id) {
    const { error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

module.exports = SupabaseProvider;