const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec"; 

let ALL_DATA = [];

// 1. Initial Load: Get everything
window.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    try {
        status.innerText = "Downloading database...";
        const resp = await fetch(`${API_URL}?action=getAllData`);
        const data = await resp.json();

        if (data.error) throw new Error(data.error);

        ALL_DATA = data;
        populateDatalist(data);
        renderTable(data); // Show all by default
        
        status.innerText = `Connected. ${data.length} items loaded.`;
    } catch (err) {
        console.error(err);
        status.innerText = "Error: Could not sync with Google Sheets.";
    }
});

function populateDatalist(data) {
    const listEl = document.getElementById('partList');
    const uniqueParts = [...new Set(data.map(item => Object.values(item)[0]))]; // Gets first column values
    
    uniqueParts.forEach(part => {
        const opt = document.createElement('option');
        opt.value = part;
        listEl.appendChild(opt);
    });
}

function renderTable(dataToDisplay) {
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    head.innerHTML = ""; body.innerHTML = "";

    if (dataToDisplay.length === 0) {
        body.innerHTML = "<tr><td colspan='100%'>No matching results found.</td></tr>";
        return;
    }

    // DYNAMIC COLUMN HIDING LOGIC
    // Get all possible headers
    const allHeaders = Object.keys(dataToDisplay[0]);
    
    // Filter headers to only those that have at least one valid value in the current result set
    const activeHeaders = allHeaders.filter(h => {
        return dataToDisplay.some(row => {
            const val = row[h];
            return val !== "" && val !== null && val !== "-" && val !== undefined;
        });
    });

    // Create Headers
    const trHead = document.createElement('tr');
    activeHeaders.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });
    head.appendChild(trHead);

    // Create Rows
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

function searchData() {
    const input = document.getElementById('partNumber').value.trim().toLowerCase();
    const status = document.getElementById('status');

    if (!input) {
        renderTable(ALL_DATA);
        status.innerText = "Showing all data.";
        return;
    }

    // Filter local data based on the first column (usually Part Number)
    const filtered = ALL_DATA.filter(row => {
        const firstValue = String(Object.values(row)[0]).toLowerCase();
        return firstValue.includes(input);
    });

    renderTable(filtered);
    status.innerText = `Found ${filtered.length} matches. (Empty columns hidden)`;
}

function resetFilters() {
    document.getElementById('partNumber').value = "";
    renderTable(ALL_DATA);
    document.getElementById('status').innerText = "All data restored.";
}
