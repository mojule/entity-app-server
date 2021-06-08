"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayHandler = void 0;
const util_1 = require("@mojule/util");
const delayHandler = (_req, _res, next) => {
    setTimeout(next, util_1.randInt(250));
};
exports.delayHandler = delayHandler;
//# sourceMappingURL=delay-handler.js.map