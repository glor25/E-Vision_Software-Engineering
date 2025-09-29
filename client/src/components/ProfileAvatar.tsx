import React from 'react';

interface ProfileAvatarProps {
    firstName: string;
    lastName: string;
    imageUrl?: string;
    size?: number;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ firstName, imageUrl, size = 40 }) => {
    const initials = `${firstName?.[0] || ''}`.toUpperCase();

    return (
        <div
        style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: imageUrl ? 'transparent' : '#FFA500',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: size * 0.4,
            color: 'white',
            fontWeight: 'bold',
        }}
        >
        {imageUrl ? (
            <img
            src={imageUrl}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        ) : (
            initials
        )}
        </div>
    );
};

export default ProfileAvatar;
