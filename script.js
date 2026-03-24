const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec"; 

let ALL_DATA = [];
let ACTIVE_FILTERS = {}; // Format: { "ColumnName": ["Val1", "Val2"] }

window.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    try {
        const resp = await fetch(`${API_URL}?action=getAllData`);
        ALL_DATA = await resp.json();
        populateDatalist(ALL_DATA);
        renderTable(ALL_DATA);
        status.innerText = `Loaded ${ALL_DATA.length} items. Click the ⚙️ icon on headers to filter.`;
    } catch (err) {
        status.innerText = "Error loading data.";
    }
});

function renderTable(dataToDisplay) {
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    head.innerHTML = ""; body.innerHTML = "";

    if (dataToDisplay.length === 0) {
        body.innerHTML = "<tr><td colspan='100%'>No results match.</td></tr>";
        return;
    }

    const headers = Object.keys(ALL_DATA[0]);
    // Hide columns that are empty in the current result set
    const activeHeaders = headers.filter(h => dataToDisplay.some(r => r[h] && r[h] !== "-"));

    const trHead = document.createElement('tr');
    activeHeaders.forEach(h => {
        const th = document.createElement('th');
        th.innerHTML = `<span>${h}</span><button class="filter-btn" onclick="toggleFilterMenu(event, '${h}')">⚙️</button>`;
        trHead.appendChild(th);
    });
    head.appendChild(trHead);

    dataToDisplay.forEach(row => {
        const tr = document.createElement('tr');
        activeHeaders.forEach(h => {
            const td = document.createElement('td');
            td.textContent = row[h] || "-";
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

function toggleFilterMenu(event, colName) {
    event.stopPropagation();
    let menu = document.getElementById(`menu-${colName}`);
    
    // Close any other open menus
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('active'));

    if (!menu) {
        menu = createFilterMenu(colName);
    }

    // Position menu under the button
    const rect = event.target.getBoundingClientRect();
    menu.style.top = (rect.bottom + window.scrollY) + "px";
    menu.style.left = (rect.left + window.scrollX - 150) + "px";
    menu.classList.add('active');
}

function createFilterMenu(colName) {
    const pool = document.getElementById('filterPool');
    const menu = document.createElement('div');
    menu.id = `menu-${colName}`;
    menu.className = "filter-menu";
    
    // Unique values for this column
    const vals = [...new Set(ALL_DATA.map(r => String(r[colName] || "-")))].sort();

    menu.innerHTML = `
        <input type="text" class="filter-search" placeholder="Search..." oninput="filterCheckboxes('${colName}', this.value)">
        <div class="checkbox-list" id="list-${colName}">
            ${vals.map(v => `
                <label class="checkbox-item">
                    <input type="checkbox" value="${v}" ${ACTIVE_FILTERS[colName]?.includes(v) ? 'checked' : ''} onchange="updateFilter('${colName}')">
                    <span>${v}</span>
                </label>
            `).join('')}
        </div>
        <div class="filter-actions">
            <button onclick="clearColFilter('${colName}')">Clear</button>
            <button onclick="closeMenus()">Close</button>
        </div>
    `;

    pool.appendChild(menu);
    return menu;
}

function filterCheckboxes(colName, query) {
    const list = document.getElementById(`list-${colName}`);
    const items = list.querySelectorAll('.checkbox-item');
    items.forEach(item => {
        const text = item.querySelector('span').textContent.toLowerCase();
        item.style.display = text.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

function updateFilter(colName) {
    const list = document.getElementById(`list-${colName}`);
    const checked = Array.from(list.querySelectorAll('input:checked')).map(i => i.value);
    
    if (checked.length === 0) delete ACTIVE_FILTERS[colName];
    else ACTIVE_FILTERS[colName] = checked;

    applyAllFilters();
}

function applyAllFilters() {
    const globalQ = document.getElementById('globalSearch').value.toLowerCase();
    const firstKey = Object.keys(ALL_DATA[0])[0];

    const filtered = ALL_DATA.filter(row => {
        const matchesGlobal = String(row[firstKey]).toLowerCase().includes(globalQ);
        const matchesMenus = Object.keys(ACTIVE_FILTERS).every(col => {
            return ACTIVE_FILTERS[col].includes(String(row[col] || "-"));
        });
        return matchesGlobal && matchesMenus;
    });

    renderTable(filtered);
}

function clearColFilter(colName) {
    delete ACTIVE_FILTERS[colName];
    const menu = document.getElementById(`menu-${colName}`);
    if (menu) {
        menu.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
    }
    applyAllFilters();
}

function resetAll() {
    ACTIVE_FILTERS = {};
    document.getElementById('globalSearch').value = "";
    document.getElementById('filterPool').innerHTML = "";
    applyAllFilters();
}

function closeMenus() {
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('active'));
}

document.addEventListener('click', closeMenus);
// Prevent menu clicks from closing themselves
document.getElementById('filterPool').addEventListener('click', e => e.stopPropagation());

function populateDatalist(data) {
    const listEl = document.getElementById('partList');
    const firstKey = Object.keys(data[0])[0];
    const unique = [...new Set(data.map(r => r[firstKey]))];
    unique.forEach(p => {
        const o = document.createElement('option');
        o.value = p;
        listEl.appendChild(o);
    });
}
