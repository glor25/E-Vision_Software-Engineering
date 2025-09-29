import axios from 'axios';

export const validateToken = async (): Promise<boolean> => {
    try {
        const host: string = import.meta.env.VITE_SERVER_URL;
        const token = localStorage.getItem('jwt_auth');

        if (!token) throw new Error('No token found');

        await axios.post(
            `${host}/validateLogin`,
            {}, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        return true; 
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};
