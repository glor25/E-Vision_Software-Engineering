import axios from 'axios';

export const validateMembership = async (): Promise<boolean> => {
    try {
        const host: string = import.meta.env.VITE_SERVER_URL;
        const token = localStorage.getItem('jwt_auth');

        if (!token) throw new Error('No token found');

        const res = await axios.post(
            `${host}/validateMembership`,
            {}, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data.isMember;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};
