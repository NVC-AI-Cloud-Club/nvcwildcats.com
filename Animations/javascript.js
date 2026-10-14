/* ============================================================
   Wildcats AI & Cloud Club — Vault Logic
   javascript.js
   ============================================================ */

/* ── TRANSLATIONS ── */
const T = {
  en: {
    langLabel: 'Español', navHome: 'Home', navVault: 'Vault',
    heroTitle: 'The Evolution of Digital Intelligence',
    heroSub:   'A journey through the history of AI in gaming and media.',
    hp1: 'In the mid-20th century, computers were extremely limited compared to modern systems. They filled entire rooms and could perform only basic calculations. Despite these constraints, researchers began exploring <strong>artificial intelligence in games</strong>, starting with classic strategy games like chess and checkers.',
    hp2: 'Early <strong>game-playing AI</strong> relied on searching possible moves and simple evaluation rules. As computing power improved, systems became more advanced, leading to major milestones in <strong>AI development</strong>. By the late 20th century, computers could defeat top human players in chess.',
    hp3: 'In the 21st century, breakthroughs in <strong>machine learning</strong> and <strong>deep learning</strong> transformed AI in gaming, enabling systems to learn from data and master complex games like Go and modern video games.',
    hp4: 'Today, <strong>AI in games</strong> achieves superhuman performance, discovering new strategies and driving forward <strong>artificial intelligence research</strong>.',
    evoTitle: 'Evolution of AI',
    c1h: 'The Birth of Video Games',
    c1p: 'Seventy years ago, computers were huge, expensive machines used only in universities and labs. Early games like OXO and simple math programs marked the beginning of gaming. Scientists like Alan Turing explored computer chess, laying the foundation for modern video games today.',
    c2h: 'Arcades to Home Consoles: Rise and Fall of 1980s Gaming',
    c2p: 'Early video games evolved from experiments like Tennis for Two into arcade systems and home consoles such as the Atari 2600. As computing advanced, simple rule-based gameplay emerged, laying the groundwork for modern AI systems.',
    c3h: 'The 1990s: 3D Gaming and the Early Rise of Game AI',
    c3p: 'The 1990s introduced 3D gaming and smarter AI using behavior rules, pathfinding, and strategy systems, evolving into more adaptive gameplay that laid foundations for modern machine learning in interactive digital worlds.',
    c4h: '2000s to Now: The Rise of Online Worlds, Smart AI, and Next-Gen Gaming',
    c4p: 'The 2000s advanced online gaming and early AI systems. Games like Halo, World of Warcraft, and GTA featured smarter NPCs, persistent worlds, and player-driven simulations, laying groundwork for modern AI and machine learning.',
    vaultTitle: 'Featured AI Animations',
    ip1: 'AI tools do not understand information like humans. Instead, they generate outputs by identifying patterns in large datasets and predicting likely results. According to Cornell University research on generative AI, these systems rely on statistical relationships rather than true comprehension or reasoning.',
    ip2: 'Because of this, AI can produce fluent and convincing content that may still be incorrect. The Cornell research also highlights that generative AI systems have "blind spots" caused by limitations or bias in training data.',
    ip3: 'This is why prompt quality is critical in AI animation and video generation. Even small spelling or wording mistakes can significantly change the final output.',
    isrc:  'Source: Cornell University – Generative AI in Academic Research',
    ilink: 'View Research →',
    v1Title: 'Welcome to NVC',   v1Tag: 'NVC PREVIEW',
    v2Title: 'The Cloud Crew',   v2Tag: 'CLOUD CREW',
    v3Title: 'Digital Frontier', v3Tag: 'FRONTIER',
    v4Title: 'Cyber Defense',    v4Tag: 'CYBER SEC',
    m80t: '1949: Turochamp',
    m80p: 'The Turochamp algorithm refers to early ideas by Alan Turing for machine intelligence, using logical rules and step-by-step processes to let computers solve problems and simulate human-like decision making.',
    m90t: '1980s: Arcades to Home Consoles',
    m90p: 'Early video games evolved from simple experiments like Tennis for Two into arcade hits such as Pong, then home consoles like the Atari 2600. The 1980s gaming boom brought major growth but also the 1983 crash.',
    m00t: 'The 1990s: 3D Gaming',
    m00p: 'The 1990s saw 3D gaming rise with Sega and Nintendo competing fiercely, while early game AI improved using scripted behaviors and pathfinding.',
    mTodayt: 'Today: The AI Brain',
    mTodayp: 'We have entered the age of Generative Intelligence. Deep learning uses neural networks to recognize patterns and make decisions, creating more intelligent NPCs and adaptive difficulty.',
    footerCounter: 'Total Page Views:',
    footerCopy:    '© 2026 Wildcats AI & Cloud Technology Club – Northwest Vista College',
    willie: "Hi! I'm Willy — coming soon!"
  },
  es: {
    langLabel: 'English', navHome: 'Inicio', navVault: 'Bóveda',
    heroTitle: 'La Evolución de la Inteligencia Digital',
    heroSub:   'Un viaje por la historia de la IA en los juegos y medios.',
    hp1: 'A mediados del siglo XX, las computadoras eran extremadamente limitadas en comparación con los sistemas modernos. Ocupaban salas enteras y solo podían realizar cálculos básicos. A pesar de estas limitaciones, los investigadores comenzaron a explorar la <strong>inteligencia artificial en los juegos</strong>.',
    hp2: 'La IA temprana para juegos dependía de la búsqueda de movimientos posibles y reglas de evaluación simples. A medida que mejoró la potencia informática, los sistemas se volvieron más avanzados, logrando hitos importantes como derrotar a los mejores jugadores humanos de ajedrez.',
    hp3: 'En el siglo XXI, los avances en el <strong>aprendizaje automático</strong> y el <strong>aprendizaje profundo</strong> transformaron la IA, permitiendo que los sistemas aprendan de los datos y dominen juegos complejos como Go.',
    hp4: 'Hoy en día, la IA en los juegos alcanza un rendimiento sobrehumano, descubriendo nuevas estrategias e impulsando la investigación de la inteligencia artificial.',
    evoTitle: 'Evolución de la IA',
    c1h: 'El Nacimiento de los Videojuegos',
    c1p: 'Hace setenta años, las computadoras eran máquinas enormes y costosas. Científicos como Alan Turing exploraron el ajedrez por computadora, sentando las bases para los videojuegos modernos de hoy.',
    c2h: 'De Arcadias a Consolas: El Auge de los 80',
    c2p: 'Los primeros juegos evolucionaron de experimentos a sistemas de arcade y consolas como el Atari 2600. Con el avance de la computación, surgieron sistemas de juego basados en reglas simples.',
    c3h: 'Los 90: Juegos 3D y el Surgimiento de la IA',
    c3p: 'La década de 1990 introdujo los juegos en 3D y una IA más inteligente utilizando reglas de comportamiento y búsqueda de rutas, evolucionando hacia una jugabilidad más adaptativa.',
    c4h: 'De los 2000 hasta Hoy: Mundos en Línea',
    c4p: 'Los años 2000 avanzaron los juegos en línea y sistemas de IA. Juegos como Halo y WoW presentaron NPCs más inteligentes y mundos persistentes, sentando las bases para el aprendizaje automático.',
    vaultTitle: 'Animaciones de IA Destacadas',
    ip1: 'Las herramientas de IA no entienden la información como los humanos. En cambio, generan resultados identificando patrones en grandes conjuntos de datos. Según investigaciones de la Universidad de Cornell, estos sistemas dependen de relaciones estadísticas.',
    ip2: 'Debido a esto, la IA puede producir contenido convincente que aún puede ser incorrecto. La investigación también destaca que los sistemas de IA generativa tienen "puntos ciegos" causados por sesgos en los datos de entrenamiento.',
    ip3: 'Es por eso que la calidad del "prompt" es crítica. Incluso pequeños errores ortográficos pueden cambiar significativamente el resultado final.',
    isrc:  'Fuente: Universidad de Cornell – IA Generativa',
    ilink: 'Ver Investigación →',
    v1Title: 'Bienvenidos a NVC',    v1Tag: 'NVC VISTA PREVIA',
    v2Title: 'El Equipo de la Nube', v2Tag: 'EQUIPO NUBE',
    v3Title: 'Frontera Digital',     v3Tag: 'FRONTERA',
    v4Title: 'Ciberdefensa',         v4Tag: 'CIBER SEG',
    m80t: '1949: Turochamp',
    m80p: 'El algoritmo Turochamp se refiere a las primeras ideas de Alan Turing para la inteligencia artificial, utilizando reglas lógicas para simular la toma de decisiones humana.',
    m90t: '1980s: Arcadias a Consolas Caseras',
    m90p: 'Los videojuegos evolucionaron de experimentos simples a éxitos de arcade como Pong. El auge de los 80 trajo un gran crecimiento pero también el colapso de 1983.',
    m00t: 'Los 1990s: Juegos 3D',
    m00p: 'Los 90 vieron el auge de los juegos 3D con Sega y Nintendo compitiendo ferozmente, mientras la IA mejoraba mediante comportamientos programados.',
    mTodayt: 'Hoy: El Cerebro de la IA',
    mTodayp: 'Hemos entrado en la era de la Inteligencia Generativa. El aprendizaje profundo utiliza redes neuronales para reconocer patrones y crear NPCs más inteligentes.',
    footerCounter: 'Vistas Totales:',
    footerCopy:    '© 2026 Wildcats AI & Cloud Technology Club – Northwest Vista College',
    willie: '¡Hola! Soy Willy — ¡próximamente!'
  }
};

/* ── STATE ── */
let lang = localStorage.getItem('wcLang') || 'en';

/* ── HELPERS ── */
// Safe setters — silently skip if the element doesn't exist in the DOM
function set(id, val)  { const e = document.getElementById(id); if (e) e.textContent = val; }
function html(id, val) { const e = document.getElementById(id); if (e) e.innerHTML  = val; }

/* ── LANGUAGE ── */
function applyLang(l) {
    lang = l;
    localStorage.setItem('wcLang', l);
    const t = T[l];
    document.documentElement.lang = l;

    set('lang-label',   t.langLabel);
    set('nav-home',     t.navHome);
    set('nav-vault',    t.navVault);
    set('hero-title',   t.heroTitle);
    set('hero-sub',     t.heroSub);
    html('hp1', t.hp1); html('hp2', t.hp2); html('hp3', t.hp3); html('hp4', t.hp4);
    set('evo-title',    t.evoTitle);
    set('c1h', t.c1h); set('c1p', t.c1p);
    set('c2h', t.c2h); set('c2p', t.c2p);
    set('c3h', t.c3h); set('c3p', t.c3p);
    set('c4h', t.c4h); set('c4p', t.c4p);
    set('vault-title',  t.vaultTitle);
    set('ip1', t.ip1); set('ip2', t.ip2); set('ip3', t.ip3);
    set('isrc', t.isrc); set('ilink', t.ilink);
    set('v1-title', t.v1Title); set('v1-tag', t.v1Tag);
    set('v2-title', t.v2Title); set('v2-tag', t.v2Tag);
    set('v3-title', t.v3Title); set('v3-tag', t.v3Tag);
    set('v4-title', t.v4Title); set('v4-tag', t.v4Tag);
    set('m80-t',    t.m80t);   set('m80-p',    t.m80p);
    set('m90-t',    t.m90t);   set('m90-p',    t.m90p);
    set('m00-t',    t.m00t);   set('m00-p',    t.m00p);
    set('mToday-t', t.mTodayt); set('mToday-p', t.mTodayp);
    set('footer-counter', t.footerCounter);
    set('footer-copy',    t.footerCopy);
}

function toggleLang() { applyLang(lang === 'en' ? 'es' : 'en'); }

/* ── VIDEO ACTIVATION ──
   Video URL lives in data-src on the wrapper element.
   On first click we snapshot innerHTML (picture + play-btn + kicker),
   swap in a <video>, and mark the wrapper as .playing.
   On a second card click we restore the snapshot of any playing card first. */
function activateVideo(wrapper) {
    if (wrapper.classList.contains('playing')) return;

    // Pause & restore any card already playing
    document.querySelectorAll('.video-wrapper.playing').forEach(w => {
        const vid = w.querySelector('video');
        if (vid) vid.pause();
        const snap = w.dataset.snapshot;
        if (snap) {
            w.innerHTML = snap;
            w.classList.remove('playing');
        }
    });

    // Snapshot BEFORE we replace the innerHTML
    wrapper.dataset.snapshot = wrapper.innerHTML;

    const videoUrl = wrapper.dataset.src;
    wrapper.innerHTML = `
        <video autoplay loop playsinline webkit-playsinline controls
               style="width:100%;height:100%;object-fit:cover;border-radius:10px;">
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
        </video>`;
    wrapper.classList.add('playing');
}


const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});


/* ── MODALS ── */
function openModal(id) {
    closeModals();
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function closeModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
}

/* ── WILLIE ── */
function willieClick() { alert(T[lang].willie); }

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 900, once: true });
    applyLang(lang);

    // Close modal when clicking the dark backdrop
    document.querySelectorAll('.modal-overlay').forEach(o => {
        o.addEventListener('click', e => { if (e.target === o) closeModals(); });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });
});
