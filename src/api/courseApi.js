import { supabase } from '../services/supabase';

const DEFAULT_COURSES = [
    {
        id: 1,
        title: "Beginner",
        level: "Level 1",
        duration: "8-12 Weeks",
        price: 4999,
        original_price: 5999,
        discount: 17,
        rating: 4.9,
        students: 312,
        icon: "♟️",
        color: "#8b5cf6",
        status: "active",
        description: "Perfect for absolute beginners. Learn the fundamentals of chess from scratch with interactive lessons.",
        curriculum: [
            "Chess board setup and piece movements",
            "Basic rules and special moves",
            "Elementary tactics: Forks, Pins, Skewers",
            "Opening principles and development",
            "Basic checkmate patterns",
            "Simple endgame techniques"
        ],
        features: ["Live online classes", "Recorded sessions", "Practice puzzles", "Participation certificate"],
        target_audience: "Ages 5+ | Rating 0-800"
    },
    {
        id: 2,
        title: "Intermediate",
        level: "Level 2",
        duration: "12-16 Weeks",
        price: 7999,
        original_price: 9999,
        discount: 20,
        rating: 4.8,
        students: 245,
        icon: "♞",
        color: "#3b82f6",
        status: "active",
        description: "Build strong fundamentals and develop competitive skills.",
        curriculum: [
            "Advanced tactical patterns and combinations",
            "Positional understanding and pawn structures",
            "Middle game planning and strategy",
            "Opening repertoire development",
            "Endgame technique and theory",
            "Tournament preparation and psychology",
            "Weekly game analysis sessions"
        ],
        features: ["Expert coaching", "Tournament prep", "Opening database", "Performance certificate"],
        target_audience: "Rating 800-1400"
    },
    {
        id: 3,
        title: "Advanced",
        level: "Level 3",
        duration: "16-20 Weeks",
        price: 12999,
        original_price: 15999,
        discount: 19,
        rating: 5.0,
        students: 189,
        icon: "♚",
        color: "#f59e0b",
        status: "active",
        description: "Competitive chess mastery for serious players.",
        curriculum: [
            "Deep opening preparation with theory",
            "Complex strategic middle game plans",
            "Advanced endgame mastery and tablebase study",
            "Professional game analysis from masters",
            "Psychological warfare and time management",
            "Tournament strategy and preparation",
            "Title norm requirements and path"
        ],
        features: ["GM coaching", "Personalized prep", "Tournament support", "Advanced certificate"],
        target_audience: "Rating 1400-1800"
    },
    {
        id: 4,
        title: "Master",
        level: "Level 4",
        duration: "24+ Weeks",
        price: 19999,
        original_price: 24999,
        discount: 20,
        rating: 5.0,
        students: 87,
        icon: "👑",
        color: "#ec4899",
        status: "active",
        description: "Elite-level training for aspiring grandmasters.",
        curriculum: [
            "Personalized opening repertoire with GM",
            "Master-level strategic concepts",
            "Advanced endgame positions and studies",
            "International tournament preparation",
            "Mental conditioning for elite play",
            "Title norm achievement strategy",
            "Professional career guidance",
            "Access to GM database and resources"
        ],
        features: ["1-on-1 GM sessions", "Custom prep", "Tournament travel support", "Master certificate"],
        target_audience: "Rating 1800+ | Title aspirants"
    }
];

export async function getCourses() {
    if (!supabase) {
        return DEFAULT_COURSES;
    }
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });
    if (error || !data || data.length === 0) {
        return DEFAULT_COURSES;
    }
    return data;
}

export async function updateCourse(id, updates) {
    if (!supabase) {
        return { success: true, data: { id, ...updates } };
    }
    const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Error updating course:', error);
        return { success: false, error };
    }
    return { success: true, data };
}

export async function toggleCourseStatus(id, status) {
    return updateCourse(id, { status });
}
