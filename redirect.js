document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const displayImage = document.getElementById('displayImage');
    const captionElement = document.getElementById('imageCaption');
    const destinationLink = document.getElementById('destinationLink');
    const imageLoading = document.getElementById('imageLoading');
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('id');
    
    // Load link data
    if (linkId) {
        loadLinkData(linkId);
    } else {
        showError();
    }
    
    function loadLinkData(id) {
        const linkData = JSON.parse(localStorage.getItem(`linkpic_${id}`));
        
        if (linkData && (!linkData.expires || linkData.expires > Date.now())) {
            // Display the image
            displayImage.onload = function() {
                // Hide loading and show image with animation
                imageLoading.classList.add('hidden');
                displayImage.classList.add('animate__animated', 'animate__fadeIn');
            };
            
            displayImage.onerror = function() {
                imageLoading.classList.add('hidden');
                showError('Failed to load image');
            };
            
            displayImage.src = linkData.image;
            
            // Set caption if available
            if (linkData.caption) {
                captionElement.textContent = linkData.caption;
                captionElement.classList.add('animate__animated', 'animate__fadeInUp');
            } else {
                captionElement.classList.add('hidden');
            }
            
            // Set destination URL
            if (linkData.url) {
                destinationLink.href = linkData.url;
                destinationLink.classList.add('animate__animated', 'animate__fadeInUp');
                
                // Add click tracking
                destinationLink.addEventListener('click', function(e) {
                    // Here you can add analytics to track clicks
                    console.log('Navigating to:', linkData.url);
                });
            } else {
                destinationLink.classList.add('hidden');
            }
        } else {
            // Data not found or expired
            imageLoading.classList.add('hidden');
            showError('Link not found or expired');
        }
    }
    
    function showError(message = 'Invalid link') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message animate__animated animate__fadeIn';
        errorDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.29 15.29a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42 1 1 0 0 0-1.42 0 1 1 0 0 0 0 1.42zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-13a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1z"/>
            </svg>
            <p>${message}</p>
        `;
        
        document.querySelector('.image-viewer').appendChild(errorDiv);
    }
});
