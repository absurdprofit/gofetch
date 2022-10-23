import gofetch from '../../../build/index.mjs';

const apiURL = new URL('http://localhost:8080/');
const loginURL = new URL('http://localhost:8080/login');

gofetch.use({
    onError: async (error, controller) => {
        if (error.response.raw.status === 401) {
            const response = await gofetch.get(loginURL); // get the auth token
            const authToken = await response.text();

            if (controller.signal.retries < 1) controller.retry(); // retry only once

            return {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        }
    }
});

gofetch.get(apiURL).then(res => res.json()).then(payload => {
    document.body.innerText = `Server says: ${payload.messagePayload}`;
});