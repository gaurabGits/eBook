import api from './api';

const searchOpenLibrary = async (query, { page = 1, limit = 12 } = {}) => {
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

const fetchOpenLibraryBookDetail = (id) => {
  return api.get(`/openlibrary/works/${id}`);
};
export { searchOpenLibrary, fetchOpenLibraryBookDetail };

export default { searchOpenLibrary, fetchOpenLibraryBookDetail };