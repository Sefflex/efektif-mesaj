/**
 * Arka Plan Efektleri Kütüphanesi
 * Havai fişek, kalpler ve uzay efektlerini içerir.
 * 
 * @author Rahmi Çınar Sari (Sefflex)
 */

const backgrounds = {
    ctx: null,
    canvas: null,
    width: 0,
    height: 0,
    animationId: null,
    heartsContainer: null,

    init(canvasId, heartsId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.heartsContainer = document.getElementById(heartsId);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    clear() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.ctx) this.ctx.clearRect(0, 0, this.width, this.height);

        // Clear hearts
        if (this.heartsContainer) {
            this.heartsContainer.style.display = 'none';
            this.heartsContainer.innerHTML = '';
            if (this.heartsContainer.dataset.interval) {
                clearInterval(this.heartsContainer.dataset.interval);
            }
        }
    },

    // --- EFFECTS ---

    simple() {
        this.clear();
        this.space(true); // Reuse space but simpler
    },

    fireworks() {
        this.clear();
        let particles = [];
        const ctx = this.ctx;
        const width = this.width;
        const height = this.height;

        function createFirework() {
            const x = Math.random() * width;
            const y = Math.random() * (height / 2);
            const colors = ['#ff0055', '#00e5ff', '#ffff00', '#00ff00', '#ff00ff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 40; i++) {
                particles.push({
                    x, y, color,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    alpha: 1,
                    decay: Math.random() * 0.02 + 0.01
                });
            }
        }

        const loop = () => {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';

            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // Gravity
                p.alpha -= p.decay;

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();

                if (p.alpha <= 0) particles.splice(i, 1);
            }

            if (Math.random() < 0.05) createFirework();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    },

    space(simple = false) {
        this.clear();
        const stars = [];
        const count = simple ? 50 : 200;
        const ctx = this.ctx;
        const width = this.width;
        const height = this.height;

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1
            });
        }

        const loop = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#ffffff';

            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > height) star.y = 0;

                ctx.globalAlpha = Math.random() * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    },

    hearts() {
        this.clear();
        if (!this.heartsContainer) return;
        this.heartsContainer.style.display = 'block';

        const createHeart = () => {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = '❤';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = Math.random() * 3 + 2 + 's';
            heart.style.opacity = Math.random();
            heart.style.fontSize = Math.random() * 20 + 10 + 'px';

            this.heartsContainer.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 5000);
        };

        const interval = setInterval(createHeart, 300);
        this.heartsContainer.dataset.interval = interval;
    }
};
