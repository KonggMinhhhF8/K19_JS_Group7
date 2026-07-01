const renderTable = (headers, rows) => {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const trHead = document.createElement("tr");

    // Render Headers
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header.text;
        trHead.append(th);
    });
    thead.append(trHead);

    // Render Rows
    rows.forEach((row) => {
        const tr = document.createElement("tr");

        headers.forEach(({ key }) => {
            const td = document.createElement("td");

            const cellValue = row[key];

            if (key === "status") {
                const span = document.createElement("span");
                if (row[key] === "Đang xử lý") span.style.color = "#FFC107";
                span.className = "status";
                span.textContent = cellValue;
                td.append(span);
            } else {
                td.textContent = cellValue;
            }

            tr.append(td);
        });

        tbody.append(tr);
    });

    table.append(thead, tbody);
    return table;
};

export { renderTable };
