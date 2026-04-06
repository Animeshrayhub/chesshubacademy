// Stub realtime service (no backend)
export const subscribeToTable = (table, callback) => {
    console.log(`Realtime subscription not available for table: ${table}`);
    return { unsubscribe: () => {} };
};

export const subscribeToChannel = (channel, event, callback) => {
    console.log(`Channel subscription not available: ${channel}`);
    return { unsubscribe: () => {} };
};

export const createClassroomChannel = (sessionId) => {
    console.log(`Classroom channel not available: ${sessionId}`);
    return null;
};

export const subscribeChannel = (channel, event, callback) => {
    console.log(`Channel subscribe not available`);
    return { unsubscribe: () => {} };
};

export const sendMove = (channel, move) => {
    console.log(`Send move not available`);
};

export const sendPosition = (channel, position) => {
    console.log(`Send position not available`);
};

export const onMoveReceived = (channel, callback) => {
    console.log(`On move received not available`);
    return { unsubscribe: () => {} };
};

export const onPositionReceived = (channel, callback) => {
    console.log(`On position received not available`);
    return { unsubscribe: () => {} };
};

export const sendBoardState = (channel, state) => {
    console.log(`Send board state not available`);
};

export const onBoardStateReceived = (channel, callback) => {
    console.log(`On board state received not available`);
    return { unsubscribe: () => {} };
};

export const sendChatMessage = (channel, message) => {
    console.log(`Send chat message not available`);
};

export const onChatReceived = (channel, callback) => {
    console.log(`On chat received not available`);
    return { unsubscribe: () => {} };
};

export const sendModeChange = (channel, mode) => {
    console.log(`Send mode change not available`);
};

export const onModeChange = (channel, callback) => {
    console.log(`On mode change not available`);
    return { unsubscribe: () => {} };
};

export const checkpointIfNeeded = (channel) => {
    console.log(`Checkpoint not available`);
};

export const resetMoveCounter = (channel) => {
    console.log(`Reset move counter not available`);
};

export const destroyChannel = (channel) => {
    console.log(`Destroy channel not available`);
};
