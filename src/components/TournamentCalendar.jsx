import './TournamentCalendar.css';

export default function TournamentCalendar() {
    return (
        <section id="tournaments" className="section tournament-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="fade-in">Upcoming Tournaments</h2>
                    <p className="section-subtitle fade-in">
                        Stay updated with the latest chess tournaments in India
                    </p>
                </div>

                <div className="glass-card tournament-embed-card">
                    <iframe
                        src="https://chess-results.com/fed.aspx?lan=1&fed=IND&bdld1=20"
                        title="Chess Tournaments India"
                        className="tournament-iframe"
                        frameBorder="0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-forms allow-popups"
                        allowFullScreen
                    />
                </div>

                <div className="tournament-info">
                    <p>
                        View complete tournament details, standings, and results directly from Chess-Results.com.
                        Click on any tournament to see full information.
                    </p>
                </div>
            </div>
        </section>
    );
}
