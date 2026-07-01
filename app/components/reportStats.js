export const renderReportStats = (data) => {
    const fragment = document.createDocumentFragment();

    data.forEach((item) => {
        const card = document.createElement("div");
        card.className = "stat-card";

        const h4 = document.createElement("h4");
        h4.textContent = item.title;

        const valueDiv = document.createElement("div");
        valueDiv.className = "value";
        valueDiv.textContent = item.value;

        const trendDiv = document.createElement("div");
        const isUp = item.trendType === "up";
        trendDiv.className = isUp ? "trend up" : "trend down";

        const icon = document.createElement("i");
        icon.className = isUp ? "fas fa-arrow-up" : "fas fa-arrow-down";

        trendDiv.append(icon, document.createTextNode(` ${item.trendText}`));
        card.append(h4, valueDiv, trendDiv);
        fragment.append(card);
    });

    return fragment;
};
