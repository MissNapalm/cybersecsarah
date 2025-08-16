import { useState, useEffect, useCallback } from 'react';

const ROWS = 8;
const COLS = 8;
const MINES = 10;

export default function Minesweeper() {
  const [board, setBoard] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [firstClick, setFirstClick] = useState(true);

  const initializeBoard = useCallback(() => {
    const newBoard = Array(ROWS).fill().map(() => 
      Array(COLS).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].adjacentMines = count;
        }
      }
    }

    return newBoard;
  }, []);

  const resetGame = () => {
    setBoard(initializeBoard());
    setGameStatus('playing');
    setFlagsLeft(MINES);
    setFirstClick(true);
  };

  useEffect(() => {
    resetGame();
  }, [initializeBoard]);

  const revealCell = (row, col) => {
    if (gameStatus !== 'playing') return;
    
    if (firstClick) {
      setFirstClick(false);
    }
    
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.map(cell => ({ ...cell })));
      
      const cell = newBoard[row][col];
      if (cell.isRevealed || cell.isFlagged) return prevBoard;

      if (cell.isMine) {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (newBoard[r][c].isMine) {
              newBoard[r][c].isRevealed = true;
            }
          }
        }
        setGameStatus('lost');
        return newBoard;
      }

      const toReveal = [[row, col]];
      const visited = new Set();

      while (toReveal.length > 0) {
        const [r, c] = toReveal.pop();
        const key = `${r},${c}`;
        
        if (visited.has(key)) continue;
        visited.add(key);

        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
        
        const currentCell = newBoard[r][c];
        if (currentCell.isRevealed || currentCell.isFlagged || currentCell.isMine) continue;

        currentCell.isRevealed = true;

        if (currentCell.adjacentMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              toReveal.push([r + dr, c + dc]);
            }
          }
        }
      }

      return newBoard;
    });
  };

  const toggleFlag = (e, row, col) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;

    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];
      
      if (cell.isRevealed) return prevBoard;
      
      if (cell.isFlagged) {
        cell.isFlagged = false;
        setFlagsLeft(prev => prev + 1);
      } else if (flagsLeft > 0) {
        cell.isFlagged = true;
        setFlagsLeft(prev => prev - 1);
      }
      
      return newBoard;
    });
  };

  useEffect(() => {
    if (gameStatus === 'playing' && board.length > 0) {
      const revealedCount = board.flat().filter(cell => cell.isRevealed).length;
      const totalCells = ROWS * COLS;
      
      if (revealedCount === totalCells - MINES) {
        setGameStatus('won');
      }
    }
  }, [board, gameStatus]);

  const getCellContent = (cell) => {
    if (cell.isFlagged) return '◆';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '●';
    if (cell.adjacentMines === 0) return '';
    return cell.adjacentMines;
  };

  const getCellStyle = (cell, row, col) => {
    let baseStyle = 'relative w-12 h-12 font-mono text-lg font-bold flex items-center justify-center transition-all duration-300 border ';
    
    if (cell.isRevealed) {
      if (cell.isMine) {
        baseStyle += 'bg-red-500/20 text-red-400 border-red-500/30 shadow-inner shadow-red-500/20 animate-pulse ';
      } else {
        baseStyle += 'bg-slate-900/50 border-blue-500/20 ';
        
        if (cell.adjacentMines === 1) baseStyle += 'text-blue-300 ';
        else if (cell.adjacentMines === 2) baseStyle += 'text-cyan-300 ';
        else if (cell.adjacentMines === 3) baseStyle += 'text-blue-200 ';
        else if (cell.adjacentMines === 4) baseStyle += 'text-indigo-300 ';
        else if (cell.adjacentMines === 5) baseStyle += 'text-sky-300 ';
        else if (cell.adjacentMines === 6) baseStyle += 'text-blue-400 ';
        else if (cell.adjacentMines === 7) baseStyle += 'text-cyan-400 ';
        else if (cell.adjacentMines === 8) baseStyle += 'text-white ';
      }
    } else {
      if (cell.isFlagged) {
        baseStyle += 'bg-gradient-to-br from-blue-500/30 to-cyan-600/30 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20 ';
      } else {
        baseStyle += 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-blue-500/30 hover:border-cyan-400/60 hover:bg-gradient-to-br hover:from-slate-700/80 hover:to-slate-800/80 cursor-pointer transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 ';
      }
    }
    
    return baseStyle;
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-gray-900 to-black p-2 rounded-xl overflow-hidden w-full h-full">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 shadow-2xl shadow-blue-500/20 p-4 rounded-2xl w-full max-w-full">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text tracking-wider mb-2">
            NEURAL SWEEP
          </h1>
        </div>

        <div className="flex items-center justify-between mb-4 text-xs font-mono bg-slate-800/50 rounded-lg p-2 border border-blue-500/20">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-cyan-400 text-xs tracking-wider">MINES</span>
            <div className="text-xl font-bold text-blue-300 font-mono bg-slate-900/50 px-2 py-1 rounded border border-blue-500/30">
              {flagsLeft.toString().padStart(2, '0')}
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="px-3 py-2 bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white border border-blue-400/50 rounded-lg hover:from-blue-500/80 hover:to-cyan-500/80 transition-all font-mono text-xs tracking-wider shadow-lg shadow-blue-500/20 transform hover:scale-105"
          >
            INITIALIZE
          </button>

          <div className="flex flex-col items-center space-y-1">
            <span className="text-cyan-400 text-xs tracking-wider">STATUS</span>
            <div className={`text-base font-bold font-mono px-2 py-1 rounded border ${
              gameStatus === 'won' ? 'text-green-300 bg-green-900/30 border-green-500/30' : 
              gameStatus === 'lost' ? 'text-red-300 bg-red-900/30 border-red-500/30' : 'text-cyan-300 bg-slate-900/50 border-blue-500/30'
            }`}>
              {gameStatus === 'won' ? 'SUCCESS' : 
               gameStatus === 'lost' ? 'FAILED' : 'ACTIVE'}
            </div>
          </div>
        </div>

        <div className="relative p-1 bg-black/40 rounded-xl border-2 border-blue-500/40 shadow-inner shadow-blue-500/10 w-full overflow-x-auto">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
          </div>

          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellStyle(cell, rowIndex, colIndex)}
                  onClick={() => revealCell(rowIndex, colIndex)}
                  onContextMenu={(e) => toggleFlag(e, rowIndex, colIndex)}
                  disabled={gameStatus !== 'playing'}
                >
                  {getCellContent(cell)}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-blue-300/70 font-mono tracking-wider">
            <span className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              <span>PRIMARY SCAN</span>
            </span>
            <div className="w-px h-4 bg-blue-500/30"></div>
            <span className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              <span>NEURAL FLAG</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
