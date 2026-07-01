import { renderReportStats } from "../components/reportStats.js";
import { renderTable } from "../components/table.js";
import { TOP_PRODUCT_HEADERS } from "../constants/reportHeaders.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { initRevenueChart, initCategoryChart } from "../utils/chartHelper.js";

const BASE_URL = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";
// get elements
const statsContainer = document.getElementById("stats-container");
const tableContainer = document.getElementById("top-products-table");
const logoutBtn = document.getElementById("logoutBtn");

async function init() {
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "../login/index.html";
        });
    }

    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            window.location.href = "../login/index.html";
        }

        // fetch api
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
            fetch(`${BASE_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }),
            fetch(`${BASE_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }),
            fetch(`${BASE_URL}/categories`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }),
        ]);

        const [orders, products, categories] = await Promise.all([
            ordersRes.json(),
            productsRes.json(),
            categoriesRes.json(),
        ]);

        // Initialize the cumulative variable
        let totalRevenue = 0;
        let successOrdersCount = 0;
        const revenueByDate = {};
        const topProductMap = {};
        const categoryCounts = {};
        let totalAllProductsSold = 0;

        // Initialize categoryCounts to 0.
        categories.forEach((cat) => {
            categoryCounts[cat.name] = 0;
        });

        // loop orders to caculate
        orders.forEach((order) => {
            const productDetail = order.product;
            if (!productDetail) return;

            const orderAmount =
                (order.amount || 0) * (productDetail.price || 0);

            if (order.status === "done") {
                totalRevenue += orderAmount;
                successOrdersCount++;

                // Cut characters to extract the date.
                const dateStr = order.date
                    ? order.date.substring(5, 10)
                    : "Không rõ";
                revenueByDate[dateStr] =
                    (revenueByDate[dateStr] || 0) + orderAmount;
            }

            const catName = productDetail.category?.name || "Khác";
            if (categoryCounts[catName] === undefined) {
                categoryCounts[catName] = 0;
            }

            // quantity Sold
            const quantitySold = order.amount || 0;
            categoryCounts[catName] += quantitySold;
            totalAllProductsSold += quantitySold;

            // top products
            if (!topProductMap[productDetail.id]) {
                topProductMap[productDetail.id] = {
                    productName: productDetail.name,
                    quantity: 0,
                    revenue: 0,
                    remaining: productDetail.remaining ?? 0,
                };
            }
            topProductMap[productDetail.id].quantity += quantitySold;
            topProductMap[productDetail.id].revenue += orderAmount;
        });

        // render card
        if (statsContainer) {
            const statsData = [
                {
                    title: "Doanh thu",
                    value: formatCurrency(totalRevenue),
                    trendType: "up",
                    trendText: "12% so với tháng trước",
                },
                {
                    title: "Đơn hàng",
                    value: successOrdersCount.toString(),
                    trendType: "up",
                    trendText: "5%",
                },
                {
                    title: "Lợi nhuận",
                    value: formatCurrency(totalRevenue * 0.2),
                    trendType: "down",
                    trendText: "2%",
                },
                {
                    title: "Khách mới",
                    value: "84",
                    trendType: "up",
                    trendText: "18%",
                },
            ];
            statsContainer.textContent = "";
            statsContainer.append(renderReportStats(statsData));
        }

        // create and build charts
        const sortedDates = [];
        const revenueValues = [];
        const targetDate = new Date();

        // caculate revenue 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(targetDate);
            d.setDate(targetDate.getDate() - i);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const dateStr = `${month}-${day}`;
            sortedDates.push(dateStr);
            revenueValues.push(revenueByDate[dateStr] || 0);
        }

        try {
            initRevenueChart("revenueChart", sortedDates, revenueValues);
        } catch (chartError) {
            console.error("Lỗi thư viện Canvas biểu đồ đường:", chartError);
        }

        // Calculate the percentage of categories sold.
        try {
            const catLabels = [];
            const catValues = [];

            Object.keys(categoryCounts).forEach((catName) => {
                const soldAmount = categoryCounts[catName];
                const percentage =
                    totalAllProductsSold > 0
                        ? ((soldAmount / totalAllProductsSold) * 100).toFixed(1)
                        : 0;
                catLabels.push(`${catName} (${percentage}%)`);
                catValues.push(soldAmount);
            });
            initCategoryChart("categoryChart", catLabels, catValues);
        } catch (chartError) {
            console.error(chartError);
        }

        // best-selling products
        if (tableContainer) {
            // Object.values ​​transforms the object into an array containing the values ​​in topProductMap.
            const topProductsData = Object.values(topProductMap)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
                .map((p) => ({
                    productName: p.productName,
                    quantity: p.quantity,
                    revenue: formatCurrency(p.revenue),
                    status: p.remaining > 0 ? "Còn hàng" : "Hết hàng",
                }));

            tableContainer.textContent = "";
            tableContainer.append(
                renderTable(TOP_PRODUCT_HEADERS, topProductsData),
            );
        }
    } catch (error) {
        console.error(error);
        if (tableContainer) {
            tableContainer.innerHTML = `<div style="text-align:center; padding:20px;">Lỗi khi tải dữ liệu. Vui lòng kiểm tra lại.</div>`;
        }
    }
}

init();
