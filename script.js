class WatermarkTool {
    constructor() {
        this.imageInput = document.getElementById('imageInput');
        this.watermarkText = document.getElementById('watermarkText');
        this.tilePattern = document.getElementById('tilePattern');
        this.addWatermarkBtn = document.getElementById('addWatermark');
        this.originalImagesContainer = document.querySelector('#originalImages .images');
        this.watermarkedImagesContainer = document.querySelector('#watermarkedImages .images');

        this.init();
    }

    init() {
        this.imageInput.addEventListener('change', () => this.handleImageUpload());
        this.addWatermarkBtn.addEventListener('click', () => this.processImages());
    }

    handleImageUpload() {
        this.originalImagesContainer.innerHTML = '';
        const files = this.imageInput.files;
        
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                const wrapper = document.createElement('div');
                wrapper.className = 'image-wrapper';
                wrapper.appendChild(img);
                this.originalImagesContainer.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        }
    }

    async processImages() {
        const watermarkText = this.watermarkText.value;
        if (!watermarkText) {
            alert('请输入水印文字');
            return;
        }

        this.watermarkedImagesContainer.innerHTML = '';
        const images = this.originalImagesContainer.querySelectorAll('img');
        
        for (const img of images) {
            const watermarkedImage = await this.addWatermark(img, watermarkText);
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';
            
            const resultImg = document.createElement('img');
            resultImg.src = watermarkedImage;
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = '下载';
            downloadBtn.onclick = () => this.downloadImage(watermarkedImage);
            
            wrapper.appendChild(resultImg);
            wrapper.appendChild(downloadBtn);
            this.watermarkedImagesContainer.appendChild(wrapper);
        }
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
}

new WatermarkTool(); 