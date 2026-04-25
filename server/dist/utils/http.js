"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRefreshCookie = exports.setRefreshCookie = void 0;
const env_1 = require("../config/env");
const setRefreshCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env_1.isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
exports.setRefreshCookie = setRefreshCookie;
const clearRefreshCookie = (res) => {
    res.clearCookie("refreshToken");
};
exports.clearRefreshCookie = clearRefreshCookie;
