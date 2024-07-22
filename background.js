chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeYouTubeShort') {
      fetchYouTubeVideoDetails(request.videoId)
        .then(data => analyzeContent(data))
        .then(result => {
          sendResponse({
            block: result.shouldBlock,
            reason: result.reason
          });
        });
      return true; // Indicates async response
    }
  });
  
  async function fetchYouTubeVideoDetails(videoId) {
    const API_KEY = 'AIzaSyAdu5SaUlQkjyaljTW9Ktm_116huxceSGM';
    const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
    const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${API_KEY}`;
  
    try {
      const [videoResponse, commentsResponse] = await Promise.all([
        fetch(videoDetailsUrl),
        fetch(commentsUrl)
      ]);
  
      const videoData = await videoResponse.json();
      const commentsData = await commentsResponse.json();
  
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('No video details found');
      }
  
      return {
        title: videoData.items[0].snippet.title || '',
        description: videoData.items[0].snippet.description || '',
        comments: (commentsData.items || []).map(item => {
          try {
            return item.snippet.topLevelComment.snippet.textDisplay;
          } catch (e) {
            console.warn('Error extracting comment:', e);
            return '';
          }
        }).filter(comment => comment !== '')
      };
    } catch (error) {
      console.error('Error fetching YouTube video details:', error);
      return {
        title: '',
        description: '',
        comments: []
      };
    }
  }
  
  function analyzeContent(data) {
    const nonInformativeWords = ['funny', 'prank', 'challenge', 'viral', 'cringe', 'reaction'];
    const educationalWords = ['learn', 'education', 'tutorial', 'how to', 'explainer', 'science', 'history', 'math'];
    
    const title = data.title.toLowerCase();
    const description = data.description.toLowerCase();
    const comments = data.comments.map(comment => comment.toLowerCase());
  
    // Check for educational content
    const isEducational = educationalWords.some(word => 
      title.includes(word) || description.includes(word)
    );
  
    if (isEducational) {
      return { shouldBlock: false, reason: 'Educational content' };
    }
  
    // Check for non-informative content
    const containsNonInformativeWords = nonInformativeWords.some(word => 
      title.includes(word) || 
      description.includes(word) ||
      comments.some(comment => comment.includes(word))
    );
  
    if (containsNonInformativeWords) {
      return { shouldBlock: true, reason: 'Contains potentially non-informative content' };
    }
  
    // If we're not sure, don't block
    return { shouldBlock: false, reason: 'Content seems okay' };
  }