import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
        key: (req, file, cb) => cb(null, `posts/${Date.now()}-${file.originalname}`)
    })
});

export const createPost = [
    upload.array('pictures', 10),
    async (req: Request, res: Response) => {
        try {
            const { title, content, userId } = req.body;
            const files = req.files as Express.Multer.File[];

            const pictureKeys: string[] = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const s3File = file as Express.MulterS3.File;
                    pictureKeys.push(s3File.key);
                }
            }

            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    userId: Number(userId),
                    pictures: {
                        create: pictureKeys.map((key: string) => ({
                            url: key,
                        })),
                    },
                },
                include: {
                    pictures: true,
                },
            });
            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({ error: `Failed to create post : ${error}` });
        }
    }
];


export const getPosts = async (_req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        profile: true, 
                    },
                },
                pictures: true,
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        const signedPosts = await Promise.all(
            posts.map(async (post) => {
            let profileUrl = null;
            if (post.user?.profile) {
                const command = new GetObjectCommand({
                    Bucket: process.env.WASABI_BUCKET!,
                    Key: post.user.profile,
                });
                profileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            }
            
            const signedPictures = await Promise.all(
                post.pictures.map(async (picture) => {
                const picCommand = new GetObjectCommand({
                    Bucket: process.env.WASABI_BUCKET!,
                    Key: picture.url,
                });
                const signedUrl = await getSignedUrl(s3Client, picCommand, { expiresIn: 3600 });
                return {
                    url: signedUrl,
                };
                })
            );

            return {
                ...post,
                user: post.user
                ? {
                    ...post.user,
                    profile: profileUrl,
                    }
                : null,
                pictures: signedPictures,
                commentCount: post._count?.comments ?? 0,
            };
            })
        );
        res.status(200).json({signedPosts});
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch posts ${error}` });
    }
};


export const updatePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, pictures } = req.body;

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: {
                title,
                content,
            },
            include: {
                pictures: true,
            },
        });

        if (pictures) {
            await prisma.picture.deleteMany({ where: { postId: updatedPost.id } });
            await prisma.picture.createMany({
                data: pictures.map((url: string) => ({
                    url,
                    postId: updatedPost.id,
                })),
            });
        }

        const postWithPictures = await prisma.post.findUnique({
            where: { id: updatedPost.id },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        profile: true,
                    },
                },
                pictures: true,
            },
        });

        res.json(postWithPictures);
    } catch (error) {
        res.status(500).json({ error: `Failed to update post ${error}` });
    }
};


export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pictures = await prisma.picture.findMany({ where: { postId: Number(id) } });
        for (const picture of pictures) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.WASABI_BUCKET!,
                Key: picture.url,
            });
            await s3Client.send(deleteCommand);
        }
        await prisma.picture.deleteMany({ where: { postId: Number(id) } });        
        await prisma.comment.deleteMany({ where: { postId: Number(id) } });
        await prisma.post.delete({ where: { id: Number(id) } });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: `Failed to delete post ${error}` });
    }
};

export const getPostWithComments = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        profile: true,
                    },
                },
                pictures: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                userName: true,
                                profile: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        let profileUrl = null;
        if (post.user?.profile) {
            const command = new GetObjectCommand({
                Bucket: process.env.WASABI_BUCKET!,
                Key: post.user.profile,
            });
            profileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        }

        const commentsWithProfile = await Promise.all(
            post.comments.map(async (comment) => {
                let commentProfileUrl = null;
                if (comment.user?.profile) {
                    const command = new GetObjectCommand({
                        Bucket: process.env.WASABI_BUCKET!,
                        Key: comment.user.profile,
                    });
                    commentProfileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                }
                return {
                    ...comment,
                    user: comment.user
                        ? {
                                ...comment.user,
                                profile: commentProfileUrl,
                            }
                        : null,
                };
            })
        );

        res.json({
            ...post,
            user: post.user
                ? {
                        ...post.user,
                        profile: profileUrl,
                    }
                : null,
            comments: commentsWithProfile,
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch post and comments: ${error}` });
    }
};


export const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        profile: true,
                    },
                },
                pictures: true,
                _count: {
                    select: { comments: true }
                }
            },
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        let profileUrl = null;
        if (post.user?.profile) {
            const command = new GetObjectCommand({
                Bucket: process.env.WASABI_BUCKET!,
                Key: post.user.profile,
            });
            profileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        }

        const signedPictures = await Promise.all(
            post.pictures.map(async (picture) => {
            const picCommand = new GetObjectCommand({
                Bucket: process.env.WASABI_BUCKET!,
                Key: picture.url,
            });
            const signedUrl = await getSignedUrl(s3Client, picCommand, { expiresIn: 3600 });
            return {
                url: signedUrl,
            };
            })
        );

        res.status(200).json({
            ...post,
            user: post.user
                ? {
                    ...post.user,
                    profile: profileUrl,
                }
                : null,
            pictures: signedPictures,
            commentCount: post._count?.comments ?? 0,
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch post: ${error}` });
    }
};

export const getCommentsByPostId = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        userName: true,
                        profile: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        const commentsWithProfile = await Promise.all(
            comments.map(async (comment) => {
                let profileUrl = null;
                if (comment.user?.profile) {
                    const command = new GetObjectCommand({
                        Bucket: process.env.WASABI_BUCKET!,
                        Key: comment.user.profile,
                    });
                    profileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                }
                return {
                    ...comment,
                    user: comment.user
                        ? {
                            ...comment.user,
                            profile: profileUrl,
                        }
                        : null,
                };
            })
        );

        res.status(200).json(commentsWithProfile);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch comments: ${error}` });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const {postId} = req.params;
        const { userId, content } = req.body;
        if (!postId || !userId || !content) {
            res.status(400).json({ error: 'postId, userId, and content are required' });
            return;
        }

        const comment = await prisma.comment.create({
            data: {
                postId: Number(postId),
                userId: Number(userId),
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        profile: true,
                    },
                },
            },
        });

        let profileUrl = null;
        if (comment.user?.profile) {
            const command = new GetObjectCommand({
                Bucket: process.env.WASABI_BUCKET!,
                Key: comment.user.profile,
            });
            profileUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        }

        res.status(201).json({
            ...comment,
            user: comment.user
                ? {
                    ...comment.user,
                    profile: profileUrl,
                }
                : null,
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to create comment: ${error}` });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const id = Number(commentId);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid commentId' });
            return;
        }
        const comment = await prisma.comment.findUnique({
            where: { id },
        });

        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        await prisma.comment.delete({
            where: { id: Number(commentId) },
        });

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: `Failed to delete comment: ${error}` });
    }
};