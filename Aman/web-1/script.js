const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.planet-row').forEach(row => {
    observer.observe(row);
});

// Subtle Parallax for the Orbit Line
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    document.querySelector('.stars').style.transform = `translateY(${scroll * 0.1}px)`;
});

