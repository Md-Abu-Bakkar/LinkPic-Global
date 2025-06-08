document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const uploadBox = document.getElementById('uploadBox');
    const imagePreview = document.getElementById('imagePreview');
    const linkForm = document.getElementById('linkForm');
    const resultArea = document.getElementById('resultArea');
    const generatedLink = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    
    let uploadedImage = null;
    
    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                uploadedImage = e.target.result;
                imagePreview.src = uploadedImage;
                imagePreview.classList.remove('hidden');
                uploadBox.classList.add('hidden');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Allow clicking on the upload area to trigger file input
    uploadBox.addEventListener('click', function() {
        imageUpload.click();
    });
    
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
        const linkId = generateId(6);
        
        // Create the redirect page content
        const redirectPageContent = `
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url='redirect.html?image=${encodeURIComponent(uploadedImage)}&url=${encodeURIComponent(destinationUrl)}&caption=${encodeURIComponent(imageCaption)}'" />
</head>
<body>
    Redirecting...
</body>
</html>
        `;
        
        // In a real implementation, you would save this file to your server
        // For GitHub Pages, we'll simulate it with URL parameters
        const link = `${window.location.href.replace('index.html', '')}redirect.html?image=${encodeURIComponent(uploadedImage)}&url=${encodeURIComponent(destinationUrl)}&caption=${encodeURIComponent(imageCaption)}`;
        
        generatedLink.value = link;
        resultArea.classList.remove('hidden');
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Copy link to clipboard
    copyBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        
        setTimeout(function() {
            copyBtn.textContent = originalText;
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
