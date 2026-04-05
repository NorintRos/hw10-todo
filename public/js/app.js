document.addEventListener('DOMContentLoaded', () => {
  // Signal JS is active
  document.body.classList.remove('no-js');
  document.body.classList.add('js-enabled');

  // Toggle: instant visual feedback before form submits
  document.querySelectorAll('.toggle-form').forEach(form => {
    const btn = form.querySelector('.toggle-btn');
    btn.addEventListener('click', () => {
      const item = form.closest('.todo-item');
      const text = item.querySelector('.todo-text');
      text.classList.toggle('completed');
      btn.classList.toggle('is-completed');
      btn.textContent = text.classList.contains('completed') ? '\u25CF' : '\u25CB';
    });
  });

  // Delete: fade-out animation before form submits
  document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = form.closest('.todo-item');
      item.classList.add('fade-out');
      item.addEventListener('animationend', () => form.submit());
    });
  });

  // Edit: toggle inline edit form visibility
  document.querySelectorAll('.edit-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.todo-item');
      item.classList.toggle('editing');
      if (item.classList.contains('editing')) {
        const input = item.querySelector('.edit-form input');
        if (input) input.focus();
      }
    });
  });
});
