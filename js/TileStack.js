import { TILE_CONFIG } from './config.js';

export class TileStack {
    constructor() {
        this.initializeTiles();
        this.currentTile = null;
        this.drawNextTile();

        // Ініціалізуємо лічильник тайлів
        const tilesLeftElement = document.getElementById('tilesLeft');
        if (tilesLeftElement) {
            tilesLeftElement.textContent = this.tiles.length;
        }

        console.log('TileStack initialized');
    }

    initializeTiles() {
        console.log('Initializing tile stack...');
        this.tiles = [];
        
        // Додаємо тайли відповідно до конфігурації
        for (const [tileType, count] of Object.entries(TILE_CONFIG)) {
            for (let i = 0; i < count; i++) {
                this.tiles.push(tileType);
            }
        }
        
        // Перемішуємо тайли
        this.shuffle();
        
        console.log(`Created tile stack with ${this.tiles.length} tiles`);
    }

    shuffle() {
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }
    }

    drawNextTile() {
        console.log('Drawing next tile...');
        if (this.tiles && this.tiles.length > 0) {
            const nextTileType = this.tiles.pop();
            console.log('Next tile type:', nextTileType);
            
            // Створюємо новий тайл з нульовим поворотом
            this.currentTile = {
                type: nextTileType,
                rotation: 0
            };
            
            // Оновлюємо відображення
            this.updateCurrentTileDisplay();

            // Оновлюємо лічильник тайлів
            const tilesLeftElement = document.getElementById('tilesLeft');
            if (tilesLeftElement) {
                tilesLeftElement.textContent = this.tiles.length;
            }
            
            console.log('Current tile set to:', this.currentTile);
            return this.currentTile;
        }
        return null;
    }

    rotateCurrentTile() {
        if (this.currentTile) {
            // Визначаємо новий кут повороту
            const currentRotation = this.currentTile.rotation || 0;
            const newRotation = (currentRotation + 90) % 360;
            
            console.log(`Rotating from ${currentRotation}° to ${newRotation}°`);
            
            // Оновлюємо значення повороту
            this.currentTile.rotation = newRotation;
            
            // Оновлюємо відображення
            const currentTileElement = document.getElementById('currentTile');
            if (currentTileElement) {
                const img = currentTileElement.querySelector('img');
                if (img) {
                    img.style.transform = `rotate(${newRotation}deg)`;
                } else {
                    console.error('Image element not found in currentTile');
                }
            }
            
            console.log('Rotated tile to:', this.currentTile.rotation);
        }
    }

    skipTile() {
        console.log('Skipping current tile...');
        if (this.currentTile) {
            this.tiles.unshift(this.currentTile.type);
            return this.drawNextTile();
        }
        return null;
    }

    reset() {
        console.log('Resetting tile stack...');
        this.initializeTiles();
        this.currentTile = null;
        return this.drawNextTile();
    }

    isEmpty() {
        return this.tiles.length === 0;
    }

    updateCurrentTileDisplay() {
        console.log('Оновлення відображення поточного тайлу');
        const currentTileElement = document.getElementById('currentTile');
        if (!currentTileElement) {
            console.error('Елемент currentTile не знайдено');
            return;
        }

        // Очищаємо контейнер
        currentTileElement.innerHTML = '';
        
        if (this.currentTile) {
            console.log('Створення нового зображення для тайлу:', this.currentTile);
            
            // Створюємо новий елемент img
            const img = document.createElement('img');
            
            // Встановлюємо атрибути та стилі
            img.src = `assets/tiles/${this.currentTile.type}.svg`;
            img.alt = this.currentTile.type;
            
            // Застосовуємо стилі напряму
            Object.assign(img.style, {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `rotate(${this.currentTile.rotation || 0}deg)`,
                transition: 'transform 0.3s ease',
                display: 'block'
            });
            
            // Додаємо обробник для перевірки завантаження
            img.onload = () => {
                console.log('Зображення тайлу завантажено успішно');
            };
            
            img.onerror = () => {
                console.error('Помилка завантаження зображення тайлу');
            };
            
            // Додаємо img в контейнер
            currentTileElement.appendChild(img);
            console.log('Зображення тайлу додано до DOM');
        }
    }
} 