import { UpdateSettingsInput } from '../schemas/settings.schema.server.js';
declare const _default: {
    getSettings: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/settings.model.js").ISettings> & import("../models/settings.model.js").ISettings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateSettings: (userId: string, dto: UpdateSettingsInput) => Promise<import("mongoose").Document<unknown, {}, import("../models/settings.model.js").ISettings> & import("../models/settings.model.js").ISettings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    uploadLogo: (userId: string, file: Express.Multer.File, fileUrl: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/settings.model.js").ISettings> & import("../models/settings.model.js").ISettings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    uploadSignature: (userId: string, file: Express.Multer.File, fileUrl: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/settings.model.js").ISettings> & import("../models/settings.model.js").ISettings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    deleteLogo: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/settings.model.js").ISettings> & import("../models/settings.model.js").ISettings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    deleteSignature: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/settings.model.js").ISettings> & import("../models/settings.model.js").ISettings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
};
export default _default;
