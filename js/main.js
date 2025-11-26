/**
 * Efektif Mesaj - Kişiselleştirilebilir Sürpriz Mesaj Uygulaması
 * 
 * @author Rahmi Çınar Sari (Sefflex)
 * @github https://github.com/Sefflex
 * 
 * Bu proje, sevdiklerinize özel, animasyonlu mesajlar göndermenizi sağlar.
 * URL parametreleri üzerinden çalışır, veritabanı gerektirmez.
 */

const state = { lang: 'tr', params: {} };

// Dil çevirileri - İleride eklenebilir
const translations = {
    tr: { toast: "Link Kopyalandı! Şimdi gönder.", defaultMsg: "Sen harikasın!" },
    en: { toast: "Link Copied! Send it now.", defaultMsg: "You are amazing!" }
};

const els = {
    inputScreen: document.getElementById('input-screen'),
    displayScreen: document.getElementById('display-screen'),
    displayName: document.getElementById('display-name'),
    textCanvas: document.getElementById('text-canvas'),
    displayMessage: document.getElementById('display-message'),
    toast: document.getElementById('toast'),
    langBtn: document.getElementById('lang-btn'),
    inpName: document.getElementById('inp-name'),
    inpMessage: document.getElementById('inp-message'),
    createBtn: document.getElementById('create-btn'),
    optFont: document.getElementById('opt-font'),
    optSize: document.getElementById('opt-size'),
    optColor: document.getElementById('opt-color'),
    optAnim: document.getElementById('opt-anim'),
    optBg: document.getElementById('opt-bg'),
    colorPickers: document.getElementById('color-pickers'),
    singleColorPicker: document.getElementById('single-color-picker'),
    gradientColorPicker: document.getElementById('gradient-color-picker'),
    color1: document.getElementById('color1'),
    gradientColor1: document.getElementById('gradient-color1'),
    gradientColor2: document.getElementById('gradient-color2')
};

function setupSelection(parent) {
    if (!parent) return;
    const btns = parent.querySelectorAll('.option-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

setupSelection(els.optFont);
setupSelection(els.optSize);
setupSelection(els.optColor);
setupSelection(els.optAnim);
setupSelection(els.optBg);

// Renk paleti değiştiğinde picker'ları göster/gizle
els.optColor.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
        const colorType = e.target.dataset.val;
        els.colorPickers.style.display = 'none';
        els.singleColorPicker.style.display = 'none';
        els.gradientColorPicker.style.display = 'none';

        if (colorType === 'single') {
            els.colorPickers.style.display = 'block';
            els.singleColorPicker.style.display = 'block';
        } else if (colorType === 'gradient') {
            els.colorPickers.style.display = 'block';
            els.gradientColorPicker.style.display = 'block';
        }
    }
});

function getSelectedValue(parent) {
    if (!parent) return 'default';
    const active = parent.querySelector('.active');
    return active ? active.dataset.val : 'default';
}

els.langBtn.addEventListener('click', () => {
    state.lang = state.lang === 'tr' ? 'en' : 'tr';
    els.langBtn.textContent = state.lang === 'tr' ? 'EN' : 'TR';
});

function init() {
    backgrounds.init('bg-canvas', 'hearts-container');
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('n')) {
        state.mode = 'display';
        state.params = {
            name: urlParams.get('n'),
            message: urlParams.get('m'),
            font: urlParams.get('f') || 'cursive',
            size: urlParams.get('s') || 'medium',
            color: urlParams.get('c') || 'rainbow',
            customColor1: urlParams.get('c1') || '',
            customColor2: urlParams.get('c2') || '',
            anim: urlParams.get('a') || 'dust',
            bg: urlParams.get('b') || 'fireworks'
        };
        renderDisplay();
    } else {
        state.mode = 'input';
        els.inputScreen.style.display = 'block';
        backgrounds.space(true);
    }
}

function renderDisplay() {
    els.inputScreen.style.display = 'none';
    els.displayScreen.style.display = 'block';

    if (backgrounds[state.params.bg]) {
        backgrounds[state.params.bg]();
    } else {
        backgrounds.simple();
    }

    const canvasEffects = ['dust', 'lines', 'galaxy', 'rain'];

    if (canvasEffects.includes(state.params.anim)) {
        els.displayName.style.display = 'none';
        els.textCanvas.style.display = 'block';

        const textSystem = new TextParticleSystem('text-canvas');
        textSystem.createParticles(
            state.params.name,
            state.params.font,
            state.params.anim,
            state.params.size,
            state.params.color,
            state.params.customColor1,
            state.params.customColor2
        );
        textSystem.animate(() => {
            els.displayMessage.classList.add('visible');
        });
    } else {
        els.textCanvas.style.display = 'none';
        els.displayName.style.display = 'block';

        els.displayName.textContent = state.params.name;
        els.displayName.className = `font-${state.params.font}`;
        els.displayName.classList.add(`anim-${state.params.anim}`);

        setTimeout(() => els.displayMessage.classList.add('visible'), 500);
    }

    els.displayMessage.textContent = state.params.message || translations[state.lang].defaultMsg;
}

els.createBtn.addEventListener('click', () => {
    const name = els.inpName.value.trim();
    if (!name) return;

    const message = els.inpMessage.value.trim();
    const font = getSelectedValue(els.optFont);
    const size = getSelectedValue(els.optSize);
    const color = getSelectedValue(els.optColor);
    const anim = getSelectedValue(els.optAnim);
    const bg = getSelectedValue(els.optBg);

    let customColor1 = '';
    let customColor2 = '';

    if (color === 'single') {
        customColor1 = els.color1.value;
    } else if (color === 'gradient') {
        customColor1 = els.gradientColor1.value;
        customColor2 = els.gradientColor2.value;
    }

    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams({
        n: name,
        m: message,
        f: font,
        s: size,
        c: color,
        a: anim,
        b: bg
    });

    if (customColor1) params.set('c1', customColor1);
    if (customColor2) params.set('c2', customColor2);

    const finalUrl = `${baseUrl}?${params.toString()}`;

    navigator.clipboard.writeText(finalUrl).then(() => {
        showToast(translations[state.lang].toast);
    }).catch(() => {
        prompt("Link:", finalUrl);
    });
});

function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 3000);
}

init();
