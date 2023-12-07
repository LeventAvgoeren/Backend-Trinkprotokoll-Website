import express from 'express';
import "express-async-errors"; // needs to be imported before routers and other stuff!

import { loginRouter } from './routes/login';
import { eintragRouter } from './routes/eintrag';
import { pflegerRouter } from './routes/pfleger';
import { protokollRouter } from './routes/protokoll';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware:
app.use('*', express.json()) // vgl. Folie 138

// Routes
app.use("/api/login",loginRouter)   
app.use("/api/pfleger",pflegerRouter);
app.use("/api/protokoll",protokollRouter);
app.use("/api/eintrag",eintragRouter);
app.use(cookieParser());

export default app;