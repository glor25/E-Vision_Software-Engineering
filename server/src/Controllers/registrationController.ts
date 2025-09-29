import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';

const prisma = new PrismaClient();

export const getPaginatePayment: RequestHandler = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.body;
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);

        if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber <= 0 || pageSize <= 0) {
            res.status(400).json({ message: 'Invalid pagination parameters' });
            return;
        }


        const skip = (pageNumber - 1) * pageSize;
        let users;
        if (req.body.search) {
            users = await prisma.user.findMany({
                skip,
                take: pageSize,
                where: {
                    OR: [
                        { firstName: { contains: req.body.search, mode: 'insensitive' } },
                        { lastName: { contains: req.body.search, mode: 'insensitive' } },
                        { email: { contains: req.body.search, mode: 'insensitive' } },
                        { telepon: { contains: req.body.search, mode: 'insensitive' } },
                    ],
                },
                include: {
                    Payment: {
                        orderBy: {
                            paymentDate: 'desc'
                        }
                    },
                },
            });
        } else {
            users = await prisma.user.findMany({
                skip,
                take: pageSize,
                include: {
                    Payment: {
                        orderBy: {
                            paymentDate: 'desc'
                        }
                    },
                },
            });
        }


        const result = users
            .map(user => {
                if (user.Payment.length > 0) {
                    console.log("Tolol");
                    return {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        telepon: user.telepon,
                        paymentStatus: user.Payment[0].paymentStatus,
                        paymentId: user.Payment[0].id
                    };
                }
                return undefined;
            })
            .filter((user) => user !== undefined);

        console.log(result);

        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching users and payments' });
        next(e);
    }
};

export const updatePaymentStatus: RequestHandler = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        console.log(paymentId);
        if (!paymentId) {
            res.status(400).json({ message: 'Payment ID is required' });
            return;
        }


        const existingPayment = await prisma.payment.findUnique({
            where: { id: Number(paymentId) },
        });

        if (!existingPayment) {
            res.status(404).json({ message: 'Payment not found' });
            return;
        }

        if (existingPayment.paymentStatus === true) {
            res.status(400).json({ message: 'Payment status is already true' });
            return;
        }
        const duration = existingPayment.duration;

        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setMonth(validUntil.getMonth() + duration);

        const payment = await prisma.payment.update({
            where: { id: Number(paymentId) },
            data: {
                paymentStatus: true,
                validFrom: now,
                validUntil: validUntil
            },
        });
        

        res.status(200).json({ 
            message: 'Payment status updated successfully', 
            paymentId: payment.id, 
            userId: payment.userId 
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error updating payment status' });
        next(e);
    }
};

export const countPayments: RequestHandler = async (req, res, next) => {
    try {
        const count = await prisma.payment.count();
        res.status(200).json({ paymentCount: count });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error counting payments' });
        next(e);
    }
};

export const deletePayment: RequestHandler = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        if (!paymentId) {
            res.status(400).json({ message: 'Payment ID is required' });
            return;
        }

        await prisma.payment.delete({
            where: { id: Number(paymentId) },
        });

        res.status(200).json({ message: 'Payment deleted successfully', paymentId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error deleting payment' });
        next(e);
    }
};