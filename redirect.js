document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const imageData = urlParams.get('image');
    const destinationUrl = urlParams.get('url');
    const imageCaption = urlParams.get('caption');
    
    const displayImage = document.getElementById('displayImage');
    const captionElement = document.getElementById('imageCaption');
    const destinationLink = document.getElementById('destinationLink');
    
    if (imageData) {
        displayImage.src = imageData;
    } else {
        displayImage.src = 'placeholder-image.png';
    }
    
    if (imageCaption) {
        captionElement.textContent = decodeURIComponent(imageCaption);
    } else {
        captionElement.classList.add('hidden');
    }
    
    if (destinationUrl) {
        destinationLink.href = decodeURIComponent(destinationUrl);
    } else {
        destinationLink.classList.add('hidden');
    }
});
