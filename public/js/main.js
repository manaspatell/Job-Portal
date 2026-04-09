// Simple form validation and utility functions

document.addEventListener('DOMContentLoaded', function() {
  // Form submission validation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const nameField = form.querySelector('input[name="name"]');
      if (nameField && !nameField.value.trim()) {
        e.preventDefault();
        showToast('Full name is required', 'warning');
        nameField.focus();
      }
    });
  });

  // File size validation on client side
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const file = this.files[0];
      if (file && file.size > maxSize) {
        showToast('File size must be less than 5MB', 'error');
        this.value = '';
      }
    });
  }

  // AJAX status update for both applicants table and dashboard
  document.querySelectorAll('form.status-update-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Use dropdown value for status
      const statusSelect = form.querySelector('select[name="status"]');
      const status = statusSelect ? statusSelect.value : '';
      console.log('DEBUG frontend sending status:', status);
      const action = form.getAttribute('action');
      const csrf = form.querySelector('input[name="_csrf"]')?.value || '';
      const row = form.closest('tr');
      fetch(action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrf ? { 'CSRF-Token': csrf } : {})
        },
        body: JSON.stringify({ status })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Successfully updated!', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          showToast(data.error || 'Failed to update status', 'error');
        }
      })
      .catch(() => {
        showToast('Server error. Please try again.', 'error');
      });
    });
  });
});
