import { API } from "../api/api.js";
const endpoint = '/products'
const productService = {
    fetchProducts : () => {
        return API(endpoint)
    }
}
export default productService