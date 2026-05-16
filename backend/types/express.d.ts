declare namespace Express {
    interface Request {
        id?: string; user?: { id: string; role: string };
        business?: { id: string };
        file?: Multer.File;
        files?: Multer.File[];
    }
}

interface AuthenticatedRequest extends Express.Request {
    user: { id: string; }; // non-optional
}