import {checkCollide, getDirectionVelocity} from "../helper"

function Bulling(game) {
    this.game = game
    this.velocity = 8

    this.bulling = {
        list: [],
        width: 8,
        height: 8,
    }
    this.burning = {
        list: [],
        frames: 7,
        width: 195,
        height: 27,
    }

    this.init = () => {
        this.burnAnimate()
    }

    this.update = () => {
        this.checkCollide()
        this.move()
    }

    this.fire = (y, x, direction, owner) => {
        let {dx, dy} = getDirectionVelocity(direction, this.velocity)

        x -= this.bulling.width / 2
        y -= this.bulling.height / 2

        this.bulling.list.push({
            x,
            y,
            dx,
            dy,
            direction,
            owner,
            width: this.bulling.width,
            height: this.bulling.height,
            remove: undefined,
        })
    }

    this.burn = (y, x) => {
        x -= this.burning.width / this.burning.frames / 2
        y -= this.burning.height / 2

        this.burning.list.push({
            x,
            y,
            frame: 0,
            remove: undefined,
        })
    }

    this.burnAnimate = () => {
        let shouldClearBurnings = false
        this.burning.list.forEach(burning => {
            if (++burning.frame > this.burning.frames) {
                shouldClearBurnings = true
                burning.remove = true
            }
        })

        setTimeout(() => {
            this.burnAnimate()
        }, 1000 / 24)

        if (shouldClearBurnings) {
            this.clearBurnings()
        }
    }

    this.checkCollide = () => {
        let shouldClearBullets = false

        this.bulling.list.forEach(bullet => {
            // 1) пуля за границей
            if (!checkCollide(bullet, this.game.maps)) {
                bullet.remove = true
            }

            // 2) пуля попала в блок/тайл
            if (!bullet.remove) {
                let colStart = this.game.maps.getCellOn(bullet.y, bullet.x)
                let colEnd = this.game.maps.getCellOn(bullet.y + this.bulling.height, bullet.x + this.bulling.width)
                if ((colStart && !colStart.bulling) || (colEnd && !colEnd.bulling)) {
                    this.onTileStrike(colStart)
                    this.onTileStrike(colEnd)

                    bullet.remove = true
                }
            }


            // 3) пуля сбила врага
            if (!bullet.remove) {
                let npcList = [
                    ...this.game.enemies,
                    this.game.user,
                ]
                npcList.forEach(npc => {
                    if (checkCollide(npc, bullet) && npc.type !== bullet.owner) {
                        bullet.remove = true
                    }
                })
            }

            if (bullet.remove) {
                shouldClearBullets = true
                return this.burn(bullet.y + this.bulling.height / 2, bullet.x + this.bulling.width / 2)
            }
        })

        if (shouldClearBullets) {
            this.clearBullets()
        }
    }

    this.onTileStrike = col => {
        if (col && !col.bulling && !col.armor) {
            this.game.maps.map[col.row][col.col] = 0
        }
    }

    this.clearBullets = () => {
        this.bulling.list = this.bulling.list.filter(bullet => !bullet.remove)
    }

    this.clearBurnings = () => {
        this.burning.list = this.burning.list.filter(burning => !burning.remove)
    }

    this.move = () => {
        this.bulling.list.forEach(bullet => {
            bullet.x += bullet.dx
            bullet.y += bullet.dy
        })
    }

    this.render = () => {
        this.bulling.list.forEach(bullet => {
            this.game.ctx.drawImage(this.game.sprites.bullet, bullet.x, bullet.y)
        })

        this.burning.list.forEach(burning => {
            let imageFrameStart = this.burning.width / this.burning.frames * burning.frame
            let imageFrameEnd = this.burning.width / this.burning.frames

            this.game.ctx.drawImage(
                this.game.sprites.burning,

                imageFrameStart,
                0,
                imageFrameEnd,
                this.burning.height,

                burning.x,
                burning.y,
                this.burning.width / this.burning.frames,
                this.burning.height,
            )
        })
    }
}

export default Bulling