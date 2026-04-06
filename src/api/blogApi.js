// Stub API for blog content (no backend)
export const getBlogs = async () => {
    return [];
};

export const getBlogPosts = async () => {
    return [];
};

export const getBlogsByCategory = async (category) => {
    return [];
};

export const getBlogBySlug = async (slug) => {
    return null;
};

export const getLatestBlogs = async (limit = 5) => {
    return [];
};

export const getRelatedPosts = async (category, currentSlug, limit = 3) => {
    return [];
};
