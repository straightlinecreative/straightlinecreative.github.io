(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    const closeNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation');
      navMenu.classList.remove('open');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navMenu.classList.toggle('open', !isOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', (event) => {
      if (!navMenu.classList.contains('open')) return;
      if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });
  }

  const videoModal = document.getElementById('video-modal');
  const videoDialog = document.getElementById('video-modal-dialog');
  const videoFrame = document.getElementById('video-frame');
  const videoClose = document.getElementById('video-modal-close');
  let lastVideoTrigger = null;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'iframe',
    'input:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function openVideoModal(trigger) {
    if (!videoModal || !videoDialog || !videoFrame || !videoClose) return;

    const videoId = trigger.dataset.videoId;
    const isShort = trigger.dataset.videoFormat === 'short';
    const videoTitle = trigger.getAttribute('aria-label') || 'Portfolio video';

    lastVideoTrigger = trigger;
    videoDialog.classList.toggle('short-video', isShort);
    videoFrame.title = videoTitle;
    videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    videoClose.focus();
  }

  function closeVideoModal() {
    if (!videoModal || !videoDialog || !videoFrame) return;

    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    videoDialog.classList.remove('short-video');
    videoFrame.src = '';
    document.body.classList.remove('modal-open');

    if (lastVideoTrigger) {
      lastVideoTrigger.focus();
    }
  }

  document.querySelectorAll('.video-thumb').forEach((trigger) => {
    trigger.addEventListener('click', () => openVideoModal(trigger));
  });

  if (videoClose) {
    videoClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (event) => {
      if (event.target === videoModal) closeVideoModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!videoModal || !videoModal.classList.contains('open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeVideoModal();
      return;
    }

    if (event.key !== 'Tab' || !videoDialog) return;

    const focusable = Array.from(videoDialog.querySelectorAll(focusableSelector))
      .filter((element) => !element.hasAttribute('hidden'));

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const postSubmitCta = document.getElementById('post-submit-cta');

  if (contactForm && formStatus && postSubmitCta) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const defaultText = submitButton ? submitButton.textContent : 'Send Message';

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      formStatus.textContent = '';
      formStatus.className = 'form-status';
      postSubmitCta.classList.remove('visible');
      postSubmitCta.setAttribute('aria-hidden', 'true');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Form submission failed with ${response.status}`);
        }

        formStatus.textContent = 'Thanks! Your message has been sent.';
        formStatus.classList.add('success');
        postSubmitCta.classList.add('visible');
        postSubmitCta.setAttribute('aria-hidden', 'false');
        contactForm.reset();
      } catch (error) {
        formStatus.textContent = 'Something went wrong. Please try again or use the scheduling link below.';
        formStatus.classList.add('error');
        postSubmitCta.classList.add('visible');
        postSubmitCta.setAttribute('aria-hidden', 'false');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = defaultText;
        }
      }
    });
  }
})();
