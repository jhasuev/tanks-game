function Npc(game, type = 'user') {
    this.game = game
    this.type = type // user / enemy
    this.x = 110
    this.y = 110
    this.dx = 0
    this.dy = 0
    this.velocity = 1
    this.width = 34
    this.height = 34

    this.frame = 0
    this.frames = 3

    this.directions = []
    this.direction = 'right'
    this.angles = {
        "right": 90,
        "up": 0,
        "left": -90,
        "down": 180,
    }
    this.moveAnimationRegistered = false

    this.animate = () => {
        setInterval(() => {
            if (this.directions.length && ++this.frame >= this.frames) {
                this.frame = 0
            }
        }, 1000 / 24)
    }

    this.addMoving = (direction) => {
        if (!this.moveAnimationRegistered) {
            this.moveAnimationRegistered = true
            this.animate()
        }

        let supportedKeys = ['left', 'up', 'right', 'down']
        if (supportedKeys.includes(direction) && !this.directions.includes(direction)) {
            this.directions.unshift(direction)
        }
    }

    this.removeMoving = (direction) => {
        this.directions = this.directions.filter(dir => dir !== direction)
    }

    this.move = () => {
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
    }

    this.setPositions = (row, col) => {
        this.x = this.game.maps.x + col * this.game.maps.cellSize + (this.game.maps.cellSize * 2 - this.width) / 2
        this.y = this.game.maps.y + row * this.game.maps.cellSize + (this.game.maps.cellSize * 2 - this.height) / 2

        console.log(row, col)
        console.log(this.game.maps.x, col, this.game.maps.cellSize, (this.game.maps.cellSize * 2 - this.width) / 2)
        // console.log(this.x, this.y)
    }

    this.checkCollide = () => {
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
    }

    this.getAllNextCells = () => {
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
    }

    this.update = () => {
        this.move()
    }

    this.render = () => {
        let sprite = this.game.sprites[this.type]
        if (!sprite) return;

        let imageWidth = sprite.width
        let imageHeight = sprite.height

        let imageFrameStart = imageWidth / this.frames * this.frame
        let imageFrameEnd = imageWidth / this.frames

        this.game.ctx.save()
        this.game.ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2))
        this.game.ctx.rotate(this.angles[this.direction] * Math.PI / 180)
        this.game.ctx.drawImage(sprite, imageFrameStart, 0, imageFrameEnd, imageHeight, this.width / -2, this.height / -2, this.width, this.width)
        this.game.ctx.restore()
    }
}

export default Npc