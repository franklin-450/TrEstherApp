// site.js — frontend behavior: form submit, toasts, gratitude wall rendering

(function () {
  // Typewriter effect for the quote
  const q = document.querySelector('.quote-text');
  if (q) {
    const text = q.textContent.trim();
    q.textContent = '';
    let i = 0;
    const speed = 24;
    const t = setInterval(() => {
      q.textContent += text.charAt(i);
      i++;
      if (i >= text.length) clearInterval(t);
    }, speed);
  }

  // Helper: escape HTML
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<"'>\/]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
      })[s];
    });
  }

  // Toast helper
  function showToast(message, variant = 'dark') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const id = 't' + Date.now();
    const html = `
    <div id="${id}" class="toast align-items-center text-bg-${variant} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${escapeHtml(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
    // remove after 6s
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.remove();
    }, 6000);
  }

  // Form submit with fetch (AJAX)
  window.submitMessageForm = async function (e) {
    e.preventDefault();
    const form = document.getElementById('messageForm');
    const name = form.querySelector('#senderName').value.trim();
    const note = form.querySelector('#senderNote').value.trim();

    if (!name || !note) {
      showToast('Please enter your name and a short message', 'danger');
      return false;
    }

    // Build form data
    const fd = new FormData();
    fd.append('Name', name);
    fd.append('Note', note);

    // Acquire antiforgery token if present
    const tokenInput = form.querySelector('input[name="__RequestVerificationToken"]');
    if (tokenInput) fd.append('__RequestVerificationToken', tokenInput.value);

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: fd
      });

      if (!resp.ok) {
        const text = await resp.text();
        showToast('Failed to send message. Try again.', 'danger');
        console.error('Message save failed:', resp.status, text);
        return false;
      }

      const json = await resp.json();
      if (json?.success) {
        showToast('Message submitted. Thank you!', 'dark');
        // close modal
        const modalEl = document.querySelector('#messageModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        setTimeout(() => bsModal.hide(), 600);

        // update wall by fetching latest messages from server (simple approach)
        await renderGratitudeWall();
        form.reset();
        return false;
      } else {
        showToast('Server returned an error. Please try again.', 'danger');
        console.error('Server error', json);
        return false;
      }
    } catch (err) {
      console.error(err);
      showToast('Network error. Check your connection.', 'danger');
      return false;
    }
  };

  // Render Gratitude Wall by fetching messages from /api/messages
  async function renderGratitudeWall() {
    try {
      const resp = await fetch('/api/messages');
      if (!resp.ok) return;
      const messages = await resp.json();
      const slot1 = document.getElementById('wall-slot-1');
      const slot2 = document.getElementById('wall-slot-2');
      if (!slot1 || !slot2) return;
      // keep static Tr. Esther card first; populate next two with recent messages if available
      if (messages.length > 0) {
        slot1.innerHTML = `<strong>${escapeHtml(messages[0].Name)}</strong><div class="small text-muted">${escapeHtml(messages[0].Note)}</div><div class="small text-muted mt-2">${new Date(messages[0].CreatedAt).toLocaleString()}</div>`;
      }
      if (messages.length > 1) {
        slot2.innerHTML = `<strong>${escapeHtml(messages[1].Name)}</strong><div class="small text-muted">${escapeHtml(messages[1].Note)}</div><div class="small text-muted mt-2">${new Date(messages[1].CreatedAt).toLocaleString()}</div>`;
      }
    } catch (err) {
      // fail silently; offline will not break page
      console.warn('Unable to load gratitude wall', err);
    }
  }

  // initial render
  document.addEventListener('DOMContentLoaded', () => {
    renderGratitudeWall();
  });

})();
