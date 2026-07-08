import { API } from "../api/api.js";
const endpoint = ('/orders')
const orderService = {
    fetchOrders: () => {      
        return API(endpoint)
    },
    postOrders: (data = {}) => {
        const option = {}
        option.method = 'POST'
        option.body = JSON.stringify(data)
        return API(endpoint, option)
    },
    putOrders: (data = {}, id) => {
        const option = {}
        option.method = 'PUT'
        option.body = JSON.stringify(data)
        return API(`${endpoint}/${id}`, option)
    },
    deleteOrders: (id) => {
        const option =  {}
        option.method = 'DELETE'
        return API(`${endpoint}/${id}`, option)
    }
}
export default orderService