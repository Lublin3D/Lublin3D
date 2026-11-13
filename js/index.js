function openPage(pageId) {
    const activeId = (pageId.toLowerCase() === 'info') ? 'info' : 'Modele3D';

    document.querySelectorAll('.page-view').forEach(sec => {
        sec.classList.toggle('active-page', sec.id === activeId);
    });

    document.querySelectorAll('.nav-pill a').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === activeId);
    });

    history.replaceState(null, '', '#' + activeId);
    window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', () => {
    openPage(window.location.hash.replace('#', ''));
});

window.addEventListener('DOMContentLoaded', () => {
    openPage(window.location.hash.replace('#', ''));

    const repoOwner = 'lublin3d'; 
    const repoName = 'Lublin3D';

    const customModels = {
        "Portal": {
            name: "Portal Lublin–Wilno",
            street: "Plac Litewski",
            description: "Interaktywna instalacja łącząca na żywo Lublin z Wilnem. Model 3D gotowy do pobrania i użycia w projektach."
        },
        "Kawiarnia Star - Tomasza Zana 35": {
            name: "Kawiarnia Star",
            street: "ul. Tomasza Zana 35",
            description: "Model 3D budynku kawiarni Star przy ulicy Tomasza Zana 35 w Lublinie. Gotowy do pobrania i wykorzystania w projektach."
        },
        "Lubartowska 24C": {
            name: "Lubartowska 24C",
            street: "ul. Lubartowska 24C",
            description: "Model 3D budynku przy ulicy Lubartowskiej 24C w Lublinie. Gotowy do pobrania i wykorzystania w projektach."
        }
    };

    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents`)
        .then(response => response.json())
        .then(data => {
            const grid = document.getElementById('dynamic-models-grid');
            grid.innerHTML = ''; 

            if (!Array.isArray(data)) {
                grid.innerHTML = '<p style="color: var(--muted);">Nie udało się pobrać listy modeli.</p>';
                return;
            }

            const glbFiles = data.filter(file => file.name.toLowerCase().endsWith('.glb'));

            if (glbFiles.length === 0) {
                grid.innerHTML = '<p style="color: var(--muted);">Brak modeli 3D w repozytorium.</p>';
                return;
            }

            glbFiles.forEach(file => {
                const fileName = file.name;
                const rawName = decodeURIComponent(fileName.replace(/\.[^/.]+$/, ""));
                
                let name, description, street;

                if (customModels[rawName]) {
                    name = customModels[rawName].name;
                    description = customModels[rawName].description;
                    street = customModels[rawName].street;
                } else {
                    const parts = rawName.split('-');
                    if (parts.length >= 3) {
                        name = parts[0].trim();
                        description = parts[1].trim();
                        street = parts[2].trim();
                    } else {
                        name = rawName;
                        description = "Interaktywny model 3D obiektu z Lublina. Gotowy do pobrania i użycia w projektach.";
                        street = "Lublin";
                    }
                }

                const formattedLocation = (street === 'Lublin' || street.startsWith('ul.') || street.startsWith('Plac')) 
                    ? street 
                    : 'ul. ' + street;

                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="viewer">
                        <model-viewer 
                            src="./${fileName}" environment-image="neutral" camera-target="auto" 
                            exposure="1.4" 
                            shadow-intensity="1"
                            auto-rotate 
                            auto-rotate-delay="0"
                            rotation-per-second="6deg"
                            camera-controls>
                        </model-viewer>
                    </div>
                    <h2>${name}</h2>
                    <div class="meta">Format: .GLB &bull; ${formattedLocation}</div>
                    <p>${description}</p>
                    <a href="${fileName}" download class="btn-dl">Pobierz model</a>
                `;
                grid.appendChild(card);
            });

            document.querySelectorAll('.card').forEach(card => {
                const viewer = card.querySelector('model-viewer');
                const viewerContainer = card.querySelector('.viewer');
                if (viewer && viewerContainer) {
                    viewerContainer.addEventListener('mouseenter', () => {
                        viewer.setAttribute('rotation-per-second', '25deg');
                    });
                    viewerContainer.addEventListener('mouseleave', () => {
                        viewer.setAttribute('rotation-per-second', '6deg');
                    });
                }
            });
        })
        .catch(error => {
            console.error('Błąd pobierania modeli:', error);
            document.getElementById('dynamic-models-grid').innerHTML = '<p style="color: var(--muted);">Błąd połączenia z API GitHub.</p>';
        });
});

const c = document.getElementById('particles'), ctx = c.getContext('2d');
let pts = [], m = { x: null, y: null, r: 130 };
function res() { c.width = innerWidth; c.height = innerHeight; }
addEventListener('resize', res); res();
addEventListener('mousemove', e => { m.x = e.clientX; m.y = e.clientY; });
addEventListener('mouseout', () => { m.x = null; m.y = null; });

for (let i = 0; i < 90; i++) {
    pts.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        bx: Math.random() * c.width, by: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        s: Math.random() * 2 + 0.8, o: Math.random() * 0.4 + 0.15
    });
}

function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (let p of pts) {
        p.bx += p.vx; p.by += p.vy;
        if (p.bx < 0 || p.bx > c.width) p.vx *= -1;
        if (p.by < 0 || p.by > c.height) p.vy *= -1;
        let dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy);
        if (m.x !== null && d < m.r) {
            let f = (m.r - d) / m.r;
            p.x -= (dx / d) * f * 3;
            p.y -= (dy / d) * f * 3;
        } else {
            p.x += (p.bx - p.x) * 0.05;
            p.y += (p.by - p.y) * 0.05;
        }
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28); ctx.fill();
    }
    requestAnimationFrame(loop);
}
loop();
