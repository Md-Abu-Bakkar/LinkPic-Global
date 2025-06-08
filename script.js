document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const uploadBox = document.getElementById('uploadBox');
    const uploadLabel = document.querySelector('.upload-label');
    const imagePreview = document.getElementById('imagePreview');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const linkForm = document.getElementById('linkForm');
    const resultArea = document.getElementById('resultArea');
    const generatedLink = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const testLink = document.getElementById('testLink');
    
    // State
    let uploadedImage = null;
    
    // Initialize
    initUploadBox();
    
    function initUploadBox() {
        // Click to upload
        uploadBox.addEventListener('click', function(e) {
            if (e.target === uploadBox || e.target === uploadLabel) {
                imageUpload.click();
            }
        });
        
        // Drag and drop
        uploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadBox.classList.add('dragover');
        });
        
        uploadBox.addEventListener('dragleave', function() {
            uploadBox.classList.remove('dragover');
        });
        
        uploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadBox.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleImageUpload(e.dataTransfer.files[0]);
            }
        });
        
        // File input change
        imageUpload.addEventListener('change', function(e) {
            if (e.target.files.length) {
                handleImageUpload(e.target.files[0]);
            }
        });
    }
    
    // Handle image upload
    function handleImageUpload(file) {
        // Validate file
        if (!file.type.match('image.*')) {
            showError('Please upload an image file (JPG, PNG, WEBP)');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showError('Image size should be less than 10MB');
            return;
        }
        
        // Show loading state
        loadingOverlay.classList.remove('hidden');
        uploadLabel.classList.add('hidden');
        
        // Process image
        const reader = new FileReader();
        reader.onload = function(e) {
            optimizeImage(e.target.result, function(optimizedImage) {
                uploadedImage = optimizedImage;
                displayPreviewImage(optimizedImage);
                loadingOverlay.classList.add('hidden');
            });
        };
        reader.readAsDataURL(file);
    }
    
    // Optimize image for web
    function optimizeImage(imageData, callback) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions (max 1600px)
            const MAX_DIMENSION = 1600;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image with new dimensions
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to WEBP (85% quality) for better compression
            if (imageData.startsWith('data:image/png')) {
                // PNGs with transparency
                callback(canvas.toDataURL('image/png'));
            } else {
                // JPG/WEBP - use WEBP if supported
                try {
                    callback(canvas.toDataURL('image/webp', 0.85));
                } catch (e) {
                    // Fallback to JPEG if WEBP not supported
                    callback(canvas.toDataURL('image/jpeg', 0.85));
                }
            }
        };
        img.src = imageData;
    }
    
    // Display preview image
    function displayPreviewImage(imageData) {
        imagePreview.src = imageData;
        imagePreview.classList.remove('hidden');
        
        // Fade in animation
        imagePreview.style.opacity = 0;
        setTimeout(() => {
            imagePreview.style.transition = 'opacity 0.5s ease';
            imagePreview.style.opacity = 1;
        }, 10);
    }
    
    // Form submission
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!uploadedImage) {
            showError('Please upload an image first');
            return;
        }
        
        const destinationUrl = document.getElementById('destinationUrl').value;
        if (!isValidUrl(destinationUrl)) {
            showError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }
        
        const imageCaption = document.getElementById('imageCaption').value;
        
        // Generate unique ID for the link
        const linkId = generateId(12);
        
        // Store data in localStorage with expiration (7 days)
        const linkData = {
            image: uploadedImage,
            url: destinationUrl,
            caption: imageCaption,
            timestamp: new Date().getTime(),
            expires: new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Clean up old entries
        cleanupStorage();
        
        // Create the shareable link
        const baseUrl = window.location.href.replace('index.html', '');
        const link = `${baseUrl}redirect.html?id=${linkId}`;
        
        // Display result
        generatedLink.value = link;
        testLink.href = link;
        resultArea.classList.remove('hidden');
        
        // Scroll to result with animation
        setTimeout(() => {
            resultArea.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });
    
    // Copy link to clipboard
    copyBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyBtn.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);
    });
    
    // Helper functions
    function generateId(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    function showError(message) {
        alert(message); // Replace with prettier error display in production
    }
    
    function cleanupStorage() {
        const now = new Date().getTime();
        const keysToRemove = [];
        
        // Find expired items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('linkpic_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.expires && data.expires < now) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    keysToRemove.push(key);
                }
            }
        }
        
        // Remove expired items
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
});
