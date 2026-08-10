import api from './api';

export const searchOpenLibrary = async (query, { page = 1, limit = 12 } = {}) => {
  try {
    const response = await api.get('/openlibrary/search', {
      params: { q: query, page, limit },
      __skipGlobalLoader: true,
    });
    return response.data;
  } catch (error) {
    console.error('Open Library Error:', error.message);
    throw error;
  }
};

export const fetchOpenLibraryBookDetail = (id) => {
  return api.get(`/openlibrary/works/${id}`);
};
