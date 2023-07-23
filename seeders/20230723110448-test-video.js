const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const Jabber = require('jabber').default;
const dayjs = require('dayjs');

const cloud = require('../cloud');
const { MEDIA_TYPES } = require('../constants/media');
const { upload } = require('../utils/upload');

const EMAIL_DOMAIN = 'seed-video-db.com';

const DISCLAMER = '\n Created with test purposes. All the right for video used here belongs to their owners. Video is taken from pexels.com as the free-to-use content.';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const date = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const jabber = new Jabber();

        const videoAssets = await new Promise((resolve, reject) => {
            fs.readdir(path.join(__dirname, '../seed-assets', 'video'), (err, files) => {
                if (err) {
                    reject(err);
                }

                resolve(files);
            });
        });

        const seedUsers = await queryInterface.rawSelect('Users', {
            where: {
                email: {
                    [Op.like]: `%${EMAIL_DOMAIN}`,
                }
            },
            plain: false,
        }, ['email']);

        const ids = seedUsers.map(user => user.id);

        const userVideosPayload = seedUsers.reduce((acc, curr) => {
            const videoCount = Math.floor(Math.random() * 5);

            const payloads = Array(videoCount).fill(null).map(() => {
                const nameLength = Math.max(Math.floor(Math.random() * 5), 1);
                const descriptionLegnth = Math.max(Math.floor(Math.random() * 30), 1);

                return {
                    name: jabber.createParagraph(nameLength),
                    description: jabber.createParagraph(nameLength) + DISCLAMER,
                    authorId: curr.id,
                    createdAt: date,
                    updatedAt: date,
                };
            });

            acc.push(...payloads);

            return acc;
        }, []);

        await queryInterface.bulkInsert('Videos', userVideosPayload);

        const seededUsersVideo = await queryInterface.rawSelect('Videos',
            {
                where: {
                    authorId: {
                        [Op.in]: ids,
                    },
                },
                plain: false,
            },
            ['id']
        );

        const mediaPayload = await Promise.all(
            seededUsersVideo
                .map(async video => {
                    const videoIndex = Math.floor(Math.random() * videoAssets.length);
                    const videoFileName = videoAssets[videoIndex];

                    if (!videoFileName) {
                        return null;
                    }

                    const cloudVideo = await upload(
                        path.join(__dirname, '../seed-assets', 'video', videoFileName),
                        'video',
                        true,
                    );

                    return {
                        externalId: cloudVideo.public_id,
                        type: MEDIA_TYPES.VIDEO,
                        createdAt: date,
                        updatedAt: date,
                        referenceId: video.id,
                        referenceType: 'video',
                    };
                })
                .filter(video => Boolean(video)),
        );

        await queryInterface.bulkInsert('Media', mediaPayload);
    },

    async down(queryInterface, Sequelize) {
        const seedUsers = await queryInterface.rawSelect('Users', {
            where: {
                email: {
                    [Op.like]: `%${EMAIL_DOMAIN}`,
                }
            },
            plain: false,
        }, ['email']);

        const ids = seedUsers.map(user => user.id);

        const seededUsersVideo = await queryInterface.rawSelect('Videos',
            {
                where: {
                    authorId: {
                        [Op.in]: ids,
                    },
                },
                plain: false,
            },
            ['id']
        );

        const videoIds = seededUsersVideo.map(avatar => avatar.id);

        await queryInterface.bulkDelete('Videos', {
            id: {
                [Op.in]: videoIds,
            },
        });
    }
};
