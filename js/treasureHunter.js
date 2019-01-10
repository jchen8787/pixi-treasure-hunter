// Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle

let app = new Application({
    width: 512,
    height: 512,
    antialias: true,
    transparent: false,
    resolution: 1
})

document.body.appendChild(app.view)

loader
    .add("../images/treasureHunter.json")
    .load(setup)

let dungeon, explorer, treasure, door, textureAtlas, rectangle, blobs, healthBar
let state

function setup() {
    // initialize game scenes
    const gameScene= new Container()
    app.stage.addChild(gameScene)

    const gameOverScene = new Container()
    gameOverScene.visible = false
    app.stage.addChild(gameOverScene)

    // add sprites from texture atlas
    textureAtlas = resources["../images/treasureHunter.json"].textures

    // dungeon
    dungeon = new Sprite(textureAtlas["dungeon.png"])
    gameScene.addChild(dungeon)

    // door
    door = new Sprite(textureAtlas["door.png"])
    door.position.set(32, 0)
    gameScene.addChild(door)

    // explorer
    explorer = new Sprite(textureAtlas["explorer.png"])
    explorer.x = 68
    explorer.y = app.stage.height /2 - explorer.height / 2
    explorer.vx = 0
    explorer.vy = 0
    gameScene.addChild(explorer)

    // treasure
    treasure = new Sprite(textureAtlas["treasure.png"])
    treasure.x = app.stage.width - treasure.width - 48
    treasure.y = app.stage.height / 2 - treasure.height / 2
    gameScene.addChild(treasure)

    // blobs
    let numBlobs = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2,
        direction = 1

    blobs = []

    for (let i = 0; i < numBlobs; i++) {
        let blob = new Sprite(textureAtlas["blob.png"])

        let x = xOffset + i * spacing
        let y = randomInt(0, app.stage.height - blob.height)

        blob.x = x
        blob.y = y
        blob.vy = direction * speed
        gameScene.addChild(blob)

        blobs.push(blob)
        direction *= -1
    }

    // healthBar
    healthBar = new PIXI.Container()
    healthBar.position.set(app.stage.width - 170, 4)
    gameScene.addChild(healthBar)

    let backgroundBar = new PIXI.Graphics()
    backgroundBar.beginFill(0x000000)
    backgroundBar.drawRect(0, 0, 128, 8)
    backgroundBar.endFill()
    healthBar.addChild(backgroundBar)

    let foregroundBar = new PIXI.Graphics()
    foregroundBar.beginFill(0xFF3300)
    foregroundBar.drawRect(0, 0, 128, 8)
    foregroundBar.endFill()
    healthBar.addChild(foregroundBar)

    healthBar.foregroundBar = foregroundBar

    // gameOverScene text
    let style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
    })
    let message = new Text("G A M E O V E R", style)
    message.x = 120
    message.y = app.stage.height / 2 - 32
    gameOverScene.addChild(message)

    // keyboard controls
    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40)

    // left
    left.press = () => {
        explorer.vx = -5
        explorer.vy = 0
    }

    left.release = () => {
        if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0
        }
    }

    // up
    up.press = () => {
        explorer.vy = -5
        explorer.vx = 0
    }

    up.release = () => {
        if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0
        }
    }

    // right
    right.press = () => {
        explorer.vx = 5
        explorer.vy = 0
    }

    right.release = () => {
        if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0
        }
    }

    // down
    down.press = () => {
        explorer.vx = 0
        explorer.vy = 5
    }

    down.release = () => {
        if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0
        }
    }

    // set up state
    state = play

    // start loop
    app.ticker.add(gameLoop)
}

function gameLoop(delta) {
    // update state
    state(delta)
}

function play(delta) {
    explorer.x += explorer.vx
    explorer.y += explorer.vy

    let boundary = {
        x: 26,
        y: 10,
        width: 460,
        height: 492,
    }

    contain(explorer, boundary)
}


function contain(sprite, boundary) {
    // left
    if (sprite.x < boundary.x) {
        sprite.x = boundary.x
        return "left"
    }

    // top
    if (sprite.y < boundary.y) {
        sprite.y = boundary.y
        return "top"
    }

    // right
    if (sprite.x + sprite.width > boundary.x + boundary.width) {
        sprite.x = boundary.x + boundary.width - sprite.width
        return "right"
    }

    // bottom
    if (sprite.y + sprite.height > boundary.y + boundary.height) {
        sprite.y = boundary.y + boundary.height - sprite.height
        return "bottom"
    }

    return null
}

function keyboard(keyCode) {
    var key = {}
    key.code = keyCode
    key.isDown = false
    key.isUp = true
    key.press = undefined
    key.release = undefined

    downHandler = (event) => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) {
                key.press()
            }
            key.isDown = true
            key.isUp = false
        }
        event.preventDefault()
    }

    upHandler = (event) => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) {
                key.release()
            }
            key.isDown = false
            key.isUp = true
        }
    }

    window.addEventListener("keydown", downHandler, false)
    window.addEventListener("keyup", upHandler, false)


    return key
}

function hitTest(r1, r2) {
    let combinedHalfWidths, combinedHalfHeights, vx, vy

    combinedHalfWidths = (r1.width / 2) + (r2.width / 2)
    combinedHalfHeights = (r1.height / 2) + (r2.height / 2)

    vx = (r1.x + r1.width / 2) - (r2.x + r2.width / 2)
    vy = (r1.y + r1.height / 2) - (r2.y + r2.height / 2)

    if (Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights){
        return true
    }

    return false
}

function randomInt(min , max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
