const isEmail = (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value);
const validatePassword = (value) => /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/.test(value);

module.exports = {
    isEmail,
    validatePassword
};
