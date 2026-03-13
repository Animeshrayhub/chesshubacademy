import { useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessgroundBoard from './ChessgroundBoard';
import './ChessBoard.css';

export default function ChessBoard({
    initialPosition = 'start',
    boardOrientation = 'white',
    interactive = true,
    showNotation = true,
    onGameEnd,
    customStyles = {}
}) {
    const [game, setGame] = useState(() => new Chess(initialPosition === 'start' ? undefined : initialPosition));
    const [moveHistory, setMoveHistory] = useState([]);
    const boardApiRef = useRef(null);

    const checkGameEnd = useCallback((g) => {
        if (g.isGameOver() && onGameEnd) {
            let result = 'Game Over';
            if (g.isCheckmate()) {
                result = `Checkmate! ${g.turn() === 'w' ? 'Black' : 'White'} wins!`;
            } else if (g.isDraw()) {
                result = 'Draw!';
            } else if (g.isStalemate()) {
                result = 'Stalemate!';
            }
            onGameEnd({
                pgn: g.pgn(),
                fen: g.fen(),
                result,
                history: g.history({ verbose: true })
            });
        }
    }, [onGameEnd]);

    const handleMove = useCallback((orig, dest) => {
        if (!interactive) return;
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({ from: orig, to: dest, promotion: 'q' });
        if (!move) return;

        setGame(gameCopy);
        setMoveHistory(gameCopy.history({ verbose: true }));
        checkGameEnd(gameCopy);
    }, [game, interactive, checkGameEnd]);

    function undoMove() {
        const copy = new Chess(game.fen());
        copy.undo();
        setGame(copy);
        setMoveHistory(copy.history({ verbose: true }));
    }

    function resetGame() {
        setGame(new Chess());
        setMoveHistory([]);
    }

    const isGameOver = game.isGameOver();
    let gameResult = null;
    if (isGameOver) {
        if (game.isCheckmate()) {
            gameResult = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
        } else if (game.isDraw()) {
            gameResult = 'Draw!';
        } else if (game.isStalemate()) {
            gameResult = 'Stalemate!';
        }
    }

    return (
        <div className="chess-board-container">
            <div className="chess-board-wrapper">
                <ChessgroundBoard
                    ref={boardApiRef}
                    fen={game.fen()}
                    orientation={boardOrientation}
                    chess={interactive ? game : undefined}
                    viewOnly={!interactive}
                    onMove={handleMove}
                />
            </div>

            <div className="chess-controls">
                <button
                    className="chess-btn chess-btn-undo"
                    onClick={undoMove}
                    disabled={moveHistory.length === 0}
                >
                    ↶ Undo
                </button>

                <button
                    className="chess-btn chess-btn-reset"
                    onClick={resetGame}
                >
                    ⟲ Reset
                </button>

                {isGameOver && gameResult && (
                    <div className="game-result">
                        <div className="result-badge">{gameResult}</div>
                    </div>
                )}
            </div>

            <div className="move-history">
                <h4>Moves</h4>
                <div className="moves-list">
                    {moveHistory.map((move, index) => (
                        <span key={index} className="move-item">
                            {index % 2 === 0 && <span className="move-number">{Math.floor(index / 2) + 1}.</span>}
                            <span className="move-notation">{move.san}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
