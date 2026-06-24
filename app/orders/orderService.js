import { API } from "./api.js";
const endpoint = ('/orders')
const orderService = {
    fetchOrders: () => {      
        return API(endpoint)
    }
}
export default orderService