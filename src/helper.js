export function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

export const KEYS = {
    37: 'left',
    65: 'left',
    38: 'up',
    87: 'up',
    39: 'right',
    68: 'right',
    40: 'down',
    83: 'down',
    32: 'fire',
    13: 'fire',
}

export const getReverseDirection = (direction) => {
    return {
        "left": "right",
        "right": "left",
        "up": "down",
        "down": "up",
    }[direction]
}

export function checkCollide(first, second) {
    let firstStartX = first.x
    let firstStopX = first.x + first.width
    let firstStartY = first.y
    let firstStopY = first.y + first.height

    return second.x + second.width > firstStartX
        && second.x < firstStopX
        && second.y + second.height > firstStartY
        && second.y < firstStopY;
}

export function getDirectionVelocity(direction, velocity) {
    let dx = 0
    let dy = 0

    switch (direction) {
        case 'left':
            dx = -velocity;
            break;

        case 'up':
            dy = -velocity;
            break;

        case 'right':
            dx = +velocity;
            break;

        case 'down':
            dy = +velocity;
            break;
    }

    return {dx, dy}
}