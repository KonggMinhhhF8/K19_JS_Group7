const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com'
localStorage.getItem('accessToken')
localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJrMTgtc3RvcmUiLCJzdWIiOiIxIiwiZXhwIjoxNzgyODAzMzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzgyODAyNzEwLCJlbWFpbCI6ImJhbmd0eEB0ZXN0LmNvbSJ9.d7qdbhFbf5EURVDpd4R7uh4ua2DWaWobGqZyLhvwl5c')
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
        if (!response.ok) alert('Order data loading error')
        return await response.json()
        
    } catch (error) {
        console.log(error)
        alert('Unable to load the order list, please try again!')
    }
}
export {resquest as API}