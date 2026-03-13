import { useState, useEffect } from 'react';
import { identifyOpening } from '../../utils/OpeningBook';
import './OpeningDisplay.css';

export default function OpeningDisplay({ moveHistory }) {
    const [opening, setOpening] = useState(null);

    // Identify opening whenever move history changes
    useEffect(() => {
        if (moveHistory && moveHistory.length > 0) {
            const identified = identifyOpening(moveHistory);
            setOpening(identified);
        }
    }, [moveHistory]);

    if (!opening) {
        return (
            <div className="opening-display">
                <div className="opening-placeholder">
                    📖 Opening will be identified after a few moves...
                </div>
            </div>
        );
    }

    return (
        <div className="opening-display">
            <div className="opening-header">
                <span className="opening-icon">📖</span>
                <span className="opening-label">Current Opening:</span>
            </div>
            <div className="opening-name">{opening.name}</div>
            <div className="opening-details">
                <span className="opening-eco">ECO: {opening.eco}</span>
                <span className="opening-category">{opening.category}</span>
            </div>
            <div className="opening-moves">
                <span className="moves-label">Moves:</span>
                <span className="moves-sequence">{opening.moves.join(' ')}</span>
            </div>
        </div>
    );
}
