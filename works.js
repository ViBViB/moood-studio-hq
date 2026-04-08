// [WORKS.JS] - Moood Studio High-Performance Carousel Engine (Asset Injection Edition)

const track = document.getElementById('carouselTrack');
const carousel = document.getElementById('worksCarousel');
const dialTrack = document.getElementById('dialTrack');
const drawer = document.getElementById('workDrawer');
const fadeElements = document.querySelectorAll('.content-to-fade');
const drawerImage = document.getElementById('drawerImage');

// Asset Mapping (Typos in folder names retained as per file system)
const PROJECT_DATA = [
    { id: 1, title: "Balú", img: "Balu.webp" },
    { id: 2, title: "Banjo Boys", img: "Banjo boys.webp" },
    { id: 3, title: "Benhar", img: "Benhar.webp" },
    { id: 4, title: "Bizzabo", img: "Bizzabo.webp" },
    { id: 5, title: "Bold", img: "Bold.webp" },
    { id: 6, title: "Culta", img: "Culta.webp" },
    { id: 7, title: "Deal", img: "Deal.webp" },
    { id: 8, title: "Domus Shield", img: "Domus.webp" },
    { id: 9, title: "Duarte", img: "Duarte.webp" },
    { id: 10, title: "Findora", img: "Findora.webp" },
    { id: 11, title: "Hubspot Inspire", img: "Hubspot-inspire.webp" },
    { id: 12, title: "Navvis", img: "Navvis.webp" },
    { id: 13, title: "Onshape", img: "Onshape.webp" },
    { id: 14, title: "Signature", img: "Signature.webp" },
    { id: 15, title: "Studio Tools", img: "Studio-tools.webp" },
    { id: 16, title: "Wollet", img: "Wollet.webp" }
];

const ASSET_PATH = "assets/images/works-aseets/"; // Retaining existing typo in folder name

let isDragging = false;
let startX = 0;
let scrollLeft = 0;
let velocity = 0;
let lastX = 0;
let autoScroll = 0;
let dragDistance = 0; 
let currentTilt = 0; 
let movementScale = 0; 

// Config
const FRICTION = 0.965;
const VELOCITY_MULTIPLIER = 1.25;
const MAX_ROTATION = 35; 
const TILT_SMOOTHNESS = 0.15;
const MOVEMENT_SMOOTHNESS = 0.1;

// 1. Initialize Dial Ruler
function initDial() {
    const lineCount = 500; 
    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'c-dial__line';
        dialTrack.appendChild(line);
    }
}

// 2. Triple Clone Strategy & Asset Injection
function initInfinite() {
    const cards = Array.from(track.querySelectorAll('.c-card-work'));
    
    // Inject Assets and Titles based on Mapping
    cards.forEach((card, index) => {
        const data = PROJECT_DATA[index % PROJECT_DATA.length];
        card.dataset.id = data.id;
        card.querySelector('.c-card-work__label').innerText = data.title;
        card.querySelector('.c-card-work__visual').style.backgroundImage = `url('${ASSET_PATH}${data.img}')`;
    });

    const cardCount = cards.length;
    for (let i = 0; i < 2; i++) {
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });
    }
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].offsetWidth + gap;
    autoScroll = -cardWidth * cardCount;
    requestAnimationFrame(updateLoop);
}

// 3. Main Animation Loop
function updateLoop() {
    const totalWidth = track.scrollWidth / 3;
    if (autoScroll <= -totalWidth * 2) autoScroll += totalWidth;
    if (autoScroll >= -totalWidth) autoScroll -= totalWidth;

    if (!isDragging) {
        autoScroll += velocity;
        velocity *= FRICTION;
    }

    track.style.transform = `translateX(${autoScroll}px)`;

    const targetTilt = Math.min(Math.max(velocity * 4.0, -MAX_ROTATION), MAX_ROTATION);
    currentTilt += (targetTilt - currentTilt) * TILT_SMOOTHNESS;

    const cards = Array.from(track.querySelectorAll('.c-card-work'));
    cards.forEach(card => {
        card.style.transform = `rotateY(${-currentTilt}deg)`;
    });

    const targetMovement = (isDragging || Math.abs(velocity) > 0.5) ? 1 : 0;
    movementScale += (targetMovement - movementScale) * MOVEMENT_SMOOTHNESS;

    const dialOffset = (autoScroll % 10); 
    dialTrack.style.transform = `translateX(${dialOffset}px)`;
    updateDialLines();

    requestAnimationFrame(updateLoop);
}

function updateDialLines() {
    const lines = dialTrack.querySelectorAll('.c-dial__line');
    const centerX = window.innerWidth / 2;
    let closestLine = null;
    let minDistance = Infinity;

    lines.forEach(line => {
        const rect = line.getBoundingClientRect();
        const distToCenter = Math.abs(rect.left - centerX);
        if (distToCenter < minDistance) {
            minDistance = distToCenter;
            closestLine = line;
        }
    });

    lines.forEach(line => {
        const rect = line.getBoundingClientRect();
        const distToCenter = Math.abs(rect.left - centerX);
        
        if (line === closestLine) {
            line.style.height = '36px';
            line.style.opacity = '1';
            line.classList.add('c-dial__line--active');
        } else if (distToCenter < 120) {
            const proximity = 1 - (distToCenter / 120);
            const scale = proximity * movementScale;
            line.style.height = `${12 + (24 * scale)}px`;
            line.style.opacity = 0.6 + (0.4 * scale);
            line.classList.remove('c-dial__line--active');
        } else {
            line.style.height = '12px';
            line.style.opacity = '0.6';
            line.classList.remove('c-dial__line--active');
        }
    });
}

// 4. Input Handlers
carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = autoScroll;
    velocity = 0;
    dragDistance = 0;
    lastX = e.pageX;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * VELOCITY_MULTIPLIER;
    dragDistance += Math.abs(e.pageX - lastX);
    velocity = e.pageX - lastX;
    autoScroll = scrollLeft + walk;
    lastX = e.pageX;
});

carousel.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = autoScroll;
    velocity = 0;
    dragDistance = 0;
    lastX = e.touches[0].pageX;
});

window.addEventListener('touchend', () => {
    isDragging = false;
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * VELOCITY_MULTIPLIER;
    dragDistance += Math.abs(e.touches[0].pageX - lastX);
    velocity = e.touches[0].pageX - lastX;
    autoScroll = scrollLeft + walk;
    lastX = e.touches[0].pageX;
});

// 5. Drawer Interactions
function openWorkDrawer(id, title) {
    const project = PROJECT_DATA.find(p => p.id == id);
    document.getElementById('drawerTitle').innerText = title;
    
    // Set Drawer Asset
    if (project) {
        drawerImage.src = ASSET_PATH + project.img;
        drawerImage.alt = title;
    }

    fadeElements.forEach(el => el.classList.add('faded'));
    drawer.classList.add('active');
    
    // Reset scroll of drawer visual to top
    document.getElementById('drawerVisual').scrollTop = 0;
}

function closeWorkDrawer() {
    fadeElements.forEach(el => el.classList.remove('faded'));
    drawer.classList.remove('active');
}

document.addEventListener('click', (e) => {
    const card = e.target.closest('.c-card-work');
    if (card && dragDistance < 10 && Math.abs(velocity) < 2) {
        const title = card.querySelector('.c-card-work__label').innerText;
        openWorkDrawer(card.dataset.id, title);
    }
});

window.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        velocity = -e.deltaX * 0.5;
    }
}, { passive: false });

window.onload = () => {
    initDial();
    initInfinite();
};
