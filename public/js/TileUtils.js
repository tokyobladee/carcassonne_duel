// Константи для типів сторін
export const TILE_SIDES = {
    CITY: 'C',
    ROAD: 'R',
    FIELD: 'F'
};

// Константи для індексів сторін
export const SIDE_INDEX = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3
};

/**
 * Отримує сторони тайлу з урахуванням повороту
 * @param {string} tileType - Тип тайлу (наприклад, 'CFFR')
 * @param {number} rotation - Поворот в градусах (0, 90, 180, 270)
 * @returns {string} - Рядок з поверненими сторонами
 */
export function getRotatedSides(tileType, rotation) {
    console.log(`\n=== Rotating tile ${tileType} by ${rotation} degrees ===`);
    
    // Нормалізуємо поворот до 0-359
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    console.log(`Normalized rotation: ${normalizedRotation} degrees`);
    
    // Перетворюємо рядок на масив
    let sides = tileType.split('');
    console.log('Initial sides (TOP-RIGHT-BOTTOM-LEFT):', sides.join(''));
    
    // Обчислюємо кількість поворотів на 90 градусів за годинниковою стрілкою
    const rotations = Math.floor(normalizedRotation / 90);
    console.log(`Number of 90-degree rotations: ${rotations}`);
    
    // Виконуємо повороти
    for (let i = 0; i < rotations; i++) {
        // При повороті на 90° за годинниковою стрілкою:
        // [TOP, RIGHT, BOTTOM, LEFT] -> [LEFT, TOP, RIGHT, BOTTOM]
        const temp = [...sides];
        sides[0] = temp[3];  // LEFT -> TOP
        sides[1] = temp[0];  // TOP -> RIGHT
        sides[2] = temp[1];  // RIGHT -> BOTTOM
        sides[3] = temp[2];  // BOTTOM -> LEFT
        
        console.log(`After ${90 * (i + 1)}° rotation:`, sides.join(''));
    }
    
    const result = sides.join('');
    console.log(`Final rotated sides: ${result}`);
    console.log('=== Rotation complete ===\n');
    
    return result;
}

/**
 * Перевіряє чи можна розмістити тайл біля існуючого
 * @param {string} newTileType - Тип нового тайлу
 * @param {number} newRotation - Поворот нового тайлу
 * @param {string} existingTileType - Тип існуючого тайлу
 * @param {number} existingRotation - Поворот існуючого тайлу
 * @param {string} direction - Напрямок розміщення ('top', 'right', 'bottom', 'left')
 * @returns {boolean} - true якщо тайли сумісні
 */
export function canPlaceTileNextTo(newTileType, newRotation, existingTileType, existingRotation, direction) {
    console.log('\n=== Starting canPlaceTileNextTo ===');
    console.log(`New tile: ${newTileType} (rotation: ${newRotation})`);
    console.log(`Existing tile: ${existingTileType} (rotation: ${existingRotation})`);
    console.log(`Direction: ${direction}`);

    // Отримуємо сторони тайлів з урахуванням поворотів
    const rotatedNewTile = getRotatedSides(newTileType, newRotation);
    const rotatedExistingTile = getRotatedSides(existingTileType, existingRotation);
    const newSides = rotatedNewTile.split('');
    const existingSides = rotatedExistingTile.split('');
    
    console.log('Original new tile:', newTileType, '-> Rotated:', rotatedNewTile);
    console.log('Original existing tile:', existingTileType, '-> Rotated:', rotatedExistingTile);
    console.log('New sides array (TOP-RIGHT-BOTTOM-LEFT):', newSides.join('-'));
    console.log('Existing sides array (TOP-RIGHT-BOTTOM-LEFT):', existingSides.join('-'));
    
    let newSide, existingSide;
    
    // Визначаємо, які сторони мають з'єднуватися
    // Порядок сторін у рядку: TOP(0), RIGHT(1), BOTTOM(2), LEFT(3)
    switch (direction) {
        case 'top': // Новий тайл знизу
            newSide = newSides[0];      // top нового
            existingSide = existingSides[2]; // bottom існуючого
            break;
        case 'right': // Новий тайл справа
            newSide = newSides[1];      // RIGHT нового
            existingSide = existingSides[3]; // LEFT існуючого
            break;
        case 'bottom': // Новий тайл зверху
            newSide = newSides[2];      // BOTTOM нового
            existingSide = existingSides[0]; // TOP існуючого
            break;
        case 'left': // Новий тайл справа
            newSide = newSides[3];      // LEFT нового
            existingSide = existingSides[1]; // RIGHT існуючого
            break;
        default:
            console.error('Invalid direction:', direction);
            return false;
    }

    console.log(`\nChecking connection for direction: ${direction}`);
    console.log(`New tile side: ${newSide} (${getSideName(direction, true)})`);
    console.log(`Existing tile side: ${existingSide} (${getSideName(direction, false)})`);
    
    const isCompatible = areSidesCompatible(newSide, existingSide);
    console.log(`Compatible: ${isCompatible}\n`);
    
    return isCompatible;
}

// Допоміжна функція для отримання назви сторони
function getSideName(direction, isNewTile) {
    switch (direction) {
        case 'top':
            return isNewTile ? 'BOTTOM' : 'TOP';
        case 'right':
            return isNewTile ? 'LEFT' : 'RIGHT';
        case 'bottom':
            return isNewTile ? 'TOP' : 'BOTTOM';
        case 'left':
            return isNewTile ? 'RIGHT' : 'LEFT';
        default:
            return 'UNKNOWN';
    }
}

/**
 * Перевіряє чи сумісні дві сторони
 * @param {string} side1 - Тип першої сторони (C, R, F)
 * @param {string} side2 - Тип другої сторони (C, R, F)
 * @returns {boolean} - true якщо сторони сумісні
 */
export function areSidesCompatible(side1, side2) {
    console.log(`\nChecking compatibility between sides: ${side1} and ${side2}`);
    
    // Перевіряємо, що обидві сторони мають допустимі значення
    if (!Object.values(TILE_SIDES).includes(side1) || !Object.values(TILE_SIDES).includes(side2)) {
        console.log('Invalid side type detected');
        return false;
    }

    // Правила сумісності:
    // 1. Місто (C) має з'єднуватися з містом (C)
    // 2. Дорога (R) має з'єднуватися з дорогою (R)
    // 3. Поле (F) має з'єднуватися з полем (F)
    const isCompatible = side1 === side2;
    
    // Додаткове логування для діагностики
    if (!isCompatible) {
        console.log(`Incompatible sides: ${side1} cannot connect to ${side2}`);
        console.log(`Required: ${side1} should be equal to ${side2}`);
    } else {
        console.log(`Compatible sides: ${side1} matches ${side2}`);
    }
    
    return isCompatible;
}

/**
 * Отримує тип конкретної сторони тайлу з урахуванням повороту
 * @param {string} tileType - Тип тайлу
 * @param {number} rotation - Поворот в градусах
 * @param {number} sideIndex - Індекс сторони (0-3: верх, право, низ, ліво)
 * @returns {string} - Тип сторони (C, R, F)
 */
export function getTileSide(tileType, rotation, sideIndex) {
    const rotatedSides = getRotatedSides(tileType, rotation);
    return rotatedSides[sideIndex];
} 