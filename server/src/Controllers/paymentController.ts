import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';

const prisma = new PrismaClient();
    
export const submitUserPayment: RequestHandler = async (req, res, next) => {
    try{
        const { userId, paymentMethod, duration } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        
        if (!paymentMethod) {
            res.status(400).json({ error: 'Payment method is required' });
            return;
        }
        
        if(!duration){
            res.status(400).json({error: 'duration is required'});
            return;
        }

        const amount = duration * 100000;

        const payment = await prisma.payment.create({
            data: {
                userId,
                amount,
                paymentMethod,
                duration,
                paymentStatus: false,
            },
        });

        res.status(201).json({ message: 'Payment submitted successfully. Wait for it to be verified!', payment });
        return;
    }catch(error){
        next(error);
    }
}

export const getAllPending: RequestHandler = async(req, res, next) => {
    try {
        const pendingPayments = await prisma.payment.findMany({
            where: {
                paymentStatus: false,
            },
        });

        res.status(200).json({ message: 'Pending payments retrieved successfully', pendingPayments });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving pending payments' });
        next(error);
    }
}

export const verifyPaymentById: RequestHandler = async(req, res, next) => {
    try{
        const { paymentId } = req.body;

        if (!paymentId) {
            res.status(400).json({ error: 'Payment ID is required' });
            return;
        }

        const payment = await prisma.payment.findUnique({
            where: { id: parseInt(paymentId) },
        });

        if (!payment) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }

        if (payment.paymentStatus) {
            res.status(400).json({ error: 'Payment is already verified' });
            return;
        }

        const updatedPayment = await prisma.payment.update({
            where: { id: parseInt(paymentId) },
            data: { paymentStatus: true },
        });

        res.status(200).json({ message: 'Payment verified successfully', updatedPayment });
    }catch(error){
        res.status(500).json({ error: 'An error occurred while retrieving pending payments' });
        next(error);
    }
}

export const getUserPaymentHistory: RequestHandler = async(req,res,next) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const paymentHistory = await prisma.payment.findMany({
            where: {
                userId: parseInt(userId),
            },
        });

        const formattedHistory = paymentHistory.map(payment => {
            let packageName = '';
            if (payment.duration >= 12) {
            const years = Math.floor(payment.duration / 12);
            const months = payment.duration % 12;
            packageName = `Paket ${years} Tahun${months > 0 ? ` ${months} Bulan` : ''}`;
            } else {
            packageName = `Paket ${payment.duration} Bulan`;
            }

            return {
                id: payment.id,
                date: payment.paymentDate
                    ? (() => {
                        const dateObj = new Date(payment.paymentDate);
                        const day = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                        const hours = dateObj.getHours().toString().padStart(2, '0');
                        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                        return `${day} Pukul ${hours}:${minutes} WIB`;
                    })()
                    : '',
                packageName,
                amount: `Rp${payment.amount.toLocaleString('id-ID')}`,
                method: payment.paymentMethod,
            };
        });

        res.status(200).json({ message: 'Payment history retrieved successfully', paymentHistory: formattedHistory });
        return;

        res.status(200).json({ message: 'Payment history retrieved successfully', paymentHistory });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving payment history' });
        next(error);
    }
}