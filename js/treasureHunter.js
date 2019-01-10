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

let dungeon, explorer, treasure, door, id, rectangle
let state

function setup() {
    id = resources["../images/treasureHunter.json"].textures

    // dungeon
    dungeon = new Sprite(id["dungeon.png"])
    app.stage.addChild(dungeon)

    // explorer
    explorer = new Sprite(id["explorer.png"])
    explorer.x = 68
    explorer.y = app.stage.height /2 - explorer.height / 2

    explorer.vx = 0
    explorer.vy = 0

    app.stage.addChild(explorer)

    // treasure
    treasure = new Sprite(id["treasure.png"])
    treasure.x = app.stage.width - treasure.width - 48
    treasure.y = app.stage.height / 2 - treasure.height / 2
    app.stage.addChild(treasure)

    // door
    door = new Sprite(id["door.png"])
    door.position.set(32, 0)
    app.stage.addChild(door)

    // blobs
    let numBlobs = 6,
        spacing = 48,
        xOffset = 150

    for (let i = 0; i < numBlobs; i++) {
        let blob = new Sprite(id["blob.png"])

        let x = spacing * i + xOffset
        let y = randomInt(0, app.stage.height - blob.height)

        blob.x = x
        blob.y = y

        app.stage.addChild(blob)
    }

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

    // rectangle
    rectangle = new Graphics()
    rectangle.beginFill(0x66CCFF)
    rectangle.lineStyle(4, 0x00FF33, 1)
    rectangle.drawRect(0, 0, 64, 64)
    rectangle.endFill()
    rectangle.x = 128
    rectangle.y = 128
    app.stage.addChild(rectangle)

    // add some text
    let style = new TextStyle({
        fontFamily: "sans-serif",
        fontSize: 18,
        fill: "white",
    })
    message = new Text("No collision...", style)
    message.position.set(80,8)
    app.stage.addChild(message)

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

    if (hitTest(explorer, rectangle)) {
        message.text = "hit!";
        rectangle.tint = 0xff3300
    } else {
        message.text = "no collision..."
        rectangle.tint = 0xccff99
    }
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
