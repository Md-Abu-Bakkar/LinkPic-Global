document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const uploadBox = document.getElementById('uploadBox');
    const imagePreview = document.getElementById('imagePreview');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const linkForm = document.getElementById('linkForm');
    const resultArea = document.getElementById('resultArea');
    const generatedLink = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const testLink = document.getElementById('testLink');
    const notification = document.getElementById('notification');

    let uploadedImage = null;

    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.match('image.*')) {
                loadingOverlay.classList.remove('hidden');
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Process image to ensure reasonable size
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set maximum dimensions
                        const MAX_WIDTH = 1200;
                        const MAX_HEIGHT = 1200;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to JPEG with 80% quality
                        uploadedImage = canvas.toDataURL('image/jpeg', 0.8);
                        imagePreview.src = uploadedImage;
                        imagePreview.classList.remove('hidden');
                        loadingOverlay.classList.add('hidden');
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // Allow clicking on the upload area
    uploadBox.addEventListener('click', function() {
        imageUpload.click();
    });

    // Handle form submission
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!uploadedImage) {
            showNotification('Please upload an image first', 'error');
            return;
        }

        const destinationUrl = document.getElementById('destinationUrl').value;
        if (!destinationUrl) {
            showNotification('Please enter a destination URL', 'error');
            return;
        }

        const imageCaption = document.getElementById('imageCaption').value;
        
        // Generate unique ID for the link
        const linkId = generateShortId();
        
        // Create data object to store
        const linkData = {
            image: uploadedImage,
            url: destinationUrl,
            caption: imageCaption,
            timestamp: new Date().getTime()
        };

        // Store in localStorage
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Create the short link
        const baseUrl = window.location.href.split('?')[0].replace('index.html', '');
        const shortLink = `${baseUrl}view.html?id=${linkId}`;
        
        // Display the result
        generatedLink.value = shortLink;
        testLink.href = shortLink;
        resultArea.classList.remove('hidden');
        
        // Show success message
        showNotification('Link generated successfully!', 'success');
    });

    // Copy link to clipboard
    copyBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        showNotification('Link copied to clipboard', 'success');
        
        setTimeout(function() {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    });

    // Generate short ID (6 characters)
    function generateShortId() {
        return Math.random().toString(36).substring(2, 8);
    }

    // Show notification
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
