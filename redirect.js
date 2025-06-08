document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('id');
    
    const displayImage = document.getElementById('displayImage');
    const captionElement = document.getElementById('imageCaption');
    const destinationLink = document.getElementById('destinationLink');
    const imageLoading = document.getElementById('imageLoading');
    
    if (linkId) {
        // Retrieve data from localStorage
        const linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
        
        if (linkData) {
            // Display the image
            displayImage.onload = function() {
                imageLoading.classList.add('hidden');
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
                
                // Add click tracking if needed
                destinationLink.addEventListener('click', function(e) {
                    // You can add analytics here
                    console.log('User clicked through to:', linkData.url);
                });
            } else {
                destinationLink.classList.add('hidden');
            }
        } else {
            // Data not found
            displayImage.src = 'placeholder-image.png';
            captionElement.textContent = 'Link not found or expired';
            destinationLink.classList.add('hidden');
            imageLoading.classList.add('hidden');
        }
    } else {
        // No ID provided
        displayImage.src = 'placeholder-image.png';
        captionElement.textContent = 'Invalid link';
        destinationLink.classList.add('hidden');
        imageLoading.classList.add('hidden');
    }
});
