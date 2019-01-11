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

let gameScene, gameOverScene
let textureAtlas, dungeon, explorer, blobs, treasure, door, healthBar, message
let state

function setup() {
    // initialize game scenes
    gameScene= new Container()
    app.stage.addChild(gameScene)

    gameOverScene = new Container()
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
    let numBlobs = 16,
        spacing = 48,
        xOffset = 102,
        speed = 3

    blobs = []

    for (let i = 0; i < numBlobs; i++) {
        let blob = new Sprite(textureAtlas["blob.png"])

        if (i % 4 === 0) {
            blob.x = xOffset + (i/2) * spacing
            blob.y = randomInt(0, app.stage.height /2 - blob.height)

            blob.vx = 0
            blob.vy = speed
        } else if (i % 4 === 1) {
            blob.x = xOffset + (i-1)/2 * spacing
            blob.y = randomInt(app.stage.height /2, app.stage.height - blob.height)

            blob.vx = speed
            blob.vy = 0
        } else if (i % 4 === 2) {
            blob.x = xOffset + (i/2) * spacing
            blob.y = randomInt(0, app.stage.height /2 - blob.height)

            blob.vx = -speed
            blob.vy = 0
        } else if (i % 4 === 3) {
            blob.x = xOffset + ((i-1)/2) * spacing
            blob.y = randomInt(app.stage.height /2, app.stage.height - blob.height)

            blob.vx = 0
            blob.vy = -speed
        }

        gameScene.addChild(blob)
        blobs.push(blob)
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
        align: 'center',
        fill: 'white',
        fontFamily: 'Futura',
        fontSize: 18,
    })
    message = new Text("placeholder", style)
    message.x = 120
    message.y = 160
    gameOverScene.addChild(message)

    // start game
    state = play
    app.ticker.add(gameLoop)
}

function gameLoop(delta) {
    state(delta)
}

function play(delta) {
    checkKeys()

    explorer.x += explorer.vx
    explorer.y += explorer.vy

    contain(explorer, {
        x: 26,
        y: 10,
        width: 460,
        height: 492,
    })

    blobs.forEach((blob) => {
        blob.x += blob.vx
        blob.y += blob.vy

        const blobCollisionPosition = contain(blob, {
            x: 26,
            y: 10,
            width: 460,
            height: 492,
        })

        if (blobCollisionPosition === 'top' || blobCollisionPosition === 'bottom') {
            blob.vy *= -1
        } else if (blobCollisionPosition === 'left' || blobCollisionPosition === 'right') {
            blob.vx *= -1
        }

        if (hasCollision(explorer, blob)) {
            explorer.alpha = 0.1
            healthBar.foregroundBar.width -= 4
        } else {
            explorer.alpha = 1
        }

        if (hasCollision(explorer, treasure)) {
            treasure.x = explorer.x + 8
            treasure.y = explorer.y + 8
        }

        if (hasCollision(treasure, door)) {
            state = end
            message.text =
                "Congratulations you win!\n"
                 + "Thank you for playing\n\n"
                 + "Credits:\n"
                 + "jchen\n"
                 + "pixi\n\n"
                 + "Copyright\u2122 Fetch Robotics 2019"
        }

        if (healthBar.foregroundBar.width < 0) {
            state = end
            message.text =
                "You died.\n\n"
                + "Game Over"
        }
    })
}

function end() {
    gameScene.visible = false
    gameOverScene.visible = true
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

function hasCollision(r1, r2) {
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

const explorerSpeed = 3
let keys = []

window.addEventListener('keydown', (e) => {
    keys[e.key] = true
})

window.addEventListener('keyup', (e) => {
    keys[e.key] = false
})

const checkKeys = () => {
    if (
        (keys['ArrowUp'] && keys['ArrowLeft'])
        || (keys['w'] && keys['a'])
    ) {
        explorer.vx = -explorerSpeed
        explorer.vy = -explorerSpeed
    } else if (
        (keys['ArrowUp'] && keys['ArrowRight'])
        || (keys['w'] && keys['d'])
    ) {
        explorer.vx = explorerSpeed
        explorer.vy = -explorerSpeed
    } else if (
        (keys['ArrowDown'] && keys['ArrowLeft'])
        || (keys['s'] && keys['a'])
    ) {
        explorer.vx = -explorerSpeed
        explorer.vy = explorerSpeed
    } else if (
        (keys['ArrowDown'] && keys['ArrowRight'])
        || (keys['s'] && keys['d'])
    ) {
        explorer.vx = explorerSpeed
        explorer.vy = explorerSpeed
    } else if (
        (keys['ArrowUp'] && !keys['ArrowDown'])
        || (keys['w'] && !keys['s'])
    ) {
        explorer.vx = 0
        explorer.vy = -explorerSpeed
    } else if (
       (keys['ArrowLeft'] && !keys['ArrowRight'])
        || (keys['a'] && !keys['d'])
    ) {
        explorer.vx = -explorerSpeed
        explorer.vy = 0
    } else if (
        (keys['ArrowDown'] && !keys['ArrowUp'])
         || (keys['s'] && !keys['w'])
     ) {
         explorer.vx = 0
         explorer.vy = explorerSpeed
     } else if (
        (keys['ArrowRight'] && !keys['ArrowLeft'])
         || (keys['d'] && !keys['a'])
     ) {
         explorer.vx = explorerSpeed
         explorer.vy = 0
     } else {
        explorer.vx = 0
        explorer.vy = 0
    }
}

function randomInt(min , max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
