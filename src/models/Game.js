// модель всех карт (там же определяются и размеры карты)
import Levels from "./Maps.js"
// NPC / общий и для врагов, и для игрока с некоторыми отличиями (пока только по цвету)
import Npc from "./Npc.js"
// вся стрельба + взрывы (все в одном объекте)
import Bulling from "./Bulling.js"
// База игрока (сердечко -_-)
import Base from "./Base.js"
// Вся отображаемая информация на канвасе
import Info from "./Info";
// вспомогатели
import {random, KEYS} from "../helper"
import emitter from "@/./eventHub"

// главный объект
function Game() {
    this.canvas = undefined
    this.ctx = undefined
    this.width = undefined
    this.height = undefined
    this.dimensions = {
        max: {
            width: 1000,
            height: 600,
        },
        min: {
            width: 23 * 26 + 100,
            height: 23 * 25,
        },
    }

    this.sprites = {
        user: undefined,
        enemy: undefined,
        enemyLogo: undefined,
        deadNpc: undefined,
        npcArmor: undefined,
        base: undefined,
        baseBroken: undefined,
        heart: undefined,
        bullet: undefined,
        burning: undefined,

        land: undefined,
        brick: undefined,
        stone: undefined,
        water: undefined,
        grass: undefined,
    }

    this.user = undefined // Npc игрока
    this.enemies = [] // Npc врагов (список)
    this.base = undefined // База игрока
    this.levels = undefined // объект карты
    this.bulling = undefined // стрельба + взрывы
    this.info = undefined // вывод информации

    this.running = false
    this.started = false
    this.ended = false

    this.start = () => {
        // this.preload() - загружает все спрайты
        this.preload().then(() => {
            this.init()
            this.createModels()
            this.initModels()

            // запускаем обновлятор ))
            this.loop()
        })
    }

    this.init = () => {
        this.canvas = document.getElementById("game")
        this.ctx = this.canvas.getContext("2d")

        // установка разрешения канваса/хоста
        this.setDimensions()
        // регистрация событий
        this.initEvents()
    }

    this.onWindowResize = () => {
        clearTimeout(this.onWindowResizeTimer)
        this.onWindowResizeTimer = setTimeout(() => {
            location.reload()
        }, 250)
    }

    this.setDimensions = () => {
        let data = {
            maxWidth: this.dimensions.max.width,
            maxHeight: this.dimensions.max.height,
            minWidth: this.dimensions.min.width,
            minHeight: this.dimensions.min.height,
            realWidth: innerWidth,
            realHeight: innerHeight,
        }

        this.canvas.style.height = this.canvas.style.width = ""

        let ratioWidth = data.realWidth / data.realHeight
        let ratioHeight = data.realHeight / data.realWidth

        let height = ratioHeight * data.maxHeight
        let width = ratioWidth * data.maxHeight

        if (ratioWidth > data.maxWidth / data.maxHeight) {
            height = Math.min(height, data.maxHeight)
            height = Math.max(height, data.minHeight)

            width = ratioWidth * height
            this.canvas.style.width = "100%"
        } else {
            width = Math.min(width, data.maxWidth)
            width = Math.max(width, data.minWidth)

            height = ratioHeight * width
            this.canvas.style.height = "100%"
        }

        this.canvas.width = this.width = width
        this.canvas.height = this.height = height
    }

    this.setUserDefaultPosition = () => {
        this.user.setPositions(this.levels.user.row, this.levels.user.col)
        this.user.setDirection(this.levels.user.direction)
    }

    this.createEnemies = () => {
        if (this.enemies.length) {
            this.enemies.forEach(enemy => this.destroyModel(enemy))
            this.enemies = []
        }

        for (let i = 0; i < this.levels.enemy.max; i++) {
            this.addNewEnemy(this.levels.enemy.positions[i])
        }
    }

    this.addNewEnemy = (position = undefined) => {
        this.enemies.push(this.createNewNpc('enemy', position))
    }

    this.killEnemy = (npc) => {
        npc.alive = false

        if (this.enemies.length <= this.levels.enemy.total) {
            this.addNewEnemy()
        }

        if (this.levels.enemy.total >= 0) {
            this.levels.enemy.total -= 1
        }

        if (this.levels.enemy.total <= 0) {
            this.userWin()
        }
    }

    this.userWin = () => {
        this.levels.levelUp()
        this.startLevel(this.levels.level)
        this.pauseToggle()
        this.showMessage("You win")
        this.ended = true
    }

    this.pauseToggle = () => {
        if (this.ended) return;

        emitter.emit("onmenutoggle", state => {
            this.running = !state
        })
    }

    this.showMessage = (msg) => {
        emitter.emit("showMessage", msg)
    }

    this.userLost = () => {
        this.pauseToggle()
        this.ended = true
        this.showMessage("You lost")
    }

    this.createModels = () => {
        this.levels = new Levels(this)
        this.bulling = new Bulling(this)
        this.base = new Base(this)
        this.info = new Info(this)
    }

    this.initModels = () => {
        // инициализация моделей
        this.bulling.init()
    }

    this.destroyModel = (model) => {
        for (let key in model) {
            delete model[key]
        }
    }

    this.startLevel = (level) => {
        this.ended = false
        this.levels.setCurrentLevel(level)

        // this.levels.create() - создает карту и размешает её сразу посередине канваса
        let mapCreated = this.levels.create()

        if (!mapCreated) {
            this.running = false
        }

        // создаем игрока и размешаем его в нужное место, которое описано на карте
        if (!this.user) {
            this.user = this.createNewNpc('user', this.levels.user)
        } else {
            this.setUserDefaultPosition()
        }

        // тоже создаем врагов и размешаем их на карте
        this.createEnemies()

        // инициализируем базу игрока
        this.base.init()

        // инициализируем информацию
        this.info.init()

        this.running = true
        this.started = true
    }

    this.killUser = (npc) => {
        if (npc.hasArmor()) return;

        if (this.levels.getUserLives() > 0) {
            this.levels.removeUserLive()
            this.setUserDefaultPosition()
            npc.setArmor()
        }

        if (this.levels.getUserLives() <= 0) {
            this.userLost()
        }
    }

    this.createNewNpc = (type, position) => {
        let npc = new Npc(this, type)

        if (!position && type === 'enemy') {
            position = this.levels.enemy.positions[random(0, this.levels.enemy.positions.length)]
        }

        npc.setPositions(position.row, position.col)
        npc.setDirection(position.direction)
        npc.init()

        return npc
    }

    this.initEvents = () => {
        const onKeyEvent = (e, type) => {
            if (!this.started) return;

            let key = KEYS[e.keyCode]
            if (key) {
                if (key === 'menu') {
                    if (e.type === "keyup") {
                        this.pauseToggle()
                    }
                } else if (key === 'fire') {
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

        window.addEventListener("resize", () => {
            this.onWindowResize()
        })
    }

    this.preload = () => {
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
    }

    this.loop = () => {
        requestAnimationFrame(() => {
            this.update()
            this.render()
            this.loop()
        })
    }

    this.update = () => {
        if (!this.running) return;

        this.bulling.update()
        if (this.user) {
            this.user.update()
        }

        this.enemies.forEach(enemy => {
            enemy.update()
        })
    }

    this.render = () => {
        if (!this.running) return;

        this.backgroundRender()
        this.levels.renderBackground()
        this.enemies.forEach(enemy => {
            enemy.render()
        })
        if (this.user) {
            this.user.render()
        }
        this.bulling.render()
        this.base.render()
        this.levels.renderMap()
        this.info.render()
    }

    this.backgroundRender = () => {
        this.ctx.fillStyle = '#636363'
        this.ctx.fillRect(0, 0, this.width, this.height)
    }
}

export default Game