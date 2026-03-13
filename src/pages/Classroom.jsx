import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../services/supabase';
import ChessgroundBoard from '../components/ChessBoard/ChessgroundBoard';
import VideoFrame from '../components/VideoFrame/VideoFrame';
import {
    createClassroomChannel,
    subscribeChannel,
    sendMove,
    onMoveReceived,
    sendBoardState,
    onBoardStateReceived,
    sendChatMessage,
    onChatReceived,
    sendModeChange,
    onModeChange,
    checkpointIfNeeded,
    resetMoveCounter,
    destroyChannel,
} from '../services/realtimeService';
import './Classroom.css';

const MODES = { PLAY: 'play', EDITOR: 'editor', ANALYSIS: 'analysis' };

export default function Classroom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user, isCoach, isAdmin } = useAuth();
    const isCoachUser = isCoach() || isAdmin();

    // Session data
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    // Board state
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moveHistory, setMoveHistory] = useState([]);
    const [mode, setMode] = useState(MODES.PLAY);
    const [orientation, setOrientation] = useState('white');

    // Chat
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // Editor
    const [fenInput, setFenInput] = useState('');

    // Realtime
    const channelRef = useRef(null);
    const boardApiRef = useRef(null);
    const movesEndRef = useRef(null);

    // Load session data
    useEffect(() => {
        if (!supabase || !sessionId) return;

        async function loadSession() {
            const { data, error } = await supabase
                .from('sessions')
                .select('*, coach:coaches(id, user_id, full_name), student:student_profiles(id, user_id, full_name)')
                .eq('id', sessionId)
                .single();

            if (error || !data) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            // Verify current user is participant
            const coachUserId = data.coach?.user_id;
            const studentUserId = data.student?.user_id;
            if (user?.id !== coachUserId && user?.id !== studentUserId) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            setSession(data);

            // Initialize board from saved state
            if (data.board_fen) {
                try {
                    const g = new Chess(data.board_fen);
                    setGame(g);
                    setFen(data.board_fen);
                } catch { /* invalid fen, use default */ }
            }

            // Set orientation: student plays black by default
            if (user?.id === studentUserId) {
                setOrientation('black');
            }

            setLoading(false);
        }

        loadSession();
    }, [sessionId, user?.id]);

    // Set up realtime channel
    useEffect(() => {
        if (!session?.id) return;

        const channel = createClassroomChannel(session.id);
        if (!channel) return;
        channelRef.current = channel;

        onMoveReceived(channel, (payload) => {
            const g = new Chess(payload.fen);
            setGame(g);
            setFen(payload.fen);
            setMoveHistory(prev => [...prev, payload.san]);
        });

        onBoardStateReceived(channel, (payload) => {
            try {
                const g = new Chess(payload.fen);
                setGame(g);
                setFen(payload.fen);
                setMoveHistory([]);
            } catch { /* invalid fen */ }
        });

        onChatReceived(channel, (payload) => {
            setMessages(prev => [...prev, payload]);
        });

        onModeChange(channel, (payload) => {
            setMode(payload.mode);
        });

        subscribeChannel(channel);
        resetMoveCounter();

        return () => {
            destroyChannel(channel);
            channelRef.current = null;
        };
    }, [session?.id]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-scroll moves
    useEffect(() => {
        movesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [moveHistory]);

    // Handle move on board
    const handleMove = useCallback((orig, dest) => {
        const gameCopy = new Chess(game.fen());
        let move;

        if (mode === MODES.PLAY) {
            // Enforce turns: coach=white, student=black
            const turn = gameCopy.turn();
            if (isCoachUser && turn !== (orientation === 'white' ? 'w' : 'b')) return;
            if (!isCoachUser && turn !== (orientation === 'white' ? 'w' : 'b')) return;

            move = gameCopy.move({ from: orig, to: dest, promotion: 'q' });
            if (!move) return;
        } else if (mode === MODES.ANALYSIS) {
            move = gameCopy.move({ from: orig, to: dest, promotion: 'q' });
            if (!move) return;
        } else {
            return; // Editor mode handles differently
        }

        setGame(gameCopy);
        setFen(gameCopy.fen());
        setMoveHistory(prev => [...prev, move.san]);

        sendMove(channelRef.current, {
            from: orig,
            to: dest,
            promotion: 'q',
            fen: gameCopy.fen(),
            san: move.san,
        });

        checkpointIfNeeded(session.id, gameCopy.fen());
    }, [game, mode, isCoachUser, orientation, session]);

    // Coach: switch mode
    const handleModeChange = (newMode) => {
        if (!isCoachUser) return;
        setMode(newMode);
        sendModeChange(channelRef.current, newMode);
    };

    // Coach: reset board
    const handleResetBoard = () => {
        if (!isCoachUser) return;
        const g = new Chess();
        setGame(g);
        setFen(g.fen());
        setMoveHistory([]);
        sendBoardState(channelRef.current, g.fen());
    };

    // Coach: clear board
    const handleClearBoard = () => {
        if (!isCoachUser) return;
        const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
        try {
            const g = new Chess(emptyFen);
            setGame(g);
            setFen(emptyFen);
            setMoveHistory([]);
            sendBoardState(channelRef.current, emptyFen);
        } catch { /* invalid fen */ }
    };

    // Coach: load FEN
    const handleLoadFEN = () => {
        if (!isCoachUser || !fenInput.trim()) return;
        try {
            const g = new Chess(fenInput.trim());
            setGame(g);
            setFen(g.fen());
            setMoveHistory([]);
            sendBoardState(channelRef.current, g.fen());
            setFenInput('');
        } catch {
            alert('Invalid FEN string');
        }
    };

    // Flip board
    const handleFlipBoard = () => {
        setOrientation(prev => prev === 'white' ? 'black' : 'white');
    };

    // Send chat
    const handleSendChat = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const name = isCoachUser
            ? (session?.coach?.full_name || 'Coach')
            : (session?.student?.full_name || 'Student');
        const msg = { userId: user.id, name, text: chatInput.trim() };
        sendChatMessage(channelRef.current, msg);
        setMessages(prev => [...prev, { ...msg, timestamp: Date.now() }]);
        setChatInput('');
    };

    // Movable config based on mode
    const getMovableConfig = () => {
        if (mode === MODES.EDITOR) {
            return { color: 'both', free: true };
        }
        if (mode === MODES.ANALYSIS) {
            return {}; // ChessgroundBoard default handles with chess.js
        }
        // Play mode — only move your own pieces
        return {};
    };

    // Loading
    if (loading) {
        return (
            <div className="classroom classroom--loading">
                <div className="classroom__spinner" />
                <p>Loading classroom...</p>
            </div>
        );
    }

    // Access denied
    if (accessDenied) {
        return (
            <div className="classroom classroom--denied">
                <h2>🚫 Access Denied</h2>
                <p>You are not a participant in this session.</p>
                <button className="classroom__back-btn" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        );
    }

    const gameStatus = game.isCheckmate()
        ? `♚ Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
        : game.isDraw() ? '½ Draw'
        : game.isStalemate() ? 'Stalemate'
        : game.isCheck() ? `♔ Check! ${game.turn() === 'w' ? 'White' : 'Black'} to move`
        : `${game.turn() === 'w' ? 'White' : 'Black'} to move`;

    return (
        <div className="classroom">
            {/* Header */}
            <div className="classroom__header">
                <button className="classroom__back-btn" onClick={() => navigate(-1)}>←</button>
                <h2 className="classroom__title">{session?.title || 'Classroom'}</h2>
                <div className="classroom__mode-badge">{mode.toUpperCase()}</div>
            </div>

            {/* Video Section */}
            <VideoFrame meetingLink={session?.meeting_link} />

            {/* Main Content */}
            <div className="classroom__content">
                {/* Board Panel */}
                <div className="classroom__board-panel">
                    <div className="classroom__board-container">
                        <ChessgroundBoard
                            ref={boardApiRef}
                            fen={fen}
                            orientation={orientation}
                            chess={mode !== MODES.EDITOR ? game : undefined}
                            viewOnly={false}
                            onMove={handleMove}
                            movable={getMovableConfig()}
                        />
                    </div>

                    {/* Board controls */}
                    <div className="classroom__board-controls">
                        <button className="classroom__ctrl-btn" onClick={handleFlipBoard} title="Flip board">🔄</button>
                        {isCoachUser && (
                            <>
                                <button className="classroom__ctrl-btn" onClick={handleResetBoard} title="Reset board">♟</button>
                                <button
                                    className={`classroom__ctrl-btn ${mode === MODES.PLAY ? 'active' : ''}`}
                                    onClick={() => handleModeChange(MODES.PLAY)}
                                >
                                    ⚔ Play
                                </button>
                                <button
                                    className={`classroom__ctrl-btn ${mode === MODES.EDITOR ? 'active' : ''}`}
                                    onClick={() => handleModeChange(MODES.EDITOR)}
                                >
                                    ✏ Editor
                                </button>
                                <button
                                    className={`classroom__ctrl-btn ${mode === MODES.ANALYSIS ? 'active' : ''}`}
                                    onClick={() => handleModeChange(MODES.ANALYSIS)}
                                >
                                    🔍 Analysis
                                </button>
                            </>
                        )}
                    </div>

                    {/* Editor panel (coach only) */}
                    {isCoachUser && mode === MODES.EDITOR && (
                        <div className="classroom__editor-panel">
                            <div className="classroom__editor-row">
                                <input
                                    value={fenInput}
                                    onChange={(e) => setFenInput(e.target.value)}
                                    placeholder="Paste FEN..."
                                    className="classroom__fen-input"
                                />
                                <button className="classroom__ctrl-btn" onClick={handleLoadFEN}>Load</button>
                            </div>
                            <div className="classroom__editor-row">
                                <button className="classroom__ctrl-btn" onClick={handleResetBoard}>Reset</button>
                                <button className="classroom__ctrl-btn" onClick={handleClearBoard}>Clear</button>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="classroom__status">{gameStatus}</div>
                </div>

                {/* Sidebar: Moves + Chat */}
                <div className="classroom__sidebar">
                    {/* Move History */}
                    <div className="classroom__panel">
                        <h4 className="classroom__panel-title">Moves</h4>
                        <div className="classroom__moves">
                            {moveHistory.length === 0 ? (
                                <span className="classroom__muted">No moves yet</span>
                            ) : (
                                moveHistory.map((m, i) => (
                                    <span key={i} className="classroom__move">
                                        {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{m}{' '}
                                    </span>
                                ))
                            )}
                            <div ref={movesEndRef} />
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="classroom__panel classroom__chat-panel">
                        <h4 className="classroom__panel-title">Chat</h4>
                        <div className="classroom__chat-messages">
                            {messages.length === 0 && (
                                <span className="classroom__muted">No messages yet</span>
                            )}
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`classroom__chat-msg ${msg.userId === user?.id ? 'classroom__chat-msg--own' : ''}`}
                                >
                                    <span className="classroom__chat-name">{msg.name}</span>
                                    <span className="classroom__chat-text">{msg.text}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form className="classroom__chat-form" onSubmit={handleSendChat}>
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                className="classroom__chat-input"
                                maxLength={500}
                            />
                            <button type="submit" className="classroom__chat-send">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
