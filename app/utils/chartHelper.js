// line chart
export const initRevenueChart = (canvasId, labels, data) => {
    console.log("initRevenueChart", labels);
    const ctx = document.getElementById(canvasId).getContext("2d");
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Doanh thu (VNĐ)",
                    data: data,
                    borderColor: "#3498db",
                    backgroundColor: "rgba(52, 152, 219, 0.1)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: { responsive: true, maintainAspectRatio: false },
    });
};

// pie chart
export const initCategoryChart = (canvasId, labels, data) => {
    console.log("initCategoryChart", labels);

    const ctx = document.getElementById(canvasId).getContext("2d");
    return new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "#3498db",
                        "#2ecc71",
                        "#f1c40f",
                        "#e74c3c",
                        "#9b59b6",
                    ],
                },
            ],
        },
        options: { responsive: true, maintainAspectRatio: false },
    });
};
