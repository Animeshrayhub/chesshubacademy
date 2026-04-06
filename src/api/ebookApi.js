// Stub API for ebooks (no backend)
export const getEbooks = async () => {
    return [];
};

export const getEbookById = async (id) => {
    return null;
};

export const createEbookOrder = async (orderData) => {
    console.log('Ebook order not available without backend:', orderData);
    return null;
};

export const getApprovedOrder = async (orderId) => {
    return null;
};
