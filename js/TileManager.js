import { TILE_CONFIG } from './config.js';

export class TileManager {
    constructor() {
        this.tileCache = new Map();
        this.loadPromise = null;
    }

    // Завантажує всі тайли та кешує їх
    async preloadTiles() {
        console.log('Починаю завантаження тайлів...');
        
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = new Promise(async (resolve) => {
            const tileTypes = Object.keys(TILE_CONFIG);
            const loadPromises = tileTypes.map(type => this.loadTile(type));
            
            try {
                await Promise.all(loadPromises);
                console.log('Всі тайли завантажено успішно');
                resolve();
            } catch (error) {
                console.error('Помилка завантаження тайлів:', error);
                resolve(); // Резолвимо проміс навіть при помилці, щоб гра могла продовжуватись
            }
        });

        return this.loadPromise;
    }

    // Завантажує окремий тайл
    async loadTile(type) {
        if (this.tileCache.has(type)) {
            return this.tileCache.get(type);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.tileCache.set(type, img);
                console.log(`Тайл ${type} завантажено`);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Помилка завантаження тайлу ${type}`);
                reject(new Error(`Failed to load tile ${type}`));
            };
            img.src = `assets/tiles/${type}.svg`;
        });
    }

    // Отримує зображення тайлу з кешу
    getTile(type) {
        return this.tileCache.get(type);
    }

    // Перевіряє чи всі тайли завантажені
    isLoaded() {
        return this.tileCache.size === Object.keys(TILE_CONFIG).length;
    }
} 