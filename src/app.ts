import express from 'express';
import "express-async-errors"; // needs to be imported before routers and other stuff!

import { loginRouter } from './routes/login';
import { eintragRouter } from './routes/eintrag';
import { pflegerRouter } from './routes/pfleger';
import { protokollRouter } from './routes/protokoll';
import cookieParser from 'cookie-parser';
import { configureCORS } from './configCORS';

const app = express();
configureCORS(app);
// Middleware:
app.use('*', express.json()) // vgl. Folie 138
//configureCORS(app);    

app.use(cookieParser());
// Routes
app.use("/api/login",loginRouter)   
app.use("/api/pfleger",pflegerRouter);
app.use("/api/protokoll",protokollRouter);
app.use("/api/eintrag",eintragRouter);


export default app;