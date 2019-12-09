import express from 'express';
import { defaultHandler } from '@reshuffle/server-function';
import { authHandler } from '@reshuffle/passport';
import { createFileUploadHandler } from '@reshuffle/storage';

const app = express();
app.use(authHandler);
app.use(createFileUploadHandler({ accept: /^image\/.*/ }));
app.use(defaultHandler);

export default app;
