// Import các hàm dùng chung từ file base.js
import {
    checkAuth, // Kiểm tra người dùng đã đăng nhập chưa
    getData, // Lấy dữ liệu từ API
    createData, // Thêm dữ liệu
    updateData, // Cập nhật dữ liệu
    deleteData, // Xóa dữ liệu
    setupSearch, // Thiết lập chức năng tìm kiếm
    renderTable, // Render bảng dữ liệu
    renderSidebar, // Render sidebar
    summary // Tạo thẻ thống kê
} from "./base.js";


// Lưu toàn bộ danh sách sản phẩm để thao tác
let allProducts = [];


// ==================== QUẢN LÝ HÌNH ẢNH ====================

// Lưu ảnh mới người dùng chọn (Base64)
let modalSelectedImageBase64 = null;

// Lưu ảnh cũ của sản phẩm khi chỉnh sửa
let modalExistingImageUrl = null;

// =======================================================
// Hiển thị preview ảnh khi người dùng chọn file
// =======================================================
function previewImageModal(event) {
    // Lấy file đầu tiên được chọn
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    // Giới hạn kích thước ảnh tối đa 5MB
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Kích thước ảnh không được vượt quá ${maxSizeMB}MB`);

        // Xóa file đã chọn
        event.target.value = "";
        return;
    }

    // FileReader dùng để đọc file ảnh
    const reader = new FileReader();
    reader.onload = function() {
        // Chuyển file thành chuỗi Base64
        modalSelectedImageBase64 = reader.result;
        // Hiển thị preview
        const img = document.getElementById('modalImgPreview');
        img.src = modalSelectedImageBase64;
        img.style.display = 'block';
    };
    // Bắt đầu đọc file
    reader.readAsDataURL(file);
}


// =======================================================
// CẤU HÌNH CÁC CỘT TRONG BẢNG
// =======================================================
// Columns Table
const productConfigs= [
    // Cột hình ảnh
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


// =======================================================
// Khi HTML load xong
// =======================================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Kiểm tra đăng nhập
        checkAuth();
        // Render menu
        renderSidebar('product');

        const productForm = document.getElementById("productForm");
        const tableBody = document.getElementById('productTableBody');

        // Lấy toàn bộ sản phẩm
        allProducts = await getProducts();
        // Hiển thị bảng
        renderData(allProducts);
        // Thiết lập tìm kiếm theo tên và SKU
        setupSearch('searchInput', allProducts, ['name', 'sku'], renderData);
        async function loadCategoryFilter() {
            const filterSelect = document.getElementById("categoryFilter");
            if (!filterSelect) return;

            try {
                const { data } = await getData("categories");
                const optionsHtml = data.map(cat =>
                    `<option value="${cat.id}">${cat.name}</option>`
                ).join("");
                filterSelect.innerHTML = '<option value="">Tất cả danh mục</option>' + optionsHtml;
            } catch (err) {
                console.error("Lỗi load danh mục filter:", err);
            }
        }
        // Sau dòng 125 (setupSearch)
        await loadCategoryFilter();
        // Mở modal thêm sản phẩm
        document.getElementById("btnAddProduct")?.addEventListener("click", async () => {
            await openProductModal();
        });
        // Đóng modal
        document.querySelector(".btn-cancel")?.addEventListener("click", closeProductModal);
        // Bắt sự kiện click trong bảng
        tableBody?.addEventListener('click', async (e) => {
            const id = e.target.closest('button')?.dataset.id;
            if (!id) return;
            // Click nút sửa
            if (e.target.closest('.edit-btn')) {
                await openProductModal(id);
            }
            // Click nút xóa
            if (e.target.closest('.delete-btn')) {
                const name = e.target.closest('.delete-btn').dataset.name;
                await handleDelete(id, name);
            }
        });
        // Submit form
        productForm?.addEventListener("submit", handleSaveProduct);
        // Setup filter by category
        const categoryFilter = document.querySelector('#categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const selectedCategoryId = e.target.value;

                if (!selectedCategoryId) {
                    // Nếu chọn "Tất cả danh mục", hiển thị toàn bộ
                    renderData(allProducts);
                } else {
                    // Lọc sản phẩm theo danh mục
                    const filteredProducts = allProducts.filter(p =>
                        String(p.categoryId || p.category?.id) === selectedCategoryId
                    );
                    renderData(filteredProducts);
                }
            });
        }

    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
    }
    // Chọn ảnh
    document.getElementById('modalFileInput')?.addEventListener('change', previewImageModal);
});

// =======================================================
// Lấy danh sách sản phẩm
// =======================================================
async function getProducts() {
    const { data, errormsg } = await getData("products");
    if (errormsg) throw new Error(errormsg);
    return data || [];
}


// =======================================================
// MỞ MODAL
// Nếu có id -> Chế độ sửa
// Không có id -> Thêm mới
// =======================================================
async function openProductModal(id = null) {
    const modal = document.getElementById("productModal");
    const form = document.getElementById("productForm");
    const title = document.getElementById("modalTitle");
    const inputId = document.getElementById("inputId");

    // Reset form
    form.reset();

    // Reset ảnh
    modalSelectedImageBase64 = null;
    modalExistingImageUrl = null;
    const modalImg = document.getElementById('modalImgPreview');
    if (modalImg) {
        modalImg.style.display = 'none';
        modalImg.src = '#';
    }

    if (id) {
        // ====================== // CHỈNH SỬA // ======================
        title.textContent = "Chỉnh sửa sản phẩm";
        inputId.value = id;

        const product = allProducts.find(p => p.id === Number(id));
        if (product) {
            // Đổ dữ liệu vào form
            fillForm(product);
            // Load danh mục
            await loadCategories(product.category?.id || product.categoryId);
            // Hiển thị ảnh cũ
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
        // ====================== // THÊM MỚI // ======================
        title.textContent = "Thêm sản phẩm mới";
        inputId.value = "";
        await loadCategories();
    }
    // Hiện modal
    modal.style.display = "flex";
}

// =======================================================
// Đóng modal
// =======================================================
function closeProductModal() {
    document.getElementById("productModal").style.display = "none";
}

// =======================================================
// LƯU SẢN PHẨM
// =======================================================
async function handleSaveProduct(event) {
    // Không cho form reload trang
    event.preventDefault();
    const productId = document.getElementById("inputId").value;
    // true = sửa
    // false = thêm
    const isEditing = !!productId;
    const saveBtn = document.getElementById("btnSaveProduct");
    // Gom dữ liệu từ form
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
            // ===================== // CẬP NHẬT // =====================
            const { data, error } = await updateData("products", productId, productData);
            if (error) {
                alert("Lỗi: " + (error.message || error));
                return;
            }
            // Cập nhật lại dữ liệu local
            const idx = allProducts.findIndex(p => p.id === Number(productId));
            if (idx !== -1) allProducts[idx] = data;

            if (!data.imageUrl && modalSelectedImageBase64) {
                allProducts[idx].imageUrl = modalSelectedImageBase64;
            }
            alert("Cập nhật thành công!");
        } else {
            // ===================== // THÊM MỚI // =====================
            const { data: newData, error } = await createData("products", productData);
            if (error) {
                alert("Lỗi: " + (error.message || error));
                return;
            }

            if (!newData.imageUrl && modalSelectedImageBase64) {
                newData.imageUrl = modalSelectedImageBase64;
            }
            // Thêm lên đầu danh sách
            allProducts.unshift(newData);
            alert("Thêm mới thành công!");
        }
        // Đóng modal
        closeProductModal();
        // Render lại bảng
        renderData(allProducts);

    } catch (err) {
        alert("Lỗi: " + err.message);
    } finally {
        // Mở lại nút lưu
        saveBtn.disabled = false;
        saveBtn.textContent = "Lưu sản phẩm";
    }
}

// =======================================================
// Load danh sách category
// =======================================================
async function loadCategories(selectedId = null) {
    const select = document.getElementById("inputCategory");
    try {
        const { data } = await getData("categories");
        // Render option cho select
        select.innerHTML = `<option value="">-- Chọn danh mục --</option>` +
            data.map(cat => `<option value="${cat.id}" ${cat.id === selectedId ? 'selected' : ''}>${cat.name}</option>`).join("");
    } catch (err) {
        console.error("Lỗi load danh mục:", err);
    }
}

// =======================================================
// Đổ dữ liệu sản phẩm vào form
// =======================================================
function fillForm(p) {
    document.getElementById("inputName").value = p.name || "";
    document.getElementById("inputPrice").value = p.price || 0;
    document.getElementById("inputStock").value = p.remaining || 0;
    document.getElementById("inputSku").value = p.sku || "";
}

// =======================================================
// Xóa sản phẩm
// =======================================================
async function handleDelete(id, name) {
    // Xác nhận trước khi xóa
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) return;
    try {
        // Xóa trên server
        await deleteData("products", id);
        // Xóa trong mảng
        allProducts = allProducts.filter(p => p.id !== id);
        // Render lại bảng
        renderData(allProducts);
    } catch (err) {
        alert("Lỗi xóa: " + err.message);
    }
}


// =======================================================
// Render phần thống kê
// =======================================================
function renderProductsSummary(products) {
    const stats = document.getElementById("product-Stats");
    if (!stats) return;
    // Tổng sản phẩm
    const totalProducts = products.length;
    // Tổng số lượng tồn
    const totalRemaining = products.reduce((sum, p) => sum + p.remaining, 0);
    // Đếm số danh mục
    const totalCategory = new Set(products.map(p => p.category?.id || p.categoryId)).size;
    // Hiển thị thống kê
    stats.innerHTML =
        summary("Tổng Sản Phẩm", totalProducts, "blue") +
        summary("Tổng tồn kho", totalRemaining, "orange") +
        summary("Danh mục", totalCategory, "green");
}

// =======================================================
// Render lại giao diện
// =======================================================
function renderData(data) {
    // Render thống kê
    renderProductsSummary(data);
    // Render bảng
    renderTable('productTable', productConfigs, data);
}