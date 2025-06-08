class LinkPicApp {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.initLocalStorageCleanup();
    }

    initElements() {
        // Upload elements
        this.uploadBox = document.getElementById('uploadBox');
        this.imageUpload = document.getElementById('imageUpload');
        this.imagePreview = document.getElementById('imagePreview');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.qualityRange = document.getElementById('qualityRange');
        this.qualityValue = document.getElementById('qualityValue');
        
        // Form elements
        this.linkForm = document.getElementById('linkForm');
        this.destinationUrl = document.getElementById('destinationUrl');
        this.imageCaption = document.getElementById('imageCaption');
        this.charCount = document.getElementById('charCount');
        this.resetBtn = document.getElementById('resetBtn');
        this.generateBtn = document.getElementById('generateBtn');
        
        // Result elements
        this.resultCard = document.getElementById('resultCard');
        this.resultPreview = document.getElementById('resultPreview');
        this.generatedLink = document.getElementById('generatedLink');
        this.copyBtn = document.getElementById('copyBtn');
        this.testLink = document.getElementById('testLink');
        this.shareBtn = document.getElementById('shareBtn');
        this.createdDate = document.getElementById('createdDate');
        
        // Notification
        this.notification = document.getElementById('notification');
        
        // State
        this.uploadedImage = null;
        this.currentLinkId = null;
    }

    initEventListeners() {
        // File upload handling
        this.imageUpload.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Drag and drop
        this.uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadBox.classList.add('dragover');
        });
        
        this.uploadBox.addEventListener('dragleave', () => {
            this.uploadBox.classList.remove('dragover');
        });
        
        this.uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadBox.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });
        
        // Click to upload
        this.uploadBox.addEventListener('click', () => this.imageUpload.click());
        
        // Quality control
        this.qualityRange.addEventListener('input', () => {
            this.qualityValue.textContent = `${this.qualityRange.value}%`;
        });
        
        // Caption character count
        this.imageCaption.addEventListener('input', () => {
            const count = this.imageCaption.value.length;
            this.charCount.textContent = count;
            if (count > 200) {
                this.charCount.style.color = '#ff4444';
            } else {
                this.charCount.style.color = '#666';
            }
        });
        
        // Form submission
        this.linkForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Reset form
        this.resetBtn.addEventListener('click', () => this.resetForm());
        
        // Copy link
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        // Share link
        this.shareBtn.addEventListener('click', () => this.shareLink());
    }

    handleFileSelect(file) {
        if (!file || !file.type.match('image.*')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }
        
        // Show file info
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        document.querySelector('.file-info').classList.remove('hidden');
        
        // Show loading state
        this.loadingOverlay.classList.remove('hidden');
        document.querySelector('.placeholder-graphic').classList.add('hidden');
        
        const reader = new FileReader();
        reader.onload = (e) => this.processImage(e.target.result);
        reader.readAsDataURL(file);
    }

    processImage(imageData) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set maximum dimensions
            const MAX_WIDTH = 1600;
            const MAX_HEIGHT = 1600;
            
            let { width, height } = this.calculateDimensions(img.width, img.height, MAX_WIDTH, MAX_HEIGHT);
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get quality from slider (convert from 0-100 to 0.5-1.0)
            const quality = this.qualityRange.value / 100;
            
            // Convert to JPEG with specified quality
            this.uploadedImage = canvas.toDataURL('image/jpeg', quality);
            this.imagePreview.src = this.uploadedImage;
            this.imagePreview.classList.remove('hidden');
            this.loadingOverlay.classList.add('hidden');
            
            this.showNotification('Image optimized and ready!', 'success');
        };
        img.onerror = () => {
            this.loadingOverlay.classList.add('hidden');
            this.showNotification('Failed to process image', 'error');
        };
        img.src = imageData;
    }

    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;
        
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }
        
        return { width: Math.round(width), height: Math.round(height) };
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.uploadedImage) {
            this.showNotification('Please upload an image first', 'error');
            return;
        }
        
        if (!this.destinationUrl.checkValidity()) {
            this.showNotification('Please enter a valid destination URL', 'error');
            return;
        }
        
        // Disable button during processing
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        // Generate unique ID for the link
        this.currentLinkId = this.generateId(12);
        
        // Prepare link data
        const linkData = {
            image: this.uploadedImage,
            url: this.destinationUrl.value,
            caption: this.imageCaption.value,
            timestamp: new Date().getTime(),
            stats: {
                views: 0,
                clicks: 0
            }
        };
        
        // Store data in localStorage
        localStorage.setItem(`linkpic_${this.currentLinkId}`, JSON.stringify(linkData));
        
        // Create the shareable link
        const baseUrl = window.location.href.replace('index.html', '');
        const link = `${baseUrl}redirect.html?id=${this.currentLinkId}`;
        
        // Update UI with results
        this.generatedLink.value = link;
        this.testLink.href = link;
        this.resultPreview.src = this.uploadedImage;
        this.createdDate.textContent = new Date().toLocaleDateString();
        
        // Show result card
        this.resultCard.classList.remove('hidden');
        
        // Scroll to result
        setTimeout(() => {
            this.resultCard.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Reset button state
        this.generateBtn.disabled = false;
        this.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Link';
        
        this.showNotification('Link created successfully!', 'success');
    }

    resetForm() {
        this.linkForm.reset();
        this.imagePreview.src = '';
        this.imagePreview.classList.add('hidden');
        this.uploadedImage = null;
        this.currentLinkId = null;
        this.resultCard.classList.add('hidden');
        document.querySelector('.placeholder-graphic').classList.remove('hidden');
        document.querySelector('.file-info').classList.add('hidden');
        this.charCount.textContent = '0';
        this.charCount.style.color = '#666';
        this.qualityRange.value = 85;
        this.qualityValue.textContent = '85%';
    }

    copyToClipboard() {
        this.generatedLink.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        this.copyBtn.classList.add('copied');
        
        this.showNotification('Link copied to clipboard!', 'success');
        
        setTimeout(() => {
            this.copyBtn.innerHTML = originalText;
            this.copyBtn.classList.remove('copied');
        }, 2000);
    }

    shareLink() {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this image',
                text: 'I created this link with LinkPicGlobal',
                url: this.generatedLink.value
            }).catch(err => {
                this.showNotification('Error sharing: ' + err, 'error');
            });
        } else {
            // Fallback for browsers without Web Share API
            this.copyToClipboard();
            this.showNotification('Link copied - paste it anywhere to share', 'info');
        }
    }

    generateId(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type) {
        this.notification.textContent = message;
        this.notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    initLocalStorageCleanup() {
        // Clean up old entries (older than 30 days)
        const now = new Date().getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('linkpic_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (now - data.timestamp > thirtyDays) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => new LinkPicApp());
