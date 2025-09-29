import { Router } from 'express';
import { createPost, getPosts, updatePost, deletePost, getPostWithComments, getPostById, getCommentsByPostId, createComment, deleteComment } from '../Controllers/communityController';
import { authorizeAdmin } from '../middlewares/authMiddleware';

const communityRouter = Router();

communityRouter.post('/posts', createPost);

communityRouter.get('/posts', getPosts);

communityRouter.put('/posts/:id', updatePost);

communityRouter.delete('/posts/:id', deletePost);

communityRouter.get('/posts/comments/:id', getPostWithComments);

communityRouter.get('/post/:id', getPostById);

communityRouter.get('/posts/:postId/comments', getCommentsByPostId);

communityRouter.post('/posts/:postId/comments', createComment);

communityRouter.delete('/posts/:postId/comments/:commentId', deleteComment);

export { communityRouter };