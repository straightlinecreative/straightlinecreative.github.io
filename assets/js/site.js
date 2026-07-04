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
    const meetingButton = postSubmitCta.querySelector('.btn');
    const defaultText = submitButton ? submitButton.textContent : 'Send Message';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (meetingButton) {
      meetingButton.classList.remove('btn-outline');
      meetingButton.classList.add('btn-primary');
    }

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      let submissionSucceeded = false;

      formStatus.textContent = '';
      formStatus.className = 'form-status';
      postSubmitCta.classList.remove('visible');
      postSubmitCta.setAttribute('aria-hidden', 'true');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        submitButton.removeAttribute('style');
        submitButton.removeAttribute('aria-label');
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

        submissionSucceeded = true;
        formStatus.textContent = 'Message sent successfully.';
        formStatus.className = 'form-status success sr-only';

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Message Sent ✓';
          submitButton.setAttribute('aria-label', 'Message sent successfully');
          Object.assign(submitButton.style, {
            background: 'var(--mint)',
            color: 'var(--black)',
            cursor: 'default',
            opacity: '1',
            transform: 'none'
          });
        }

        postSubmitCta.classList.add('visible');
        postSubmitCta.setAttribute('aria-hidden', 'false');
        contactForm.reset();

        if (!reduceMotion && typeof postSubmitCta.animate === 'function') {
          postSubmitCta.animate([
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], {
            duration: 450,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
          });
        }

        if (!reduceMotion && meetingButton && typeof meetingButton.animate === 'function') {
          meetingButton.animate([
            { boxShadow: '0 0 0 rgba(232, 105, 42, 0)', transform: 'scale(1)' },
            { boxShadow: '0 0 0 10px rgba(232, 105, 42, 0.16)', transform: 'scale(1.025)' },
            { boxShadow: '0 0 0 rgba(232, 105, 42, 0)', transform: 'scale(1)' }
          ], {
            duration: 900,
            delay: 350,
            easing: 'ease-out'
          });
        }
      } catch (error) {
        formStatus.textContent = 'Something went wrong. Please try again or use the scheduling link below.';
        formStatus.classList.add('error');
        postSubmitCta.classList.add('visible');
        postSubmitCta.setAttribute('aria-hidden', 'false');
      } finally {
        if (submitButton && !submissionSucceeded) {
          submitButton.disabled = false;
          submitButton.textContent = defaultText;
          submitButton.removeAttribute('style');
          submitButton.removeAttribute('aria-label');
        }
      }
    });
  }
})();
