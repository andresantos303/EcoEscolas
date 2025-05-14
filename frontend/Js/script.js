window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links.mobile');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active'); 
    navLinks.classList.toggle('show'); 
});

  const counters = document.querySelectorAll('.counter');
  const statItems = document.querySelectorAll('.stat-item');
  let triggered = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const speed = 200;
        const increment = target / speed;

        if (count < target) {
          counter.innerText = Math.ceil(count + increment);
          setTimeout(updateCount, 10);
        } else {
          counter.innerText = target.toLocaleString('pt-PT');
        }
      };
      updateCount();
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        statItems.forEach(item => item.classList.add('visible'));
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(document.querySelector('#estatisticas'));