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

export const isTokenValid = async (token: string): Promise<boolean> => {
    try {
        const response = await axios.get('http://localhost:3001/api/auth/verify', { headers: { token } });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}; 