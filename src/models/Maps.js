import maps from "../maps.json";

function Maps(game) {
    this.game = game;
    this.map = undefined;
    this.userInfo = undefined;
    this.width = undefined;
    this.height = undefined;
    this.y = undefined;
    this.x = undefined;
    this.cellSize = 23; // original size of cell is "17", the other pixels are offsets
    this.level = 0;
    this.cellTypes = {
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
    };
    this.bgPattern = undefined;

    this.create = () => {
        return new Promise(resolve => {
            this.map = maps[this.level].map
            this.userInfo = maps[this.level].user

            this.height = this.map.length * this.cellSize
            this.width = this.map[0].length * this.cellSize

            this.y = this.game.height / 2 - this.height / 2
            this.x = this.game.width / 2 - this.width / 2

            resolve(this)
        })
    }

    this.renderMap = () => {
        let spriteName = undefined

        this.map.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                spriteName = this.getCellName(col)
                if (spriteName && spriteName !== 'land') {
                    this.game.ctx.drawImage(this.game.sprites[spriteName], this.x + colIndex * this.cellSize, this.y + rowIndex * this.cellSize, this.cellSize, this.cellSize)
                }
            })
        })
    }

    this.renderBackground = () => {
        if (!this.bgPattern) {
            this.bgPattern = this.game.ctx.createPattern(this.game.sprites.land, 'repeat')
        }
        this.game.ctx.fillStyle = this.bgPattern
        this.game.ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    this.getCellName = (cell) => {
        return this.cellTypes[cell].sprite
    }

    this.isCellWalkable = (cell) => {
        return this.cellTypes[cell].walkable
    }
}

export default Maps