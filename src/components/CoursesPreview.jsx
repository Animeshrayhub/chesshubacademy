import './CoursesPreview.css';

export default function CoursesPreview() {
    const courseLevels = [
        {
            title: 'Beginner',
            curriculum: [
                'Rules of chess',
                'Basic tactics',
                'Opening principles',
                'Basic checkmates',
            ],
        },
        {
            title: 'Intermediate',
            curriculum: [
                'Tactical combinations',
                'Calculation training',
                'Middlegame planning',
                'Endgame fundamentals',
            ],
        },
        {
            title: 'Advanced',
            curriculum: [
                'Positional strategy',
                'Advanced endgames',
                'Opening preparation',
                'Tournament strategy',
            ],
        },
        {
            title: 'Master Training',
            curriculum: [
                'Deep opening preparation',
                'Classical game analysis',
                'Advanced calculation training',
                'Professional tournament preparation',
            ],
        },
    ];

    const trainingPackages = [
        {
            sessions: '12 Sessions',
            price: '₹8,400',
            perSession: '₹700 per session',
            popular: false,
        },
        {
            sessions: '24 Sessions',
            price: '₹14,400',
            perSession: '₹600 per session',
            popular: true,
        },
        {
            sessions: '48 Sessions',
            price: '₹24,000',
            perSession: '₹500 per session',
            popular: false,
        },
    ];

    return (
        <section id="courses" className="section courses-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-subtitle">Our Training Programs</h2>
                    <h1 className="section-title fade-in">
                        Course <span className="text-gradient">Levels</span>
                    </h1>
                    <p className="section-description fade-in">
                        Structured curriculum for each level of chess development.
                    </p>
                </div>

                <div className="course-levels-grid">
                    {courseLevels.map((level) => (
                        <div key={level.title} className="glass-card level-card">
                            <h3 className="level-title">{level.title}</h3>
                            <ul className="level-curriculum">
                                {level.curriculum.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="training-packages">
                    <div className="section-header text-center">
                        <h2 className="section-subtitle">Training Packages</h2>
                        <p className="section-description fade-in">Weekly 2 Classes</p>
                    </div>

                    <div className="packages-grid">
                        {trainingPackages.map((pack) => (
                            <div key={pack.sessions} className={`glass-card package-card ${pack.popular ? 'package-popular' : ''}`}>
                                {pack.popular && <div className="popular-badge">Most Popular</div>}
                                <h3 className="package-title">{pack.sessions}</h3>
                                <p className="package-price">{pack.price}</p>
                                <p className="package-rate">{pack.perSession}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
