// Listener for the extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension clicked. Tab URL:", tab.url);

  // Validate if the URL is from the Azure Portal
  if (tab.url && tab.url.startsWith("https://portal.azure.com/")) {
    console.log("Valid Azure Portal URL detected.");

    // Regex to extract the Resource ID from the URL
    const resourceIdMatch = tab.url.match(/\/subscriptions\/[^/]+\/resourceGroups\/[^/]+\/providers\/[^/]+\/[^/]+\/[^/]+/);
    if (resourceIdMatch) {
      const resourceId = resourceIdMatch[0];
      console.log("Extracted Resource ID:", resourceId);

      // Execute clipboard write in the active tab's context
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: (resourceId) => {
            // Copy the Resource ID to the clipboard
            navigator.clipboard.writeText(resourceId).then(() => {
              console.log("Resource ID successfully copied to clipboard:", resourceId);
            }).catch((err) => {
              console.error("Failed to copy Resource ID:", err);
            });
          },
          args: [resourceId]
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error("Error executing script:", chrome.runtime.lastError.message);
          } else {
            console.log("Clipboard script executed successfully.");
          }
        }
      );
    } else {
      console.warn("No valid Resource ID found in the URL.");
      notifyUser(tab.id, "No valid Resource ID found in the URL.");
    }
  } else {
    console.warn("This extension only works on the Azure Portal.");
    notifyUser(tab.id, "This extension only works on the Azure Portal.");
  }
});

// Helper function to notify the user via an alert in the active tab
function notifyUser(tabId, message) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (msg) => {
      alert(msg);
    },
    args: [message]
  });
}