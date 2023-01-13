let bodyObserver = null;

function bodyTagObserver() {
    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                // Select the video that will be observed for mutations
                const videos = document.querySelectorAll('video');
                const mutedIcons = document.querySelectorAll('[aria-label="Toggle audio"]');

                if (videos) {
                    for (const video of videos) {
                        video.setAttribute("controls", true);
                    }
                
                    if (mutedIcons.length) {
                       for (const icon of mutedIcons) {
                            icon.style.display = 'none';
                        }
                    }
                    
                    break;
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const bodyObserver = new MutationObserver(callback);

    bodyObserver.observe(targetNode, config);
}

window.onload = function() {
    bodyTagObserver();
};

window.onclose = function() {
    bodyObserver.disconnect();
};
