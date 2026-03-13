import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Chessground } from 'chessground';
import './ChessgroundBoard.css';

function toColor(chess) {
    return chess.turn() === 'w' ? 'white' : 'black';
}

function toDests(chess) {
    const dests = new Map();
    for (const s of chess.SQUARES || []) {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map(m => m.to));
    }
    // Fallback for chess.js versions without SQUARES
    if (dests.size === 0) {
        const squares = [];
        for (let r = 1; r <= 8; r++) {
            for (const f of ['a','b','c','d','e','f','g','h']) {
                squares.push(f + r);
            }
        }
        for (const s of squares) {
            const ms = chess.moves({ square: s, verbose: true });
            if (ms.length) dests.set(s, ms.map(m => m.to));
        }
    }
    return dests;
}

const ChessgroundBoard = forwardRef(function ChessgroundBoard({
    fen,
    orientation = 'white',
    movable = {},
    onMove,
    viewOnly = false,
    animation = { enabled: true, duration: 200 },
    highlight = { lastMove: true, check: true },
    drawable = { enabled: true },
    chess,
    width,
    className = '',
}, ref) {
    const boardRef = useRef(null);
    const cgRef = useRef(null);

    useImperativeHandle(ref, () => ({
        setPosition(newFen) {
            cgRef.current?.set({ fen: newFen });
        },
        move(from, to) {
            cgRef.current?.move(from, to);
        },
        toggleOrientation() {
            cgRef.current?.toggleOrientation();
        },
        setDrawable(shapes) {
            cgRef.current?.setShapes(shapes);
        },
        set(config) {
            cgRef.current?.set(config);
        },
        getApi() {
            return cgRef.current;
        },
        destroy() {
            cgRef.current?.destroy();
            cgRef.current = null;
        },
    }));

    // Mount chessground
    useEffect(() => {
        if (!boardRef.current) return;

        const movableConfig = chess ? {
            color: toColor(chess),
            free: false,
            dests: toDests(chess),
            ...movable,
        } : {
            color: 'both',
            free: true,
            ...movable,
        };

        const config = {
            fen: fen || 'start',
            orientation,
            viewOnly,
            movable: movableConfig,
            animation,
            highlight,
            drawable,
            events: {
                move: (orig, dest) => {
                    onMove?.(orig, dest);
                },
            },
        };

        cgRef.current = Chessground(boardRef.current, config);

        return () => {
            cgRef.current?.destroy();
            cgRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update FEN
    useEffect(() => {
        if (!cgRef.current || !fen) return;
        const update = { fen };
        if (chess) {
            update.turnColor = toColor(chess);
            update.movable = {
                color: toColor(chess),
                free: false,
                dests: toDests(chess),
                ...movable,
            };
            update.check = chess.isCheck();
        }
        cgRef.current.set(update);
    }, [fen, chess, movable]);

    // Update orientation
    useEffect(() => {
        cgRef.current?.set({ orientation });
    }, [orientation]);

    // Update viewOnly
    useEffect(() => {
        cgRef.current?.set({ viewOnly });
    }, [viewOnly]);

    const style = {};
    if (width) {
        style.width = typeof width === 'number' ? `${width}px` : width;
        style.height = style.width;
    }

    return (
        <div
            className={`cg-board-wrap ${className}`}
            style={style}
        >
            <div ref={boardRef} className="cg-board-inner" />
        </div>
    );
});

export default ChessgroundBoard;
