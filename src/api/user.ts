import { Router } from 'express';
import { createOrUpdateUser } from '../controllers/userController';

const userRouter = Router();

userRouter.post('/', createOrUpdateUser);

export { userRouter };
