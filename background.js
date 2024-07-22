chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeYouTubeShort') {
      fetchYouTubeVideoDetails(request.videoId)
        .then(data => analyzeContent(data))
        .then(result => {
          if (typeof result === 'boolean') {
            sendResponse({block: result, reason: 'Potentially non-informative content'});
          } else {
            sendResponse({
              block: result.isNonInformative, 
              reason: `Educational score: ${result.educationalScore.toFixed(2)}, Entertainment score: ${result.entertainmentScore.toFixed(2)}`
            });
          }
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
  
  async function analyzeContent(data) {
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
      return false; // Don't block educational content
    }
  
    // Check for non-informative content
    const containsNonInformativeWords = nonInformativeWords.some(word => 
      title.includes(word) || 
      description.includes(word) ||
      comments.some(comment => comment.includes(word))
    );
  
    // Use Gemini API for more nuanced content analysis
    const geminiAnalysis = await analyzeWithGemini(data);
  
    // Combine simple keyword matching with Gemini analysis
    return containsNonInformativeWords || geminiAnalysis.isNonInformative;
  }
  
  async function analyzeWithGemini(data) {
    // This is a placeholder. You'll need to implement the actual Gemini API call.
    console.log("Analyzing with Gemini:", data);
  
    // For demonstration, let's simulate a more nuanced analysis
    const educationalScore = Math.random();
    const entertainmentScore = Math.random();
  
    return {
      isNonInformative: entertainmentScore > 0.7 && educationalScore < 0.3,
      educationalScore: educationalScore,
      entertainmentScore: entertainmentScore
    };
  }