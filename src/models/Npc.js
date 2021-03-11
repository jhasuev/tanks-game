import {random, getReverseDirection, getDirectionVelocity} from "../helper.js"

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

    this.supportedDirections = ['left', 'up', 'right', 'down']
    this.directions = []
    this.direction = 'right'
    this.angles = {
        "right": 90,
        "up": 0,
        "left": -90,
        "down": 180,
    }
    this.lastDirectionChanged = undefined
    this.lastFiredAt = undefined

    this.init = () => {
        this.animate()
    }

    this.canGoTo = (direction) => {
        let positions = this.getAroundCols(false)

        positions.map(position => {
            let row = position.row
            let col = position.col

            switch (direction) {
                case 'left':
                    col -= 1
                    break;
                case 'up':
                    row -= 1
                    break;
                case 'right':
                    col += 1
                    break;
                case 'down':
                    row += 1
                    break;
            }

            position.row = row
            position.col = col
            position.cell = this.game.maps.getCell(row, col)

            return position
        })

        return !positions.some(col => !this.game.maps.isCellWalkable(col.cell))
    }

    this.randomizeMoving = () => {
        if (this.lastDirectionChanged && (Date.now() - this.lastDirectionChanged) < 200) {
            return;
        }

        let direction = this.getRandomDirection()

        if (
            this.canGoTo(direction)
            && direction !== getReverseDirection(this.direction)
            || this.checkCollide()
        ) {
            if (!this.directions.length) {
                this.addMoving(direction)
            } else {
                this.directions[0] = direction
            }
            this.lastDirectionChanged = Date.now()
        }
    }

    this.animate = () => {
        setInterval(() => {
            if (this.directions.length && ++this.frame >= this.frames) {
                this.frame = 0
            }
        }, 1000 / 24)
    }

    this.addMoving = (direction) => {
        if (this.supportedDirections.includes(direction) && !this.directions.includes(direction)) {
            this.directions.unshift(direction)
            this.direction = direction
        }
    }

    this.removeMoving = (direction) => {
        this.directions = this.directions.filter(dir => dir !== direction)
    }

    this.move = () => {
        this.dx = this.dy = 0
        let velocities = getDirectionVelocity(this.directions[0], this.velocity)
        this.dx = velocities.dx
        this.dy = velocities.dy

        if (this.directions.length && !this.checkCollide()) {
            this.x += this.dx
            this.y += this.dy
            this.direction = this.directions[0]
        }
    }

    this.setPositions = (row, col) => {
        this.x = this.game.maps.x + col * this.game.maps.cellSize + (this.game.maps.cellSize * 2 - this.width) / 2
        this.y = this.game.maps.y + row * this.game.maps.cellSize + (this.game.maps.cellSize * 2 - this.height) / 2
    }

    this.setDirection = direction => {
        this.direction = direction
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
        if (this.getAllCurrentCells().some(cell => !this.game.maps.isCellWalkable(cell))) {
            return true
        }
    }

    this.getAroundCols = (next = true) => {
        let x = this.x
        let y = this.y

        if (next) {
            x += this.dx
            y += this.dy
        }

        let rowStart = this.game.maps.getRowOn(y)
        let rowEnd = this.game.maps.getRowOn(y + this.height - .001)
        let colStart = this.game.maps.getColOn(x)
        let colEnd = this.game.maps.getColOn(x + this.width - .001)

        rowStart = Math.max(rowStart, 0)
        colStart = Math.max(colStart, 0)

        rowEnd = Math.min(rowEnd, this.game.maps.map.length - 1)
        colEnd = Math.min(colEnd, this.game.maps.map[0].length - 1)

        let cols = []
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                cols.push({row, col, cell: this.game.maps.map[row][col]})
            }
        }

        return cols
    }

    this.fire = () => {
        if (Date.now() - this.lastFiredAt < 500) return;

        let x = this.x
        let y = this.y

        switch (this.direction) {
            case "up":
                x += this.width / 2;
                break;
            case "right":
                y += this.height / 2;
                x += this.width
                break;
            case "down":
                x += this.width / 2;
                y += this.height;
                break;
            case "left":
                y += this.height / 2;
                break;
        }

        this.game.bulling.fire(y, x, this.direction, this.type)

        this.lastFiredAt = Date.now()
    }

    this.getAllCurrentCells = () => {
        return this.getAroundCols().map(col => col.cell)
    }

    this.update = () => {
        if (this.type === 'enemy') {
            this.randomizeMoving()
        }
        this.move()
    }

    this.getRandomDirection = () => {
        return this.supportedDirections[random(0, this.supportedDirections.length)]
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
        this.game.ctx.drawImage(sprite, imageFrameStart, 0, imageFrameEnd, imageHeight, this.width / -2, this.height / -2, this.width, this.height)
        this.game.ctx.restore()
    }
}

export default Npc