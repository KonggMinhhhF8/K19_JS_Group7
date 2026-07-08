import {refreshAccessToken} from '../../shared/auth.js';

const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com'

const resquest = async (endpoint, options = {}) => {
    const accessToken = localStorage.getItem('accessToken')
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    }
    if (options.method === 'POST' || options.method === 'PUT') {
        headers['Content-Type'] = 'application/json'
    }
    const config = {
        headers: headers,
        ...options
    }
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config)
        if (response.status === 401 || response.status === 403) {
            try {
                const newAccessToken = await refreshAccessToken()
                if (newAccessToken) return await resquest(endpoint, options)
            } catch (refreshError) {
                alert('Your login session has expired, please login!')
                window.location.href = '../../login/index.html'
                return
            }
        }
        if (!response.ok) {
            alert('Order data loading error')
            return
        }

        return await response.json()     
    } catch (error) {
        console.log(error)
        alert('Unable to load the order list, please try again!')
    }
}
export {resquest as API}