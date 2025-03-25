document.getElementById("copyButton").addEventListener("click", async () => {
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url && tab.url.startsWith("https://portal.azure.com/")) {
      // Extract the Resource ID from the URL
      const resourceIdMatch = tab.url.match(/\/subscriptions\/[^/]+\/resourceGroups\/[^/]+\/providers\/[^/]+\/[^/]+\/[^/]+/);
      if (resourceIdMatch) {
        const resourceId = resourceIdMatch[0];

        // Display the Resource ID in the popup
        document.getElementById("resourceId").textContent = resourceId;

        // Copy the Resource ID to the clipboard
        try {
          await navigator.clipboard.writeText(resourceId);
        } catch (err) {
          document.getElementById("resourceId").textContent = "Failed to copy Resource ID.";
        }
      } else {
        document.getElementById("resourceId").textContent = "No valid Resource ID found in the URL.";
      }
    } else {
      document.getElementById("resourceId").textContent = "This extension only works on the Azure Portal.";
    }
  })();
});

document.addEventListener("DOMContentLoaded", () => {
  const resourceIdElement = document.getElementById("resourceId");

  if (!resourceIdElement) {
    console.error("Element with ID 'resourceId' not found in the DOM.");
    return;
  }

  // Listen for messages from background.js
  chrome.runtime.onMessage.addListener((message) => {
    if (message.resourceId) {
      // Display the copied Resource ID
      resourceIdElement.textContent = message.resourceId;
    } else if (message.error) {
      // Display the error message
      resourceIdElement.textContent = message.error;
    } else {
      // Fallback message
      resourceIdElement.textContent = "No data received.";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const messageElement = document.getElementById("message");
  const detailsElement = document.getElementById("details");

  // Listen for messages from background.js
  chrome.runtime.onMessage.addListener((message) => {
    if (message.status === "success") {
      // Display success message
      messageElement.textContent = "Resource ID copied successfully!";
      detailsElement.textContent = message.resourceId;
    } else if (message.status === "error") {
      // Display error message
      messageElement.textContent = "Error:";
      detailsElement.textContent = message.message;
    }
  });
});