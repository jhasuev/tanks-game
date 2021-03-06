import './styles/main.scss'

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
    },

    user: undefined,
    maps: undefined,

    // row = 26 * 1 = 26
    // col = 26 * 2 = 52

    // 0 - ничего (пустая зона)
    // 1 - вода
    // 2 - зелень
    // 3 - кирпич
    // 4 - камень


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
        this.maps.render()
        this.user.render()
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

        this.x += this.dx
        this.y += this.dy
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
    width: undefined,
    height: undefined,
    topOffset: undefined,
    leftOffset: undefined,
    cellSize: 17,

    create(){
        this.map = [
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
            [0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0],
        ]
        let user = {
            row: 8,
            col: 1,
        }

        this.height = this.map.length * this.cellSize
        this.width = this.map[0].length * this.cellSize

        this.topOffset = this.game.height / 2 - this.height / 2
        this.leftOffset = this.game.width / 2 - this.width / 2

        this.game.user.x = this.leftOffset + user.col * (this.cellSize * 2)
        this.game.user.y = this.topOffset + user.row * (this.cellSize * 2)
    },

    render(){
        this.map.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                let spriteToDraw = this.getColSprite(col)
                if (spriteToDraw) {
                    this.game.ctx.drawImage(spriteToDraw, this.leftOffset + colIndex * this.cellSize, this.topOffset + rowIndex * this.cellSize)
                }
            })
        })
    },

    getColSprite(col){
        if (col === 3)
            return this.game.sprites.brick

        if (col === 4)
            return this.game.sprites.stone

        return this.game.sprites.land
    },
}

Game.start()