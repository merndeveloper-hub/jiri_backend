import  {cloud_name, api_key, api_secret}  from "../../config/index.js";

import { v2 as cloudinary } from "cloudinary";
console.log(cloud_name, api_key, api_secret,"cloudniary");

cloudinary.config({
  cloud_name,
  api_key,
  api_secret
});

export default cloudinary;
