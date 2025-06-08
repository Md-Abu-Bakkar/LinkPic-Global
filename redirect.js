<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkPicGlobal - View Image</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Adsterra Ads -->
    <script type='text/javascript' src='//pl26865068.profitableratecpm.com/28/5a/9d/285a9daf669638cc241d55b11a9022a8.js'></script>
    <script type='text/javascript' src='//pl26865081.profitableratecpm.com/3f/7c/da/3f7cdae06fb7910f8f7c01f3378a4291.js'></script>
</head>
<body>
    <div class="redirect-container">
        <div class="ad-container top-ad">
            <!-- Ad will be loaded here -->
        </div>
        
        <div class="image-viewer">
            <div class="image-container">
                <div class="loading-overlay" id="loadingOverlay">
                    <div class="spinner"></div>
                    <p>Loading image...</p>
                </div>
                <img id="displayImage" alt="Linked Image" class="hidden">
            </div>
            <div id="imageCaption" class="caption"></div>
            <a href="#" id="destinationLink" class="destination-btn">Go to Original URL</a>
        </div>
        
        <div class="ad-container bottom-ad">
            <!-- Ad will be loaded here -->
        </div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const linkId = urlParams.get('id');
        const displayImage = document.getElementById('displayImage');
        const captionElement = document.getElementById('imageCaption');
        const destinationLink = document.getElementById('destinationLink');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (linkId) {
            // Retrieve data from localStorage
            const linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
            
            if (linkData) {
                // Display the image
                displayImage.onload = function() {
                    loadingOverlay.classList.add('hidden');
                    displayImage.classList.remove('hidden');
                };
                
                displayImage.onerror = function() {
                    loadingOverlay.textContent = 'Failed to load image';
                };
                
                displayImage.src = linkData.image;
                
                // Set caption if available
                if (linkData.caption) {
                    captionElement.textContent = linkData.caption;
                } else {
                    captionElement.classList.add('hidden');
                }
                
                // Set destination URL
                if (linkData.url) {
                    destinationLink.href = linkData.url;
                } else {
                    destinationLink.classList.add('hidden');
                }
            } else {
                loadingOverlay.textContent = 'Link not found or expired';
            }
        } else {
            loadingOverlay.textContent = 'Invalid link - missing ID';
        }
    });
    </script>
</body>
</html>
