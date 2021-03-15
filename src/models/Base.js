function Npc(game) {
    this.game = game
    this.x = undefined
    this.y = undefined
    this.width = 500 / 12
    this.height = 34

    this.frame = 0
    this.frames = 12
    this.active = !true

    this.init = () => {
        this.frame = 0
        this.active = true
        this.setPositions()
        this.animate()
    }

    this.animate = () => {
        if (this.game.running) {
            if (++this.frame >= this.frames) {
                this.frame = 0
            }
        }

        clearTimeout(this.animateTimer)
        this.animateTimer = setTimeout(() => {
            this.animate()
        }, 1000 / 12)
    }

    this.setPositions = () => {
        let {row, col} = this.game.levels.getBasePosition()

        this.x = this.game.levels.getXPositionOfCol(col) - this.width / 2
        this.y = this.game.levels.getYPositionOfCol(row) - this.height / 2
    }

    this.kill = () => {
        this.active = false
    }

    this.render = () => {
        let sprite = this.game.sprites.base
        if (this.active) {
            let imageFrameStart = sprite.width / this.frames * this.frame
            let imageFrameEnd = sprite.width / this.frames

            this.game.ctx.drawImage(
                sprite,

                imageFrameStart,
                0,
                imageFrameEnd,
                sprite.height,

                this.x,
                this.y,
                this.width,
                this.height,
            )
        } else {
            sprite = this.game.sprites.baseBroken
            this.game.ctx.drawImage(
                sprite,

                this.x,
                this.y,
                this.width,
                this.height,
            )
        }
    }
}

export default Npc