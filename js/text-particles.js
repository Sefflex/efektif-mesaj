/**
 * Canvas Metin Parçacık Sistemi
 * Harfleri geometrik şekillerden oluşan parçacıklara dönüştürür ve animasyonla birleştirir.
 * 
 * @author Rahmi Çınar Sari (Sefflex)
 */

class TextParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = 0;
        this.height = 0;
        this.animationId = null;
        this.startTime = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = 300;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createParticles(text, fontStyle, effectType = 'dust', textSize = 'medium', colorPalette = 'rainbow', customColor1 = '', customColor2 = '') {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = this.width;
        offCanvas.height = this.height;

        let fontFamily = 'Montserrat';
        if (fontStyle === 'cursive') fontFamily = 'Sacramento';
        if (fontStyle === 'neon') fontFamily = 'Orbitron';
        if (fontStyle === 'retro') fontFamily = 'Pacifico';

        let fontSize = 100;
        if (window.innerWidth < 600) {
            fontSize = textSize === 'small' ? 40 : textSize === 'large' ? 80 : 60;
        } else {
            fontSize = textSize === 'small' ? 70 : textSize === 'large' ? 130 : 100;
        }

        offCtx.font = `${fontSize}px ${fontFamily}`;
        offCtx.fillStyle = '#ffffff';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(text, this.width / 2, this.height / 2);

        const imageData = offCtx.getImageData(0, 0, this.width, this.height).data;
        this.particles = [];

        const density = 4;
        let colors;

        if (colorPalette === 'rainbow') {
            colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#8b00ff'];
        } else if (colorPalette === 'single') {
            const singleColor = customColor1 || '#ff0055';
            colors = [singleColor, singleColor, singleColor];
        } else {
            const color1 = customColor1 || '#ff0055';
            const color2 = customColor2 || '#00e5ff';
            colors = [color1, color1, color2, color2];
        }

        const shapePerLetter = ['square', 'circle', 'line', 'star', 'hexagon', 'triangle'];
        const letterPositions = this.getLetterPositions(text, offCtx, fontFamily, fontSize);

        for (let y = 0; y < this.height; y += density) {
            for (let x = 0; x < this.width; x += density) {
                const index = (y * this.width + x) * 4;
                const alpha = imageData[index + 3];

                if (alpha > 128) {
                    const letterIndex = this.findLetterIndex(x, letterPositions);
                    const shapeType = shapePerLetter[letterIndex % shapePerLetter.length];
                    const colorIndex = Math.floor((x / this.width) * colors.length);

                    let startX, startY;

                    // Efekt tipine göre başlangıç pozisyonları
                    if (effectType === 'lines') {
                        // Yanlardan gelme
                        startX = Math.random() < 0.5 ? -100 : this.width + 100;
                        startY = y; // Aynı hizada kalsın
                    } else if (effectType === 'galaxy') {
                        // Merkezden patlama
                        startX = this.width / 2;
                        startY = this.height / 2;
                    } else if (effectType === 'rain') {
                        // Yukarıdan yağmur gibi
                        startX = x; // Aynı hizada
                        startY = -100 - Math.random() * 500; // Yukarıdan rastgele yükseklik
                    } else {
                        // dust (Efektif) - Rastgele dağılım
                        startX = Math.random() * this.width;
                        startY = Math.random() * this.height;
                    }

                    const p = {
                        x: startX,
                        y: startY,
                        targetX: x,
                        targetY: y,
                        size: Math.random() * 3 + 2,
                        color: colors[colorIndex],
                        shape: shapeType,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.1,
                        letterIndex: letterIndex,
                        delay: letterIndex * 0.8
                    };

                    this.particles.push(p);
                }
            }
        }
    }

    getLetterPositions(text, ctx, fontFamily, fontSize) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        const totalWidth = ctx.measureText(text).width;
        const startX = (this.width - totalWidth) / 2;
        const positions = [];
        let currentX = startX;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            positions.push({ startX: currentX, endX: currentX + charWidth });
            currentX += charWidth;
        }
        return positions;
    }

    findLetterIndex(x, letterPositions) {
        for (let i = 0; i < letterPositions.length; i++) {
            if (x >= letterPositions[i].startX && x < letterPositions[i].endX) return i;
        }
        return 0;
    }

    drawShape(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;

        switch (p.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.lineTo(p.size, p.size);
                ctx.lineTo(-p.size, p.size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'square':
                ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
                break;
            case 'line':
                ctx.fillRect(-p.size * 2, -p.size / 2, p.size * 4, p.size);
                break;
            case 'star':
                this.drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
                break;
            case 'hexagon':
                this.drawHexagon(ctx, 0, 0, p.size);
                break;
        }
        ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    animate(onComplete) {
        const ctx = this.ctx;
        const ANIMATION_DURATION = 10000;
        this.startTime = Date.now();

        const loop = () => {
            const elapsed = Date.now() - this.startTime;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            ctx.clearRect(0, 0, this.width, this.height);

            for (let i = 0; i < this.particles.length; i++) {
                let p = this.particles[i];
                const particleStartTime = p.delay || 0;
                const particleProgress = Math.max(0, (elapsed / 1000) - particleStartTime) / ((ANIMATION_DURATION / 1000) - particleStartTime);

                if (particleProgress <= 0) continue;
                const easeProgress = Math.min(1, 1 - Math.pow(1 - particleProgress, 3));
                const speed = 0.015 + (easeProgress * 0.025);

                p.x = p.x + (p.targetX - p.x) * speed;
                p.y = p.y + (p.targetY - p.y) * speed;
                p.rotation += p.rotationSpeed;
                this.drawShape(ctx, p);
            }

            if (progress < 1) {
                this.animationId = requestAnimationFrame(loop);
            } else {
                if (onComplete) onComplete();
            }
        };
        loop();
    }
}
