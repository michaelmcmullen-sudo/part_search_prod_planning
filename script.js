const API_URL = "YOUR_NEW_DEPLOYMENT_URL"; 

// 1. Auto-load the search list on page load
window.onload = async () => {
    const dataList = document.getElementById('partList');
    const status = document.getElementById('status');
    
    try {
        const response = await fetch(`${API_URL}?action=getSearchList`);
        const data = await response.json();
        
        data.parts.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id; // Search by the ID (Part Number)
            option.textContent = item.label; // Show the user "Part | Cust Mat"
            dataList.appendChild(option);
        });
        status.innerText = `System Ready: ${data.parts.length} parts loaded.`;
    } catch (err) {
        status.innerText = "Error loading parts list.";
        console.error(err);
    }
};

async function searchData() {
    const input = document.getElementById('partNumber').value.trim();
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');
    const status = document.getElementById('status');

    if (!input) return;

    status.innerText = "Fetching data...";
    head.innerHTML = ""; body.innerHTML = "";

    try {
        const response = await fetch(`${API_URL}?partNumber=${encodeURIComponent(input)}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            status.innerText = "Ready.";
            return;
        }

        // The API now only sends headers that have data
        const columns = Object.keys(data[0]);
        
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        head.appendChild(headerRow);

        data.forEach(item => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = item[col] || "-";
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        status.innerText = "Displaying results.";
    } catch (err) {
        alert("Search failed.");
        status.innerText = "Ready.";
    }
}
