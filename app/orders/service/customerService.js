import { API } from "../api/api.js";
const endpoint = '/customers'
const customerService = {
    fetchCustomers : () => {
        return API(endpoint)
    }
}
export default customerService