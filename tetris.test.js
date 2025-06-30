import { createMatrix, createPiece } from './tetris.js';

describe('createMatrix', () => {
  test('should create a matrix of the specified dimensions filled with zeros', () => {
    const matrix = createMatrix(3, 4);
    expect(matrix.length).toBe(4);
    expect(matrix[0].length).toBe(3);
    expect(matrix[0]).toEqual([0, 0, 0]);
    expect(matrix[3]).toEqual([0, 0, 0]);
  });
});

describe('createPiece', () => {
  test('should create an I piece', () => {
    const piece = createPiece('I');
    expect(piece).toEqual([
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ]);
  });

  test('should create an O piece', () => {
    const piece = createPiece('O');
    expect(piece).toEqual([
      [4, 4],
      [4, 4],
    ]);
  });

  test('should return undefined for an unknown piece type', () => {
    const piece = createPiece('X');
    expect(piece).toBeUndefined();
  });
});
