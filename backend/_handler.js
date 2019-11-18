import express from 'express';
import { defaultHandler } from '@reshuffle/server-function';
import { mw } from '@reshuffle/passport';

const app = express();
app.use('/', mw());
app.use(defaultHandler);

export default app;
