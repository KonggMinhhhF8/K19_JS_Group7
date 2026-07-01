import { renderCards } from "../components/card.js";
import { renderSidebar } from "../components/sidebar.js";
import { renderTable } from "../components/table.js";
import { ORDER_HEADERS } from "../constants/orderTable.js";
import { formatCurrency } from "../utils/formatCurrency.js";

import axiosClient from "../utils/axiosClient.js";

const BASE_URL = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

// DOM Elements
const tableContainer = document.querySelector("#order-table");
const statsContainer = document.querySelector(".stats");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// Toggle Sidebar Mobile
const toggleMenu = () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
};

menuToggle.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

async function init() {
    // Render sidebar
    sidebar.append(renderSidebar());

    try {
        const accessToken = localStorage.getItem("accessToken");

        const res = await fetch(`${BASE_URL}/orders`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const orders = await res.json();

        // Calculate Revenue
        const totalRevenue = orders.reduce((total, order) => {
            if (order.status !== "done") return total;
            return total + (order.amount || 0) * (order.product?.price || 0);
        }, 0);

        // cardData
        const cardData = [
            { title: "Doanh thu", value: formatCurrency(totalRevenue) },
            { title: "Đơn mới", value: orders.length },
        ];

        // map data to render
        const tableRows = orders.map((order) => {
            const orderTotal = order.amount * (order.product?.price || 0);
            return {
                id: `#${order.id}`,
                customer: order.customer?.name || "Ẩn danh",
                status: order.status === "done" ? "Thành công" : "Đang xử lý",
                total: formatCurrency(orderTotal),
            };
        });

        // render
        statsContainer.append(renderCards(cardData));
        tableContainer.append(renderTable(ORDER_HEADERS, tableRows));
    } catch (error) {
        console.error(error);
        tableContainer.textContent =
            "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.";
        tableContainer.style.marginTop = "20px";
        tableContainer.style.marginBottom = "20px";
        tableContainer.style.textAlign = "center";
    }
}

init();
