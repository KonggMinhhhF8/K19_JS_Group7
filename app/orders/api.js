const API_URL = 'https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com'
localStorage.getItem('accessToken')
localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJrMTgtc3RvcmUiLCJzdWIiOiIxIiwiZXhwIjoxNzgyMzI0MTI0LCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzgyMzIzNTI0LCJlbWFpbCI6ImJhbmd0eEB0ZXN0LmNvbSJ9.xlH8BQ_SPTGr2qja_SpHd70gc-fY_13eZ6sIiSsVtAU')
const resquest = async (endpoint, options = {}) => {
    const accessToken = localStorage.getItem('accessToken')
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    }
    if (options.method === 'POST' || options.method === 'PUT') {
        header['Content-Type'] = 'application/json'
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