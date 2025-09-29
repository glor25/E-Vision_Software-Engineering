import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { randomInt } from 'crypto';
import { error } from 'console';
const prisma = new PrismaClient();

dotenv.config();


ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobeStatic.path);

async function generateRandomThumbnailAndUpload(
    videoUrl: string,
    videoId: string,
    s3Client: S3Client,
    bucketName: string
): Promise<string> {
    const duration = await new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(videoUrl, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
        });
    });

    const randomTime = randomInt(1, Math.max(2, Math.floor(duration - 1)));
    const localPath = path.resolve(`./${videoId}.jpg`);
    const thumbnailKey = `thumbnails/${videoId}.jpg`;

    await new Promise<void>((resolve, reject) => {
        ffmpeg(videoUrl)
            .on('end', () => resolve())
            .on('error', (err, _stdout, _stderr) => reject(err)) // <-- Fix here
            .screenshots({
            timestamps: [randomTime],
            filename: `${videoId}.jpg`,
            folder: './',
            size: '320x240',
        });
    });


    const fileBuffer = fs.readFileSync(localPath);
    await s3Client.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbnailKey,
            Body: fileBuffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
        })
    );

    return thumbnailKey;
}


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
        key: (req, file, cb) => cb(null, `videos/${Date.now()}-${file.originalname}`)
    })
});

export const uploadVideo: RequestHandler[] = [
    upload.single('file'),
    async (req, res, next) => {
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
        res.status(400).json({ message: 'Title, category, and description are required' });
        return;
    }

    const file = req.file as Express.MulterS3.File;
    if (!file) {
        res.status(400).json({ message: 'No video file uploaded' });
        return;
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.WASABI_BUCKET!,
            Key: file.key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Get duration in seconds
        const durationSeconds = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(signedUrl, (err, metadata) => {
                if (err) return reject(err);
                resolve(metadata.format.duration || 0);
            });
        });


        const videoId = file.key.split('/').pop()!.split('.')[0];
        const thumbnailKey = await generateRandomThumbnailAndUpload(
            signedUrl,
            videoId,
            s3Client,
            process.env.WASABI_BUCKET!
        );

        const video = await prisma.vids.create({
            data: {
                name: file.originalname,
                title,
                category,
                description,
                filePath: file.location,
                fileKey: file.key,
                uploadTime: new Date(),
                fileDuration: durationSeconds,
                thumbnail: thumbnailKey,
            },
        });

        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error uploading video' });
    }

    next();
  },
];


export const getVideoUrl: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);                                    
    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid video id" });
        return;
    }

    const record = await prisma.vids.findUnique({
        where: { id },
        select: { fileKey: true }
    });

    if (!record) {
        res.status(404).json({ message: "Video not found" });
        return;
    }

    const command = new GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET!,
        Key: record.fileKey
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ url });
};

export const getThumbnailUrl: RequestHandler = async (req, res) => {
    const {fileKey} = req.body;
    if (!fileKey || typeof fileKey !== 'string') {
        res.status(400).json({ message: "File key is required" });
        return;
    }
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.WASABI_BUCKET!,
            Key: fileKey
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.status(200).json({ url });
        return;
    } catch (e) {
        res.status(400).json({ message: "Failed to get the url", error: e });
    }
};

export const getAllVideos:RequestHandler = async (req, res, next) => {
    try {
        const videos = await prisma.vids.findMany();
        res.status(200).json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching videos' });
        next(error);
    }
};

export const getPaginate: RequestHandler = async (req, res, next) => {
    try{
        const { page = 1, limit = 10 } = req.body;
        let userId: number | undefined = undefined;

        if (req.body.userId) {
            userId = Number(req.body.userId);
        }
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);

        if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber <= 0 || pageSize <= 0) {
            res.status(400).json({ message: 'Invalid pagination parameters' });
            return;
        }


        const skip = (pageNumber - 1) * pageSize;
        let videos;
        if(req.body.search){
            // Get only favorite videos for the user that match the search
            if (userId && req.body.onlyFavorite) {
                const favoriteVideoIds = await prisma.favoriteVideo.findMany({
                    where: {
                        userId: userId,
                        video: {
                            OR: [
                                { title: { contains: req.body.search, mode: 'insensitive' } },
                                { category: { contains: req.body.search, mode: 'insensitive' } },
                                { description: { contains: req.body.search, mode: 'insensitive' } },
                            ],
                        },
                    },
                    select: { videoId: true },
                });
                const ids = favoriteVideoIds.map(fav => fav.videoId);
                videos = await prisma.vids.findMany({
                    where: {
                        id: { in: ids },
                    },
                    skip,
                    take: pageSize,
                });
            } else {
                videos = await prisma.vids.findMany({
                    skip,
                    take: pageSize,
                    where: {
                        OR: [
                            { title: { contains: req.body.search, mode: 'insensitive' } },
                            { category: { contains: req.body.search, mode: 'insensitive' } },
                            { description: { contains: req.body.search, mode: 'insensitive' } },
                        ],
                    },
                });
            }
        }else{
            if (userId && req.body.onlyFavorite) {
                const favoriteVideoIds = await prisma.favoriteVideo.findMany({
                    where: { userId: userId },
                    select: { videoId: true },
                });
                const ids = favoriteVideoIds.map(fav => fav.videoId);
                videos = await prisma.vids.findMany({
                    where: { id: { in: ids } },
                    skip,
                    take: pageSize,
                });
            } else {
                videos = await prisma.vids.findMany({
                    skip,
                    take: pageSize,
                });
            }
        }
        

        const totalVideos = await prisma.vids.count();
        const totalPages = Math.ceil(totalVideos / pageSize);

        res.status(200).json({
            currentPage: pageNumber,
            totalPages,
            pageSize,
            totalVideos,
            videos,
        });
    }catch(e){
        console.log(e);
        res.status(500).json({message: 'Error fetching data'});
        next(e);
    }
}


// Update a video
export const updateVideo: RequestHandler[] = [
    upload.single('file'),
    async (req, res, next) => {
        const { id } = req.params;
        const { title, category, description } = req.body;
    
        if (!title || !category || !description) {
            res.status(400).json({ message: 'Title, category, and description are required' });
            return;
        }
    
        const newFile = req.file as Express.MulterS3.File;
        try {
            const existingVideo = await prisma.vids.findUnique({
                where: { id: parseInt(id, 10) }
            });

            if (!existingVideo) {
                res.status(404).json({ message: 'Video not found' });
                return;
            }

            let filePath = existingVideo.filePath;
            let fileKey = existingVideo.fileKey;
            let name = existingVideo.name;
            let fileDuration = existingVideo.fileDuration;
            let thumbnail = existingVideo.thumbnail;

            if (newFile) {
                const command = new GetObjectCommand({
                    Bucket: process.env.WASABI_BUCKET!,
                    Key: newFile.key,
                });
                const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

                const durationSeconds = await new Promise<number>((resolve, reject) => {
                    ffmpeg.ffprobe(signedUrl, (err, metadata) => {
                        if (err) return reject(err);
                        resolve(metadata.format.duration || 0);
                    });
                });
                
                fileDuration = durationSeconds / 60;

                const videoId = newFile.key.split('/').pop()!.split('.')[0];
                thumbnail = await generateRandomThumbnailAndUpload(
                    signedUrl,
                    videoId,
                    s3Client,
                    process.env.WASABI_BUCKET!
                );
            }

            if (newFile) {
                try {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.WASABI_BUCKET!,
                        Key: existingVideo.fileKey,
                    }));
                    
                    if (existingVideo.thumbnail) {
                        await s3Client.send(new DeleteObjectCommand({
                            Bucket: process.env.WASABI_BUCKET!,
                            Key: existingVideo.thumbnail,
                        }));
                    }
                } catch (err) {
                    console.error('Error deleting old video from S3:', err);
                    res.status(500).json({ message: 'Error deleting old video from storage' });
                    return;
                }

                // Set new file data
                filePath = newFile.location;
                fileKey = newFile.key;
                name = newFile.originalname;
            }

            // Update database
            const updatedVideo = await prisma.vids.update({
                where: { id: parseInt(id, 10) },
                data: {
                    title,
                    category,
                    description,
                    filePath,
                    fileKey,
                    name,
                    uploadTime: new Date(),
                    fileDuration,
                    thumbnail,
                }
            });

            res.status(200).json({ message: 'Video updated successfully', video: updatedVideo });

        } catch (err) {
            console.error('Error updating video:', err);
            res.status(500).json({ message: 'Error updating video' });
        }
    }
];

// Delete a video
export const deleteVideo:RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const video = await prisma.vids.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }
        
        const command = new GetObjectCommand({
            Bucket: process.env.WASABI_BUCKET!,
            Key: video.fileKey,
        });

        try {
            await s3Client.send(command);
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.WASABI_BUCKET!,
                Key: video.fileKey,
            }));
        } catch (error) {
            console.log('Error deleting video from S3:', error);
            res.status(500).json({ message: 'Error deleting video from storage' });
            return;
        }
        
        await prisma.vids.delete({
            where: { id: parseInt(id, 10) },
        });

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting video' });
        next(error);
    }
};

export const countVideos: RequestHandler = async (req, res, next) => {
    try {
        const search = req.query.search;
        let count;
        if(search){
            count = await prisma.vids.count(
                {
                    where: {
                        OR: [
                            { title: { contains: search as string, mode: 'insensitive' } },
                            { category: { contains: search as string, mode: 'insensitive' } },
                            { description: { contains: search as string, mode: 'insensitive' } },
                        ],
                    },
                }
            );
        }else{
            count = await prisma.vids.count();
        }
        
        res.status(200).json({ totalVideos: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error counting videos' });
        next(error);
    }
};

// Get a single video by ID
export const getVideoById:RequestHandler = async (req, res, next) => {
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
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching video' });
        next(error);
    }
};

export const toggleFavorite: RequestHandler = async (req, res, next) => {
    const { userId, videoId } = req.body;

    if (!userId || !videoId) {
        res.status(400).json({ message: 'userId and videoId are required' });
        return;
    }

    try {
        const existing = await prisma.favoriteVideo.findFirst({
            where: {
                userId: Number(userId),
                videoId: Number(videoId),
            },
        });

        if (existing) {
            await prisma.favoriteVideo.delete({
                where: { id: existing.id },
            });
            res.status(200).json({ message: 'Favorite removed successfully', isFavorite: false });
        } else {
            const favorite = await prisma.favoriteVideo.create({
                data: {
                    userId: Number(userId),
                    videoId: Number(videoId),
                },
            });
            res.status(201).json({ message: 'Favorite added successfully', favorite, isFavorite: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling favorite' });
        next(error);
    }
};

export const isFavorite: RequestHandler = async (req, res, next) => {
    const { userId, videoId } = req.params;

    if (!userId || !videoId) {
        res.status(400).json({ message: 'userId and videoId are required' });
        return;
    }

    try {
        const favorite = await prisma.favoriteVideo.findFirst({
            where: {
                userId: Number(userId),
                videoId: Number(videoId),
            },
        });

        res.status(200).json({ isFavorite: !!favorite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking favorite status' });
        next(error);
    }
};

export const getMyFavorites: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
    }

    try {
        const favorites = await prisma.favoriteVideo.findMany({
            where: { userId: Number(userId) },
            include: {
                video: true
            }
        });

        res.status(200).json({ favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching favorites' });
        next(error);
    }
};