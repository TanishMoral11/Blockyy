document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('status');
    const toggleButton = document.getElementById('toggleFilter');
  
    chrome.storage.sync.get('filterEnabled', function(data) {
      const isEnabled = data.filterEnabled !== false; // Default to true if not set
      updateStatus(isEnabled);
    });
  
    toggleButton.addEventListener('click', function() {
      chrome.storage.sync.get('filterEnabled', function(data) {
        const currentState = data.filterEnabled !== false;
        const newState = !currentState;
        chrome.storage.sync.set({filterEnabled: newState}, function() {
          updateStatus(newState);
        });
      });
    });
  
    function updateStatus(isEnabled) {
      statusElement.textContent = isEnabled ? 'Active' : 'Inactive';
      toggleButton.textContent = isEnabled ? 'Disable Filter' : 'Enable Filter';
    }
  });