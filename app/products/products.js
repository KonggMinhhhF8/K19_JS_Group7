import {
    checkAuth, getData, createData, updateData, deleteData,
    setupSearch, renderTable, renderSidebar, summary
} from "./base.js";


let allProducts = [];


// thêm 2 biến toàn cục để quản lý ảnh trong modal
let modalSelectedImageBase64 = null;    // base64 data của file mới (nếu chọn)
let modalExistingImageUrl = null;       // ảnh đang có của sản phẩm khi edit

function previewImageModal(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // optional: validate file type/size
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Kích thước ảnh không được vượt quá ${maxSizeMB}MB`);
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        modalSelectedImageBase64 = reader.result; // data URL
        const img = document.getElementById('modalImgPreview');
        img.src = modalSelectedImageBase64;
        img.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Columns Table
const productConfigs= [
    {
        label: 'Hình',
        render: (item) => {
            const imgPath = item.imageUrl ? item.imageUrl : 'https://picsum.photos/51';
            return `<img src="${imgPath}" alt="sp" class="img-thumb">`;
        }
    },
    {
        label: 'Thông tin sản phẩm',
        render: (item) => `<strong>${item.name}</strong><br><small>SKU: ${item.sku || 'N/A'}</small>`
    },
    {
        label: 'Danh mục',
        render: (item) => item.category ? item.category.name : 'Chưa phân loại'
    },
    {
        label: 'Giá bán',
        render: (item) => item.price.toLocaleString('vi-VN') + 'đ'
    },
    {
        label: 'Tồn kho',
        render: (item) => {
            const statusClass = item.remaining < 5 ? 'stock-low' : '';
            return `<span class="${statusClass}">${item.remaining}</span>`;
        }
    },
    {
        label: 'Thao tác',
        render: (item) => `
            <button class="btn-icon edit-btn" data-id="${item.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-btn" data-id="${item.id}" data-name="${item.name}">
                <i class="fas fa-trash"></i>
            </button>
        `
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        checkAuth();
        renderSidebar('product');

        const productForm = document.getElementById("productForm");
        const tableBody = document.getElementById('productTableBody');

        allProducts = await getProducts();
        renderData(allProducts);

        setupSearch('searchInput', allProducts, ['name', 'sku'], renderData);

        document.getElementById("btnAddProduct")?.addEventListener("click", async () => {
            await openProductModal();
        });

        document.querySelector(".btn-cancel")?.addEventListener("click", closeProductModal);

        tableBody?.addEventListener('click', async (e) => {
            const id = e.target.closest('button')?.dataset.id;
            if (!id) return;

            if (e.target.closest('.edit-btn')) {
                await openProductModal(id);
            }
            if (e.target.closest('.delete-btn')) {
                const name = e.target.closest('.delete-btn').dataset.name;
                await handleDelete(id, name);
            }
        });

        productForm?.addEventListener("submit", handleSaveProduct);

    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
    }
    document.getElementById('modalFileInput')?.addEventListener('change', previewImageModal);
});

async function getProducts() {
    const { data, errormsg } = await getData("products");
    if (errormsg) throw new Error(errormsg);
    return data || [];
}

async function openProductModal(id = null) {
    const modal = document.getElementById("productModal");
    const form = document.getElementById("productForm");
    const title = document.getElementById("modalTitle");
    const inputId = document.getElementById("inputId");

    form.reset();

    modalSelectedImageBase64 = null;
    modalExistingImageUrl = null;
    const modalImg = document.getElementById('modalImgPreview');
    if (modalImg) {
        modalImg.style.display = 'none';
        modalImg.src = '#';
    }

    if (id) {
        title.textContent = "Chỉnh sửa sản phẩm";
        inputId.value = id;

        const product = allProducts.find(p => p.id === Number(id));
        if (product) {
            fillForm(product);
            await loadCategories(product.category?.id || product.categoryId);
            modalExistingImageUrl = product.imageUrl || null;
            if (modalExistingImageUrl) {
                const img = document.getElementById('modalImgPreview');
                if (img) {
                    img.src = modalExistingImageUrl;
                    img.style.display = 'block';
                }
            }
        }
    } else {
        title.textContent = "Thêm sản phẩm mới";
        inputId.value = "";
        await loadCategories();
    }

    modal.style.display = "flex";
}

function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
}

async function handleSaveProduct(event) {
    event.preventDefault();
    const form = event.target;
    const productId = document.getElementById("inputId").value;
    const isEditing = !!productId;
    const saveBtn = document.getElementById("btnSaveProduct");

    const productData = {
        name: document.getElementById("inputName").value.trim(),
        sku: document.getElementById("inputSku").value.trim(),
        price: parseInt(document.getElementById("inputPrice").value) || 0,
        remaining: parseInt(document.getElementById("inputStock").value) || 0,
        categoryId: parseInt(document.getElementById("inputCategory").value),
        // nếu có ảnh mới thì dùng base64 mới, nếu không và đang edit thì giữ ảnh cũ
        imageUrl: modalSelectedImageBase64 ? modalSelectedImageBase64 : (modalExistingImageUrl || null)
    };

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Đang lưu...";

        if (isEditing) {
            const { data, error } = await updateData("products", productId, productData);
            if (error) throw new Error(error);

            const idx = allProducts.findIndex(p => p.id == productId);
            if (idx !== -1) allProducts[idx] = data;

            if (!data.imageUrl && modalSelectedImageBase64) {
                allProducts[idx].imageUrl = modalSelectedImageBase64;
            }
            alert("Cập nhật thành công!");
        } else {
            const { data, error } = await createData("products", productData);
            if (error) throw new Error(error);

            if (!data.imageUrl && modalSelectedImageBase64) {
                data.imageUrl = modalSelectedImageBase64;
            }
            allProducts.unshift(data);
            alert("Thêm mới thành công!");
        }

        closeProductModal();

        renderData(allProducts);

    } catch (err) {
        alert("Lỗi: " + err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Lưu sản phẩm";
    }
}

async function loadCategories(selectedId = null) {
    const select = document.getElementById("inputCategory");
    try {
        const { data } = await getData("categories");
        select.innerHTML = `<option value="">-- Chọn danh mục --</option>` +
            data.map(cat => `<option value="${cat.id}" ${cat.id === selectedId ? 'selected' : ''}>${cat.name}</option>`).join("");
    } catch (err) {
        console.error("Lỗi load danh mục:", err);
    }
}

function fillForm(p) {
    document.getElementById("inputName").value = p.name || "";
    document.getElementById("inputPrice").value = p.price || 0;
    document.getElementById("inputStock").value = p.remaining || 0;
    document.getElementById("inputSku").value = p.sku || "";
}

async function handleDelete(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) return;
    try {
        await deleteData("products", id);

        allProducts = allProducts.filter(p => p.id != id);

        renderData(allProducts);
    } catch (err) {
        alert("Lỗi xóa: " + err.message);
    }
}

function renderProductsSummary(products) {
    const stats = document.getElementById("product-Stats");
    if (!stats) return;

    const totalProducts = products.length;
    const totalRemaining = products.reduce((sum, p) => sum + p.remaining, 0);
    const totalCategory = new Set(products.map(p => p.category?.id || p.categoryId)).size;

    stats.innerHTML =
        summary("Tổng Sản Phẩm", totalProducts, "blue") +
        summary("Tổng tồn kho", totalRemaining, "orange") +
        summary("Danh mục", totalCategory, "green");
}

// Render Table
function renderData(data) {
    renderProductsSummary(data);
    renderTable('productTable', productConfigs, data);
}