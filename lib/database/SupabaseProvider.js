const { createClient } = require('@supabase/supabase-js');
const { AuthError } = require('../auth/errors');
const { normalizeEmail } = require('../auth/validation');
const DatabaseProvider = require('./DatabaseProvider');
const { TABLE_NAME, formatTodo } = require('./models/supabaseModels');

class SupabaseProvider extends DatabaseProvider {
  async connect() {
    this.anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    this.adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    console.log('Connected to Supabase');
  }

  async registerUser({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true
    });

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        throw new AuthError('An account with that email already exists.', 409, 'EMAIL_TAKEN');
      }
      throw error;
    }

    return {
      id: data.user.id,
      email: data.user.email
    };
  }

  async authenticateUser({ email, password }) {
    const { data, error } = await this.anonClient.auth.signInWithPassword({
      email: normalizeEmail(email),
      password
    });

    if (error) {
      if (error.status === 400 || error.status === 401) {
        return null;
      }
      throw error;
    }

    return {
      id: data.user.id,
      email: data.user.email
    };
  }

  async getUserById(userId) {
    const { data, error } = await this.adminClient.auth.admin.getUserById(userId);
    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }

    if (!data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email
    };
  }

  async getTodos(userId) {
    const { data, error } = await this.adminClient
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(formatTodo);
  }

  async createTodo(userId, text) {
    const { data, error } = await this.adminClient
      .from(TABLE_NAME)
      .insert([{ user_id: userId, text }])
      .select()
      .single();
    if (error) throw error;
    return formatTodo(data);
  }

  async updateTodo(userId, id, updates) {
    const payload = {};
    if (Object.prototype.hasOwnProperty.call(updates, 'text')) {
      payload.text = updates.text;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
      payload.completed = updates.completed;
    }

    const { data, error } = await this.adminClient
      .from(TABLE_NAME)
      .update(payload)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return formatTodo(data);
  }

  async deleteTodo(userId, id) {
    const { error } = await this.adminClient
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw error;
  }
}

module.exports = SupabaseProvider;
