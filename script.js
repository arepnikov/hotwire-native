// ============================================================
// Copy-to-clipboard buttons
// ============================================================
document.querySelectorAll('pre').forEach((pre) => {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';

  btn.addEventListener('click', () => {
    const code = pre.querySelector('code');
    const text = code ? code.innerText : pre.innerText;

    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      btn.textContent = 'Error';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    });
  });

  pre.appendChild(btn);
});

// ============================================================
// Sticky nav active state via IntersectionObserver
// ============================================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove('active'));
          const activeLink = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (activeLink) activeLink.classList.add('active');
        }
      });
    },
    { rootMargin: '-60px 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}
