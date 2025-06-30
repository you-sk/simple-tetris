import { jest } from '@jest/globals';

const mockCanvas = {
  getContext: jest.fn(() => ({
    scale: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
  })),
};

// Use the existing document object from JSDOM and modify its properties
document.getElementById = jest.fn((id) => {
  if (id === 'tetris' || id === 'next') {
    return mockCanvas;
  } else if (id === 'title-screen' || id === 'game-over-screen' || id === 'game-container') {
    return { style: {} };
  } else if (id === 'start-button' || id === 'retry-button') {
    return { addEventListener: jest.fn() };
  } else if (id === 'final-score' || id === 'score' || id === 'highscore') {
    return { innerText: '' };
  }
  return null;
});

document.addEventListener = jest.fn();

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn(() => '0'),
    setItem: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: {
    getGamepads: jest.fn(() => []), // Mock an empty array for gamepads
  },
  writable: true,
});
