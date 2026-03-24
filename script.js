const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec"; 

let ALL_DATA = [];
let ACTIVE_FILTERS = {}; 
let CURRENT_VIEW_DATA = [];

window.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    try {
        const resp = await fetch(`${API_URL}?action=getAllData`);
        ALL_DATA = await resp.json();
        populateDatalist(ALL_DATA);
        renderTable(ALL_DATA);
        status.innerText = `Database Ready: ${ALL_DATA.length} items.`;
    } catch (err) {
        status.innerText = "Error: Check API permissions/Deployment URL.";
    }
});

function renderTable(dataToDisplay) {
    CURRENT_VIEW_DATA = dataToDisplay;
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    head.innerHTML = ""; body.innerHTML = "";

    if (dataToDisplay.length === 0) {
        body.innerHTML = "<tr><td colspan='100%' style='text-align:center; padding:40px;'>No results match.</td></tr>";
        return;
    }

    const headers = Object.keys(ALL_DATA[0]);
    // Hide columns that are empty across current filtered results
    const activeHeaders = headers.filter(h => dataToDisplay.some(r => r[h] && r[h] !== "" && r[h] !== "-"));

    const trHead = document.createElement('tr');
    activeHeaders.forEach(h => {
        const th = document.createElement('th');
        const filterMark = ACTIVE_FILTERS[h] ? " ★" : "";
        th.innerHTML = `<span>${h}${filterMark}</span><button class="filter-btn" onclick="toggleFilterMenu(event, '${h}')">▼</button>`;
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
    menu.style.left = Math.min(rect.left, window.innerWidth - 270) + "px";
    menu.classList.add('active');
}

function createFilterMenu(colName) {
    const pool = document.getElementById('filterPool');
    const menu = document.createElement('div');
    menu.id = `menu-${colName}`;
    menu.className = "filter-menu";
    
    const vals = [...new Set(ALL_DATA.map(r => String(r[colName] || "-")))].sort();

    menu.innerHTML = `
        <input type="text" class="filter-search" placeholder="Search values..." oninput="filterCheckboxes('${colName}', this.value)">
        <div class="checkbox-list">
            <label class="checkbox-item select-all-box">
                <input type="checkbox" id="all-${colName}" onchange="toggleAll('${colName}', this.checked)" checked>
                <span>(Select All)</span>
            </label>
            <div id="list-${colName}">
                ${vals.map(v => `
                    <label class="checkbox-item">
                        <input type="checkbox" value="${v}" checked onchange="updateFilterState('${colName}')">
                        <span>${v}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="filter-actions"><button onclick="closeMenus()">OK</button></div>
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
    
    document.getElementById(`all-${colName}`).checked = (checked.length === checkboxes.length);

    if (checked.length === checkboxes.length) delete ACTIVE_FILTERS[colName];
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
    document.getElementById('status').innerText = `Matches found: ${filtered.length}`;
}

function resetAll() {
    ACTIVE_FILTERS = {};
    document.getElementById('globalSearch').value = "";
    document.getElementById('filterPool').innerHTML = "";
    applyAllFilters();
}

function exportToCSV() {
    if (CURRENT_VIEW_DATA.length === 0) return alert("No data to export.");

    const headers = Object.keys(ALL_DATA[0]);
    const activeHeaders = headers.filter(h => CURRENT_VIEW_DATA.some(r => r[h] && r[h] !== "" && r[h] !== "-"));

    const csvRows = [activeHeaders.join(',')];
    CURRENT_VIEW_DATA.forEach(row => {
        const values = activeHeaders.map(h => `"${String(row[h] || "").replace(/"/g, '""')}"`);
        csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BOM_Export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

function closeMenus() { document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('active')); }
document.addEventListener('click', closeMenus);
document.getElementById('filterPool').addEventListener('click', e => e.stopPropagation());

function populateDatalist(data) {
    const listEl = document.getElementById('partList');
    const firstKey = Object.keys(data[0])[0];
    [...new Set(data.map(r => r[firstKey]))].forEach(p => {
        const o = document.createElement('option'); o.value = p; listEl.appendChild(o);
    });
}
