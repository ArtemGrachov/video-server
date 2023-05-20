const errorFactory = (code, message, data) => {
    return {
        code: code ?? 500,
        data: {
            message,
            ...data
        }
    };
};

module.exports = {
    errorFactory
};
