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
const navContainer = document.querySelector('.sticky-nav .container');
const stickyNav = document.querySelector('.sticky-nav');

// Update scroll hint visibility - hide when scrolled to end
function updateScrollHint() {
  if (!navContainer || !stickyNav) return;
  const isAtEnd = navContainer.scrollLeft + navContainer.clientWidth >= navContainer.scrollWidth - 5;
  stickyNav.style.setProperty('--scroll-hint-opacity', isAtEnd ? '0' : '1');
}

if (navContainer) {
  navContainer.addEventListener('scroll', updateScrollHint);
  window.addEventListener('resize', updateScrollHint);
  // Initial check
  setTimeout(updateScrollHint, 100);
}

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove('active'));
          const activeLink = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (activeLink) {
            activeLink.classList.add('active');
            // Auto-scroll nav to show active link
            if (navContainer) {
              const linkRect = activeLink.getBoundingClientRect();
              const containerRect = navContainer.getBoundingClientRect();

              // Check if link is outside visible area
              if (linkRect.left < containerRect.left + 10 || linkRect.right > containerRect.right - 40) {
                activeLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }
            }
          }
        }
      });
    },
    { rootMargin: '-60px 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}
