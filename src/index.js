import './styles/main.scss'
import Maps from "./models/Maps.js"
import Npc from "./models/Npc.js"
import { random } from "./helper"

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
        enemy: undefined,
        land: undefined,
        brick: undefined,
        stone: undefined,
        water: undefined,
        grass: undefined,
    },

    user: undefined,
    maps: undefined,
    enemies: [],

    start() {
        this.init()
        this.setPositions()

        this.preload().then(() => {
            this.maps.create().then(() => {
                this.createUser()
                this.createEnemies()
            })
            this.loop()
        })
    },

    init() {
        this.canvas = document.getElementById("game")
        this.ctx = this.canvas.getContext("2d")

        this.initEvents()

        this.maps = new Maps(this)
    },

    createUser(){
        this.user = new Npc(this, 'user')
        this.user.setDirection(this.maps.user.direction)
        this.user.setPositions(this.maps.user.row, this.maps.user.col)
        this.user.start()
    },

    createEnemies() {
        for (let i = 0; i < this.maps.enemy.max; i++) {
            this.addEnemy(this.maps.enemy.positions[i])
        }
    },

    addEnemy(position){
        let enemy = new Npc(this, 'enemy')
        if (!position) {
            position = this.maps.enemy.positions[random(0, this.maps.enemy.positions.length)]
        }
        enemy.setPositions(position.row,position.col)
        enemy.setDirection(position.direction)
        enemy.start()

        this.enemies.push(enemy)
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
        this.enemies.forEach(enemy => {
            enemy.update()
        })
    },

    render() {
        this.backgroundRender()
        this.maps.renderBackground()
        this.user.render()
        this.enemies.forEach(enemy => {
            enemy.render()
        })
        this.maps.renderMap()
    },

    backgroundRender() {
        this.ctx.fillStyle = '#636363'
        this.ctx.fillRect(0, 0, this.width, this.height)
    },
}

Game.start()