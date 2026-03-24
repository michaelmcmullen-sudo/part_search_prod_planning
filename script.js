const API_URL = "https://script.google.com/macros/s/AKfycbxxsvbelm0fJ4kcWXDVdHpwVzhg42c6lJ0DeO4IygG4K7JPDbbPldsuNXiJqZ8YJ0joKg/exec";

async function searchData() {
    const input = document.getElementById('partNumber').value;
    const status = document.getElementById('status');
    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');

    if (!input) {
        alert("Please enter a Part Number first.");
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

        if (data.length === 0) {
            alert("No data returned for this part number.");
            return;
        }

        // Get headers from the first object
        const columns = Object.keys(data[0]);

        // Create Header Row
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        head.appendChild(headerRow);

        // Create Data Rows
        data.forEach(item => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = item[col] || "";
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert("Connection Error. Check your internet or Google Apps Script deployment permissions.");
    } finally {
        status.style.display = "none";
    }
}
