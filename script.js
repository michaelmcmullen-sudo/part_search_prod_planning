// PASTE YOUR GOOGLE DEPLOYMENT URL HERE
const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec";

// Verification: Pulls the top 10 parts from 'Data Sort'
async function loadTestParts() {
    const dropdown = document.getElementById('testDropdown');
    dropdown.innerHTML = '<option>Connecting...</option>';
    
    try {
        const response = await fetch(`${API_URL}?action=getTopTen`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        dropdown.innerHTML = '<option value="">-- Select a found part --</option>';
        data.parts.forEach(part => {
            const opt = document.createElement('option');
            opt.value = part;
            opt.textContent = part;
            dropdown.appendChild(opt);
        });
        alert("Success! Connection to 'Data Sort' is active.");
    } catch (err) {
        console.error(err);
        dropdown.innerHTML = '<option value="">Error</option>';
        alert("Connection Failed. Check: 1. Deployment URL, 2. Tab Name 'Data Sort', 3. Permissions set to 'Anyone'.");
    }
}

// Search: Fetches the specific part data
async function searchData() {
    const input = document.getElementById('partNumber').value.trim();
    const status = document.getElementById('status');
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');

    if (!input) return alert("Please enter a Part Number.");

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

        // Build Table Headers
        const columns = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        head.appendChild(headerRow);

        // Build Table Rows
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
        console.error(err);
        alert("Network Error. Check browser console (F12).");
    } finally {
        status.style.display = "none";
    }
}
