import React from 'react';
import PropTypes from 'prop-types';

// Кольори для різних типів місцевості
const TERRAIN_COLORS = {
    C: {
        gradient: {
            start: '#8d6e63',
            end: '#6d4c41'
        },
        detail: '#4e342e'
    },
    F: {
        gradient: {
            start: '#7cb342',
            end: '#558b2f'
        }
    },
    R: {
        gradient: {
            start: '#bdbdbd',
            end: '#9e9e9e'
        },
        detail: '#616161'
    }
};

const TileImage = ({ code, rotation = 0, size = 100 }) => {
    // Розбиваємо код на сторони (TRBL: top, right, bottom, left)
    const [top, right, bottom, left] = code.split('');

    // Створюємо унікальні ідентифікатори для градієнтів
    const gradientIds = {
        top: `${code}-top-${rotation}`,
        right: `${code}-right-${rotation}`,
        bottom: `${code}-bottom-${rotation}`,
        left: `${code}-left-${rotation}`
    };

    // Функція для створення градієнта
    const createGradient = (type, id) => (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: TERRAIN_COLORS[type].gradient.start }} />
            <stop offset="100%" style={{ stopColor: TERRAIN_COLORS[type].gradient.end }} />
        </linearGradient>
    );

    // Функція для створення деталей міста
    const createCityDetails = (side) => {
        switch(side) {
            case 'top':
                return <path d="M20,0 v10 h10 v-5 h10 v5 h10 v-10" fill={TERRAIN_COLORS.C.detail}/>;
            case 'right':
                return <path d="M100,20 h-10 v10 h5 v10 h-5 v10" fill={TERRAIN_COLORS.C.detail}/>;
            case 'bottom':
                return <path d="M20,100 v-10 h10 v5 h10 v-5 h10 v10" fill={TERRAIN_COLORS.C.detail}/>;
            case 'left':
                return <path d="M0,20 h10 v10 h-5 v10 h5 v10" fill={TERRAIN_COLORS.C.detail}/>;
            default:
                return null;
        }
    };

    // Функція для створення деталей дороги
    const createRoadDetails = (side) => {
        switch(side) {
            case 'top':
                return <path d="M40,0 v15 h20 v-15" fill="#757575" stroke={TERRAIN_COLORS.R.detail}/>;
            case 'right':
                return <path d="M100,40 h-15 v20 h15" fill="#757575" stroke={TERRAIN_COLORS.R.detail}/>;
            case 'bottom':
                return <path d="M40,100 v-15 h20 v15" fill="#757575" stroke={TERRAIN_COLORS.R.detail}/>;
            case 'left':
                return <path d="M0,40 h15 v20 h-15" fill="#757575" stroke={TERRAIN_COLORS.R.detail}/>;
            default:
                return null;
        }
    };

    // Функція для створення з'єднань між містами
    const createCityConnections = () => {
        const connections = [];
        if (top === 'C' && right === 'C') connections.push(<path key="tr" d="M50,50 L90,10" stroke={TERRAIN_COLORS.C.detail} strokeWidth="3" fill="none"/>);
        if (right === 'C' && bottom === 'C') connections.push(<path key="rb" d="M50,50 L90,90" stroke={TERRAIN_COLORS.C.detail} strokeWidth="3" fill="none"/>);
        if (bottom === 'C' && left === 'C') connections.push(<path key="bl" d="M50,50 L10,90" stroke={TERRAIN_COLORS.C.detail} strokeWidth="3" fill="none"/>);
        if (left === 'C' && top === 'C') connections.push(<path key="lt" d="M50,50 L10,10" stroke={TERRAIN_COLORS.C.detail} strokeWidth="3" fill="none"/>);
        return connections;
    };

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100"
            width={size}
            height={size}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <defs>
                {createGradient(top, gradientIds.top)}
                {createGradient(right, gradientIds.right)}
                {createGradient(bottom, gradientIds.bottom)}
                {createGradient(left, gradientIds.left)}
            </defs>

            {/* Фон */}
            <rect width="100" height="100" fill="white"/>

            {/* Трикутники для кожної сторони */}
            <path className="top" d="M0,0 L100,0 L50,50 Z" fill={`url(#${gradientIds.top})`}/>
            <path className="right" d="M100,0 L100,100 L50,50 Z" fill={`url(#${gradientIds.right})`}/>
            <path className="bottom" d="M100,100 L0,100 L50,50 Z" fill={`url(#${gradientIds.bottom})`}/>
            <path className="left" d="M0,100 L0,0 L50,50 Z" fill={`url(#${gradientIds.left})`}/>

            {/* Центральна точка */}
            <circle cx="50" cy="50" r="3" fill="#424242"/>

            {/* Додаткові деталі */}
            {top === 'C' && createCityDetails('top')}
            {right === 'C' && createCityDetails('right')}
            {bottom === 'C' && createCityDetails('bottom')}
            {left === 'C' && createCityDetails('left')}

            {top === 'R' && createRoadDetails('top')}
            {right === 'R' && createRoadDetails('right')}
            {bottom === 'R' && createRoadDetails('bottom')}
            {left === 'R' && createRoadDetails('left')}

            {/* З'єднання між містами */}
            {createCityConnections()}
        </svg>
    );
};

TileImage.propTypes = {
    code: PropTypes.string.isRequired,
    rotation: PropTypes.number,
    size: PropTypes.number
};

export default TileImage; 