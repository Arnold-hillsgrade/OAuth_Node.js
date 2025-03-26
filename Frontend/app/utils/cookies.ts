import axios from "axios";

export const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
};

export const isTokenValid = async (token: string): Promise<any> => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify`, { headers: { token } });
        return response;
    } catch (error) {
        return false;
    }
}; 