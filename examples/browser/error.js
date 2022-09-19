import gofetch from '../../build/index.mjs';

gofetch.use({onError: (config, controller) => {
    if (controller.signal.retries < 2) controller.retry();
}});
gofetch.use({onError: (config, controller) => {
    console.log("After retry");
}});
gofetch.get('./error.html');