const errorFactory = (status, message, data) => {
    return {
        status: status ?? 500,
        data: {
            message,
            ...data
        }
    };
};

module.exports = {
    errorFactory
};
