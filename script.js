const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec"; 

let ALL_DATA = [];
let ACTIVE_FILTERS = {}; 

window.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    try {
        const resp = await fetch(`${API_URL}?action=getAllData`);
        ALL_DATA = await resp.json();
        populateDatalist(ALL_DATA);
        renderTable(ALL_DATA);
        status.innerText = `Database Ready: ${ALL_DATA.length} parts online.`;
    } catch (err) {
        status.innerText = "Connection failed. Check API permissions.";
    }
});

function renderTable(dataToDisplay) {
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    head.innerHTML = ""; body.innerHTML = "";

    if (dataToDisplay.length === 0) {
        body.innerHTML = "<tr><td colspan='100%' style='text-align:center; padding:40px;'>No items match the selected filters.</td></tr>";
        return;
    }

    const headers = Object.keys(ALL_DATA[0]);
    // Hide columns that are empty across the current results
    const activeHeaders = headers.filter(h => dataToDisplay.some(r => r[h] && r[h] !== "" && r[h] !== "-"));

    const trHead = document.createElement('tr');
    activeHeaders.forEach(h => {
        const th = document.createElement('th');
        // Indicator if filter is active
        const indicator = ACTIVE_FILTERS[h] ? " ★" : "";
        th.innerHTML = `<span>${h}${indicator}</span><button class="filter-btn" onclick="toggleFilterMenu(event, '${h}')">▼</button>`;
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
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('active'));

    let menu = document.getElementById(`menu-${colName}`);
    if (!menu) menu = createFilterMenu(colName);

    const rect = event.target.getBoundingClientRect();
    menu.style.top = (rect.bottom + 5) + "px";
    menu.style.left = Math.min(rect.left, window.innerWidth - 260) + "px";
    menu.classList.add('active');
}

function createFilterMenu(colName) {
    const pool = document.getElementById('filterPool');
    const menu = document.createElement('div');
    menu.id = `menu-${colName}`;
    menu.className = "filter-menu";
    
    const uniqueValues = [...new Set(ALL_DATA.map(r => String(r[colName] || "-")))].sort();

    menu.innerHTML = `
        <input type="text" class="filter-search" placeholder="Search values..." oninput="filterCheckboxes('${colName}', this.value)">
        <div class="checkbox-list">
            <label class="checkbox-item select-all-box">
                <input type="checkbox" id="all-${colName}" onchange="toggleAll('${colName}', this.checked)" checked>
                <span>(Select All)</span>
            </label>
            <div id="list-${colName}">
                ${uniqueValues.map(v => `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${v}" checked onchange="updateFilterState('${colName}')">
                        <span>${v}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="filter-actions">
            <button onclick="closeMenus()">OK</button>
        </div>
    `;

    pool.appendChild(menu);
    return menu;
}

function toggleAll(colName, isChecked) {
    const list = document.getElementById(`list-${colName}`);
    list.querySelectorAll('input').forEach(i => i.checked = isChecked);
    updateFilterState(colName);
}

function filterCheckboxes(colName, query) {
    const items = document.getElementById(`list-${colName}`).querySelectorAll('.checkbox-item');
    items.forEach(item => {
        const text = item.querySelector('span').textContent.toLowerCase();
        item.style.display = text.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

function updateFilterState(colName) {
    const list = document.getElementById(`list-${colName}`);
    const checkboxes = Array.from(list.querySelectorAll('input'));
    const checked = checkboxes.filter(i => i.checked).map(i => i.value);
    
    // Update "Select All" indeterminate/checked state visually
    const selectAllBtn = document.getElementById(`all-${colName}`);
    selectAllBtn.checked = checked.length === checkboxes.length;

    // If all are selected, we don't need a specific filter for this column
    if (checked.length === checkboxes.length) {
        delete ACTIVE_FILTERS[colName];
    } else {
        ACTIVE_FILTERS[colName] = checked;
    }

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
    document.getElementById('status').innerText = `Filtering: ${filtered.length} results found.`;
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

// Global click listeners
document.addEventListener('click', closeMenus);
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
