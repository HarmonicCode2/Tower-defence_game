export const GAME_CONSTANTS = {
    BASE_WIDTH: 1280,
    BASE_HEIGHT: 720,
    TOWER_PRICES: {
        simple: 0,
        cannon: 200,
        fire: 300
    },
    WAVES: [
        { count: 10, health: 1, speed: 1, worth: 20, takesHits: 1 },
        { count: 15, health: 2, speed: 1.2, worth: 30, takesHits: 2 },
        { count: 20, health: 3, speed: 1.5, worth: 40, takesHits: 3 }
    ],
    PATH_POINTS: [
        { x: 260, y: 0 },
        { x: 260, y: 430 },
        { x: 1160, y: 460 },
    ],
    TOWER_SPOTS: [
        { x: 330, y: 100 },
        { x: 190, y: 360 },
        { x: 600, y: 380 },
        { x: 800, y: 520 },
        { x: 1100, y: 390 },
    ]
};