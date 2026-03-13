import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessgroundBoard from '../ChessBoard/ChessgroundBoard';
import { supabase } from '../../services/supabase';
import { updateSession } from '../../api/sessionApi';

export default function LiveClassroom({ session, userRole, userId: _userId }) {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(session?.board_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moveHistory, setMoveHistory] = useState([]);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [sessionActive, setSessionActive] = useState(!!session?.actual_start && !session?.actual_end);
    const timerRef = useRef(null);
    const boardApiRef = useRef(null);
    const isCoach = userRole === 'admin' || userRole === 'coach';

    const duration = session?.session_type === 'demo' ? 30 : 50;

    // Realtime board sync via Supabase
    useEffect(() => {
        if (!session?.id || !supabase) return;
        const channel = supabase
            .channel(`classroom-${session.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sessions',
                filter: `id=eq.${session.id}`,
            }, (payload) => {
                const newFen = payload.new.board_fen;
                if (newFen && newFen !== fen) {
                    const g = new Chess(newFen);
                    setGame(g);
                    setFen(newFen);
                }
                if (payload.new.actual_end) {
                    setSessionActive(false);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [session?.id]);

    // Timer
    useEffect(() => {
        if (!sessionActive) return;
        const startTime = session?.actual_start ? new Date(session.actual_start).getTime() : Date.now();
        timerRef.current = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [sessionActive]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const remainingSeconds = Math.max(0, duration * 60 - timeElapsed);
    const isOvertime = timeElapsed > duration * 60;

    const onDrop = useCallback((orig, dest) => {
        if (!sessionActive) return;
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({ from: orig, to: dest, promotion: 'q' });
        if (!move) return;

        setGame(gameCopy);
        setFen(gameCopy.fen());
        setMoveHistory(prev => [...prev, move.san]);

        // Sync board to DB
        if (session?.id) {
            updateSession(session.id, { board_fen: gameCopy.fen() });
        }
    }, [game, sessionActive, session]);

    const handleStartSession = async () => {
        if (!isCoach) return;
        const now = new Date().toISOString();
        await updateSession(session.id, { actual_start: now, status: 'in_progress' });
        setSessionActive(true);
    };

    const handleEndSession = async () => {
        if (!isCoach) return;
        const now = new Date().toISOString();
        await updateSession(session.id, { actual_end: now, status: 'completed' });
        setSessionActive(false);
        clearInterval(timerRef.current);
    };

    const handleResetBoard = () => {
        if (!isCoach) return;
        const g = new Chess();
        setGame(g);
        setFen(g.fen());
        setMoveHistory([]);
        if (session?.id) {
            updateSession(session.id, { board_fen: g.fen() });
        }
    };

    const handleLoadFEN = (fenStr) => {
        if (!isCoach) return;
        try {
            const g = new Chess(fenStr);
            setGame(g);
            setFen(g.fen());
            setMoveHistory([]);
            if (session?.id) {
                updateSession(session.id, { board_fen: g.fen() });
            }
        } catch {
            alert('Invalid FEN');
        }
    };

    return (
        <div style={S.container}>
            <div style={S.header}>
                <h2 style={S.title}>{session?.title || 'Live Classroom'}</h2>
                <div style={S.timerArea}>
                    <span style={{ ...S.timer, color: isOvertime ? '#f87171' : remainingSeconds < 300 ? '#fbbf24' : '#6ee7b7' }}>
                        {sessionActive ? (isOvertime ? `-${formatTime(timeElapsed - duration * 60)}` : formatTime(remainingSeconds)) : formatTime(duration * 60)}
                    </span>
                    <span style={S.timerLabel}>{isOvertime ? 'Overtime' : sessionActive ? 'Remaining' : (session?.session_type === 'demo' ? '30 min Demo' : '50 min Class')}</span>
                </div>
            </div>

            <div style={S.layout}>
                <div style={S.boardArea}>
                    <ChessgroundBoard
                        ref={boardApiRef}
                        fen={fen}
                        chess={sessionActive ? game : undefined}
                        viewOnly={!sessionActive}
                        onMove={onDrop}
                        width={480}
                    />
                </div>

                <div style={S.sidebar}>
                    {/* Session Controls - Coach Only */}
                    {isCoach && (
                        <div style={S.panel}>
                            <h4 style={S.panelTitle}>Session Controls</h4>
                            {!sessionActive && !session?.actual_end ? (
                                <button onClick={handleStartSession} style={S.startBtn}>▶ Start Session</button>
                            ) : sessionActive ? (
                                <button onClick={handleEndSession} style={S.endBtn}>⏹ End Session</button>
                            ) : (
                                <span style={{ color: '#6ee7b7' }}>✓ Session Completed</span>
                            )}
                        </div>
                    )}

                    {/* Coach Tools */}
                    {isCoach && (
                        <div style={S.panel}>
                            <h4 style={S.panelTitle}>Board Tools</h4>
                            <button onClick={handleResetBoard} style={S.toolBtn}>🔄 Reset Board</button>
                            <button onClick={() => {
                                const f = prompt('Enter FEN:');
                                if (f) handleLoadFEN(f);
                            }} style={S.toolBtn}>📋 Load FEN</button>
                        </div>
                    )}

                    {/* Move History */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>Moves</h4>
                        <div style={S.moves}>
                            {moveHistory.length === 0 ? (
                                <span style={{ color: '#666' }}>No moves yet</span>
                            ) : moveHistory.map((m, i) => (
                                <span key={i} style={S.move}>
                                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{m}{' '}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div style={S.panel}>
                        <h4 style={S.panelTitle}>Status</h4>
                        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                            {game.isCheckmate() ? '♚ Checkmate!' :
                             game.isDraw() ? '½ Draw' :
                             game.isCheck() ? '♔ Check!' :
                             `${game.turn() === 'w' ? 'White' : 'Black'} to move`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const S = {
    container: { background: '#0a0a1a', borderRadius: '12px', padding: '24px', color: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '20px', fontWeight: 600, margin: 0 },
    timerArea: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    timer: { fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' },
    timerLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.5)' },
    layout: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
    boardArea: { flexShrink: 0 },
    sidebar: { flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '12px' },
    panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' },
    panelTitle: { fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'rgba(255,255,255,0.7)' },
    startBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
    endBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '8px', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
    toolBtn: { display: 'block', width: '100%', padding: '8px', marginBottom: '6px', border: '1px solid #444', borderRadius: '6px', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left' },
    moves: { maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem', lineHeight: 1.8 },
    move: { color: '#ddd' },
};
