export const BOARD_SIZE = 10;

// Типи ландшафту
export const LANDSCAPE = {
    CITY: 'C',
    ROAD: 'R',
    FIELD: 'F'
};

// Конфігурація тайлів для гри (тип та кількість)
export const TILE_CONFIG = {
    'CCRF': 4,  // Місто-Місто-Дорога-Поле
    'CCFR': 4,  // Місто-Місто-Поле-Дорога
    'CFRF': 11, // Місто-Поле-Дорога-Поле
    'CRRF': 9,  // Місто-Дорога-Дорога-Поле
    'CRFF': 9,  // Місто-Дорога-Поле-Поле
    'FFCR': 4,  // Поле-Поле-Місто-Дорога
    'FFRF': 4,  // Поле-Поле-Дорога-Поле
    'FRRF': 9,  // Поле-Дорога-Дорога-Поле
    'FFCC': 4,  // Поле-Поле-Місто-Місто
    'RRFF': 6   // Дорога-Дорога-Поле-Поле
};

// Можливі тайли для границі
export const BORDER_TILES = {
    top: ['CFRF', 'CRFF', 'CRRF'], // Тайли з містом зверху
    right: ['FFCR', 'CCFR'], // Тайли з містом справа
    bottom: ['FFCC', 'FFCR'], // Тайли з містом знизу
    left: ['FFCR', 'CCFR'] // Тайли з містом зліва
};

// Початкова матриця поля (null означає порожню клітинку)
export const INITIAL_BOARD = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

// Правила для границь
export const BORDER_RULES = {
    cityCount: 4,  // Кількість міст на границі
    roadCount: 8,  // Кількість доріг на границі
    citiesPerSide: 1, // Кількість міст на кожній стороні
    roadsPerSide: 2  // Кількість доріг на кожній стороні
};

// Кутові клітинки
export const CORNERS = [
    [0, 0],           // Верхній лівий кут
    [0, BOARD_SIZE-1],    // Верхній правий кут
    [BOARD_SIZE-1, 0],    // Нижній лівий кут
    [BOARD_SIZE-1, BOARD_SIZE-1]  // Нижній правий кут
];

// Кількість джокерів на гравця
export const JOKERS_PER_PLAYER = 2;

// Очки за різні типи ландшафту
export const POINTS = {
    CITY: {
        COMPLETE: 2,    // Множник для завершеного міста
        INCOMPLETE: 1   // Очки за незавершене місто
    },
    ROAD: {
        COMPLETE: 2,    // Множник для завершеної дороги
        INCOMPLETE: 1   // Очки за незавершену дорогу
    }
};

// Кольори гравців
export const PLAYER_COLORS = {
    1: '#e74c3c',
    2: '#3498db'
};