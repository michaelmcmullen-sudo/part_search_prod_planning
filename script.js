const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec"; 

// Run as soon as the page loads to fill the search suggestions
window.addEventListener('DOMContentLoaded', async () => {
    const listEl = document.getElementById('partList');
    const status = document.getElementById('status');
    
    try {
        const resp = await fetch(`${API_URL}?action=getSearchList`);
        const result = await resp.json();
        
        if (result.error) throw new Error(result.error);

        result.parts.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.value;    // This is what gets sent to search
            opt.label = item.label;    // This is what the user sees
            listEl.appendChild(opt);
        });
        status.innerText = `Connected: ${result.parts.length} parts available.`;
    } catch (err) {
        console.error("Initialization Error:", err);
        status.innerText = "Error: Could not load parts list. Check API URL and Permissions.";
    }
});

async function searchData() {
    const input = document.getElementById('partNumber').value.trim();
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    const status = document.getElementById('status');

    if (!input) return alert("Please select or enter a part number.");

    status.innerText = "Searching...";
    head.innerHTML = ""; body.innerHTML = "";

    try {
        const resp = await fetch(`${API_URL}?partNumber=${encodeURIComponent(input)}`);
        const data = await resp.json();

        if (data.error) {
            alert(data.error);
            status.innerText = "Ready.";
            return;
        }

        const cols = Object.keys(data[0]);
        const trHead = document.createElement('tr');
        cols.forEach(c => {
            const th = document.createElement('th');
            th.textContent = c;
            trHead.appendChild(th);
        });
        head.appendChild(trHead);

        data.forEach(row => {
            const tr = document.createElement('tr');
            cols.forEach(c => {
                const td = document.createElement('td');
                td.textContent = row[c] || "-";
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        status.innerText = "Done.";
    } catch (err) {
        console.error("Search Error:", err);
        alert("Failed to retrieve data.");
        status.innerText = "Ready.";
    }
}
