import './styles/main.scss'
import maps from "./maps.json"

const KEYS = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
}

const Game = {
    canvas: undefined,
    ctx: undefined,
    width: undefined,
    height: undefined,

    sprites: {
        user: undefined,
        land: undefined,
        brick: undefined,
        stone: undefined,
        water: undefined,
        grass: undefined,
    },

    user: undefined,
    maps: undefined,

    start() {
        this.init()
        this.setPositions()

        this.preload().then(() => {
            this.maps.create()
            this.loop()
        })
    },

    init() {
        this.canvas = document.getElementById("game")
        this.ctx = this.canvas.getContext("2d")

        this.initEvents()
    },

    initEvents() {
        const onKeyEvent = ({keyCode}, type) => {
            let key = KEYS[keyCode]
            if (key) {
                if (type === 'add') {
                    this.user.addMoving(key)
                } else {
                    this.user.removeMoving(key)
                }
            }
        }

        window.addEventListener("keydown", e => {
            onKeyEvent(e, 'add')
        })
        window.addEventListener("keyup", e => {
            onKeyEvent(e, 'remove')
        })
    },

    setPositions() {
        this.width = this.canvas.width = 640 * 2
        this.height = this.canvas.height = 360 * 2
    },

    preload() {
        return new Promise(resolve => {
            let loaded = 0
            let required = Object.keys(this.sprites).length

            const onSpriteLoaded = () => {
                if (++loaded >= required) {
                    resolve()
                }
            }

            for (let sprite in this.sprites) {
                this.sprites[sprite] = new Image()
                this.sprites[sprite].onload = onSpriteLoaded
                this.sprites[sprite].src = `assets/img/${sprite}.png`
            }
        })
    },

    loop() {
        requestAnimationFrame(() => {
            this.update()
            this.render()
            this.loop()
        })
    },

    update() {
        this.user.update()
    },

    render() {
        this.backgroundRender()
        this.maps.renderBackground()
        this.user.render()
        this.maps.renderMap()
    },

    backgroundRender() {
        this.ctx.fillStyle = '#636363'
        this.ctx.fillRect(0, 0, this.width, this.height)
    },
}

Game.user = {
    game: Game,
    x: 110,
    y: 110,
    dx: 0,
    dy: 0,
    velocity: 1,
    width: 34,
    height: 34,

    frame: 0,
    frames: 3,

    directions: [],
    direction: 'right',
    angles: {
        "right": 90,
        "up": 0,
        "left": -90,
        "down": 180,
    },
    moveAnimationRegistered: false,

    animate() {
        setInterval(() => {
            if (this.directions.length && ++this.frame >= this.frames) {
                this.frame = 0
            }
        }, 1000 / 24)
    },

    addMoving(direction) {
        if (!this.moveAnimationRegistered) {
            this.moveAnimationRegistered = true
            this.animate()
        }

        let supportedKeys = ['left', 'up', 'right', 'down']
        if (supportedKeys.includes(direction) && !this.directions.includes(direction)) {
            this.directions.unshift(direction)
        }
    },

    removeMoving(direction) {
        this.directions = this.directions.filter(dir => dir !== direction)
    },

    move() {
        this.dx = this.dy = 0

        switch (this.directions[0]) {
            case 'left':
                this.dx = -this.velocity;
                this.direction = 'left';
                break;

            case 'up':
                this.dy = -this.velocity;
                this.direction = 'up';
                break;

            case 'right':
                this.dx = +this.velocity;
                this.direction = 'right';
                break;

            case 'down':
                this.dy = +this.velocity;
                this.direction = 'down';
                break;
        }

        if (this.directions.length && !this.checkCollide()) {
            this.x += this.dx
            this.y += this.dy
        }
    },

    checkCollide() {
        let x = this.x + this.dx
        let y = this.y + this.dy

        // коллизия по границам
        if (
            x < this.game.maps.x
            || x + this.width > this.game.maps.x + this.game.maps.width
            || y < this.game.maps.y
            || y + this.height > this.game.maps.y + this.game.maps.height
        ) {
            return true
        }

        // коллизия по блокам
        if (this.getAllNextCells().some(cell => !this.game.maps.isCellWalkable(cell))) {
            return true
        }
    },

    getAllNextCells() {
        let x = this.x + this.dx
        let y = this.y + this.dy

        let rowStart = Math.floor((y - this.game.maps.y) / this.game.maps.cellSize)
        let rowEnd = Math.floor(((y + this.height - .001) - this.game.maps.y) / this.game.maps.cellSize)
        let colStart = Math.floor((x - this.game.maps.x) / this.game.maps.cellSize)
        let colEnd = Math.floor(((x + this.width - .001) - this.game.maps.x) / this.game.maps.cellSize)

        let cols = []
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                cols.push(this.game.maps.map[row][col])
            }
        }

        return cols
    },

    update() {
        this.move()
    },

    render() {
        let imageWidth = this.game.sprites.user.width
        let imageHeight = this.game.sprites.user.height

        let imageFrameStart = imageWidth / this.frames * this.frame
        let imageFrameEnd = imageWidth / this.frames

        this.game.ctx.save()
        this.game.ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2))
        this.game.ctx.rotate(this.angles[this.direction] * Math.PI / 180)
        this.game.ctx.drawImage(this.game.sprites.user, imageFrameStart, 0, imageFrameEnd, imageHeight, this.width / -2, this.height / -2, this.width, this.width)
        this.game.ctx.restore()
    },
}

Game.maps = {
    game: Game,
    map: undefined,
    userInfo: undefined,
    width: undefined,
    height: undefined,
    y: undefined,
    x: undefined,
    cellSize: 27, // original size of cell is "17", the other pixels are offsets
    level: 0,
    cellTypes: {
        0: { // 0 - ничего (пустая зона)
            walkable: true,
            sprite: 'land',
        },
        1: { // 1 - вода
            walkable: false,
            sprite: 'water',
        },
        2: { // 2 - зелень
            walkable: true,
            sprite: 'grass',
        },
        3: { // 3 - кирпич
            walkable: false,
            sprite: 'brick',
        },
        4: { // 4 - камень
            walkable: false,
            sprite: 'stone',
        },
    },
    bgPattern: undefined,

    create() {
        this.map = maps[this.level].map
        this.userInfo = maps[this.level].user

        this.height = this.map.length * this.cellSize
        this.width = this.map[0].length * this.cellSize

        this.y = this.game.height / 2 - this.height / 2
        this.x = this.game.width / 2 - this.width / 2

        this.game.user.x = this.x + this.userInfo.col * this.cellSize
        this.game.user.y = this.y + this.userInfo.row * this.cellSize
        this.game.user.direction = this.userInfo.direction
    },

    renderMap() {
        let spriteName = undefined

        this.map.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                spriteName = this.getCellName(col)
                if (spriteName && spriteName !== 'land') {
                    this.game.ctx.drawImage(this.game.sprites[spriteName], this.x + colIndex * this.cellSize, this.y + rowIndex * this.cellSize,this.cellSize,this.cellSize)
                }
            })
        })
    },

    renderBackground() {
        if (!this.bgPattern) {
            this.bgPattern = this.game.ctx.createPattern(this.game.sprites.land, 'repeat')
        }
        this.game.ctx.fillStyle = this.bgPattern
        this.game.ctx.fillRect(this.x, this.y, this.width, this.height)
    },

    getCellName(cell) {
        return this.cellTypes[cell].sprite
    },

    isCellWalkable(cell){
        return this.cellTypes[cell].walkable
    },
}

Game.start()