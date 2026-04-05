const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateSignupInput({ email, password, confirmPassword }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { error: 'Email is required.' };
  }

  if (!password) {
    return { error: 'Password is required.' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  return {
    value: {
      email: normalizedEmail,
      password
    }
  };
}

function validateLoginInput({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { error: 'Email is required.' };
  }

  if (!password) {
    return { error: 'Password is required.' };
  }

  return {
    value: {
      email: normalizedEmail,
      password
    }
  };
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateSignupInput,
  validateLoginInput
};
