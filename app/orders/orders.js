import orderService from "./orderService.js"
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

const renderOrderContentsTable = (data) => {
    const tableContainerEl = document.createElement('section')
    tableContainerEl.setAttribute('class', 'table-container')

    //---
    const orderControlsEl = document.createElement('div')
    orderControlsEl.setAttribute('class', 'order-controls')

    const tabsEl = document.createElement('div')
    tabsEl.setAttribute('class', 'tabs')

    const buttonEl = document.createElement('button')
    buttonEl.setAttribute('class', 'tab active')
    buttonEl.innerText = `Tất cả`
    tabsEl.append(buttonEl)
    for(const status of statusArr) {
        const buttonEl = document.createElement('button')
        buttonEl.setAttribute('class', 'tab')
        buttonEl.innerText = `${status}`
        tabsEl.append(buttonEl)
    }

    const dateFilterEl = document.createElement('div')
    const inputDateFilterEl = document.createElement('input')
    inputDateFilterEl.setAttribute('type', 'date')
    inputDateFilterEl.setAttribute('style', 'padding: 5px; border: 1px solid')
    dateFilterEl.append(inputDateFilterEl)

    orderControlsEl.append(tabsEl)
    orderControlsEl.append(dateFilterEl)

    // ----
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
    for(const row of data) {
        const trEl = document.createElement('tr')
        for(const value of headers) {
            const tdEl = document.createElement('td')
            const tmp = value.key.split('.').reduce((acc, key) => {
                return (acc && acc[key] != undefined) ? acc[key] : undefined
            }, row)
            tdEl.innerText = `${tmp}`
            if(value.value === 'Khách hàng') {
                console.log('da vao')
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
        totalEl.innerText = `${total}`
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
    tableEl.append(tbodyEl)
    
    tableContainerEl.append(orderControlsEl)
    tableContainerEl.append(tableEl)

    return tableContainerEl
}





const init = async () => {
    const data = await orderService.fetchOrders()
    console.log(data)
    const tableContainerElOld = document.querySelector('.table-container')
    tableContainerElOld.remove()
    const mainContentEl = document.querySelector('.main-content')
    mainContentEl.append(renderOrderContentsTable(data))
}
init()
