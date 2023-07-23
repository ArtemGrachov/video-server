const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const Jabber = require('jabber').default;
const cloudinary = require('cloudinary').v2;

const cloud = require('../cloud');
const { MEDIA_TYPES } = require('../constants/media');
const { upload } = require('../utils/upload');

const EMAIL_DOMAIN = 'seed-video-db.com';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const date = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const jabber = new Jabber();

        const avatarAssets = await new Promise((resolve, reject) => {
            fs.readdir(path.join(__dirname, '../seed-assets', 'images'), (err, files) => {
                if (err) {
                    reject(err);
                }

                resolve(files);
            });
        });

        const users = await Promise.all(Array(15).fill(null).map(async () => {
            const nameLength = Math.max(Math.floor(Math.random() * 10), 2);
            const passwordLength = Math.max(Math.floor(Math.random() * 15), 8);

            const result = {
                email: jabber.createEmail(EMAIL_DOMAIN),
                name: jabber.createWord(nameLength, true),
                password: await bcrypt.hash(jabber.createWord(passwordLength, true) + Math.ceil(Math.random() * 100), 10),
                createdAt: date,
                updatedAt: date,
            };


            return result;
        }));

        await queryInterface.bulkInsert('Users', users);

        const seedUsers = await queryInterface.rawSelect('Users', {
            where: {
                email: {
                    [Op.like]: `%${EMAIL_DOMAIN}`,
                }
            },
            plain: false,
        }, ['email']);

        const avatars = await Promise.all(
            seedUsers
                .map(async user => {
                    const avatarIndex = Math.floor(Math.random() * avatarAssets.length);
                    const avatar = avatarAssets[avatarIndex];

                    if (!avatar) {
                        return null;
                    }


                    const cloudAvatar = await upload(
                        path.join(__dirname, '../seed-assets', 'images', avatar),
                        'image',
                        true,
                    );

                    return {
                        externalId: cloudAvatar.public_id,
                        type: MEDIA_TYPES.IMAGE,
                        createdAt: date,
                        updatedAt: date,
                        referenceId: user.id,
                        referenceType: 'user',
                    };
                })
                .filter(avatar => Boolean(avatar)),
        );

        await queryInterface.bulkInsert('Media', avatars);
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

        const seededUsersAvatars = await queryInterface.rawSelect('Media',
            {
                where: {
                    referenceId: {
                        [Op.in]: ids,
                    },
                    referenceType: {
                        [Op.eq]: 'user',
                    },
                },
                plain: false,
            },
            ['id']
        );

        await Promise.all(seededUsersAvatars.map(avatar => {
            return cloudinary.uploader.destroy(avatar.externalId, { resource_type: avatar.type });
        }));

        const avatarIds = seededUsersAvatars.map(avatar => avatar.id);

        await queryInterface.bulkDelete('Media', {
            id: {
                [Op.in]: avatarIds,
            },
        });

        await queryInterface.bulkDelete('Users', {
            email: {
                [Op.like]: `%${EMAIL_DOMAIN}`,
            }
        });
    },
};
