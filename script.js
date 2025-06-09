document.addEventListener('DOMContentLoaded', function() {
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
    
    let uploadedImage = null;
    
    // Handle image upload via file input
    imageUpload.addEventListener('change', function(e) {
        handleImageUpload(e.target.files[0]);
    });
    
    // Handle drag and drop
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
    
    // Handle image upload processing
    function handleImageUpload(file) {
        if (file && file.type.match('image.*')) {
            loadingOverlay.classList.remove('hidden');
            uploadLabel.classList.add('hidden');
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Process the image to ensure reasonable size
                processImage(e.target.result, function(processedImage) {
                    uploadedImage = processedImage;
                    imagePreview.src = uploadedImage;
                    imagePreview.classList.remove('hidden');
                    loadingOverlay.classList.add('hidden');
                });
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // Process image to ensure proper dimensions
    function processImage(imageData, callback) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set maximum dimensions
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions maintaining aspect ratio
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
            
            // Convert to JPEG with 80% quality to reduce size
            callback(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = imageData;
    }
    
    // Handle form submission
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!uploadedImage) {
            alert('Please upload an image first');
            return;
        }
        
        const destinationUrl = document.getElementById('destinationUrl').value;
        const imageCaption = document.getElementById('imageCaption').value;
        
        // Generate unique ID for the link
        const linkId = generateId(12);
        
        // Store data in localStorage
        const linkData = {
            image: uploadedImage,
            url: destinationUrl,
            caption: imageCaption,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Create the shareable link
        const baseUrl = window.location.href.replace('index.html', '');
        const link = `${baseUrl}redirect.html?id=${linkId}`;
        
        generatedLink.value = link;
        testLink.href = link;
        resultArea.classList.remove('hidden');
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Copy link to clipboard
    copyBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(function() {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
    
    // Generate random ID
    function generateId(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
});
