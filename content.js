let bodyObserver = null;

function bodyTagObserver() {
  const targetNode = document.body;
  if (!targetNode) return;

  const config = { childList: true, subtree: true };

  const callback = (mutationList) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'childList' && !document.URL.includes('stories')) {
        document.querySelectorAll('video').forEach((video) => {
          configureVideo(video);
        });
      }
    });
  };

  function configureVideo(video) {
    if (video.dataset.processed) return;
    video.dataset.processed = 'true';

    const muteButton = video.closest('article')?.querySelector('[aria-label="Toggle audio"]');

    if (!muteButton) return;

    const parentDiv = muteButton.parentElement;

    if (!parentDiv) return;

    parentDiv.style.display = 'flex';
    parentDiv.style.alignItems = 'center';
    parentDiv.style.gap = '8px';
    parentDiv.style.flexDirection = 'row-reverse';
    parentDiv.style.zIndex = '9999';
    parentDiv.style.width = '100%';

    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.gap = '8px';
    controlsContainer.style.marginLeft = '10px';
    controlsContainer.style.width = '100%';
    controlsContainer.style.marginBottom = '16px';

    const playPauseButton = document.createElement('button');
    playPauseButton.style = muteButton.style;
    playPauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" height="14" width="14" version="1.1" id="Layer_1" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <path d="M139.6,0H46.5C20.9,0,0,20.9,0,46.5v418.9C0,491.1,20.9,512,46.5,512h93.1c25.7,0,46.5-20.9,46.5-46.5V46.5 C186.2,20.9,165.3,0,139.6,0z M465.5,0h-93.1c-25.7,0-46.5,20.9-46.5,46.5v418.9c0,25.7,20.9,46.5,46.5,46.5h93.1 c25.7,0,46.5-20.9,46.5-46.5V46.5C512,20.9,491.1,0,465.5,0z"/> </g></svg>`;
    styleButton(playPauseButton);

    playPauseButton.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playPauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" height="14" width="14" version="1.1" id="Layer_1" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <path d="M139.6,0H46.5C20.9,0,0,20.9,0,46.5v418.9C0,491.1,20.9,512,46.5,512h93.1c25.7,0,46.5-20.9,46.5-46.5V46.5 C186.2,20.9,165.3,0,139.6,0z M465.5,0h-93.1c-25.7,0-46.5,20.9-46.5,46.5v418.9c0,25.7,20.9,46.5,46.5,46.5h93.1 c25.7,0,46.5-20.9,46.5-46.5V46.5C512,20.9,491.1,0,465.5,0z"/> </g></svg>`;
      } else {
        video.pause();
        playPauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" height="14" width="14" version="1.1" id="Layer_1" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <path d="M464.7,221.5L86.1,7.3C52.5-11.7,25,7.5,25,50v412c0,42.5,27.5,61.7,61.1,42.7l378.6-214.1 C498.2,271.5,498.2,240.5,464.7,221.5z"/> </g></svg>`;
      }
    });

    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;
    styleProgressBar(progressBar);

    video.addEventListener('timeupdate', () => {
      progressBar.value = (video.currentTime / video.duration) * 100;
    });

    video.addEventListener('click', (event) => {
      if (document.fullscreenElement) {
        event.preventDefault();
      }

      video.paused ? video.play() : video.pause();
    });

    progressBar.addEventListener('input', () => {
      video.currentTime = (progressBar.value / 100) * video.duration;
    });

    const fullScreenButton = document.createElement('button');
    fullScreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" height="14" width="14" version="1.1" id="Layer_1" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <path d="M93.1,139.6l46.5-46.5L93.1,46.5L139.6,0H0v139.6l46.5-46.5L93.1,139.6z M93.1,372.4l-46.5,46.5L0,372.4V512h139.6 l-46.5-46.5l46.5-46.5L93.1,372.4z M372.4,139.6H139.6v232.7h232.7V139.6z M325.8,325.8H186.2V186.2h139.6V325.8z M372.4,0 l46.5,46.5l-46.5,46.5l46.5,46.5l46.5-46.5l46.5,46.5V0H372.4z M418.9,372.4l-46.5,46.5l46.5,46.5L372.4,512H512V372.4l-46.5,46.5 L418.9,372.4z"/> </g></svg>`;
    styleButton(fullScreenButton);

    fullScreenButton.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        video.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    controlsContainer.appendChild(playPauseButton);
    controlsContainer.appendChild(progressBar);
    controlsContainer.appendChild(fullScreenButton);
    parentDiv.appendChild(controlsContainer);
  }

  function styleButton(button) {
    button.style.fontSize = '14px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.color = 'white';
    button.style.padding = '7px 8px 3px';
    button.style.backgroundColor = '#262626';
    button.style.borderRadius = '50%';
  }

  function styleProgressBar(bar) {
    bar.style.width = '100%';
    bar.style.cursor = 'pointer';
    bar.style.background = 'rgba(255, 255, 255, 1)';
    bar.style.borderRadius = '4px';
    bar.style.borderColor = 'white';
    bar.style.height = '5px';
    bar.style.marginBottom = '4px';
    bar.style.webkitAppearance = 'none';
    bar.style.outline = 'none';
    bar.style.accentColor = 'white';
    bar.addEventListener('input', () => {
      bar.style.accentColor = 'white';
    });
  }

  bodyObserver = new MutationObserver(callback);
  bodyObserver.observe(targetNode, config);

  document.querySelectorAll('video').forEach(configureVideo);
}

window.onload = bodyTagObserver;
window.onbeforeunload = () => bodyObserver?.disconnect();
