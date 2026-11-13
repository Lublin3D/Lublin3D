function openPage(pageId) {
    const activeId = (pageId.toLowerCase() === 'info') ? 'info' : 'Modele3D';
    document.querySelectorAll('.page-view').forEach(sec => sec.classList.toggle('active-page', sec.id === activeId));
    document.querySelectorAll('.nav-pill a').forEach(link => link.classList.toggle('active', link.dataset.tab === activeId));
    history.replaceState(null, '', '#' + activeId);
    window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', () => openPage(window.location.hash.replace('#', '')));
window.addEventListener('DOMContentLoaded', () => {
    openPage(window.location.hash.replace('#', ''));
    const customModels = {
        "Portal": { name: "Portal Lublin–Wilno", street: "Plac Litewski", description: "Interaktywna instalacja łącząca na żywo Lublin z Wilnem. Model 3D gotowy do pobrania i użycia w projektach." },
        "Kawiarnia Star - Tomasza Zana 35": { name: "Kawiarnia Star", street: "ul. Tomasza Zana 35", description: "Model 3D budynku kawiarni Star przy ulicy Tomasza Zana 35 w Lublinie. Gotowy do pobrania i wykorzystania w projektach." },
        "Lubartowska 24C": { name: "Lubartowska 24C", street: "ul. Lubartowska 24C", description: "Model 3D budynku przy ulicy Lubartowskiej 24C w Lublinie. Gotowy do pobrania i wykorzystania w projektach." }
    };
    fetch('https://api.github.com/repos/lublin3d/Lublin3D/contents')
        .then(r => r.json())
        .then(data => {
            const grid = document.getElementById('dynamic-models-grid');
            grid.innerHTML = '';
            if (!Array.isArray(data)) { grid.innerHTML = '<p style="color: var(--muted);">Nie udało się pobrać listy modeli.</p>'; return; }
            const glbFiles = data.filter(f => f.name.toLowerCase().endsWith('.glb'));
            if (glbFiles.length === 0) { grid.innerHTML = '<p style="color: var(--muted);">Brak modeli 3D w repozytorium.</p>'; return; }
            glbFiles.forEach(file => {
                const rawName = decodeURIComponent(file.name.replace(/\.[^/.]+$/, ""));
                let name = rawName, description = "Interaktywny model 3D obiektu z Lublina. Gotowy do pobrania i użycia w projektach.", street = "Lublin";
                if (customModels[rawName]) { ({ name, description, street } = customModels[rawName]); }
                else {
                    const parts = rawName.split('-');
                    if (parts.length >= 3) { name = parts[0].trim(); description = parts[1].trim(); street = parts[2].trim(); }
                }
                const loc = (street === 'Lublin' || street.startsWith('ul.') || street.startsWith('Plac')) ? street : 'ul. ' + street;
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `<div class="viewer"><model-viewer src="./${file.name}" environment-image="neutral" camera-target="auto" exposure="1.4" shadow-intensity="1" auto-rotate auto-rotate-delay="0" rotation-per-second="6deg" camera-controls></model-viewer></div><h2>${name}</h2><div class="meta">Format: .GLB &bull; ${loc}</div><p>${description}</p><a href="${file.name}" download class="btn-dl">Pobierz model</a>`;
                grid.appendChild(card);
            });
            document.querySelectorAll('.card').forEach(card => {
                const v = card.querySelector('model-viewer'), vc = card.querySelector('.viewer');
                if (v && vc) {
                    vc.addEventListener('mouseenter', () => v.setAttribute('rotation-per-second', '25deg'));
                    vc.addEventListener('mouseleave', () => v.setAttribute('rotation-per-second', '6deg'));
                }
            });
        })
        .catch(() => { document.getElementById('dynamic-models-grid').innerHTML = '<p style="color: var(--muted);">Błąd połączenia z API GitHub.</p>'; });
});
const c = document.getElementById('particles'), ctx = c.getContext('2d');
let pts = [], m = { x: null, y: null, r: 120 };
function res() { c.width = innerWidth; c.height = innerHeight; }
addEventListener('resize', res); res();
addEventListener('mousemove', e => { m.x = e.clientX; m.y = e.clientY; });
addEventListener('mouseout', () => { m.x = null; m.y = null; });
for (let i = 0; i < 65; i++) pts.push({ x: Math.random() * c.width, y: Math.random() * c.height, bx: Math.random() * c.width, by: Math.random() * c.height, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, s: Math.random() * 1.1 + 0.6, o: Math.random() * 0.35 + 0.2 });
function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (let p of pts) {
        p.bx += p.vx; p.by += p.vy;
        if (p.bx < 0 || p.bx > c.width) p.vx *= -1;
        if (p.by < 0 || p.by > c.height) p.vy *= -1;
        let dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy);
        if (m.x !== null && d < m.r) { let f = (m.r - d) / m.r; p.x -= (dx / d) * f * 2.5; p.y -= (dy / d) * f * 2.5; }
        else { p.x += (p.bx - p.x) * 0.05; p.y += (p.by - p.y) * 0.05; }
    }
    for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            let dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            if (dist < 140) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 140) * 0.16})`;
                ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
            }
        }
    }
    for (let p of pts) { ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); }
    requestAnimationFrame(loop);
}
loop();
