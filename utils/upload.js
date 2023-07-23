const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

module.exports = {
    upload(fileName, resourceType, customPath = false) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                customPath ? fileName : `./uploads/${fileName}`,
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
