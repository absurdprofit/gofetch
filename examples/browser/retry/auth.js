import gofetch from '../../../build/index.mjs';

const apiURL = new URL('http://localhost:8080/');
const loginURL = new URL('http://localhost:8080/login');

gofetch.use({onError: async (config, controller) => {
    if (config.options.status === 401) {
        const response = await gofetch.get(loginURL); // get the auth token
        const authToken = await response.text();

        if (controller.signal.retries < 1) controller.retry(); // retry only once

        const options = {
            headers: {
                authorization: authToken
            }
        };
        return {
          options  
        }
    }
}});

gofetch.get(apiURL).then(res => res.text()).then(resText => {
    document.body.innerText = `Server says: ${resText}`;
});