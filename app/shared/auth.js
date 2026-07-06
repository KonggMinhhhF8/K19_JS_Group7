const API_BASE_URL =
    "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("Không có refresh token");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Refresh token hết hạn");
    }

    localStorage.setItem("accessToken", result.accessToken);

    return result.accessToken;
}
