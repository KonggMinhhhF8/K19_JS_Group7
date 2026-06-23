const accessToken = localStorage.getItem("accessToken");

if (!accessToken) {
    window.location.href = "../login/index.html";
}

function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

async function addCustomer() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const tier = document.getElementById("tier").value;

    if (!name || !email || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                address: "",
                rank: tier.toUpperCase(),
            }),
        });

        const result = await response.json();

        console.log(result);

        if (!response.ok) {
            throw new Error(result.message || "Thêm khách hàng thất bại");
        }

        closeModal();

        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("phone").value = "";

        await fetchCustomers();

        alert("Thêm khách hàng thành công");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

let editRow = null;
function editCustomer(btn) {
    editRow = btn.closest("tr");

    const name = editRow.querySelector("strong").innerText;
    const email = editRow.children[1].childNodes[0].textContent.trim();
    const phone = editRow.children[1].querySelector("small").innerText;
    const tier = editRow.querySelector(".tier").classList[1];

    document.getElementById("name").value = name;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    document.getElementById("tier").value = tier;
    openModal();
}

function searchCustomer() {
    const keyword = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(keyword) ? "" : "none";
    });
}

function renderCustomers(data) {
    const tbody = document.getElementById("customerTableBody");

    tbody.innerHTML = data
        .map((customer) => {
            const rankClass = customer.rank.toLowerCase();

            const rankText = {
                GOLD: "VÀNG",
                SILVER: "BẠC",
                BRONZE: "ĐỒNG",
            };

            const initials = customer.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase();

            return `
        <tr>
          <td>
            <div class="cust-info">
              <div class="avatar">${initials}</div>
              <div>
                <strong>${customer.name}</strong><br />
                <small>ID: ${customer.id}</small>
              </div>
            </div>
          </td>

          <td>
            ${customer.email}<br />
            <small>${customer.phone || "Chưa có SĐT"}</small>
          </td>

          <td>
            <span class="tier ${rankClass}">
              ${rankText[customer.rank] || customer.rank}
            </span>
          </td>

          <td>-</td>

          <td>
            <strong>${customer.totalSpending || "0đ"}</strong>
          </td>

          <td>
            <button class="btn-action" title="Sửa">
              <i class="fas fa-user-edit"></i>
            </button>
          </td>
        </tr>
      `;
        })
        .join("");
}

const API_BASE_URL =
    "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

let customers = [];

async function fetchCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const result = await response.json();
        console.log("Status:", response.status);
        console.log("Result:", result);

        if (!response.ok) {
            throw new Error(
                result.message || "Không lấy được danh sách khách hàng",
            );
        }

        customers = result;
        renderCustomers(customers);
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

fetchCustomers();
