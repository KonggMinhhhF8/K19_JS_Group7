import orderService from "./orderService.js"
const init = async () => {
    const response = await orderService.fetchOrders()
    console.log(response)
}
init()