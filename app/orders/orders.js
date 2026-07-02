import orderService from "./orderService.js"

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
        button1El.setAttribute('class', 'btn-action')
        button2El.setAttribute('class', 'btn-action')
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
            button2El.append(i2El)
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
            tdActionEl.append(button1El)
            tdActionEl.append(button2El)
        } else if (row.status === 'cancel'){
            const i1El = document.createElement('i')
            spanStatusEl.innerText = 'Đã hủy'
            spanStatusEl.setAttribute('class', 'badge cancelled')
            button1El.setAttribute('title', 'Xem chi tiết')
            i1El.setAttribute('class', 'fas fa-eye')
            button1El.append(i1El)
            tdActionEl.append(button1El)
        }
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
            window.location.href = 'create-order.html'
        })
    }
}


const init = async () => {
    onLogout()
    renderOrderContentsTable(data)
    onSearch()
    loadDataOrderStatus(data)
    onCreateOrder()
}
init()
