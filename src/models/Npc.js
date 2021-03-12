import {random, getReverseDirection, getDirectionVelocity} from "../helper.js"

function Npc(game, type = 'user') {
    this.game = game
    this.type = type // user / enemy
    this.x = 110
    this.y = 110
    this.dx = 0
    this.dy = 0
    this.velocity = 1.5
    this.width = 34
    this.height = 34
    this.armor = {
        state: false,
        frames: 3,
        frame: 0,
    }

    this.frame = 0
    this.frames = 3
    this.alive = true

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
        if (type === 'enemy') {
            this.randomizeShooting()
        }

        if (type === 'user') {
            this.setArmor()
        }
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
            position.cell = this.game.levels.getCell(row, col)

            return position
        })

        return !positions.some(col => !this.game.levels.isCellWalkable(col.cell))
    }

    this.randomizeMoving = () => {
        if (this.lastDirectionChanged && (Date.now() - this.lastDirectionChanged) < random(200, 3000)) {
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

    this.randomizeShooting = () => {
        if (!this.isAlive()) {
            return
        }

        if (this.checkNpcCrosses() || this.checkNpcAndBaseCrosses() || Math.random() > .8) {
            this.fire()
        }
        setTimeout(() => {
            if (this.randomizeShooting) {
                this.randomizeShooting()
            }
        }, 900)
    }

    this.checkNpcCrosses = () => {
        return this.game.levels.checkTilesCrossing(this.getAroundCols(), this.game.user.getAroundCols())
    }

    this.checkNpcAndBaseCrosses = () => {
        return this.game.levels.checkTilesCrossing(
            this.getAroundCols(),
            this.game.levels.getAroundCols(this.game.base.y, this.game.base.x, this.game.base.height, this.game.base.width)
        )
    }

    this.animate = () => {
        if (this.directions.length && ++this.frame >= this.frames) {
            this.frame = 0
        }

        if (this.armor.state && ++this.armor.frame >= this.armor.frames) {
            this.armor.frame = 0
        }

        setTimeout(() => {
            if (this.animate) {
                this.animate()
            }
        }, 1000 / 24)
    }

    this.addMoving = (direction) => {
        if (this.supportedDirections.includes(direction) && !this.directions.includes(direction)) {
            this.directions.unshift(direction)
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

        if (this.directions.length) {
            if (!this.checkCollide()) {
                this.x += this.dx
                this.y += this.dy
            }
            this.direction = this.directions[0]
        }
    }

    this.setPositions = (row, col) => {
        this.x = this.game.levels.getXPositionOfCol(col) - this.width / 2
        this.y = this.game.levels.getYPositionOfCol(row) - this.height / 2
    }

    this.setDirection = direction => {
        this.direction = direction
    }

    this.checkCollide = () => {
        let x = this.x + this.dx
        let y = this.y + this.dy

        // коллизия по границам
        if (
            x < this.game.levels.x
            || x + this.width > this.game.levels.x + this.game.levels.width
            || y < this.game.levels.y
            || y + this.height > this.game.levels.y + this.game.levels.height
        ) {
            return true
        }

        // коллизия по блокам
        if (this.getAllCurrentCells().some(cell => !this.game.levels.isCellWalkable(cell))) {
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

        return this.game.levels.getAroundCols(y, x, this.height, this.width)
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
        if (!this.isAlive()) {
            return
        }

        if (this.type === 'enemy') {
            this.randomizeMoving()
        }

        this.move()
    }

    this.getRandomDirection = () => {
        return this.supportedDirections[random(0, this.supportedDirections.length)]
    }

    this.isAlive = () => this.alive

    this.render = () => {
        let sprite = this.game.sprites[this.type]
        let frames = this.frames
        let frame = this.frame

        if (!this.isAlive()) {
            sprite = this.game.sprites['deadNpc']
            frame = 0
            frames = 1
        }

        if (!sprite) return;

        let imageWidth = sprite.width
        let imageHeight = sprite.height

        let imageFrameStart = imageWidth / frames * frame
        let imageFrameEnd = imageWidth / frames

        this.game.ctx.save()
        this.game.ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2))
        this.game.ctx.rotate(this.angles[this.direction] * Math.PI / 180)
        this.game.ctx.drawImage(sprite, imageFrameStart, 0, imageFrameEnd, imageHeight, this.width / -2, this.height / -2, this.width, this.height)

        if (this.armor.state && this.isAlive()) {
            this.renderArmor()
        }

        this.game.ctx.restore()
    }

    this.hasArmor = () => this.armor.state

    this.turnOnArmor = () => {
        this.armor.state = true
    }

    this.turnOffArmor = () => {
        this.armor.state = false
    }

    this.setArmor = () => {
        this.turnOnArmor()
        clearTimeout(this.setArmorTimer)
        this.setArmorTimer = setTimeout(() => {
            this.turnOffArmor()
        }, 3000)
    }

    this.renderArmor = () => {
        const sprite = this.game.sprites.npcArmor

        this.game.ctx.drawImage(
            sprite,

            sprite.width / this.armor.frames * this.armor.frame,
            0,
            sprite.width / this.armor.frames,
            sprite.height,

            this.width / -2,
            this.height / -2,
            this.width,
            this.height
        )
    }
}

export default Npc