const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'YTD-PLAYER') {
            checkYouTubeShort(node);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  function checkYouTubeShort(playerElement) {
    const videoId = getVideoIdFromUrl(window.location.href);
    
    chrome.runtime.sendMessage({action: 'analyzeYouTubeShort', videoId: videoId}, (response) => {
      if (response.block) {
        blockYouTubeShort(playerElement);
      }
    });
  }
  
  function getVideoIdFromUrl(url) {
    const regex = /(?:\/shorts\/|\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
  
  function blockYouTubeShort(playerElement) {
    playerElement.style.display = 'none';
    const message = document.createElement('div');
    message.textContent = 'This Short has been blocked due to potentially non-informative content.';
    message.style.cssText = 'padding: 20px; text-align: center; background: #f0f0f0;';
    playerElement.parentNode.insertBefore(message, playerElement);
    
    const skipButton = document.createElement('button');
    skipButton.textContent = 'Next Short';
    skipButton.onclick = () => {
      const event = new KeyboardEvent('keydown', {'keyCode': 39, 'which': 39});
      document.dispatchEvent(event);
    };
    message.appendChild(skipButton);
  }