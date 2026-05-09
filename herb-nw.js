/* ------------------------------------------------------------------ */
/* CONFIG                                                               */
/* ------------------------------------------------------------------ */
const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/' +
    '2PACX-1vSQvRgMgqr0TlvEpatJF7dAn-3SB77GXQe8MDYLSTQA1QDQG6PvmfViNtEdg7bQHnTBZ9jqZKGneXqn' +
    '/pub?gid=2025051505&single=true&output=csv';

/* ------------------------------------------------------------------ */
/* STATE                                                                */
/* ------------------------------------------------------------------ */
let herbData     = [];
let filteredData = [];
let currentSort  = 'AZ';

const TIER_SCORE = { S:5, A:4, B:3, C:2, D:1 };
const TIER_COLOR = {
    S: 'var(--herb-tier-s)',
    A: 'var(--herb-tier-a)',
    B: 'var(--herb-tier-b)',
    C: 'var(--herb-tier-c)',
    D: 'var(--herb-tier-d)'
};

/* ------------------------------------------------------------------ */
/* CSV PARSER                                                           */
/* ------------------------------------------------------------------ */
function parseCSV(raw) {
    const rows = [];
    let cur = '', inQ = false, row = [];

    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i], nx = raw[i + 1];
        if (ch === '"') {
            if (inQ && nx === '"') { cur += '"'; i++; }
            else { inQ = !inQ; }
        } else if (ch === ',' && !inQ) {
            row.push(cur.trim()); cur = '';
        } else if ((ch === '\n' || ch === '\r') && !inQ) {
            row.push(cur.trim()); rows.push(row); row = []; cur = '';
            if (ch === '\r' && nx === '\n') i++;
        } else {
            cur += ch;
        }
    }
    if (row.length || cur) { row.push(cur.trim()); rows.push(row); }

    const headers = rows[0].map(h => h.trim());
    return rows.slice(1)
        .filter(r => r.some(c => c))
        .map(r => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = (r[i] || '').trim());
            return obj;
        });
}

/* ------------------------------------------------------------------ */
/* HELPERS                                                              */
/* ------------------------------------------------------------------ */
function tierColor(t) {
    return TIER_COLOR[(t || '').toUpperCase()] || 'var(--herb-border)';
}

function setText(id, val, fallback = '—') {
    const el = document.getElementById(id);
    if (el) el.textContent = val || fallback;
}

/* ------------------------------------------------------------------ */
/* RENDER INDEX GRID                                                    */
/* ------------------------------------------------------------------ */
function renderGrid() {
    const grid = document.getElementById('herb-grid');
    grid.innerHTML = '';

    if (!filteredData.length) {
        grid.innerHTML = '<p class="herb-no-results">ไม่พบสมุนไพรที่ค้นหา…<br><em>No herbs matched your search.</em></p>';
        return;
    }

    filteredData.forEach((herb, idx) => {
        const card = document.createElement('div');
        card.className = 'herb-card';
        card.addEventListener('click', () => showDetail(herb));

        const tier = (herb.tier || '').toUpperCase();
        const tc   = tierColor(tier);

        card.innerHTML = `
            <div class="herb-card-body">
                <div class="herb-card-num">No.&thinsp;${String(idx + 1).padStart(2, '0')}</div>
                <div class="herb-card-name-th">${herb.name_th || '—'}</div>
                <div class="herb-card-name-en">${herb.name_en || ''}</div>
                ${herb.element ? `<div class="herb-card-element">◈ ${herb.element}</div>` : ''}
            </div>
            ${tier ? `<div class="herb-tier-seal" style="background:${tc}" title="เกรด ${tier}">${tier}</div>` : ''}
        `;
        grid.appendChild(card);
    });
}

/* ------------------------------------------------------------------ */
/* SORT                                                                 */
/* ------------------------------------------------------------------ */
function sortData() {
    if (currentSort === 'AZ') {
        filteredData.sort((a, b) =>
            a.name_th.localeCompare(b.name_th, 'th'));
    } else {
        filteredData.sort((a, b) => {
            const sa = TIER_SCORE[(a.tier || '').toUpperCase()] || 0;
            const sb = TIER_SCORE[(b.tier || '').toUpperCase()] || 0;
            return sb !== sa ? sb - sa : a.name_th.localeCompare(b.name_th, 'th');
        });
    }
    renderGrid();
}

function setSort(mode) {
    currentSort = mode;
    document.getElementById('herb-sort-az')  .classList.toggle('herb-active', mode === 'AZ');
    document.getElementById('herb-sort-tier').classList.toggle('herb-active', mode === 'TIER');
    sortData();
}

/* ------------------------------------------------------------------ */
/* SHOW DETAIL                                                          */
/* ------------------------------------------------------------------ */
function showDetail(herb) {
    const tier = (herb.tier || '').toUpperCase();
    const tc   = tierColor(tier);

    setText('herb-d-name-th',    herb.name_th,    'สมุนไพรนิรนาม');
    setText('herb-d-name-en',    herb.name_en,    'Unknown Herb');
    setText('herb-d-tier-ghost', tier,            '');
    setText('herb-d-element',    herb.element);
    setText('herb-d-sun',        herb.sun);
    setText('herb-d-water',      herb.water);
    setText('herb-d-duration',   herb.plant_duration);
    setText('herb-d-fact',       herb.fact);
    setText('herb-d-magical',    herb.magical_properties);
    setText('herb-d-appearance', herb.appearance);
    setText('herb-d-harvest',    herb.harvest);
    setText('herb-d-caution',    herb.caution, 'ไม่มีข้อควรระวังเป็นพิเศษ');

    /* Tier with colored dot */
    const tierEl = document.getElementById('herb-d-tier');
    if (tierEl) {
        tierEl.innerHTML = tier
            ? `<span class="herb-tier-dot" style="background:${tc}"></span>${tier}`
            : '—';
    }

    /* Image */
    const img = document.getElementById('herb-d-image');
    if (img) img.src = herb.url || '';

    /* Caption */
    const cap = document.getElementById('herb-d-caption');
    if (cap) cap.textContent = herb.name_en
        ? `Fig. — ${herb.name_en}`
        : 'Botanical Illustration';

    /* History section */
    const histSec = document.getElementById('herb-section-history');
    if (histSec) {
        histSec.style.display = herb.history ? 'block' : 'none';
        setText('herb-d-history', herb.history);
    }

    /* Enable detail tab and switch */
    document.getElementById('herb-tab-detail-btn').disabled = false;
    switchTab('herb-view-detail');
}

/* ------------------------------------------------------------------ */
/* TAB SWITCHING                                                        */
/* ------------------------------------------------------------------ */
function switchTab(targetId) {
    document.querySelectorAll('.herb-view-section').forEach(el => el.classList.remove('herb-active'));
    document.querySelectorAll('.herb-tab-btn')    .forEach(el => el.classList.remove('herb-active'));
    document.getElementById(targetId).classList.add('herb-active');
    const btn = document.querySelector(`.herb-tab-btn[data-target="${targetId}"]`);
    if (btn) btn.classList.add('herb-active');
}

/* ------------------------------------------------------------------ */
/* IMAGE MODAL FUNCTIONS                                                */
/* ------------------------------------------------------------------ */
function openImageModal() {
    const modal = document.getElementById('herb-image-modal');
    const modalImg = document.getElementById('herb-modal-img');
    const modalCaption = document.getElementById('herb-modal-caption');
    const sourceImg = document.getElementById('herb-d-image');
    const sourceCaption = document.getElementById('herb-d-caption');

    modalImg.src = sourceImg.src;
    modalCaption.textContent = sourceCaption.textContent;

    modal.style.display = 'flex';
    // Delay slightly to ensure display:flex is applied before adding opacity for smooth transition
    setTimeout(() => {
        modal.classList.add('herb-show');
    }, 10);
}

function closeImageModal() {
    const modal = document.getElementById('herb-image-modal');
    modal.classList.remove('herb-show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Matches CSS transition duration
}

/* ------------------------------------------------------------------ */
/* INIT & EVENTS                                                        */
/* ------------------------------------------------------------------ */
async function initApp() {
    try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        herbData     = parseCSV(await res.text());
        filteredData = [...herbData];
        sortData();

        document.getElementById('herb-loading-screen').style.display = 'none';
        document.getElementById('herb-app').style.display = 'flex';
    } catch (err) {
        document.getElementById('herb-loading-screen').innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--herb-ink-faded)">
                <div style="font-size:3rem;margin-bottom:14px">📜</div>
                <div style="font-family:var(--herb-font-heading);font-size:1.1rem;margin-bottom:8px">
                    ไม่สามารถเปิดตำราได้
                </div>
                <div style="font-family:var(--herb-font-en);font-style:italic;font-size:0.9rem">
                    Cannot load the compendium. Check your Google Sheets URL or network connection.
                </div>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    document.getElementById('herb-search-input').addEventListener('input', e => {
        const kw = e.target.value.toLowerCase();
        filteredData = kw
            ? herbData.filter(h =>
                (h.name_th || '').toLowerCase().includes(kw) ||
                (h.name_en || '').toLowerCase().includes(kw))
            : [...herbData];
        sortData();
    });

    // Close Modal when clicking outside the image frame
    const modal = document.getElementById('herb-image-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageModal();
        }
    });

    // Close Modal when pressing the Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('herb-show')) {
            closeImageModal();
        }
    });
});
</script>
