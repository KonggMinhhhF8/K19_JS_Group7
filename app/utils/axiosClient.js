const BASE_URL = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";
const TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJrMTgtc3RvcmUiLCJzdWIiOiIxIiwiZXhwIjoxNzgyNTcxODE2LCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzgyNTcxMjE2LCJlbWFpbCI6ImJhbmd0eEB0ZXN0LmNvbSJ9.xgM_0n-l39-B9hs4qC1iynpQLTwlFaIWGJpu_N8NeAM";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        if (TOKEN) {
            config.headers.Authorization = `Bearer ${TOKEN}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error("Lỗi hệ thống", error.response?.status || error.message);
        return Promise.reject(error);
    },
);

export default axiosClient;
