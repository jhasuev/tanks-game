import './styles/main.scss'
import Maps from "./models/Maps.js"
import Npc from "./models/Npc.js"
import Bulling from "./models/Bulling.js"
import { random, KEYS } from "./helper"

const Game = {
    canvas: undefined,
    ctx: undefined,
    width: undefined,
    height: undefined,
    dimensions: {
        max: {
            width: 600,
            height: 600,
        },
        min: {
            width: 600,
            height: 600,
        },
    },

    sprites: {
        user: undefined,
        enemy: undefined,
        bullet: undefined,
        burning: undefined,

        land: undefined,
        brick: undefined,
        stone: undefined,
        water: undefined,
        grass: undefined,
    },

    user: undefined,
    maps: undefined,
    bulling: undefined,
    enemies: [],

    start() {
        this.preload().then(() => {
            this.init()
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

        this.initDimensions()
        this.initEvents()

        this.maps = new Maps(this)
        this.bulling = new Bulling(this)
        this.bulling.init()
    },

    initDimensions(){
        let data = {
            maxWidth: this.dimensions.max.width,
            maxHeight: this.dimensions.max.height,
            minWidth: this.dimensions.min.width,
            minHeight: this.dimensions.min.height,
            realWidth: innerWidth,
            realHeight: innerHeight,
        }

        this.fitWindow(data)
    },

    fitWindow(data){
        let ratioWidth = data.realWidth / data.realHeight
        let ratioHeight = data.realHeight / data.realWidth

        if (ratioWidth > data.maxWidth / data.maxHeight) {
            this.height = ratioHeight * data.maxHeight
            this.height = Math.min(this.height, data.maxHeight)
            this.height = Math.max(this.height, data.minHeight)

            this.width = ratioWidth * this.height
            this.canvas.style.height = ""
            this.canvas.style.width = "100%"
        } else {
            this.width = ratioWidth * data.maxHeight
            this.width = Math.min(this.width, data.maxWidth)
            this.width = Math.max(this.width, data.minWidth)

            this.height = ratioHeight * this.width
            this.canvas.style.width = ""
            this.canvas.style.height = "100%"
        }

        this.canvas.width = this.width
        this.canvas.height = this.height
    },

    createUser(){
        this.user = this.createNewNpc('user', this.maps.user)
    },

    createEnemies() {
        for (let i = 0; i < this.maps.enemy.max; i++) {
            this.enemies.push(this.createNewNpc('enemy', this.maps.enemy.positions[i]))
        }
    },

    createNewNpc(type, position){
        let npc = new Npc(this, type)

        if (!position && type === 'enemy') {
            position = this.maps.enemy.positions[random(0, this.maps.enemy.positions.length)]
        }

        npc.setPositions(position.row, position.col)
        npc.setDirection(position.direction)
        npc.init()

        return npc
    },

    initEvents() {
        const onKeyEvent = ({keyCode}, type) => {
            let key = KEYS[keyCode]
            if (key) {
                if (key == 'fire') {
                    this.user.fire()
                } else {
                    if (type === 'down') {
                        this.user.addMoving(key)
                    } else {
                        this.user.removeMoving(key)
                    }
                }
            }
        }

        window.addEventListener("keydown", e => {
            onKeyEvent(e, 'down')
        })
        window.addEventListener("keyup", e => {
            onKeyEvent(e, 'up')
        })
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
        this.bulling.update()
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

        this.bulling.render()
    },

    backgroundRender() {
        this.ctx.fillStyle = '#636363'
        this.ctx.fillRect(0, 0, this.width, this.height)
    },
}

Game.start()