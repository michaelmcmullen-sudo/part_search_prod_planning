const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec"; 

let ALL_DATA = [];
let ACTIVE_FILTERS = {}; 

window.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    try {
        const resp = await fetch(`${API_URL}?action=getAllData`);
        const data = await resp.json();

        if (data.error) throw new Error(data.error);

        ALL_DATA = data;
        populateDatalist(data);
        renderTable(data);
        
        status.innerText = `Database Synced: ${data.length} items loaded.`;
    } catch (err) {
        console.error(err);
        status.innerText = "Connection Error. Please check Deployment permissions.";
    }
});

function renderTable(dataToDisplay) {
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    head.innerHTML = ""; body.innerHTML = "";

    if (dataToDisplay.length === 0) {
        body.innerHTML = "<tr><td colspan='100%' style='text-align:center; padding:20px;'>No results match these filters.</td></tr>";
        return;
    }

    const allHeaders = Object.keys(ALL_DATA[0]);
    const activeHeaders = allHeaders.filter(h => {
        return dataToDisplay.some(row => row[h] !== "" && row[h] !== null && row[h] !== "-");
    });

    const trHead = document.createElement('tr');
    activeHeaders.forEach(h => {
        const th = document.createElement('th');
        const title = document.createElement('div');
        title.textContent = h;
        th.appendChild(title);

        const select = document.createElement('select');
        select.className = "column-filter";
        const optAll = document.createElement('option');
        optAll.value = "";
        optAll.textContent = "(All)";
        select.appendChild(optAll);

        const uniqueValues = [...new Set(ALL_DATA.map(row => row[h]))]
            .filter(v => v !== "" && v !== null && v !== "-")
            .sort();

        uniqueValues.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            if (ACTIVE_FILTERS[h] === String(val)) opt.selected = true;
            select.appendChild(opt);
        });

        select.onchange = (e) => {
            if (e.target.value === "") delete ACTIVE_FILTERS[h];
            else ACTIVE_FILTERS[h] = e.target.value;
            applyAllFilters();
        };

        th.appendChild(select);
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

function applyAllFilters() {
    const searchText = document.getElementById('partNumber').value.trim().toLowerCase();
    const firstColKey = Object.keys(ALL_DATA[0])[0];

    const filtered = ALL_DATA.filter(row => {
        const matchesSearch = String(row[firstColKey]).toLowerCase().includes(searchText);
        const matchesDropdowns = Object.keys(ACTIVE_FILTERS).every(header => {
            return String(row[header]) === ACTIVE_FILTERS[header];
        });
        return matchesSearch && matchesDropdowns;
    });

    renderTable(filtered);
    document.getElementById('status').innerText = `Showing ${filtered.length} matching rows.`;
}

function resetFilters() {
    document.getElementById('partNumber').value = "";
    ACTIVE_FILTERS = {};
    renderTable(ALL_DATA);
    document.getElementById('status').innerText = "All filters cleared.";
}

function populateDatalist(data) {
    const listEl = document.getElementById('partList');
    listEl.innerHTML = "";
    const firstColKey = Object.keys(data[0])[0];
    const uniqueParts = [...new Set(data.map(item => item[firstColKey]))];
    uniqueParts.forEach(part => {
        const opt = document.createElement('option');
        opt.value = part;
        listEl.appendChild(opt);
    });
}
