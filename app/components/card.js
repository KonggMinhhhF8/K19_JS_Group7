const renderCard = ({ title, value }) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card";

    const cardTitle = document.createElement("h3");
    cardTitle.textContent = title;

    const cardValue = document.createElement("p");
    cardValue.textContent = value;

    cardElement.append(cardTitle, cardValue);
    return cardElement;
};

const renderCards = (cards) => {
    const fragment = document.createDocumentFragment();
    cards.forEach((card) => fragment.append(renderCard(card)));
    return fragment;
};

export { renderCard, renderCards };
