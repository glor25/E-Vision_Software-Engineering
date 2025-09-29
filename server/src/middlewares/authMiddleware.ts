import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send({ message: 'Access denied, no token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.body.user = decoded;
        next();
    } catch (error) {
        res.status(400).send({ message: 'Invalid token.' , error: error});
        return;
    }
};


export const authorizeAdmin: RequestHandler = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).send({ message: 'Access denied, no token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (typeof decoded !== 'object' || !('role' in decoded) || decoded.role !== 'admin') {
            res.status(403).send({ message: 'Access denied, admin only.' });
            return;
        }
    } catch (error) {
        res.status(400).send({ message: 'Invalid token.', error: error });
        return;
    }
    next();
};

