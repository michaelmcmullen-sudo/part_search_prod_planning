// PASTE YOUR GOOGLE DEPLOYMENT URL HERE
const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec";

// Verification Function: Tests the link and fills the dropdown
async function loadTestParts() {
    const dropdown = document.getElementById('testDropdown');
    dropdown.innerHTML = '<option>Connecting...</option>';
    
    try {
        const response = await fetch(`${API_URL}?action=getTopTen`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        dropdown.innerHTML = '<option value="">-- Select a discovered part --</option>';
        data.parts.forEach(part => {
            const opt = document.createElement('option');
            opt.value = part;
            opt.textContent = part;
            dropdown.appendChild(opt);
        });
        alert("Connection Successful! 10 parts retrieved.");
    } catch (err) {
        console.error(err);
        dropdown.innerHTML = '<option value="">Connection Failed</option>';
        alert("Connection Error: Check if Web App is deployed to 'Anyone'.");
    }
}

// Main Search Function
async function searchData() {
    const input = document.getElementById('partNumber').value.trim();
    const status = document.getElementById('status');
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');

    if (!input) {
        alert("Please enter or select a Part Number.");
        return;
    }

    status.style.display = "inline";
    head.innerHTML = ""; 
    body.innerHTML = "";

    try {
        const response = await fetch(`${API_URL}?partNumber=${encodeURIComponent(input)}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // 1. Generate Headers
        const columns = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        head.appendChild(headerRow);

        // 2. Generate Rows
        data.forEach(item => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = item[col];
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Network Error. Check console for details.");
    } finally {
        status.style.display = "none";
    }
}
