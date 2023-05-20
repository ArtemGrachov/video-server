const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {
    upload(fileName, resourceType) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                `./uploads/${fileName}`,
                {
                    resource_type: resourceType,
                    folder: process.env.CLOUDINARY_FOLDER
                },
                (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(res);
                }
            );
        });
    },
    removeLocalFile(fileName) {
        const fullPath = path.join(__dirname, '../uploads', fileName);
        fs.unlink(fullPath, () => {});
    }
};
