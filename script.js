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
    { hue: 48, saturation: 82, lightness: 84 },
    { hue: 43, saturation: 72, lightness: 89 },
    { hue: 52, saturation: 66, lightness: 92 },
    { hue: 55, saturation: 48, lightness: 94 },
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
window.addEventListener('resize', updateStageOffset);
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
        this.saturation = Math.min(100, Math.max(20, swatch.saturation + satVariation));
        this.lightness = Math.min(98, Math.max(70, swatch.lightness + lightVariation));
        this.alpha = 0.42 + Math.random() * 0.28;
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
        const highlightLightness = Math.min(this.lightness + 6, 100);
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
        ctx.shadowColor = `hsla(${this.hue}, ${this.saturation}%, ${highlightLightness}%, 0.45)`;
        ctx.shadowBlur = 18;
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

const cardStage = document.querySelector('.card-stage');
const card = document.querySelector('.card');
const cardInner = card?.querySelector('.card-inner');
const frontFace = card?.querySelector('.card-front');
const backFace = card?.querySelector('.card-back');
const avatarEl = document.getElementById('profile-avatar');
const readmeContainer = document.getElementById('readme-content');

const githubUsername = 'blixeron';
const readmeUrl = `https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/README.md`;
const avatarUrl = `https://github.com/${githubUsername}.png?size=320`;

if (card && cardStage && cardInner && frontFace && backFace) {
    initializeProfileCard();
}

function initializeProfileCard() {
    card.setAttribute('aria-pressed', 'false');

    card.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a, button')) {
            return;
        }
        toggleCard();
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCard();
        }
    });

    if (avatarEl) {
        avatarEl.src = avatarUrl;
        avatarEl.addEventListener('load', updateStageOffset, { once: true });
        if (avatarEl.complete) {
            updateStageOffset();
        }
    }

    loadGitHubReadme();
    updateStageOffset();
}

function toggleCard() {
    if (!card || !cardInner) {
        return;
    }
    const flipped = card.classList.toggle('is-flipped');
    if (cardStage) {
        cardStage.classList.toggle('is-flipped', flipped);
    }
    updateCardAria(flipped);
    updateStageOffset();
}

function updateCardAria(isFlipped) {
    if (!card || !frontFace || !backFace) {
        return;
    }

    card.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
    frontFace.setAttribute('aria-hidden', isFlipped ? 'true' : 'false');
    backFace.setAttribute('aria-hidden', isFlipped ? 'false' : 'true');
}

function updateStageOffset() {
    if (!cardStage || !card) {
        return;
    }

    cardStage.classList.remove('is-compact');

    const stageWidth = cardStage.clientWidth;
    const cardWidth = card.offsetWidth;
    const cardHeight = cardInner?.offsetHeight || card.offsetHeight;
    const viewportWidth = window.innerWidth;

    if (!avatarEl) {
        cardStage.classList.add('is-compact');
        cardStage.style.setProperty('--card-shift', '0px');
        cardStage.style.setProperty('--avatar-shift', '0px');
        return;
    }

    const computedCardHeight = cardHeight > 0 ? cardHeight : 220;
    const avatarSize = Math.round(Math.max(160, computedCardHeight));

    cardStage.style.setProperty('--avatar-size', `${avatarSize}px`);
    avatarEl.style.width = `${avatarSize}px`;
    avatarEl.style.height = `${avatarSize}px`;

    const sideBySidePossible = viewportWidth > 820 && cardWidth > 0 && stageWidth >= cardWidth + avatarSize + 64;

    if (!sideBySidePossible) {
        avatarEl.style.display = 'none';
        cardStage.classList.add('is-compact');
        cardStage.style.setProperty('--card-shift', '0px');
        cardStage.style.setProperty('--avatar-shift', '0px');
        return;
    }

    avatarEl.style.display = '';

    const cardBoundary = Math.max(0, (stageWidth - cardWidth) / 2);
    const avatarBoundary = Math.max(0, (stageWidth - avatarSize) / 2);
    const minShiftNeeded = (cardWidth + avatarSize) / 4 + 8;
    const maxShift = Math.min(cardBoundary, avatarBoundary);

    if (maxShift <= minShiftNeeded) {
        avatarEl.style.display = 'none';
        cardStage.classList.add('is-compact');
        cardStage.style.setProperty('--card-shift', '0px');
        cardStage.style.setProperty('--avatar-shift', '0px');
        return;
    }

    cardStage.classList.remove('is-compact');

    const desiredGap = Math.min(120, Math.max(48, stageWidth * 0.06));
    const desiredShift = (avatarSize + desiredGap) / 2;
    const shift = Math.max(minShiftNeeded, Math.min(desiredShift, maxShift));

    cardStage.style.setProperty('--card-shift', `${shift}px`);
    cardStage.style.setProperty('--avatar-shift', `${shift}px`);
}

async function loadGitHubReadme() {
    if (!readmeContainer) {
        return;
    }

    try {
        const response = await fetch(readmeUrl, {
            headers: {
                Accept: 'text/plain',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to load README: ${response.status}`);
        }

        const markdown = await response.text();

        if (window.marked && typeof window.marked.parse === 'function') {
            readmeContainer.innerHTML = window.marked.parse(markdown);
        } else {
            readmeContainer.textContent = markdown;
        }

        readmeContainer.querySelectorAll('a').forEach((link) => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        updateStageOffset();
    } catch (error) {
        readmeContainer.innerHTML = '<p>Could not load your GitHub README right now. You can visit <a href="https://github.com/blixeron" target="_blank" rel="noopener noreferrer">github.com/blixeron</a> instead.</p>';
        updateStageOffset();
    }
}
