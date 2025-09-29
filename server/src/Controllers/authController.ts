import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';

const prisma = new PrismaClient();


export const register:RequestHandler = async (req, res, next) => {
    try{
        const { firstName, lastName, userName , password, email } = req.body;
        if (!firstName || !lastName || !email || !userName || !password) {
            res.status(400).json({ message: 'Mohon Isi semua bagian dengan lengkap!'});
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Mohon isi email yang valid!' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: 'Password harus minimal 6 kata!' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Sudah ada akun teradaftar menggunakan email tersebut!' });
            return;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                userName,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({
            message: 'User registered successfully',
            newUser,
        });
    }catch(error){
        next(error);
    }
};

export const login:RequestHandler = async (req, res, next) => {
    try{
        const { email, password } = req.body;
        if (email === 'admin@gmail.com') {
            const adminPassword = process.env.ADMIN_PASSWORD;
            if (!adminPassword || password !== adminPassword) {
                res.status(400).json({ message: 'Invalid admin credentials' });
                return;
            }

            const token = jwt.sign({ userId: 'admin', email , role: 'admin'}, process.env.JWT_SECRET!, { expiresIn: '6h' });

            res.status(200).json({
                message: 'Admin login successful',
                token,
            });
            return;
        }
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Incorrect Email or Password' });
            return;
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect Email or Password' });
            return;
        }

        const token = jwt.sign({ userId: user.id, email: user.email, name: user.firstName + ' ' + user.lastName, role: 'user', isMember: user.isMemberActive , phoneNumber: user.telepon}, process.env.JWT_SECRET!, { expiresIn: '6h' });

        res.status(200).json({
            message: 'Login successful',
            token,
        });
        return;
    }catch(error){
        next(error);
    }
};


export const logout: RequestHandler = (req, res) => {
    res.status(200).json({
        message: 'Logout successful',
        token: null,
    });
};

export const validateToken: RequestHandler = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Token is required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        res.status(200).json({
            message: 'Token is valid',
            decoded,
        });
        return;
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
        console.log(error);
    }
};


export const validateMembership: RequestHandler = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Token is required' });
            return;
        }

        const decoded: any =  jwt.verify(token, process.env.JWT_SECRET!);

        if (decoded.role === 'admin') {
            res.status(200).json({ message: 'Admin has full membership', isMember: true });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Determine membership status based on user's latest successful payment (validUntil date)
        const latestPayment = await prisma.payment.findFirst({
            where: {
            userId: user.id,
            paymentStatus: true,
            validUntil: { not: null }
            },
            orderBy: { validUntil: 'desc' }
        });

        const isActive = latestPayment && latestPayment.validUntil && new Date(latestPayment.validUntil) > new Date();
        if(!isActive){
            res.status(403).json({
                message: 'Membership is inactive',
                isMember: false,
            });
            return;
        }
        user.isMemberActive = isActive;
        await prisma.user.update({
            where: { id: user.id },
            data: { isMemberActive: isActive },
        });
        res.status(200).json({
            message: user.isMemberActive ? 'Membership is active' : 'Membership is inactive',
            isMember: user.isMemberActive,
        });
    } catch (error) {
        next(error);
    }
};