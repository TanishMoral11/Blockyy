chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeYouTubeShort') {
      fetchYouTubeVideoDetails(request.videoId)
        .then(data => analyzeContent(data))
        .then(result => sendResponse({block: result}));
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
  
  async function analyzeContent(data) {
    const nonInformativeWords = ['funny', 'hot', 'girl', 'cringe', /* add more words */];
    
    const geminiAnalysis = await analyzeWithGemini(data);
    
    const containsNonInformativeWords = nonInformativeWords.some(word => 
      data.title.toLowerCase().includes(word) || 
      data.description.toLowerCase().includes(word) ||
      data.comments.some(comment => comment.toLowerCase().includes(word))
    );
    
    return geminiAnalysis.isNonInformative || containsNonInformativeWords;
  }
  
  async function analyzeWithGemini(data) {
    // Placeholder for Gemini API integration
    // You'll need to implement the actual API call here
    console.log("Analyzing with Gemini:", data);
    return { isNonInformative: Math.random() < 0.5 };
  }