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
            
            // Оновлюємо відображення без анімації
            const currentTileElement = document.getElementById('currentTile');
            if (currentTileElement) {
                // Спочатку прибираємо всі стилі та transition
                currentTileElement.style.cssText = '';
                currentTileElement.style.transition = 'none';
                
                // Застосовуємо нові стилі
                requestAnimationFrame(() => {
                    currentTileElement.style.backgroundImage = `url('assets/tiles/${this.currentTile.type}.svg')`;
                    currentTileElement.style.transform = 'rotate(0deg)';
                    
                    // Повертаємо transition для наступних обертань
                    requestAnimationFrame(() => {
                        currentTileElement.style.transition = 'transform 0.3s ease';
                    });
                });
            }

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
            const currentRotation = this.currentTile.rotation;
            const newRotation = ((currentRotation + 90) % 360);
            
            console.log(`Rotating from ${currentRotation}° to ${newRotation}°`);
            
            // Оновлюємо значення повороту
            this.currentTile.rotation = newRotation;
            
            // Оновлюємо відображення
            const currentTileElement = document.getElementById('currentTile');
            if (currentTileElement) {
                currentTileElement.style.transform = `rotate(${newRotation}deg)`;
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
} 