import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();
dotenv.config();

const s3Client = new S3Client({
    endpoint: process.env.WASABI_ENDPOINT,
    region: process.env.WASABI_REGION,
    credentials: {
        accessKeyId: process.env.WASABI_KEY!,
        secretAccessKey: process.env.WASABI_SECRET!
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.WASABI_BUCKET!,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => cb(null, `profilepics/${Date.now()}-${file.originalname}`)
    })
});

export const getPaginateUsers: RequestHandler = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.body;

        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);

        if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber <= 0 || pageSize <= 0) {
            res.status(400).json({ message: 'Invalid pagination parameters' });
            return;
        }

        const skip = (pageNumber - 1) * pageSize;
        let users;

        if (search) {
            console.log(`search: ${search}`);
            users = await prisma.user.findMany({
                skip,
                take: pageSize,
                where: {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { userName: { contains: search, mode: 'insensitive' } },
                    ],
                },
            });
        } else {
            users = await prisma.user.findMany({
                skip,
                take: pageSize,
            });
        }

        res.status(200).json({
            currentPage: pageNumber,
            pageSize,
            users,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching data' });
        next(e);
    }
};

export const addUser: RequestHandler = async (req, res, next) => {
    try {
        const { firstName, lastName, email, userName, password , telepon } = req.body;
        if (!firstName || !lastName || !email || !userName || !password || !telepon) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                userName,
                password,
                telepon,
            },
        });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error creating user' });
        next(e);
    }
};


export const countUsers: RequestHandler = async (req, res, next) => {
    try {
        const search = req.query.search;
        let count;
        if (search) {
            count = await prisma.user.count({
                where: {
                    OR: [
                        { firstName: { contains: search as string, mode: 'insensitive' } },
                        { lastName: { contains: search as string, mode: 'insensitive' } },
                        { email: { contains: search as string, mode: 'insensitive' } },
                        { userName: { contains: search as string, mode: 'insensitive' } },
                    ],
                },
            });
        } else {
            count = await prisma.user.count();
        }

        res.status(200).json({ totalUsers: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error counting users' });
        next(error);
    }
};

export const getVideoById: RequestHandler = async (req, res, next) => {
    const { id } = req.params;

    try {
        const video = await prisma.vids.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        res.status(200).json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching video' });
        next(error);
    }
};


export const deleteUser: RequestHandler = async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await prisma.user.delete({
            where: { id: parseInt(id, 10) },
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
        next(error);
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, email, userName, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!existingUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: {
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                email: email || existingUser.email,
                userName: userName || existingUser.userName,
                password: password || existingUser.password, // Note: Ensure password is hashed before saving in production
            },
        });

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user' });
        next(error);
    }
};

export const updateFromUser: RequestHandler[] = [ upload.single('file'),
    async (req, res, next) => { 
        const { id } = req.params;
        const { firstName, lastName, userEmail, userPhone, userPassword, userProfilePic } = req.body;
        const file = req.file as Express.MulterS3.File;
        // File is now optional; no need to return error if not present
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: parseInt(id, 10) }
            });

            if (!existingUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            if (userEmail && userEmail !== existingUser.email) {
                const emailUsed = await prisma.user.findUnique({
                    where: { email: userEmail },
                });
                if (emailUsed) {
                    res.status(400).json({ message: 'Email is already used by another user' });
                    return;
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id, 10) },
                data: {
                    firstName: firstName ?? existingUser.firstName,
                    lastName: lastName ?? existingUser.lastName,
                    email: userEmail ?? existingUser.email,
                    telepon: userPhone ?? existingUser.telepon,
                    password: userPassword ?? existingUser.password,
                    ...(file && { profile: file.key}),
                },
            });

            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating user' });
            next(error);
        }
    }
];

export const getProfilePic: RequestHandler = async(req, res, next) => {
    const {id} = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!user || !user.profile) {
            res.status(404).json({ message: 'Profile picture not found' });
            return;
        }
        const key = user.profile;
        const command = new GetObjectCommand({
            Bucket: process.env.WASABI_BUCKET!,
            Key: key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 * 7 }); 

        res.status(200).json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching profile picture' });
        next(error);
    }
}


export const getUserInfo: RequestHandler = async(req, res, next) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user info' });
        next(error);
    }
}