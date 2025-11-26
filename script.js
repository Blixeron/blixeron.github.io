const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

const config = {
    particleCount: 140,
    interactionRadius: 140,
    mouseStrength: 1.2,
    friction: 0.94,
    jitter: 0.05,
    baseSpeed: 0.3,
    sizeRange: [1.2, 2.6],
};

const mouse = { x: 0, y: 0, active: false };
const particles = [];
const palette = [
    { hue: 16, saturation: 92, lightness: 60 },
    { hue: 28, saturation: 88, lightness: 64 },
    { hue: 342, saturation: 78, lightness: 66 },
    { hue: 305, saturation: 72, lightness: 63 },
];

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(randomizePosition = false) {
        this.x = randomizePosition ? Math.random() * canvas.clientWidth : canvas.clientWidth / 2;
        this.y = randomizePosition ? Math.random() * canvas.clientHeight : canvas.clientHeight / 2;
        const [min, max] = config.sizeRange;
        this.size = Math.random() * (max - min) + min;
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * config.baseSpeed) + config.baseSpeed * 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        const swatch = palette[Math.floor(Math.random() * palette.length)];
        const hueVariation = (Math.random() - 0.5) * 8;
        const satVariation = (Math.random() - 0.5) * 8;
        const lightVariation = (Math.random() - 0.5) * 6;
        this.hue = swatch.hue + hueVariation;
        this.saturation = Math.min(100, Math.max(65, swatch.saturation + satVariation));
        this.lightness = Math.min(80, Math.max(55, swatch.lightness + lightVariation));
        this.alpha = 0.48 + Math.random() * 0.32;
    }

    update() {
        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.hypot(dx, dy);

            if (distance > 0 && distance < config.interactionRadius) {
                const force = (config.interactionRadius - distance) / config.interactionRadius;
                this.vx += (dx / distance) * force * config.mouseStrength;
                this.vy += (dy / distance) * force * config.mouseStrength;
            }
        }

        this.vx += (Math.random() - 0.5) * config.jitter;
        this.vy += (Math.random() - 0.5) * config.jitter;

        this.vx *= config.friction;
        this.vy *= config.friction;

        this.x += this.vx;
        this.y += this.vy;

        const margin = 40;
        if (this.x < -margin || this.x > canvas.clientWidth + margin || this.y < -margin || this.y > canvas.clientHeight + margin) {
            this.reset(true);
        }
    }

    draw() {
        ctx.beginPath();
        const highlightLightness = Math.min(this.lightness + 10, 85);
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
        ctx.shadowColor = `hsla(${this.hue}, ${this.saturation}%, ${highlightLightness}%, 0.55)`;
        ctx.shadowBlur = 16;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initParticles() {
    particles.length = 0;
    for (let i = 0; i < config.particleCount; i += 1) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
});

window.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) {
        mouse.active = false;
    }
});

initParticles();
animate();
