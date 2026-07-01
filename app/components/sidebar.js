import { SIDEBAR_ITEMS } from "../constants/sidebar.js";

const renderSidebarItem = ({ icon, text, href, active }) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    const i = document.createElement("i");

    a.href = href || "#";

    a.style.textDecoration = "none";
    a.style.color = "inherit";
    a.style.display = "flex";
    a.style.alignItems = "center";
    a.style.width = "100%";

    i.className = icon;
    a.append(i, document.createTextNode(text));

    li.append(a);

    if (active) li.classList.add("active");

    return li;
};

const renderSidebar = (items = SIDEBAR_ITEMS) => {
    const fragment = document.createDocumentFragment();

    const title = document.createElement("h2");
    title.textContent = "ShopAdmin";

    const list = document.createElement("ul");
    items.forEach((item) => list.append(renderSidebarItem(item)));

    fragment.append(title, list);
    return fragment;
};

export { renderSidebar };
