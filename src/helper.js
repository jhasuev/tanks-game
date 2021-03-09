export function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

export const KEYS = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
}

export const getReverseDirection = (direction) => {
    return {
        "left": "right",
        "right": "left",
        "up": "down",
        "down": "up",
    }[direction]
}