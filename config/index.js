

import dotenv from "dotenv";
dotenv.config();




 
export const PORT = process.env.PORT;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;

export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_PORT;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const cloud_name = process.env.cloud_name;
export const api_key = process.env.api_key;
export const api_secret = process.env.api_secret;
export const NODE_ENV = process.env.NODE_ENV;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
export const JWT_EXPIRES_IN_REFRESH_TOKEN = process.env.JWT_EXPIRES_IN_REFRESH_TOKEN



