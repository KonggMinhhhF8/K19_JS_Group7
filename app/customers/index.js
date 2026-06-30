const accessToken = localStorage.getItem("accessToken");

if (!accessToken) {
    window.location.href = "../login/index.html";
}

function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    editingCustomerId = null;
    resetCustomerForm();
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

async function updateCustomer() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const tier = document.getElementById("tier").value;

    if (!name || !email || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/customers/${editingCustomerId}`,
            {
                method: "PUT",
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
            },
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Cập nhật khách hàng thất bại");
        }

        editingCustomerId = null;
        closeModal();
        resetCustomerForm();
        await fetchCustomers();

        alert("Cập nhật khách hàng thành công");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function resetCustomerForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("tier").value = "gold";

    document.querySelector(".modal-header h3").textContent = "Thêm khách hàng";
    document.querySelector(".btn-save").textContent = "Lưu khách hàng";
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

async function deleteCustomer(id) {
    const confirmDelete = confirm("Bạn có chắc muốn xóa khách hàng này không?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(result?.message || "Xóa khách hàng thất bại");
        }

        await fetchCustomers();
        alert("Xóa khách hàng thành công");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function renderCustomers(data) {
    const tbody = document.getElementById("customerTableBody");

    if (!data.length) {
        tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <h3>Chưa có khách hàng nào</h3>
            <p>Hãy thêm khách hàng đầu tiên của bạn</p>
          </div>
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = data
        .map((customer) => {
            const name = customer.name || "Chưa có tên";
            const email = customer.email || "Chưa có email";
            const phone = customer.phone || "Chưa có SĐT";
            const rank = customer.rank || "BRONZE";
            const totalSpending = customer.totalSpending || "0đ";
            const rankClass = rank.toLowerCase();

            const rankText = {
                GOLD: "VÀNG",
                SILVER: "BẠC",
                BRONZE: "ĐỒNG",
            };

            const initials = name
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
                <strong>${name}</strong><br />
                <small>ID: ${customer.id}</small>
              </div>
            </div>
          </td>

          <td>
            ${email}<br />
            <small>${phone}</small>
          </td>

          <td>
            <span class="tier ${rankClass}">
              ${rankText[rank] || rank}
            </span>
          </td>

          <td>-</td>

          <td>
            <strong>${totalSpending}</strong>
          </td>

          <td>
            <button class="btn-action" onclick="openEditCustomer(${customer.id})" title="Sửa">
  <i class="fas fa-user-edit"></i>
</button>

            <button class="btn-action btn-delete" onclick="deleteCustomer(${customer.id})" title="Xóa">
                <i class="fas fa-trash"></i>
            </button>
        </td>
        </tr>
      `;
        })
        .join("");
}

function openEditCustomer(id) {
    const customer = customers.find((item) => item.id === id);

    if (!customer) {
        alert("Không tìm thấy khách hàng");
        return;
    }

    editingCustomerId = id;

    document.getElementById("name").value = customer.name || "";
    document.getElementById("email").value = customer.email || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("tier").value = (
        customer.rank || "BRONZE"
    ).toLowerCase();

    document.querySelector(".modal-header h3").textContent =
        "Cập nhật khách hàng";
    document.querySelector(".btn-save").textContent = "Cập nhật";

    openModal();
}

function submitCustomerForm() {
    if (editingCustomerId) {
        updateCustomer();
    } else {
        addCustomer();
    }
}

const API_BASE_URL =
    "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

let customers = [];
let editingCustomerId = null;

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
