import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessgroundBoard from '../ChessBoard/ChessgroundBoard';

export default function CoachTools() {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [fenInput, setFenInput] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [bestMove, setBestMove] = useState('');
    const [depth, setDepth] = useState(18);
    const [analyzing, setAnalyzing] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);
    const engineRef = useRef(null);

    // Initialize Stockfish WASM
    useEffect(() => {
        try {
            const worker = new Worker('/stockfish/stockfish.js');
            engineRef.current = worker;
            worker.postMessage('uci');
            worker.postMessage('isready');

            worker.onmessage = (e) => {
                const line = e.data;
                if (typeof line !== 'string') return;

                if (line.startsWith('info') && line.includes('score')) {
                    const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
                    const pvMatch = line.match(/pv (.+)/);
                    if (scoreMatch) {
                        const type = scoreMatch[1];
                        const val = parseInt(scoreMatch[2]);
                        if (type === 'cp') {
                            setEvaluation(val / 100);
                        } else {
                            setEvaluation(val > 0 ? 999 : -999);
                        }
                    }
                    if (pvMatch) {
                        setBestMove(pvMatch[1].split(' ')[0]);
                    }
                }
            };

            return () => { worker.terminate(); };
        } catch {
            console.log('Stockfish not available');
        }
    }, []);

    const analyzePosition = useCallback(() => {
        if (!engineRef.current) return;
        setAnalyzing(true);
        engineRef.current.postMessage('stop');
        engineRef.current.postMessage(`position fen ${fen}`);
        engineRef.current.postMessage(`go depth ${depth}`);
        setTimeout(() => setAnalyzing(false), 3000);
    }, [fen, depth]);

    const onDrop = useCallback((orig, dest) => {
        const copy = new Chess(game.fen());
        const move = copy.move({ from: orig, to: dest, promotion: 'q' });
        if (!move) return;
        setGame(copy);
        setFen(copy.fen());
        setMoveHistory(prev => [...prev, move.san]);
    }, [game]);

    const handleLoadFEN = () => {
        try {
            const g = new Chess(fenInput);
            setGame(g);
            setFen(g.fen());
            setMoveHistory([]);
            setEvaluation(null);
            setBestMove('');
        } catch {
            alert('Invalid FEN string');
        }
    };

    const handleReset = () => {
        const g = new Chess();
        setGame(g);
        setFen(g.fen());
        setMoveHistory([]);
        setEvaluation(null);
        setBestMove('');
    };

    const handleUndo = () => {
        const copy = new Chess(game.fen());
        copy.undo();
        setGame(copy);
        setFen(copy.fen());
        setMoveHistory(prev => prev.slice(0, -1));
    };

    // Evaluation bar
    const evalPercent = evaluation !== null
        ? Math.max(5, Math.min(95, 50 + (evaluation * 5)))
        : 50;

    return (
        <div style={S.wrap}>
            <h3 style={S.title}>🔧 Coach Tools</h3>

            <div style={S.layout}>
                <div style={S.boardCol}>
                    {/* Eval Bar */}
                    <div style={S.evalBar}>
                        <div style={{ ...S.evalFill, height: `${100 - evalPercent}%` }} />
                        {evaluation !== null && (
                            <span style={S.evalText}>
                                {evaluation > 900 ? 'M' : evaluation < -900 ? '-M' : evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <ChessgroundBoard
                        fen={fen}
                        chess={game}
                        onMove={onDrop}
                        width={420}
                    />
                </div>

                <div style={S.tools}>
                    {/* Engine Analysis */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>Engine Analysis</h4>
                        <button onClick={analyzePosition} style={S.analyzeBtn} disabled={analyzing}>
                            {analyzing ? '⏳ Analyzing...' : '🤖 Analyze Position'}
                        </button>
                        <div style={S.depthRow}>
                            <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Depth: {depth}</label>
                            <input type="range" min="10" max="24" value={depth} onChange={e => setDepth(Number(e.target.value))} style={{ flex: 1 }} />
                        </div>
                        {evaluation !== null && (
                            <div style={S.evalResult}>
                                <span>Eval: <strong>{evaluation > 900 ? 'Mate' : `${evaluation > 0 ? '+' : ''}${evaluation.toFixed(2)}`}</strong></span>
                                {bestMove && <span>Best: <strong>{bestMove}</strong></span>}
                            </div>
                        )}
                    </div>

                    {/* FEN Loader */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>FEN Loader</h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input value={fenInput} onChange={e => setFenInput(e.target.value)} placeholder="Paste FEN..." style={S.input} />
                            <button onClick={handleLoadFEN} style={S.smallBtn}>Load</button>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#888', wordBreak: 'break-all' }}>
                            Current: {fen}
                        </div>
                    </div>

                    {/* Board Controls */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>Board Controls</h4>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={handleReset} style={S.smallBtn}>🔄 Reset</button>
                            <button onClick={handleUndo} style={S.smallBtn}>↩ Undo</button>
                            <button onClick={() => navigator.clipboard.writeText(fen)} style={S.smallBtn}>📋 Copy FEN</button>
                        </div>
                    </div>

                    {/* Move History */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>Move History</h4>
                        <div style={S.moves}>
                            {moveHistory.length === 0 ? (
                                <span style={{ color: '#666' }}>No moves</span>
                            ) : moveHistory.map((m, i) => (
                                <span key={i} style={{ color: '#ddd' }}>
                                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{m}{' '}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>Position</h4>
                        <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                            {game.isCheckmate() ? '♚ Checkmate!' :
                             game.isDraw() ? '½ Draw' :
                             game.isCheck() ? '♔ Check!' :
                             game.isStalemate() ? 'Stalemate' :
                             `${game.turn() === 'w' ? 'White' : 'Black'} to move`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const S = {
    wrap: { color: '#fff' },
    title: { fontSize: '20px', fontWeight: 600, marginBottom: '16px' },
    layout: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    boardCol: { display: 'flex', gap: '6px', flexShrink: 0 },
    evalBar: { width: '24px', background: '#333', borderRadius: '4px', position: 'relative', overflow: 'hidden' },
    evalFill: { position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', transition: 'height 0.3s' },
    evalText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', fontWeight: 700, color: '#8b5cf6', writingMode: 'vertical-rl' },
    tools: { flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '10px' },
    panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px' },
    panelTitle: { fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
    analyzeBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px', marginBottom: '8px' },
    depthRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    evalResult: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.9rem', color: '#ccc' },
    input: { flex: 1, padding: '6px 10px', background: 'rgba(15,15,35,0.8)', border: '1px solid #444', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' },
    smallBtn: { padding: '6px 12px', border: '1px solid #555', borderRadius: '6px', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem' },
    moves: { maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem', lineHeight: 1.8 },
};
