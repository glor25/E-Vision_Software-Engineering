import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";

const prisma = new PrismaClient();

export const metrics: RequestHandler = async (req, res, next) => {
    try{
        const community_count = await prisma.post.count();
        const video_count = await prisma.vids.count();
        // const user_count = await prisma.user.count({
        //     where: {
        //         Payment: {
        //             some: {
        //             paymentStatus: true,
        //             },
        //         },
        //     },
        // });
        const user_count = await prisma.user.count();
        const unpaid_payment_count = await prisma.user.count({
            where: {
                Payment: {
                    some: {
                    paymentStatus: false,
                    },
                },
            },
        });
        res.status(200).json({
            message: "Metrics send successfully",
            community: community_count,
            jumlahVideo: video_count,
            jumlahUser: user_count,
            dataPendaftaran: unpaid_payment_count,
        });
    }catch(e){
        next(e);
    }
}