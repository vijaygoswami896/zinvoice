declare namespace Express {
    interface Request {
        id?: string;
        user?: { id: string; role: string };
        business?: { id: string };
        // file?: Multer.File;
        // files?: Multer.File[];
    }
}