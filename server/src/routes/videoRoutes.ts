import express from 'express';
import {

uploadVideo,
getAllVideos,
getVideoById,
updateVideo,
deleteVideo,
countVideos,
getPaginate,
getVideoUrl,
getThumbnailUrl,
isFavorite,
getMyFavorites,
toggleFavorite
} from '../Controllers/videoController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const router = express.Router();


router.post('/upload',authorizeAdmin, uploadVideo);
router.get("/videos/:id/url",  getVideoUrl);
router.get('/videos', getAllVideos);
router.post('/videos/paginate', getPaginate);
router.get('/getVideo/:id', getVideoById);
router.put('/updateVideo/:id',authorizeAdmin, updateVideo);
router.delete('/deleteVideo/:id', authorizeAdmin, deleteVideo);
router.get('/countVideos', authorizeAdmin,countVideos);
router.post('/thumbnail-url', getThumbnailUrl);

router.post('/favorite', toggleFavorite);
router.post('/isFavorite/:videoId/:userId', isFavorite);
router.post('/myFavorites/:userId', getMyFavorites);

export default router;