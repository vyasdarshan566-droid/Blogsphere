import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
let csrfToken;
let csrfRequest;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

async function getCsrfToken() {
    if (csrfToken) return csrfToken;
    csrfRequest ??= axios.get(`${baseURL}/auth/csrf`, { withCredentials: true })
        .then(({ data }) => { csrfToken = data.csrfToken; return csrfToken; })
        .finally(() => { csrfRequest = undefined; });
    return csrfRequest;
}

api.interceptors.request.use(async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const isCsrfBootstrap = config.url?.endsWith('/auth/csrf');
    if (!['get', 'head', 'options'].includes(method) && !isCsrfBootstrap) {
        config.headers['X-CSRF-Token'] = await getCsrfToken();
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        const csrfRejected = error.response?.status === 403 && error.response?.data?.message === 'A valid CSRF token is required.';
        if (csrfRejected && config && !config._csrfRetried && !config.url?.endsWith('/auth/csrf')) {
            config._csrfRetried = true;
            csrfToken = undefined;
            try {
                config.headers['X-CSRF-Token'] = await getCsrfToken();
                return api.request(config);
            } catch {
                // Return the original API error when refreshing the token fails.
            }
        }
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        const normalized = new Error(message);
        normalized.response = error.response;
        normalized.status = error.response?.status;
        return Promise.reject(normalized);
    }
);

export default api;
