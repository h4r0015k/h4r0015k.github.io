/* ============================================================
   NIKHIL SAHANI // h4r0015k — CLIENT CONTROLLER
   Modern, Minimalist, Fast, Zero Overhead
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initClipboard();
  initSmoothScroll();
  initKeyboardShortcuts();
});

// --- 1. TOAST SYSTEM ---
let toastTimer = null;
function showToast(message, duration = 2500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// --- 2. CLIPBOARD CONTROLLER ---
function copyText(text, label, btnEl) {
  const onSuccess = () => {
    showToast(`${label || 'TEXT'} COPIED TO CLIPBOARD`);
    if (btnEl) {
      const origText = btnEl.textContent;
      btnEl.textContent = 'COPIED';
      btnEl.classList.add('btn-copied');
      setTimeout(() => {
        btnEl.textContent = origText;
        btnEl.classList.remove('btn-copied');
      }, 1800);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      fallbackCopy(text, onSuccess);
    });
  } else {
    fallbackCopy(text, onSuccess);
  }
}

function fallbackCopy(text, callback) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

function initClipboard() {
  // Global handler for copy events if needed
}

// --- 3. SMOOTH SCROLL ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Update URL hash without jump
        history.pushState(null, null, targetId);
      }
    });
  });
}

// --- 4. KEYBOARD SHORTCUTS ---
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
      return;
    }

    // Press 'c' to copy email directly
    if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) {
      const emailHeroBtn = document.getElementById('copy-email-hero');
      copyText('hire@nikhilsahani.com', 'EMAIL', emailHeroBtn);
    }

    // Press '?' for keyboard help
    if (e.key === '?') {
      showToast('SHORTCUTS // [C] Copy Email • [T] Scroll Top', 3000);
    }

    // Press 't' to scroll to top
    if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
