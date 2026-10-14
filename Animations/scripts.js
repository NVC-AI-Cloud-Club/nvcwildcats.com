/* ============================================================
   Wildcats AI & Cloud Club — Vault  |  scripts.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       AOS (Animate On Scroll) initialisation
    ---------------------------------------------------------- */
    AOS.init({ duration: 900, once: true, easing: 'ease-out-cubic' });

    /* ----------------------------------------------------------
       Auto-play / pause videos as they enter / leave the viewport
    ---------------------------------------------------------- */
    const videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            const video = entry.target.querySelector('video');
            if (!video) return;

            if (entry.isIntersecting) {
                video.play().catch(function () {}); // silently ignore autoplay blocks
                entry.target.classList.add('playing');
            } else {
                video.pause();
                entry.target.classList.remove('playing');
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.video-wrapper').forEach(function (wrapper) {
        videoObserver.observe(wrapper);
    });

    /* ----------------------------------------------------------
       Click-outside-modal-content closes the modal
    ---------------------------------------------------------- */
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeModals();
            }
        });
    });

    /* ----------------------------------------------------------
       ESC key closes any open modal
    ---------------------------------------------------------- */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModals();
        }
    });

});

/* ----------------------------------------------------------
   Toggle video play / pause on click
   Called from inline onclick on .video-wrapper elements
---------------------------------------------------------- */
function toggleVideo(wrapper) {
    const video = wrapper.querySelector('video');

    if (video.paused) {
        video.play().catch(function () {});
        wrapper.classList.add('playing');
    } else {
        video.pause();
        wrapper.classList.remove('playing');
    }
}

/* ----------------------------------------------------------
   Modal helpers
   openModal(id) — opens the overlay whose id matches
   closeModals() — closes every open overlay
---------------------------------------------------------- */
function openModal(id) {
    closeModals(); // always close any previously open modal first

    var el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent page scroll behind modal
    }
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(function (m) {
        m.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

/* ----------------------------------------------------------
   Willie chat-bubble click handler
   Replace the alert with your chat widget integration
---------------------------------------------------------- */
function willieClick() {
    // Example: window.open('chat.html', '_blank');
    alert("Hi! I'm Willy — coming soon!");
}