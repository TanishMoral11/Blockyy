// Listen for new video elements being added to the page
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
    // Get video ID from the URL
    const videoId = getVideoIdFromUrl(window.location.href);
    
    // Send message to background script to fetch and analyze video details
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