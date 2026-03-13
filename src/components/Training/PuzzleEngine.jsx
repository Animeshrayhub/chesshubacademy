import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessgroundBoard from '../ChessBoard/ChessgroundBoard';
import { getRandomPuzzle, recordPuzzleAttempt } from '../../api/puzzleApi';
import { getDailyPuzzle } from '../../services/lichessApi';

export default function PuzzleEngine({ studentId }) {
    const [puzzle, setPuzzle] = useState(null);
    const [game, setGame] = useState(new Chess());
    const [moveIndex, setMoveIndex] = useState(0);
    const [status, setStatus] = useState('loading'); // loading, solving, correct, wrong
    const [rating, setRating] = useState(1200);
    const [streak, setStreak] = useState(0);
    const [solved, setSolved] = useState(0);
    const [startTime, setStartTime] = useState(null);

    const loadPuzzle = useCallback(async () => {
        setStatus('loading');
        let p = await getRandomPuzzle([Math.max(800, rating - 200), rating + 200]);

        // Fallback to Lichess daily puzzle if no custom puzzles
        if (!p) {
            try {
                const lichess = await getDailyPuzzle();
                if (lichess?.game?.pgn && lichess?.puzzle) {
                    p = {
                        id: 'lichess-daily',
                        fen: lichess.game.pgn, // Will use setup FEN
                        moves: lichess.puzzle.solution.join(' '),
                        rating: lichess.puzzle.rating,
                        themes: lichess.puzzle.themes?.join(', ') || '',
                        source: 'lichess',
                    };
                }
            } catch { /* fallback failed */ }
        }

        if (!p) {
            setStatus('no_puzzles');
            return;
        }

        setPuzzle(p);
        const moves = p.moves.split(' ');

        // Set up position - play the first move (opponent's move), then student solves
        const g = new Chess(p.fen);
        if (moves.length > 0) {
            // First move is opponent's move
            try { g.move(moves[0]); } catch { /* invalid move */ }
        }
        setGame(g);
        setMoveIndex(1); // Student needs to find move at index 1
        setStatus('solving');
        setStartTime(Date.now());
    }, [rating]);

    useEffect(() => { loadPuzzle(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSolved = useCallback(() => {
        setStatus('correct');
        setStreak(prev => prev + 1);
        setSolved(prev => prev + 1);
        setRating(prev => prev + 15);
        if (studentId && puzzle?.id !== 'lichess-daily') {
            recordPuzzleAttempt({
                student_id: studentId,
                puzzle_id: puzzle.id,
                solved: true,
                time_spent: Math.floor((Date.now() - startTime) / 1000),
                rating_change: 15,
            });
        }
    }, [studentId, puzzle, startTime]);

    const onDrop = useCallback((orig, dest) => {
        if (status !== 'solving' || !puzzle) return;

        const moves = puzzle.moves.split(' ');
        const expectedMove = moves[moveIndex];
        if (!expectedMove) return;

        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({ from: orig, to: dest, promotion: 'q' });
        if (!move) return;

        // Check if this is the correct move
        const uciMove = orig + dest;
        const isCorrect = expectedMove === uciMove || expectedMove === move.san;

        if (isCorrect) {
            setGame(gameCopy);

            const nextMoveIndex = moveIndex + 1;
            if (nextMoveIndex < moves.length) {
                const nextGame = new Chess(gameCopy.fen());
                try {
                    nextGame.move(moves[nextMoveIndex]);
                    setGame(nextGame);
                    setMoveIndex(nextMoveIndex + 1);
                } catch {
                    handleSolved();
                }
            } else {
                handleSolved();
            }
        } else {
            setStatus('wrong');
            setStreak(0);
            setRating(prev => Math.max(400, prev - 10));
            if (studentId && puzzle.id !== 'lichess-daily') {
                recordPuzzleAttempt({
                    student_id: studentId,
                    puzzle_id: puzzle.id,
                    solved: false,
                    time_spent: Math.floor((Date.now() - startTime) / 1000),
                    rating_change: -10,
                });
            }
        }
    }, [game, puzzle, moveIndex, status, studentId, startTime, handleSolved]);

    return (
        <div style={S.container}>
            <div style={S.header}>
                <h3 style={S.title}>🧩 Puzzle Training</h3>
                <div style={S.stats}>
                    <span style={S.stat}>Rating: <strong>{rating}</strong></span>
                    <span style={S.stat}>Streak: <strong>🔥 {streak}</strong></span>
                    <span style={S.stat}>Solved: <strong>{solved}</strong></span>
                </div>
            </div>

            {status === 'loading' && <div style={S.loading}>Loading puzzle...</div>}
            {status === 'no_puzzles' && (
                <div style={S.loading}>
                    <p>No puzzles available yet.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>Admin can add puzzles from the admin panel.</p>
                </div>
            )}

            {(status === 'solving' || status === 'correct' || status === 'wrong') && puzzle && (
                <div style={S.puzzleArea}>
                    <div style={S.boardWrap}>
                        <ChessgroundBoard
                            fen={game.fen()}
                            chess={status === 'solving' ? game : undefined}
                            viewOnly={status !== 'solving'}
                            onMove={onDrop}
                            width={400}
                        />
                    </div>

                    <div style={S.info}>
                        {puzzle.rating && <span style={S.puzzleRating}>Puzzle Rating: {puzzle.rating}</span>}
                        {puzzle.themes && <span style={S.themes}>{puzzle.themes}</span>}

                        {status === 'solving' && (
                            <div style={S.hint}>
                                <span style={{ color: game.turn() === 'w' ? '#fff' : '#666' }}>
                                    {game.turn() === 'w' ? '⬜ White' : '⬛ Black'} to move
                                </span>
                                <span style={{ color: '#aaa' }}>Find the best move!</span>
                            </div>
                        )}

                        {status === 'correct' && (
                            <div style={{ ...S.result, background: 'rgba(16,185,129,0.15)', borderColor: '#10b981' }}>
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <span>Correct! +15 rating</span>
                                <button onClick={loadPuzzle} style={S.nextBtn}>Next Puzzle →</button>
                            </div>
                        )}

                        {status === 'wrong' && (
                            <div style={{ ...S.result, background: 'rgba(239,68,68,0.15)', borderColor: '#ef4444' }}>
                                <span style={{ fontSize: '1.5rem' }}>❌</span>
                                <span>Wrong move. -10 rating</span>
                                <button onClick={loadPuzzle} style={S.nextBtn}>Try Another →</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const S = {
    container: { color: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' },
    title: { fontSize: '18px', fontWeight: 600, margin: 0 },
    stats: { display: 'flex', gap: '16px' },
    stat: { fontSize: '0.85rem', color: '#aaa' },
    loading: { textAlign: 'center', padding: '40px', color: '#aaa' },
    puzzleArea: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    boardWrap: { flexShrink: 0 },
    info: { flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '12px' },
    puzzleRating: { padding: '4px 10px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.85rem', alignSelf: 'flex-start' },
    themes: { fontSize: '0.8rem', color: '#888', textTransform: 'capitalize' },
    hint: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' },
    result: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: '10px', border: '1px solid', textAlign: 'center' },
    nextBtn: { padding: '8px 20px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
};
