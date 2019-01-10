// Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle

let app = new Application({
    width: 512,
    height: 512,
    antialias: true,
    transparent: false,
    resolution: 1
})

document.body.appendChild(app.view)

loader
    .add("../images/animals.json")
    .load(setup)

function setup() {
    id = resources["../images/animals.json"].textures

    let cat = new Sprite(id["cat.png"])
    cat.position.set(16, 16)

    let hedgehog = new Sprite(id["hedgehog.png"])
    hedgehog.position.set(32, 32)

    let tiger = new Sprite(id["tiger.png"])
    tiger.position.set(64, 64)

    let animals = new Container()
    animals.addChild(cat)
    animals.addChild(hedgehog)
    animals.addChild(tiger)
    console.log(animals.children)

    animals.position.set(64, 64)

    app.stage.addChild(animals)
}
