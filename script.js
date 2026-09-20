/* =============================================
   Particle Background
============================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const PARTICLE_COUNT = 80;
const particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x      = Math.random() * canvas.width;
    this.y      = Math.random() * canvas.height;
    this.vx     = (Math.random() - 0.5) * 0.4;
    this.vy     = (Math.random() - 0.5) * 0.4;
    this.radius = Math.random() * 1.5 + 0.5;
    this.alpha  = Math.random() * 0.5 + 0.1;
    this.color  = Math.random() > 0.5 ? '108, 99, 255' : '0, 212, 255';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(108, 99, 255, ${0.1 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* =============================================
   Navbar
============================================= */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* =============================================
   Mobile Menu
============================================= */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

/* =============================================
   Typewriter Role Cycler
============================================= */
const roles = ['AI Solutions', 'ML Models', 'Data Pipelines', 'LLM Apps', 'Intelligent Systems'];
const roleCycler = document.getElementById('role-cycler');
let roleIndex = 0, charIndex = 0, isDeleting = false;

function typeRole() {
  const current = roles[roleIndex];
  roleCycler.textContent = isDeleting
    ? current.substring(0, charIndex - 1)
    : current.substring(0, charIndex + 1);

  isDeleting ? charIndex-- : charIndex++;

  let delay = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === current.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }

  setTimeout(typeRole, delay);
}
typeRole();

/* =============================================
   Scroll Reveal
============================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =============================================
   Counter Animation
============================================= */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  let current  = 0;
  const step   = target / 50;
  const timer  = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 30);
}

const statSection = document.querySelector('.about-stats');
if (statSection) {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      }
    });
  }, { threshold: 0.3 }).observe(statSection);
}

/* =============================================
   Contact Form — EmailJS
============================================= */
const EMAILJS_PUBLIC_KEY  = 'R53W2abFlYLZE7HZu';   // from emailjs.com > Account > API Keys
const EMAILJS_SERVICE_ID  = 'service_fuhpycq';   // from emailjs.com > Email Services
const EMAILJS_TEMPLATE_ID = 'template_9rwy9mk';  // from emailjs.com > Email Templates

emailjs.init(EMAILJS_PUBLIC_KEY);

const form = document.getElementById('contact-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn          = form.querySelector('button[type="submit"]');
  const btnText      = btn.querySelector('.btn-text');
  const originalText = btnText.textContent;

  btn.disabled = true;
  btnText.textContent = 'Sending...';

  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
    .then(() => {
      btnText.textContent  = 'Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #28c840, #00d4ff)';
      form.reset();
      setTimeout(() => {
        btnText.textContent  = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      btnText.textContent = 'Failed — try again';
      btn.style.background = 'linear-gradient(135deg, #ff4d4d, #ff8c00)';
      setTimeout(() => {
        btnText.textContent  = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
});

/* =============================================
   Smooth Scroll
============================================= */
const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
    }
  });
});

/* =============================================
   Active Nav Link
============================================= */
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

/* =============================================
   Staggered Reveal Delays
============================================= */
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

document.querySelectorAll('.timeline-item').forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.12}s`;
});
