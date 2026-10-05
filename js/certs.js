/* Certifications in the landing footer: ISO/IEC 27001 and B Corp, as quiet outlined pills
   under the C-MORE blurb. The footer is drawn by the design system after load, so this
   waits for it and adds the row once. These are text badges, not the certifiers' marks. */
(() => {
  const css = `
.cert-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
.cert { display: inline-flex; align-items: center; gap: 0.5rem; height: 2.25rem; padding: 0 0.875rem 0 0.625rem; border-radius: 9999px;
  border: 1px solid rgba(250, 250, 250, .22); color: #fafafa; font-size: 0.8125rem; font-weight: 500; letter-spacing: 0.01em; white-space: nowrap; }
.cert svg { flex: none; width: 1.125rem; height: 1.125rem; color: #f46d4f; }
.cert small { font-size: inherit; font-weight: 400; color: #909db6; }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>';
  const B = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h3.25a2.1 2.1 0 0 1 0 4.2H9.5zm0 4.2h3.75a2.4 2.4 0 0 1 0 4.8H9.5zM9.5 7.5v9"/></svg>';
  const add = () => {
    const col = document.querySelector('footer .container-site > div:first-child > div:first-child');
    if (!col || col.querySelector('.cert-row')) return;
    const row = document.createElement('div');
    row.className = 'cert-row';
    row.setAttribute('aria-label', 'Certifications');
    row.innerHTML = `<span class="cert">${SHIELD}ISO/IEC 27001 <small>Certified</small></span><span class="cert">${B}Certified <small>B Corporation</small></span>`;
    col.appendChild(row);
  };
  add();
  new MutationObserver(add).observe(document.documentElement, { childList: true, subtree: true });
})();
