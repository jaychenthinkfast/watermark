class WatermarkTool {
    constructor() {
        this.imageInput = document.getElementById('imageInput');
        this.watermarkText = document.getElementById('watermarkText');
        this.tilePattern = document.getElementById('tilePattern');
        this.addWatermarkBtn = document.getElementById('addWatermark');
        this.downloadAllBtn = document.getElementById('downloadAll');
        this.originalImagesContainer = document.querySelector('#originalImages .images');
        this.watermarkedImagesContainer = document.querySelector('#watermarkedImages .images');
        this.watermarkedImages = [];
        this.previewModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        this.previewImage = document.getElementById('previewImage');

        this.init();
    }

    init() {
        this.imageInput.addEventListener('change', () => this.handleImageUpload());
        this.addWatermarkBtn.addEventListener('click', () => this.processImages());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllImages());
        this.setupImagePreview();
    }

    setupImagePreview() {
        this.originalImagesContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.showPreview(e.target.src);
            }
        });

        this.watermarkedImagesContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.showPreview(e.target.src);
            }
        });
    }

    showPreview(src) {
        this.previewImage.src = src;
        this.previewModal.show();
    }

    handleImageUpload() {
        this.originalImagesContainer.innerHTML = '';
        const files = this.imageInput.files;
        
        const loadPromises = [];
        
        for (const file of files) {
            const promise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.onload = () => resolve(img);
                    img.src = e.target.result;
                    const wrapper = document.createElement('div');
                    wrapper.className = 'image-wrapper';
                    wrapper.appendChild(img);
                    this.originalImagesContainer.appendChild(wrapper);
                };
                reader.readAsDataURL(file);
            });
            loadPromises.push(promise);
        }
        
        Promise.all(loadPromises).then(loadedImages => {
            this.loadedImages = loadedImages;
        });
    }

    async processImages() {
        const watermarkText = this.watermarkText.value;
        if (!watermarkText) {
            alert('请输入水印文字');
            return;
        }

        if (!this.loadedImages || this.loadedImages.length === 0) {
            alert('请先选择图片');
            return;
        }

        this.watermarkedImagesContainer.innerHTML = '';
        this.watermarkedImages = [];
        
        for (const img of this.loadedImages) {
            const watermarkedImage = await this.addWatermark(img, watermarkText);
            this.watermarkedImages.push(watermarkedImage);
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';
            
            const resultImg = document.createElement('img');
            resultImg.src = watermarkedImage;
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.innerHTML = '<i class="bi bi-download"></i>下载';
            downloadBtn.onclick = () => this.downloadImage(watermarkedImage);
            
            wrapper.appendChild(resultImg);
            wrapper.appendChild(downloadBtn);
            this.watermarkedImagesContainer.appendChild(wrapper);
        }
        this.downloadAllBtn.style.display = this.watermarkedImages.length > 0 ? 'block' : 'none';
    }

    async addWatermark(img, text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        ctx.font = `${canvas.width * 0.05}px Arial`;
        ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
        
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = canvas.width * 0.05;
        
        const tileCount = parseInt(this.tilePattern.value);
        const spacingX = canvas.width / tileCount;
        const spacingY = canvas.height / tileCount;
        
        for (let i = 0; i < tileCount; i++) {
            for (let j = 0; j < tileCount; j++) {
                const x = spacingX * i + (spacingX - textWidth) / 2;
                const y = spacingY * j + (spacingY + textHeight) / 2;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 6);
                ctx.fillText(text, 0, 0);
                ctx.restore();
            }
        }
        
        return canvas.toDataURL('image/jpeg', 0.9);
    }

    downloadImage(dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `watermarked_${Date.now()}.jpg`;
        link.click();
    }

    async downloadAllImages() {
        if (this.watermarkedImages.length === 0) {
            alert('没有可下载的图片');
            return;
        }

        const JSZip = window.JSZip;
        const zip = new JSZip();

        this.watermarkedImages.forEach((dataUrl, index) => {
            const imageData = dataUrl.split(',')[1];
            zip.file(`watermarked_${index + 1}.jpg`, imageData, {base64: true});
        });

        const zipContent = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipContent);
        link.download = `watermarked_images_${Date.now()}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}

new WatermarkTool(); 