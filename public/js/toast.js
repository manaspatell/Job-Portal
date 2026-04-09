// Toast Notification System
// Usage: showToast('Message', 'success|error|warning|info')

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const icon = icons[type] || icons.info;
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="closeToast(this)">×</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('toast-show'), 10);
  
  // Auto remove after duration
  setTimeout(() => {
    closeToast(toast.querySelector('.toast-close'));
  }, duration);
  
  return toast;
}

function closeToast(closeBtn) {
  const toast = closeBtn.parentElement || closeBtn;
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

// Confirmation dialog with toast styling
function showConfirm(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  
  dialog.innerHTML = `
    <div class="confirm-icon">⚠</div>
    <div class="confirm-message">${message}</div>
    <div class="confirm-buttons">
      <button class="confirm-btn confirm-cancel">Cancel</button>
      <button class="confirm-btn confirm-ok">Confirm</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.classList.add('confirm-show');
    dialog.classList.add('confirm-show');
  }, 10);
  
  const closeDialog = () => {
    overlay.classList.remove('confirm-show');
    dialog.classList.remove('confirm-show');
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
    }, 300);
  };
  
  dialog.querySelector('.confirm-ok').onclick = () => {
    closeDialog();
    if (onConfirm) onConfirm();
  };
  
  dialog.querySelector('.confirm-cancel').onclick = () => {
    closeDialog();
    if (onCancel) onCancel();
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeDialog();
      if (onCancel) onCancel();
    }
  };
  
  // ESC key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}
