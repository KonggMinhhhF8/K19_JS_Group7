import orderService from "./orderService.js"
const headers = [
    {
        key: id,
        value: 'Mã vận đơn'
    },
    {
        key: 'customer',
        value: 'Khách hàng'
    },
    {
        key: 'product[name]',
        value: 'Sản phẩm'
    }
]

const renderOrderContentsTable = (data) => {
    const tableContainerEl = document.createElement('section')
    tableContainerEl.setAttribute('class', 'table-container')

    //---
    const orderControlsEl = document.createElement('div')
    orderControlsEl.setAttribute('class', 'order-controls')

    const tabsEl = document.createElement('div')
    tabsEl.setAttribute('class', 'tabs')

    const buttonEl = document.createElement('button')
    buttonEl.setAttribute('class', 'tab')
    buttonEl.innerText = `Tất cả`
    tabsEl.append(buttonEl)
    const statusArr = ['Chờ xử lý', 'Đang giao', 'Đã xong']
    for(const status of statusArr) {
        const buttonEl = document.createElement('button')
        buttonEl.setAttribute('class', 'tab')
        buttonEl.innerText = `${status}`
        tabsEl.append(buttonEl)
    }

    const dateFilterEl = document.createElement('div')
    const inputDateFilterEl = document.createElement('div')
    inputDateFilterEl.setAttribute('type', 'date')
    inputDateFilterEl.setAttribute('style', 'padding: 5px; border: 1px solid')
    dateFilterEl.append(inputDateFilterEl)

    orderControlsEl.append(tabsEl)
    orderControlsEl.append(dateFilterEl)

    // ----
    const tableEl = document.createElement('table')
    const theadEl = document.createElement('thead')
    const trHeadEl = document.createElement('tr')
    for(title of headers) {
        const thEl = document.createElement('th')
        thEl.innerText = `${title.value}`
        trHeadEl.append(thEl)
    }
    const thStatusEl = document.createElement('th')
    thStatusEl.innerText = `Trạng thái`
    trHeadEl.append(thStatusEl)
    const thActionEl = document.createElement('th')
    thActionEl.innerText = `Thao tác`
    trHeadEl.append(thActionEl)
    theadEl.append(trHeadEl)
    tableEl.append(theadEl)
    
    const tbodyEl = document.createElement('tbody')
    for(order of data) {
        const trEl = document.createElement('tr')
        for(value of headers) {
            const td = document.createElement('td')
            
        }
    }

}





const init = async () => {
    const response = await orderService.fetchOrders()
    console.log(response)
    const res2 = await orderService.deleteOrders('5')
    console.log(res2)
}
init()
