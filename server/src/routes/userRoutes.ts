import express from 'express';

import {
getPaginateUsers,
addUser,
countUsers,
getVideoById,
deleteUser,
updateUser,
updateFromUser,
getProfilePic,
getUserInfo
} from '../Controllers/userController';
import { authorizeAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/users/paginate', getPaginateUsers);
router.post('/usersAdd',authorizeAdmin,  addUser);
router.get('/users/count', authorizeAdmin, countUsers);
router.get('/videos/:id', authorizeAdmin, getVideoById);
router.delete('/users/:id', authorizeAdmin, deleteUser);
router.put('/users/:id', authorizeAdmin, updateUser);
router.patch('/users/:id/profile', updateFromUser);
router.get('/users/:id/profile-pic', getProfilePic);
router.get('/users/:id', getUserInfo);
export default router;