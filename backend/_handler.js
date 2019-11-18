import express from 'express';
import { defaultHandler } from '@reshuffle/server-function';
import { authRouter } from '@reshuffle/passport';

const app = express();
app.use('/', authRouter());

app.get('/env', (req, res) => res.json(process.env));

app.use(defaultHandler)

export default app;
