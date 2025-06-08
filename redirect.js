class RedirectPage {
    constructor() {
        this.initElements();
        this.loadImageData();
    }

    initElements() {
        this.displayImage = document.getElementById('displayImage');
        this.captionElement = document.getElementById('imageCaption');
        this.destinationLink = document.getElementById('destinationLink');
        this.imageLoading = document.getElementById('imageLoading');
        this.imageError = document.getElementById('imageError');
    }

    loadImageData() {
        const urlParams = new URLSearchParams(window.location.search);
        const linkId = urlParams.get('id');
        
        if (!linkId) {
            this.showError('Invalid link - missing ID');
            return;
        }
        
        const linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
        
        if (!linkData) {
            this.showError('Link not found or expired');
            return;
        }
        
        // Update stats (count this as a view)
        linkData.stats.views = (linkData.stats.views || 0) + 1;
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Display the content
        this.displayCaption(linkData.caption);
        this.setupDestinationLink(linkData.url, linkId);
        this.loadImage(linkData.image);
    }

    loadImage(imageData) {
        this.displayImage.onload = () => {
            this.imageLoading.classList.add('hidden');
            this.displayImage.classList.remove('hidden');
        };
        
        this.displayImage.onerror = () => {
            this.imageLoading.classList.add('hidden');
            this.showError('Failed to load image');
        };
        
        this.displayImage.src = imageData;
    }

    displayCaption(caption) {
        if (caption && caption.trim() !== '') {
            this.captionElement.textContent = caption;
            this.captionElement.classList.remove('hidden');
        }
    }

    setupDestinationLink(url, linkId) {
        if (url) {
            this.destinationLink.href = url;
            
            // Track click event
            this.destinationLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update click stats
                const linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
                linkData.stats.clicks = (linkData.stats.clicks || 0) + 1;
                localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
                
                // Open destination in new tab
                window.open(url, '_blank');
            });
        } else {
            this.destinationLink.classList.add('hidden');
        }
    }

    showError(message) {
        this.imageLoading.classList.add('hidden');
        this.imageError.querySelector('p').textContent = message;
        this.imageError.classList.remove('hidden');
    }
}

// Initialize the redirect page
document.addEventListener('DOMContentLoaded', () => new RedirectPage());
