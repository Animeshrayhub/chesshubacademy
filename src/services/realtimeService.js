import { supabase } from './supabase';
import { updateSession } from '../api/sessionApi';

// Tracks moves between FEN checkpoints — reset per session
let moveCounter = 0;

export function createClassroomChannel(sessionId) {
    if (!supabase) return null;
    return supabase.channel(`classroom-${sessionId}`, {
        config: { broadcast: { self: false } },
    });
}

export function subscribeChannel(channel) {
    if (!channel) return Promise.resolve(null);
    return channel.subscribe();
}

export function sendMove(channel, { from, to, promotion, fen, san }) {
    if (!channel) return;
    channel.send({
        type: 'broadcast',
        event: 'move',
        payload: { from, to, promotion, fen, san, timestamp: Date.now() },
    });
}

export function onMoveReceived(channel, callback) {
    if (!channel) return;
    channel.on('broadcast', { event: 'move' }, ({ payload }) => {
        callback(payload);
    });
}

export function sendBoardState(channel, fen) {
    if (!channel) return;
    channel.send({
        type: 'broadcast',
        event: 'board_state',
        payload: { fen, timestamp: Date.now() },
    });
}

export function onBoardStateReceived(channel, callback) {
    if (!channel) return;
    channel.on('broadcast', { event: 'board_state' }, ({ payload }) => {
        callback(payload);
    });
}

export function sendChatMessage(channel, { userId, name, text }) {
    if (!channel) return;
    channel.send({
        type: 'broadcast',
        event: 'chat',
        payload: { userId, name, text, timestamp: Date.now() },
    });
}

export function onChatReceived(channel, callback) {
    if (!channel) return;
    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
        callback(payload);
    });
}

export function sendModeChange(channel, mode) {
    if (!channel) return;
    channel.send({
        type: 'broadcast',
        event: 'mode_change',
        payload: { mode, timestamp: Date.now() },
    });
}

export function onModeChange(channel, callback) {
    if (!channel) return;
    channel.on('broadcast', { event: 'mode_change' }, ({ payload }) => {
        callback(payload);
    });
}

export function checkpointIfNeeded(sessionId, fen) {
    moveCounter++;
    if (moveCounter % 10 === 0) {
        updateSession(sessionId, { board_fen: fen });
    }
}

export function resetMoveCounter() {
    moveCounter = 0;
}

export function destroyChannel(channel) {
    if (!channel || !supabase) return;
    supabase.removeChannel(channel);
}
