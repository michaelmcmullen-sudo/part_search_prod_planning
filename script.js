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

    // Reset and show loader
    status.style.display = "inline";
    head.innerHTML = "";
    body.innerHTML = "";

    try {
        // Fetch data from your Google Web App
        const response = await fetch(`${API_URL}?partNumber=${input}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            status.style.display = "none";
            return;
        }

        // 1. Get headers from the first object returned
        const columns = Object.keys(data[0]);

        // 2. Create Header Row
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        head.appendChild(headerRow);

        // 3. Create Data Rows
        data.forEach(item => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = item[col] || ""; // Shows empty string if data is missing
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert("Error connecting to Google Sheets. Ensure you deployed as 'Anyone'.");
    } finally {
        status.style.display = "none";
    }
}
