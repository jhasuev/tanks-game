// основные стили
import './styles/main.scss'
// модель всех карт (там же определяются и размеры карты)
import Maps from "./models/Maps.js"
// NPC / общий и для врагов, и для игрока с некоторыми отличиями (пока только по цвету)
import Npc from "./models/Npc.js"
// вся стрельба + взрывы (все в одном объекте)
import Bulling from "./models/Bulling.js"
// База игрока (сердечко -_-)
import Base from "./models/Base.js"
// Вся отображаемая информация на канвасе
import Info from "./models/Info";
// вспомогатели
import {random, KEYS} from "./helper"

// главный объект
const Game = {
    canvas: undefined,
    ctx: undefined,
    width: undefined,
    height: undefined,
    dimensions: {
        max: {
            width: 1000,
            height: 600,
        },
        min: {
            width: 23 * 26 + 100,
            height: 23 * 25,
        },
    },

    sprites: {
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
    },

    user: undefined, // Npc игрока
    enemies: [], // Npc врагов (список)
    base: undefined, // База игрока
    maps: undefined, // объект карты
    bulling: undefined, // стрельба + взрывы
    info: undefined, // вывод информации

    start() {
        // this.preload() - загружает все спрайты
        this.preload().then(() => {
            this.init()
            this.createModels()
            this.startLevel()

            // запускаем обновлятор ))
            this.loop()

            setTimeout(() => {
                this.userWin()
            }, 1111)
        })
    },

    init() {
        this.canvas = document.getElementById("game")
        this.ctx = this.canvas.getContext("2d")

        // установка разрешения канваса/хоста
        this.setDimensions()
        // регистрация событий
        this.initEvents()
    },

    onWindowResize() {
        clearTimeout(this.onWindowResizeTimer)
        this.onWindowResizeTimer = setTimeout(() => {
            location.reload()
        }, 250)
    },

    setDimensions() {
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
    },

    setUserDefaultPosition() {
        this.user.setPositions(this.maps.user.row, this.maps.user.col)
        this.user.setDirection(this.maps.user.direction)
    },

    createEnemies() {
        if (this.enemies.length) {
            this.enemies.forEach(enemy => this.destroyModel(enemy))
            this.enemies = []
        }

        for (let i = 0; i < this.maps.enemy.max; i++) {
            this.addNewEnemy(this.maps.enemy.positions[i])
        }
    },

    addNewEnemy(position = undefined) {
        this.enemies.push(this.createNewNpc('enemy', position))
    },

    killEnemy(npc) {
        npc.alive = false

        if (this.enemies.length <= this.maps.enemy.total) {
            this.addNewEnemy()
        }

        if (this.maps.enemy.total >= 0) {
            this.maps.enemy.total -= 1
        }

        if (this.maps.enemy.total <= 0) {
            this.userWin()
        }
    },

    userWin() {
        console.log(1)
        this.maps.levelUp()
        this.startLevel()
    },

    createModels() {
        this.maps = new Maps(this)
        this.bulling = new Bulling(this)
        this.base = new Base(this)
        this.info = new Info(this)

        // инициализация моделей
        this.bulling.init()
    },

    destroyModel(model) {
        for (let key in model) delete model[key]
    },

    startLevel() {
        // this.maps.create() - создает карту и размешает её сразу посередине канваса
        this.maps.create()

        // создаем игрока и размешаем его в нужное место, которое описано на карте
        if (!this.user) {
            this.user = this.createNewNpc('user', this.maps.user)
        } else {
            this.setUserDefaultPosition()
        }

        // тоже создаем врагов и размешаем их на карте
        this.createEnemies()

        // инициализируем базу игрока
        this.base.init()

        // инициализируем информацию
        this.info.init()

    },

    userLost() {
    },

    killUser(npc) {
        if (npc.hasArmor()) return;

        if (this.maps.getUserLives() > 0) {
            this.maps.removeUserLive()
            this.setUserDefaultPosition()
            npc.setArmor()
        }

        if (this.maps.getUserLives() <= 0) {
            this.userLost()
        }
    },

    createNewNpc(type, position) {
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
                if (key === 'fire') {
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
        this.enemies.forEach(enemy => {
            enemy.render()
        })
        this.user.render()
        this.bulling.render()
        this.base.render()
        this.maps.renderMap()
        this.info.render()
    },

    backgroundRender() {
        this.ctx.fillStyle = '#636363'
        this.ctx.fillRect(0, 0, this.width, this.height)
    },
}

Game.start()