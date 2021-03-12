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
            if (!checkCollide(bullet, this.game.levels)) {
                bullet.remove = true
            }

            // 2) пуля попала в блок/тайл
            if (!bullet.remove) {
                let col1 = this.game.levels.getCellOn(bullet.y, bullet.x)
                let col2 = this.game.levels.getCellOn(bullet.y, bullet.x + this.bulling.width)
                let col3 = this.game.levels.getCellOn(bullet.y + this.bulling.height, bullet.x)
                let col4 = this.game.levels.getCellOn(bullet.y + this.bulling.height, bullet.x + this.bulling.width)

                if (this.canShot(col1) || this.canShot(col2) || this.canShot(col3) || this.canShot(col4)) {
                    this.onTileStrike(col1)
                    this.onTileStrike(col2)
                    this.onTileStrike(col3)
                    this.onTileStrike(col4)

                    bullet.remove = true
                }
            }


            // 3) пуля сбила врага или игрока
            if (!bullet.remove) {
                let npcList = [
                    ...this.game.enemies,
                    this.game.user,
                ]
                npcList.forEach(npc => {
                    if (checkCollide(npc, bullet) && npc.type !== bullet.owner) {
                        if (!npc.isAlive()) {
                            return
                        }

                        bullet.remove = true
                        if (npc.type === 'enemy') {
                            this.game.killEnemy(npc)
                        } else {
                            this.game.killUser(npc)
                        }
                    }
                })
            }


            // 4) пуля попала на базу
            if (!bullet.remove) {
                if (checkCollide(this.game.base, bullet) && this.game.base.active) {
                    bullet.remove = true
                    this.game.base.kill()
                }
            }


            // 5) пуля попала в другую пулю
            if (!bullet.remove) {
                for (let anotherBullet of this.bulling.list) {
                    if (checkCollide(anotherBullet, bullet) && bullet !== anotherBullet) {
                        bullet.remove = true
                        break
                    }
                }
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

    this.canShot = (col) => {
        return col && !col.bulling
    }

    this.onTileStrike = col => {
        if (col && !col.bulling && !col.armor) {
            this.game.levels.map[col.row][col.col] = 0
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