// REPLACE THIS URL with your new "Anyone" deployment URL from Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec";

async function searchData() {
    const input = document.getElementById('partNumber').value.trim();
    const status = document.getElementById('status');
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');

    if (!input) {
        alert("Please enter a Part Number first.");
        return;
    }

    // UI Reset
    status.style.display = "inline";
    head.innerHTML = "";
    body.innerHTML = "";

    try {
        const response = await fetch(`${API_URL}?partNumber=${encodeURIComponent(input)}`);
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();

        if (data.error) {
            alert("System Message: " + data.error);
            return;
        }

        // Build Table
        const columns = Object.keys(data[0]);

        // Headers
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        head.appendChild(headerRow);

        // Rows
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
        alert("Connection Error. Ensure the Google Script is deployed to 'Anyone' and the URL is correct.");
    } finally {
        status.style.display = "none";
    }
}
