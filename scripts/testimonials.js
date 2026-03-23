/* ==========================================================================
   Testimonials Carousel — Alielenglish
   ========================================================================== */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const track = document.getElementById('testimonialsTrack');
        const prevBtn = document.getElementById('testimonialPrev');
        const nextBtn = document.getElementById('testimonialNext');
        const dotsContainer = document.getElementById('carouselDots');

        if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

        const cards = track.querySelectorAll('.testimonial-card');
        if (cards.length === 0) return;

        let currentIndex = 0;
        let cardsPerView = getCardsPerView();
        let totalPages = Math.ceil(cards.length / cardsPerView);
        let autoplayInterval = null;

        // Build dots
        function buildDots() {
            dotsContainer.innerHTML = '';
            totalPages = Math.ceil(cards.length / cardsPerView);
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('aria-label', 'Rəy səhifə ' + (i + 1));
                dot.addEventListener('click', function () {
                    goTo(i);
                });
                dotsContainer.appendChild(dot);
            }
        }

        function getCardsPerView() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 769) return 2;
            return 1;
        }

        function goTo(index) {
            cardsPerView = getCardsPerView();
            totalPages = Math.ceil(cards.length / cardsPerView);
            if (index < 0) index = totalPages - 1;
            if (index >= totalPages) index = 0;
            currentIndex = index;

            const offset = -(currentIndex * (100 / cardsPerView) * cardsPerView);
            track.style.transform = 'translateX(' + offset + '%)';

            // Update dots
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach(function (d, i) {
                d.classList.toggle('active', i === currentIndex);
            });
        }

        function next() {
            goTo(currentIndex + 1);
        }

        function prev() {
            goTo(currentIndex - 1);
        }

        // Event listeners
        prevBtn.addEventListener('click', function () {
            prev();
            resetAutoplay();
        });
        nextBtn.addEventListener('click', function () {
            next();
            resetAutoplay();
        });

        // Autoplay
        function startAutoplay() {
            autoplayInterval = setInterval(next, 5000);
        }

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }

        // Touch / Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) next();
                else prev();
                resetAutoplay();
            }
        }, { passive: true });

        // Resize handler
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var newPerView = getCardsPerView();
                if (newPerView !== cardsPerView) {
                    cardsPerView = newPerView;
                    buildDots();
                    goTo(0);
                }
            }, 200);
        });

        // Pause autoplay on hover
        var carousel = document.getElementById('testimonialsCarousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', function () {
                clearInterval(autoplayInterval);
            });
            carousel.addEventListener('mouseleave', function () {
                startAutoplay();
            });
        }

        // Initialize
        buildDots();
        goTo(0);
        startAutoplay();
    });
})();
