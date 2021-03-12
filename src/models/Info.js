function Info(game) {
    this.game = game;
    this.fz = 10
    this.linesOffset = 10
    this.iconSize = 10
    this.iconRightOffset = 5
    this.infoLeftOffset = 5
    this.infoTopOffset = 10

    this.info = [
        {
            icon: this.game.sprites.enemyLogo,
            key: "enemies",
            type: "icon",
        },
        {
            icon: this.game.sprites.heart,
            key: "lives",
            type: "icon",
        },
        {
            text: "lvl: ",
            key: "level",
            type: "text",
        },
    ]

    this.init = () => {
        this.game.ctx.font = `${this.fz}px Arial`
    }

    this.render = () => {
        let infos = {
            enemies: "x " + this.game.maps.getEnemiesLeft(),
            lives: "x " + this.game.maps.getUserLives(),
            level: this.game.maps.getCurrentLevel(),
        }

        this.info.forEach((block, blockIndex) => {
            let y = this.game.maps.y + blockIndex * (this.fz + this.linesOffset) + this.infoTopOffset

            if (block.type === 'icon') {
                this.game.ctx.drawImage(block.icon, this.infoLeftOffset, y, this.iconSize, this.iconSize)
            } else if (block.type === 'text') {
                this.game.ctx.fillText(block.text, this.infoLeftOffset, y + this.fz - 2)
            }

            this.game.ctx.fillText(infos[block.key], this.infoLeftOffset + this.iconRightOffset + this.iconSize, y + this.fz - 2)
        })
    }
}

export default Info