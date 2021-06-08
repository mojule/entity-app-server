"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileHandlers = void 0;
const multer = require("multer");
const log_iisnode_1 = require("@mojule/log-iisnode");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// needs to handle update as well
const createFileHandlers = (createDiskFile) => {
    const createFileHandlers = [
        upload.single('file'),
        async (req, res) => {
            try {
                const defaultTags = [];
                const { tags = defaultTags } = req.body;
                const file = req['file'];
                const fileWithoutBuffer = Object.assign({}, file, { buffer: undefined });
                log_iisnode_1.log.info({ file: fileWithoutBuffer, tags });
                const fileData = Object.assign(file, { tags });
                const id = await createDiskFile(fileData);
                res.json([null, id]);
            }
            catch (err) {
                log_iisnode_1.log.error(err);
                res.json([err.message || 'Unknown error']);
            }
        }
    ];
    return createFileHandlers;
};
exports.createFileHandlers = createFileHandlers;
//# sourceMappingURL=post-route.js.map