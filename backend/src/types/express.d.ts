// types/express.d.ts — single source of truth
declare namespace Express {
    interface Request {
        id?: string;
        user?: {
            id: string;
            role: string;
            businessId?: string;
        };
        business?: { id: string };
    }
}


// declare namespace Express {
//     interface Request {
//         id?: string;
//         user?: { id: string; role: string };
//         business?: { id: string };
//         // file?: Multer.File;
//         // files?: Multer.File[];
//     }
// }