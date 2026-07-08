import orderService from "./service/orderService.js"

const data = await orderService.fetchOrders()


const headers = [
    {
        key: 'id',
        value: 'Mã vận đơn'
    },
    {
        key: 'customer.name',
        value: 'Khách hàng'
    },
    {
        key: 'product.name',
        value: 'Sản phẩm'
    }
]

const statusArr = ['Chờ xử lý', 'Đang giao', 'Đã xong']
const statusMap = {
    'pending' : 'Chờ xử lý',
    'delivering': 'Đang giao',
    'cancel' : 'Đã hủy',
    'done' : 'Hoàn thành'
}

const countStatusArr = {
    pending: 0,
    cancel: 0,
    delivering: 0,
    done : 0
}


let currentSatus = 'all'
let currentData = ''

const loadDataOrderStatus = (data) => {
    const statusEl = document.querySelector('.stats')
    
    for(const order of data) {
        if(order.status === 'pending') countStatusArr.pending++
        else if(order.status === 'cancel') countStatusArr.cancel++
        else if(order.status === 'delivering') countStatusArr.delivering++
        else if(order.status === 'done') countStatusArr.done++
    }

    const allStatusEl = statusEl.querySelector('.card.blue > p')
    const pendingStatusEl = statusEl.querySelector('.card.orange > p')
    const cancelStatusEl = statusEl.querySelector('.card.red > p')
    const doneStatusEl = statusEl.querySelector('.card.green > p')

    allStatusEl.innerText = `${data.length}`
    pendingStatusEl.innerText = `${Number(countStatusArr.pending) + Number(countStatusArr.delivering)}`
    cancelStatusEl.innerText = `${countStatusArr.cancel}`
    doneStatusEl.innerText = `${countStatusArr.done}`
}

const loadDataTable = (data, tbodyEl) => {
    if (!tbodyEl) {
        const mainContentEl = document.querySelector('.main-content')
        tbodyEl = mainContentEl.querySelector('tbody')
    } 
    tbodyEl.innerHTML = ''
    for(const row of data) {
        const trEl = document.createElement('tr')
        for(const value of headers) {
            const tdEl = document.createElement('td')
            const tmp = value.key.split('.').reduce((acc, key) => {
                return (acc && acc[key] != undefined) ? acc[key] : undefined
            }, row)
            tdEl.innerText = `${tmp}`
            if(value.value === 'Khách hàng') {
                const brEl = document.createElement('br')
                tdEl.append(brEl)
                const sdt = row.customer.phone
                const smallEl = document.createElement('small')
                smallEl.innerText = `${sdt}`
                tdEl.append(smallEl)             
            }
            trEl.append(tdEl)
        }

        const amount = Number(row.amount)
        const price = Number(row.product.price)
        const total = amount * price
        const totalEl = document.createElement('td')
        totalEl.innerText = `${total.toLocaleString('vi')} đ`
        trEl.append(totalEl)

        const tdStatusEl = document.createElement('td')
        const spanStatusEl = document.createElement('span')
        const tdActionEl = document.createElement('td')
        const button1El = document.createElement('button')
        const button2El = document.createElement('button')
        const button3El = document.createElement('button')
        button1El.setAttribute('class', 'btn-action')
        button2El.setAttribute('class', 'btn-action')
        button3El.setAttribute('class', 'btn-action')
        if(row.status === 'done') {
            const i1El = document.createElement('i')
            const i2El = document.createElement('i')
            spanStatusEl.innerText = 'Hoàn thành'
            spanStatusEl.setAttribute('class', 'badge completed')
            button1El.setAttribute('title', 'Xem chi tiết')
            i1El.setAttribute('class', 'fas fa-eye')
            button2El.setAttribute('title', 'In hóa đơn')
            i2El.setAttribute('class', 'fas fa-print')
            button1El.append(i1El)
            button2El.append(i2El)
            button1El.addEventListener('click', () => {
                openOrderDetailModal(row)
            })
            tdActionEl.append(button1El)
            tdActionEl.append(button2El)
        } else if(row.status === 'pending'){
            const i1El = document.createElement('i')
            const i2El = document.createElement('i')
            spanStatusEl.innerText = 'Chờ xử lý'
            spanStatusEl.setAttribute('class', 'badge pending')
            button1El.setAttribute('title', 'Xử lý')
            i1El.setAttribute('class', 'fas fa-check')
            button2El.setAttribute('title', 'Hủy đơn')
            i2El.setAttribute('class', 'fas fa-times')
            button1El.append(i1El)
            button1El.addEventListener('click', async () => {
                if(window.confirm('Do you agree to confirm the order?')) {
                    await updateStatusOrder('delivering', row)
                }
            })
            button2El.append(i2El)
            button2El.addEventListener('click', async () => {
                if(window.confirm('Do you agree to confirm the order?')) {
                    await updateStatusOrder('cancel', row)
                }
            })
            tdActionEl.append(button1El)
            tdActionEl.append(button2El)
        } else if(row.status === 'delivering'){
            const i1El = document.createElement('i')
            const i2El = document.createElement('i')
            spanStatusEl.innerText = 'Đang giao'
            spanStatusEl.setAttribute('class', 'badge shipping')
            button1El.setAttribute('title', 'Xem chi tiết')
            i1El.setAttribute('class', 'fas fa-eye')
            button2El.setAttribute('title', 'In hóa đơn')
            i2El.setAttribute('class', 'fas fa-print')
            button1El.append(i1El)
            button2El.append(i2El)
            button1El.addEventListener('click', () => {
                openOrderDetailModal(row)
            })
            tdActionEl.append(button1El)
            tdActionEl.append(button2El)
        } else if (row.status === 'cancel'){
            const i1El = document.createElement('i')
            spanStatusEl.innerText = 'Đã hủy'
            spanStatusEl.setAttribute('class', 'badge cancelled')
            button1El.setAttribute('title', 'Xem chi tiết')
            i1El.setAttribute('class', 'fas fa-eye')
            button1El.append(i1El)
            button1El.addEventListener('click', () => {
                openOrderDetailModal(row)
            })
            tdActionEl.append(button1El)
        }
        const i3El = document.createElement('i')
        i3El.setAttribute('class', 'fas fa-pencil')
        button3El.append(i3El)
        button3El.addEventListener('click', () => {
            window.location.href = `create-order/create-order.html?id=${row.id}`
            localStorage.setItem('order', JSON.stringify(row))
        })
        tdActionEl.append(button3El)

        tdStatusEl.append(spanStatusEl)
        trEl.append(tdStatusEl)
        trEl.append(tdActionEl)

        tbodyEl.append(trEl)
    }
}

const renderOrderTable = (data) => {
    const tableEl = document.createElement('table')

    const theadEl = document.createElement('thead')
    const trHeadEl = document.createElement('tr')
    for(const title of headers) {
        const thEl = document.createElement('th')
        thEl.innerText = `${title.value}`
        trHeadEl.append(thEl)
    }
    const thTotalEl = document.createElement('th')
    thTotalEl.innerText = `Tổng tiền`
    trHeadEl.append(thTotalEl)
    const thStatusEl = document.createElement('th')
    thStatusEl.innerText = `Trạng thái`
    trHeadEl.append(thStatusEl)
    const thActionEl = document.createElement('th')
    thActionEl.innerText = `Thao tác`
    trHeadEl.append(thActionEl)
    theadEl.append(trHeadEl)
    tableEl.append(theadEl)
    
    const tbodyEl = document.createElement('tbody')
    loadDataTable(data, tbodyEl)
    tableEl.append(tbodyEl)
    
    return tableEl
}

const applyFilter = (data) => {
    if(currentSatus === 'all' && currentData === '') return loadDataTable(data)
    const fillterData = data.filter(row => {
        let isStatus = (currentSatus === 'all' || currentSatus === row.status)
        let isData = true
        if(currentData !== '') {
            if (currentData !== row.date) isData = false
        }
        return isStatus && isData
    })
    loadDataTable(fillterData)
}

const renderOrderContentsTable = (data) => {
    const mainContentEl = document.querySelector('.main-content')

    const tableContainerEl = document.querySelector('.table-container')
    tableContainerEl.innerHTML =''
    //---
    const orderControlsEl = document.createElement('div')
    orderControlsEl.setAttribute('class', 'order-controls')

    const tabsEl = document.createElement('div')
    tabsEl.setAttribute('class', 'tabs')

    const buttonEl = document.createElement('button')
    buttonEl.setAttribute('class', 'tab active')
    buttonEl.innerText = `Tất cả`
    buttonEl.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'))
        buttonEl.setAttribute('class', 'tab active')
        currentSatus = 'all'
        applyFilter(data)
    })
    tabsEl.append(buttonEl)
    for(const status in statusMap) {
        const buttonEl = document.createElement('button')
        buttonEl.setAttribute('class', 'tab')
        buttonEl.innerText = `${statusMap[status]}`
        buttonEl.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'))
            buttonEl.setAttribute('class', 'tab active')
            currentSatus = status
            applyFilter(data)
        })
        tabsEl.append(buttonEl)
    }

    const dateFilterEl = document.createElement('div')
    const inputDateFilterEl = document.createElement('input')
    inputDateFilterEl.setAttribute('type', 'date')
    inputDateFilterEl.setAttribute('style', 'padding: 5px; border: 1px solid')
    inputDateFilterEl.addEventListener('change', (e) => {
        currentData = e.target.value
        applyFilter(data)
    })
    dateFilterEl.append(inputDateFilterEl)


    orderControlsEl.append(tabsEl)
    orderControlsEl.append(dateFilterEl)

    tableContainerEl.append(orderControlsEl)
    tableContainerEl.append(renderOrderTable(data))
    mainContentEl.append(tableContainerEl)
    
}

const searchOrder = (keyword) => {
    if(keyword === '') {
        loadDataTable(data) 
        return
    }
    
    const searchResult = data.filter(row => {
        const id = String(row.id).toLocaleLowerCase().trim()
        const name = String(row.customer.name).toLocaleLowerCase().trim()
        return id.includes(keyword) || name.includes(keyword)
    })

    loadDataTable(searchResult)
}

const onSearch = () => {
    const searchBarEl = document.querySelector('.search-bar')
    searchBarEl.addEventListener('input', (e) => {
        searchOrder(e.target.value.toLocaleLowerCase().trim())
    })
}

const onLogout = () => {
    const logoutBtn = document.querySelector('#logoutBtn')
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "../login/index.html";
        });
    }
}

const onCreateOrder = () => {
    const btnCreateOrderEl = document.querySelector('.btn-create-order')
    if(btnCreateOrderEl) {
        btnCreateOrderEl.addEventListener('click', async () => {
            window.location.href = 'create-order/create-order.html'
        })
    }
}

const updateStatusOrder = async (newStatus, order = {}) => {
    const data = {
        productId: order.product.id,
        customerId: order.customer.id,
        amount: order.amount,
        status: newStatus
    }
    try {
        const res =  await orderService.putOrders(data, order.id)
        window.alert('Sucess!')
        window.location.reload()
    } catch (error) {
        window.alert('Error!')
    }
} 

const openOrderDetailModal = (row) => {
    document.getElementById('modal-title').innerText = `Chi tiết đơn hàng #${row.id}`
    document.getElementById('modal-customer-name').innerHTML = `<strong>Khách hàng:</strong> ${row.customer.name}`
    document.getElementById('modal-customer-phone').innerHTML = `<strong>Số điện thoại:</strong> ${row.customer.phone}`
    document.getElementById('modal-product-name').innerHTML = `<strong>Sản phẩm:</strong> ${row.product.name}`
    document.getElementById('modal-product-price').innerHTML = `<strong>Đơn giá:</strong> ${Number(row.product.price).toLocaleString('vi')} đ`
    document.getElementById('modal-amount').innerHTML = `<strong>Số lượng:</strong> ${row.amount}`
    
    const total = Number(row.product.price) * Number(row.amount);
    document.getElementById('modal-total').innerHTML = `Tổng tiền: ${total.toLocaleString('vi')} đ`

    document.getElementById('order-detail-modal').style.display = 'flex'
}

const createOrderDetailModal = () => {
    const orderDetailModal = document.createElement('div')
    orderDetailModal.setAttribute('id', 'order-detail-modal')
    orderDetailModal.setAttribute('class', 'modal-overlay')
    orderDetailModal.style.display = 'none'
    const modalContent = document.createElement('div')
    modalContent.setAttribute('class', 'modal-content')
    const modalHeader = document.createElement('div')
    modalHeader.setAttribute('class', 'modal-header')
    
    const modalTitle = document.createElement('h3')
    modalTitle.setAttribute('id', 'modal-title')
    
    const btnCloseModal = document.createElement('button')
    btnCloseModal.setAttribute('class', 'btn-close')
    
    const iEl = document.createElement('i')
    iEl.setAttribute('class', 'fas fa-times')
    btnCloseModal.append(iEl)
    modalHeader.append(modalTitle)
    modalHeader.append(btnCloseModal)
    const modalBody = document.createElement('div')
    modalBody.setAttribute('class', 'modal-body')
    
    const modalCustomerName = document.createElement('p')
    modalCustomerName.setAttribute('id', 'modal-customer-name')
    
    const modalCustomerPhone = document.createElement('p')
    modalCustomerPhone.setAttribute('id', 'modal-customer-phone')
    
    const line1 = document.createElement('hr')
    
    const modalProductName = document.createElement('p')
    modalProductName.setAttribute('id', 'modal-product-name')
    
    const modalProductPrice = document.createElement('p')
    modalProductPrice.setAttribute('id', 'modal-product-price')
    
    const modalAmount = document.createElement('p')
    modalAmount.setAttribute('id', 'modal-amount')
    const line2 = document.createElement('hr')
    
    const modalTotal = document.createElement('h4')
    modalTotal.setAttribute('id', 'modal-total')
    modalTotal.setAttribute('style', 'text-align: right; color: #e74c3c;')

    modalBody.append(modalCustomerName)
    modalBody.append(modalCustomerPhone)
    modalBody.append(line1)
    modalBody.append(modalProductName)
    modalBody.append(modalProductPrice)
    modalBody.append(modalAmount)
    modalBody.append(line2)
    modalBody.append(modalTotal)
    modalContent.append(modalHeader)
    modalContent.append(modalBody)
    orderDetailModal.append(modalContent)

    btnCloseModal.addEventListener('click', () => {
        orderDetailModal.style.display = 'none'
    })
    orderDetailModal.addEventListener('click', (e) => {
        if (e.target === orderDetailModal) orderDetailModal.style.display = 'none'
    })

    document.body.append(orderDetailModal)
}

const init = async () => {
    onLogout()
    renderOrderContentsTable(data)
    onSearch()
    loadDataOrderStatus(data)
    onCreateOrder()
    createOrderDetailModal()
}
init()
