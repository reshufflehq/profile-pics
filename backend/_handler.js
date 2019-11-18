import express from 'express';
import { defaultHandler } from '@reshuffle/server-function';
import { authRouter } from '@reshuffle/passport';

const app = express();
app.use('/', authRouter());

app.use(defaultHandler)

export default app;
