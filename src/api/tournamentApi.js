// Stub API for tournaments (no backend)
export const getTournaments = async () => {
    return [];
};

export const getTournamentById = async (id) => {
    return null;
};

export const registerForTournament = async (tournamentId, studentId) => {
    console.log('Tournament registration not available without backend');
    return null;
};

export const createRegistration = async (registrationData) => {
    console.log('Tournament registration not available without backend:', registrationData);
    return null;
};
