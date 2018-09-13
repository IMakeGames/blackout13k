//Item class.
class Item {
    constructor(name, desc, sprite, xm, dmg, hp, hunger, sanity) {
        this.name = name;
        this.desc = desc;
        this.sprite = sprite;
        this.dmg = dmg;
        this.hp = hp;
        this.hunger = hunger;
        this.sanity = sanity;
        this.xm = xm
    }

    use() {
        mainC.hp = mainC.hp + this.hp >= mainC.totalHp ? mainC.totalHp : mainC.hp + this.hp
        mainC.hunger = mainC.hunger + this.hunger >= 100 ? 100 : mainC.hunger + this.hunger
        mainC.sanity = mainC.sanity + this.sanity >= 100 ? 100 : mainC.sanity + this.sanity
    }

    copy(){
        return Object.assign(new Item(),this)
    }
}

class Sprite {
    constructor(x, y, w, h,) {
        this.xInSprite = x;
        this.yInSprite = y;
        this.wInSprite = w;
        this.hInSprite = h
    }

    draw(x, y, scale, mults) {
        if (mults != null) {
            ctx.drawImage(
                spriteSheet,
                this.xInSprite + this.wInSprite * mults.x,
                this.yInSprite + this.hInSprite * mults.y,
                this.wInSprite,
                this.hInSprite,
                x,
                y,
                this.wInSprite * scale,
                this.hInSprite * scale)
        } else {
            ctx.drawImage(
                spriteSheet,
                this.xInSprite,
                this.yInSprite,
                this.wInSprite,
                this.hInSprite,
                x,
                y,
                this.wInSprite * scale,
                this.hInSprite * scale)
        }
    }
}
//Room class
class Room {
    constructor(name, desc, mx, customInit) {
        this.name = name;
        this.desc = desc;
        this.roomBg = spriteArray.rooms;
        this.enemy = null;
        this.mx = mx;
        this.cInit = customInit;
        this.chest = false
        this.pos = null
    }

    init(i, j,house) {
        this.pos = [i,j]
        var rng = Math.random()
        if(rng < 0.4){
            this.enemy = enemyArray.requestRandom()
        }if(rng < 0.4){
            this.chest = true
        }
        if (this.cInit != null) this.cInit()
        var mm = house.matrix
        var assignRooms = true
        var chance = 0.6
        while(assignRooms){
            var nextOpen = this.NextOpenAndAdjNum(i,j,mm)
            //console.log(nextOpen)
            if (nextOpen.nextToAsign != null){
                mm[nextOpen.nextToAsign[0]][nextOpen.nextToAsign[1]] = "open"
            }else{
                assignRooms = false
            }
            if(nextOpen.openRooms < 3 && Math.random() < chance){
                chance -= 25
            }else{
                assignRooms = false
            }
        }
        assignRooms = true
        while(assignRooms){
            var nextOpen = this.NextOpenAndAdjNum(i,j,mm)
            if (nextOpen.nextToAsign != null) {
                mm[nextOpen.nextToAsign[0]][nextOpen.nextToAsign[1]] = "closed"
            }else{
                assignRooms = false
            }
        }
    }

    drawRoom() {
        this.roomBg.draw(0, 165, 6, {x: this.mx, y: 0})
    }

    copy(){
        let name = this.name
        let desc = this.desc
        let mx   = this.mx
        let customInit = this.customInit
        return new Room(name,desc,mx,customInit)
    }

    NextOpenAndAdjNum(i,j, mm){
        var count = 0
        var retVect = null
        if(i - 1 >= 0){
            if (mm[i - 1][j] == null && retVect == null){
                retVect = [i - 1,j]
            }
            if (mm[i - 1][j] != "closed"){
                count++
            }
        }if(j - 1 >= 0) {
            if (mm[i][j - 1] == null && retVect == null) {
                retVect = [i, j - 1]
            }
            if (mm[i][j - 1] != "closed") {
                count++
            }
        }if(i + 1 <5) {
            if (mm[i + 1][j] == null && retVect == null) {
                retVect = [i+1,j]
            }
            if (mm[i + 1][j]  != "closed") {
                count++
            }
        }if(j + 1 < 5){
            if(mm[i][j+1] == null && retVect == null){
                retVect = [i,j+1]
            }
            if (mm[i][j+1] == "open") {
                count++
            }
        }

        return {openRooms: count, nextToAsign: retVect}
    }

    asignStreet(street){
        this.street = street
    }
}

class Street {
    constructor(room) {
        this.moveOpts = {north: "open", south: "open", east: null, west: null}
        this.cat =false
        this.enemy = null
        if(room != null){
            this.moveOpts.east = room
        }else {
            if (Math.random() < 0.5) {
                Math.random() > 0.5 ? this.moveOpts.east = "open" : this.moveOpts.west = "open"
                if (Math.random() < 0.25) {
                    this.moveOpts.east == "open" ? this.moveOpts.west = "open" : this.moveOpts.east = "open"
                }
            }
            var rng = Math.random()
            if(rng < 0.5){
                this.enemy = enemyArray.requestRandom()
            }if(rng < 0.3){
                this.cat = true
            }
        }
        this.name = "street";
        this.desc = "streets of rage";
    }

    drawRoom() {
        spriteArray.rooms.draw(0, 65, 6, {x: 1, y: 0})
    }
}

//Character class
class Enemy {
    //Has some attributes, like the name, lvl(?), hp, etc.
    //Must decide whether to leave lvl, spec and sanity... might not be necesary.
    constructor(name, sprite, xm, actions,hp,atk,def,spd,luck,itemProb) {
        this.name = name
        this.sprite = sprite;
        this.acc = 0.85
        this.hp = hp
        this.atk = atk
        this.def = def
        this.spd = spd
        this.luck = luck
        this.actions = actions;
        this.xm = xm
        this.itemProb = itemProb
    }

    //Attack method takes into consideration luck. Luck is nice.
    atacc(str) {
        eventQ.insert(null,str)
        if(Math.random() > enemy.acc) {
            eventQ.insert(null,(enemy.name + " misses"))
        }else{
            var dmg = enemy.atk;
            dmg += (enemy.luck * 3) / 100 > Math.random() ? Math.ceil(enemy.luck * 3 * enemy.atk / 100) : 0;
            eventQ.insert(function () {
                setDmgAnim(null, "fight")
            }, null)
            eventQ.insert(function () {
                var Ddealt = mainC.protecc(dmg)
                setDialog("you received " + Ddealt + " damage.")
            }, null)
        }
    }

    performAction() {
        var rng = Math.random();
        for (i = 0; i < this.actions.length; i++) {
            if (this.actions[i].prob > rng) {
                this.actions[i].funct()
                return
            }
        }
    }

    //Protect method takes into consideration defence. Noice
    protecc(dmg) {
        dmg -= Math.ceil(dmg * (this.def * 3 / 100));
        this.hp -= dmg;
        return dmg
    }

    performDeath() {
        var name = this.name;
        eventQ.insert(null,name + " was defeated")
        var rng = Math.random()
        console.log("this rng: "+rng+" this item prob: "+this.itemProb)
        if(rng < this.itemProb){
            eventQ.insert(null,name+" dropped an item")
            const item = itemArray.requestRandom()
            eventQ.insert(function(){
                addItem(item)}, "you get "+item.name)
        }
        eventQ.insert(function(){
            currentRoom.enemy = null
            switchState("explore","win")},null)
        score += 20
    }

    draw() {
        this.sprite.draw(350, 200, 7, {x: this.xm, y: 0})
    }

    copy(){
        let hp = this.hp
        let atk = this.atk
        let def = this.def
        let spd = this.spd
        let luck = this.luck
        return new Enemy(this.name,this.sprite, this.xm, this.actions,hp,atk,def,spd,luck,this.itemProb)
    }
}

//Option box class
class OptionBox {
    constructor(name, x, y, scale) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.w = scale == 6 ? 5.5 * name.length * scale + 20 : 6 * name.length * scale + 15;
        this.h = 5 * scale + 20
    }

    //Collision detection for mouse clicks. Calls event accordi
    in(x, y) {
        if (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h) {
            return true
        }
    }

    //Draws the bocs and the word inside.
    drawOptionBox() {
        if (standby) {
            ctx.fillStyle = "#18381e"
        } else {
            ctx.fillStyle = "black"
        }
        ctx.fillRect(this.x, this.y, this.w, this.h);
        drawWords(this.name, this.x + 10, this.y + 10, this.scale, 0);
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
}

class OptionMenu {
    constructor(x, y, optionBoxNames, itemIndex) {
        this.optionBoxes = [];
        this.x = x;
        this.initial_y = y;
        this.w = 190;
        for (i = 0; i < optionBoxNames.length; i++) {
            y += 10;
            this.optionBoxes.push(new OptionBox(optionBoxNames[i], x + 10, y, 5));
            y += 50
        }
        this.h = y - this.initial_y + 10;
        this.itemIndex = itemIndex
    }

    drawMenu() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.initial_y, this.w, this.h);
        ctx.strokeRect(this.x, this.initial_y, this.w, this.h);
        for (i = 0; i < this.optionBoxes.length; i++) {
            this.optionBoxes[i].drawOptionBox()
        }
    }

    in(x, y) {
        if (x >= this.x && x <= this.x + this.w && y >= this.initial_y && y <= this.initial_y + this.h) {
            return true
        }
        return false
    }
}

class ItemSlot {
    constructor(item, x, y) {
        this.item = item;
        this.x = x;
        this.y = y;
        this.xw = x + 75;
        this.yh = y + 75
    }

    in(x, y) {
        if (x >= this.x && x <= this.xw && y >= this.y && y <= this.yh) {
            return true
        }
    }

    draw() {
        if (this.item != null) this.item.sprite.draw(this.x + 8, this.y + 8, 2.5, {x: this.item.xm, y: 0});
        ctx.strokeRect(this.x, this.y, 75, 75)
    }
}

class House{
    constructor(){
        this.matrix = []
        for (var i = 0; i < 5; i++) {
            this.matrix[i] = new Array(5)
        }
    }

    insert(i, j, room) {
        this.matrix[i][j] = room;
        this.matrix[i][j].init(i, j,this)
    }

    init(street){
        var rng = Math.floor(Math.random()*3)
        var newRoom = roomArray.entrance.copy()
        var arr
        newRoom.asignStreet(street)
        if(rng ==0){
            arr = [2,0]
        }else if(rng == 1){
            arr = [4,2]
        }else if(rng == 2){
            arr = [2,4]
        }else{
            arr = [0,2]
        }
        this.insert(arr[0],arr[1],newRoom)
        this.entrance = newRoom
    }

}

class Collection{

    constructor(memberArray){
        this.memberArray = memberArray
        this.probDist = []
    }

    init(){
        for(var i = 0;i<this.memberArray.length;i++){
            for(var j = 0; j<this.memberArray[i].p;j++){
                this.probDist.push(this.memberArray[i])
            }
        }
    }

    requestRandom(){
        return this.probDist[Math.floor(Math.random() * this.probDist.length)].m.copy()
    }

    requestSpecific(name){
        for(var i = 0;i<this.memberArray.length;i++){
            if(this.memberArray[i].m.name == name) return this.memberArray[i].m.copy()
        }
    }

}
spriteSheet = new Image();
spriteSheet.src = "ssheet_alpha.png";
spriteArray = {
    abc: new Sprite(5, 0, 5, 5),
    nums: new Sprite(0, 0, 5, 5),
    punkSp: new Sprite(140, 0, 2, 5),
    scroll: new Sprite(152, 0, 5, 5),
    mc: new Sprite(0, 50, 20, 23),
    enemies: new Sprite(5, 5, 34, 45),
    items: new Sprite(0, 73, 23, 24),
    rooms: new Sprite(0, 97, 167, 75),
    misc: new Sprite(0, 172, 53, 34)
};
enemyArray = new Collection([
    {p: 70, m: new Enemy("ratboy",spriteArray.enemies, 1, [
            {
                prob: 0.2, funct: function () {
                    eventQ.insert(null,"rat boy hits you with his pixaxe.")
                    eventQ.insert(null,"... but it's made out of cardboard")
                }
            },
            {
                prob: 1.0, funct: function () {
                    Enemy.prototype.atacc("rat boy bites you")
                }
            }],18,7,8,4,5,0.4)},
    {p: 25, m: new Enemy("twitcher", spriteArray.enemies, 0, [
            {
                prob: 0.2, funct: function () {
                    eventQ.insert(null,"twitcher starts streaming.")
                    eventQ.insert(null,"... but there's no internet")
                }
            },
            {
                prob: 1.0, funct: function () {
                    Enemy.prototype.atacc("twitcher drop kicks you")
                }
            }],16,9,5,5,6,0.5)},
    {p: 5, m:new Enemy("influncer", spriteArray.enemies, 2, [
            {
                prob: 0.2, funct: function () {
                    eventQ.insert(null,"influencer took a selfie")
                    eventQ.insert(null,"she says she looks fat...")
                }
            },
            {
                prob: 1.0, funct: function () {
                    Enemy.prototype.atacc("influencer slaps you with her phone")
                }
            }],25,10,4,7,7,0.7)},
    {p: 0, m:new Enemy("yourself", spriteArray.mc, 0, [
            {
                prob: 0.2, funct: function () {
                    eventQ.insert(null,"you laugh maniacaly")
                    eventQ.insert(null,"... laughter echoes through the night")
                }
            },
            {
                prob: 1.0, funct: function () {
                    Enemy.prototype.atacc("doom falls upon you")
                }
            }],30,15,2,6,8,1)}

])
enemyArray.init()
roomArray = {
    bedroom: new Room("bedroom", "just your standard bedroom", 0),
    entrance: new Room("entrance", "there's an entrance here",0)
};

abc = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
    j: 9,
    k: 10,
    l: 11,
    m: 12,
    n: 13,
    o: 14,
    p: 15,
    q: 16,
    r: 17,
    s: 18,
    t: 19,
    u: 20,
    v: 21,
    w: 22,
    x: 23,
    y: 24,
    z: 25,
    "?": 26
};
punks = JSON.parse('{".":0,"\,":1,"\:":2,"/":3,"\'":4,"!":5}');

itemArray = new Collection([
    {p: 20, m: new Item("instant lunch", "nutritious and healthy... or not. it will satiate your hunger though", spriteArray.items,0, 0, 8, 15, 0)},
    {p: 11,m: new Item("mcdaniel's", "tastes a bit like cardboard, but that mayo is damn good", spriteArray.items,1,0,6,20,0)},
    {p: 25,m: new Item("ciggy", "helps you reduce tension at the expense of your health", spriteArray.items,2,0,-2,0,17)},
    {p: 2,m: new Item("benzos", "chill you right up, but they're dangerously addictive", spriteArray.items,3,0,0,0,25)},
    {p: 15,m: new Item("booze", "will help you carry on. lowers your accuracy", spriteArray.items,4,0,0,0,20)},
    {p: 7,m: new Item("band aid", "it's all white magic", spriteArray.items,5,0,10,0,0)},
    {p: 20,m: new Item("cheat o's", "that greasy cheat o's dust gets everywhere", spriteArray.items,6,0,6,10,0)}
])

itemArray.init()
// ========================================= FRAMEWORK VARIABLES ARE SET ===============================================
//Initialize Canvas
ctx = main.getContext("2d");
//Set all smoothing effects off
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.oImageSmoothingEnabled = false;
//Set some drawing variables
ctx.strokeStyle = 'green';
ctx.fillStyle = 'green';
ctx.lineWidth = 5;


game = null;
optionMenu = null;
mapMenuActive = false;
anim = null
drawOpenChest = null
drawCatto = false
globalItemIndex = null
cont = false
window.setTimeout(function () {
    standby = true;
    game = "mainMenu";
    refreshGlobalDraw()
}, 1000);
// ======================================================== END ========================================================


// ======================================== THIS SECTION DEALS WITH INPUT ==============================================
main.addEventListener('click', function (event) {
    if (anim == null) {
        if (standby) {
            coords = getMouseCoords(event);
            if (optionMenu == null) {
                if (globalItemIndex != null) {
                    optionMenu = new OptionMenu(coords.x, coords.y, ["use", "drop"], globalItemIndex);
                    refreshGlobalDraw()
                }
                oBoxes.forEach(function (optB) {
                    if (optB.in(coords.x, coords.y)) {
                        if (optB.name == "new game" || optB.name == "try again?") {
                            initNewGame()
                            switchState("explore","newgame")
                            cont = true
                            globalCounter()
                        }
                        if (optB.name == "move") {
                            standby = false;
                            mapMenuActive = true;
                            refreshGlobalDraw()
                        }
                        if (optB.name == "attack") {
                            order = mainC.spd >= enemy.spd ? [mainC, enemy] : [enemy, mainC];
                            order[0].performAction("attack");
                            if (order[1].hp < 1) {
                                order[1].performDeath("you were killed")
                            } else {
                                order[1].performAction("attack")
                                if (order[0].hp < 1) {
                                    order[0].performDeath("you were killed")
                                } else {
                                    eventQ.insert(function(){switchState("fight","attack")},null)
                                }
                            }
                            if(boozedCounter > 0) boozedCounter--
                            eventQ.perform()
                        }
                        if (optB.name == "defend") {
                            mainC.performAction("defend")
                            enemy.performAction()
                            mainC.hp < 1 ? mainC.performDeath("you were killed") : eventQ.insert(function(){switchState("fight","defend")},null)
                            eventQ.perform()
                        }
                        if (optB.name == "look") {
                            setDialog(currentRoom.desc)
                            if(outside && currentRoom.cat){
                                drawCatto = true
                                eventQ.insert(null, "there is fine boi")
                                eventQ.insert(null, "you give some pattos")
                                eventQ.insert(null, "well, that was rewarding")
                                eventQ.insert(function () {
                                    mainC.sanity += 15
                                    drawCatto = false
                                    currentRoom.cat = false
                                    switchState("explore", "look")
                                }, null)
                                score += 5
                            }else if (currentRoom.chest){
                                drawOpenChest = 0
                                eventQ.insert(null, "there is an ancient treasure chest")
                                eventQ.insert(function () {
                                    currentRoom.chest = false
                                    drawOpenChest = 1
                                }, "there was an item inside")
                                const item = itemArray.requestRandom()
                                eventQ.insert(function () {
                                    addItem(item)
                                }, "you get " + item.name)
                                eventQ.insert(function () {
                                    drawOpenChest = null
                                    switchState("explore", "look")
                                }, null)
                                score += 5
                            }
                        }
                        if (optB.name == "items") {
                            switchState("items","items")
                        }
                        if (optB.name == "action") {
                            setDialog("you hear a voice whisper in your ear...")
                            eventQ.insert(null,"'this feature didn't make the cut'")
                            eventQ.insert(null,"whoa.. scary..")
                            eventQ.insert(null,"you wonder what that means..")
                            enemy.performAction()
                            mainC.hp < 1 ? mainC.performDeath("you were killed") : eventQ.insert(function(){switchState("fight","action")},null)
                            mainC.sanity -= 5
                        }
                        if (optB.name == "escape") {
                            setDialog("you attempt escaping")
                            rng = Math.random()
                            escapeChance = 0.4 + (mainC.spd - enemy.spd)/mainC.spd
                            escapeChance += escapeChance*(mainC.luck/100)
                            console.log("escape chance: "+escapeChance)
                            if(escapeChance > rng){
                                eventQ.insert(null,"you managed to escape")
                                eventQ.insert(function(){currentRoom = lastRoom;switchState("explore","escape")},null)
                                score +=5
                            }else{
                                eventQ.insert(null, "you failed to escape")
                                eventQ.insert(function(){
                                    enemy.performAction()
                                    mainC.hp < 1 ? mainC.performDeath("you were killed") : eventQ.insert(function(){switchState("fight","escape")},null)
                                    eventQ.perform()
                                },null)
                                score -= 5
                            }
                        }
                        if(optB.name == "exit"){
                            if(currentRoom.street == null) {
                                str = new Street(currentRoom)
                                currentRoom.asignStreet(str)
                                score += 15
                            }else{
                                str = currentRoom.street
                            }
                            outside = true
                            currentHouse = null
                            setTransAnim("you went outside", "explore", str)
                        }
                        if (optB.name == "back") {
                            switchState("explore","back")
                        }
                    }
                })
            } else if (optionMenu != null) {
                if (!optionMenu.in(coords.x, coords.y)) {
                    optionMenu = null;
                    refreshGlobalDraw()
                } else {
                    optionMenu.optionBoxes.forEach(function (optB) {
                        if (optB.in(coords.x, coords.y)) {
                            it = itemSlots[optionMenu.itemIndex].item
                            if (optB.name == "use") {
                                setDialog("you used " + it.name);
                                if (it.name == "booze") {
                                    boozedCounter = 15
                                }
                                eventQ.insert(function () {
                                    refreshGlobalDraw();
                                    standby = true
                                }, null);
                                it.use()
                                itemSlots[optionMenu.itemIndex].item = null;
                                optionMenu = null
                            }
                            if (optB.name == "drop") {
                                setDialog("you dropped " + i.name);
                                eventQ.insert(function () {
                                    refreshGlobalDraw();
                                    standby = true
                                }, null);
                                itemSlots[optionMenu.itemIndex].item = null;
                                optionMenu = null
                            }
                        }
                    })
                }
            }
        } else if (mapMenuActive) {
            coords = getMouseCoords(event);
            if (coords.x < 200 || coords.x > 800 || coords.y < 200 || coords.y > 800) {
                mapMenuActive = false;
                roomOpt = []
                dirOpt = []
                switchState("explore","mapmenu")
            } else {
                if (outside) {
                    for(i=0;i<dirOpt.length;i++){
                        if(dirOpt[i].in(coords.x,coords.y)){
                            dirName = dirOpt[i].name
                            if(dirName == "south" && currentRoom.moveOpts.south == "open"){
                                currentRoom.moveOpts.south = new Street()
                                currentRoom.moveOpts.south.moveOpts.north = currentRoom
                                score += 15
                            }else if(dirName == "north" && currentRoom.moveOpts.north == "open") {
                                currentRoom.moveOpts.north = new Street()
                                currentRoom.moveOpts.north.moveOpts.south = currentRoom
                                score += 15
                            }else{
                                if(currentRoom.moveOpts[dirName] == "open"){
                                    newHouse = new House()
                                    newHouse.init(currentRoom)
                                    currentRoom.moveOpts[dirName] = newHouse.entrance
                                    score += 15
                                }else{
                                    newHouse = currentRoom.moveOpts[dirName].house
                                }
                                currentHouse = newHouse
                                outside = false
                            }
                            msg = currentRoom.moveOpts[dirName].constructor.name == "Street" ? "you moved to another street" : "you went inside a house"
                            setTransAnim(msg, "explore", currentRoom.moveOpts[dirName])
                            mapMenuActive = false;
                            roomOpt = []
                            return
                        }
                    }
                } else {
                    for (i = 0; i < roomOpt.length; i++) {
                        //console.log("Mouse coords: "+coords+" Room Option: "+ro)
                        if (roomOpt[i].in(coords.x, coords.y)) {
                            if (currentHouse.matrix[roomOpt[i].indI][roomOpt[i].indJ] == 'open') {
                                currentHouse.insert(roomOpt[i].indI, roomOpt[i].indJ, roomArray.bedroom.copy());
                                score += 15
                            } else if (currentHouse.matrix[roomOpt[i].indI][roomOpt[i].indJ] == 'entrance') {
                                currentHouse.insert(roomOpt[i].indI, roomOpt[i].indJ, roomArray.entrance);
                            }
                            if(currentHouse.matrix[roomOpt[i].indI][roomOpt[i].indJ].enemy == null && Math.random()<0.20) currentHouse.matrix[roomOpt[i].indI][roomOpt[i].indJ].enemy = enemyArray.requestRandom()
                            setTransAnim("you moved to another room", "explore", currentHouse.matrix[roomOpt[i].indI][roomOpt[i].indJ])
                            mapMenuActive = false;
                            roomOpt = []
                            return
                        }

                    }
                }
            }
        } else if (waitForScroll) {
            waitForScroll = false;
            ctx.clearRect(895, 895, 50, 50);
            eventQ.perform()
        }
    }
}, false);

main.addEventListener('mousemove', function (event) {
    if (game == 'items' && standby && optionMenu == null) {
        coords = getMouseCoords(event);
        for (i = 0; i < itemSlots.length; i++) {
            if (itemSlots[i].item != null && itemSlots[i].in(coords.x, coords.y)) {
                globalItemIndex = i;
                refreshGlobalDraw();
                return
            }
        }
        globalItemIndex = null;
        refreshGlobalDraw()
    }
}, false);

function getMouseCoords(event) {
    bounds = main.getBoundingClientRect();
    x = 1000 * (event.pageX - bounds.left) / bounds.width;
    y = 1000 * (event.pageY - bounds.top) / bounds.height;

    return {x: x, y: y}
}

// ======================================================== END ========================================================

// ========================================== THIS SECTION DEALS WITH State Switching0 =================================
function switchState(name,from) {
    game = name;
    if(mainC.hp <= 0 && name != "gameover" && from != "fight"){
        mainC.performDeath(" you died")
    }
    else if (name == "explore") {
        //"newgame"
        //"look"
        //"escape"
        //"back"
        //"streets"
        //"withdrawal"
        //"room"
        //"win"
        setDialog("you are in " + currentRoom.name)
        if((["streets","room","escape","win"]).includes(from)){
            withdrawal_prob += withdrawal_increment
            withdrawal_increment += 0.02
            rng = Math.random()

            //console.log("withdrawal probability: "+withdrawal_prob+" withdrawal increment: "+withdrawal_increment+" rng: "+rng)
            if(rng < withdrawal_prob){
                withdrawal_prob = 0
                withdrawal_increment = 0.05
                eventQ.insert(function(){
                    mainC.sanity -= 15
                },"internet withdrawal kicks in...")
                eventQ.insert(function(){
                    switchState("explore","withdrawal")
                },null)

            }
            if(boozedCounter > 0) boozedCounter--
            if(toughnessCounter > 0) {
                toughnessCounter--
                console.log("thoughness counter: "+toughnessCounter)
            }else{
                if(enemyArray.memberArray[0].p >25){
                    console.log("making it tougher")
                    enemyArray.memberArray[0].p -= 15
                    enemyArray.memberArray[1].p += 8
                    enemyArray.memberArray[2].p += 7
                    enemyArray.init()
                }
                toughnessCounter = 12
            }
            if(mainC.sanity < 20 && enemyArray.memberArray[3].p < 100){
                enemyArray.memberArray[3].p = 100
                enemyArray.init()
            }else{
                enemyArray.memberArray[3].p = 0
                enemyArray.init()
            }
            if(hungerCounter == 0){
                mainC.hunger -= 10
                hungerCounter = 10
            }else{
                hungerCounter--
            }
            if(mainC.hunger <= 0){
                eventQ.insert(function(){
                    mainC.hp -= Math.ceil(mainC.totalHp/2)
                    setDmgAnim("you are starving!","starving")
                },null)
            }
        }
    }
    else if (name == "items") {
        //"items"
        dialog = null;
        refreshGlobalDraw()
    }
    else if (name == "fight") {
        //"encounter"
        //"attack"
        //"defend"
        //"escape"
        setDialog("you are fighting "+enemy.name)
        if(mainC.defMod > 0) mainC.defMod = 0
        if(mainC.atkMod > 0) mainC.atkMod = 0
    }
    else if (name == "gameover") {
        //"fight"
        //"explore"
        eventQ.queue = []
        dialog = null
        standby = true
        refreshGlobalDraw()
    }
}

// ======================================================== END ========================================================

// ===================================== IN THIS SECTION WE DECIDE DRAWING THINGS ======================================

function refreshGlobalDraw() {
    ctx.clearRect(0, 0, main.width, main.height);
    if (game == "mainMenu") {
        drawWords("b1ack0ut.", 125, 400, 16, 0);
        oBoxes = [new OptionBox("new game", 340, 550, 6)]
    }
    if (game == "explore" || game == "fight") {
        if (game == "explore") {
            //Draw Room Background
            oBoxes = [new OptionBox("move", 40, 640, 5), new OptionBox("look", 235, 640, 5), new OptionBox("items", 610, 640, 5)]
            currentRoom.name == 'entrance' ? oBoxes.push(new OptionBox("exit", 825, 640, 5)) : ""

            currentRoom.drawRoom()
            drawWords("score: "+score,750,145,3,0)
        } else {
            oBoxes = [new OptionBox("attack", 40, 640, 4), new OptionBox("action", 235, 640, 4), new OptionBox("defend", 580, 640, 4), new OptionBox("escape", 795, 640, 4)];
            currentRoom.enemy.draw()
        }
        //Draws Lower boxes and player face
        ctx.strokeRect(25, 625, 950, 350);
        ctx.strokeRect(40, 705, 920, 255);
        ctx.fillStyle = "black";
        ctx.fillRect(420, 580, 119, 125);
        ctx.strokeRect(420, 580, 119, 125);

        //Draws hunger box
        ctx.strokeRect(25, 25, 307, 110);
        drawWords("hunger:", 45, 45, 5, 0);
        ctx.strokeRect(49, 77, 258, 35);
        ctx.fillStyle = "green";
        ctx.fillRect(55, 83, 247 * (mainC.hunger > 0 ? mainC.hunger / 100: 0), 23);

        //Draws health box
        ctx.strokeRect(342, 25, 307, 110);
        drawWords("health:", 362, 45, 5, 0);
        ctx.strokeRect(366, 77, 258, 35);
        ctx.fillRect(372, 83, 247 * (mainC.hp > 0 ? (mainC.hp / mainC.totalHp): 0 ), 23);

        //Draws Mood
        ctx.strokeRect(659, 25, 307, 110);
        drawWords("mood:", 679, 45, 5, 0);
        state = "";
        if (mainC.sanity >= 80) {
            state = "cool"
            face_x = 0
        }
        if (mainC.sanity < 80 && mainC.sanity >= 50) {
            state = "anxious";
            color = {r: 255, g: 255, b: 0}
            face_x = 1
        }
        if (mainC.sanity < 50 && mainC.sanity >= 20) {
            state = "paranoid";
            color = {r: 255, g: 150, b: 0}
            face_x = 2
        }
        if (mainC.sanity < 20) {
            state = "psychotic";
            color = {r: 255, g: 0, b: 0}
            face_x = 3
        }
        spriteArray.mc.draw(426, 585, 5, {x: face_x, y: 0});
        drawWords(state, 685, 82, 5, 0);
        coloredMood = ctx.getImageData(685, 82, 265, 35);
        if (state != "cool") {
            d = coloredMood.data;
            for (i = 0; i < d.length; i += 4) {
                if (!(d[i] == 0 && d[i + 1] == 0 && d[i + 2] == 0)) {
                    d[i] = color.r;     // red
                    d[i + 1] = color.g;      // green
                    d[i + 2] = color.b // blue
                }
            }
        }
        ctx.putImageData(coloredMood, 685, 82)
    }
    if (game == "items") {
        oBoxes = [new OptionBox("back", 450, 900, 5)];
        ctx.strokeRect(25, 25, 950, 950);
        drawLine(500, 25, 500, 705);
        drawWords("items", 200, 50, 5, 0);
        drawWords("status", 675, 50, 5, 0);
        ctx.strokeRect(40, 705, 920, 255);
        drawWords("health: " + mainC.hp + "/" + mainC.totalHp, 515, 150, 5, 0);
        drawWords("hunger: " + mainC.hunger + "/100", 515, 200, 5, 0);

        itemSlots.forEach(function (it) {
            it.draw()
        });
        if (globalItemIndex != null && itemSlots[globalItemIndex].item != null) {
            item = itemSlots[globalItemIndex].item;
            drawWords(item.name, 325, 725, 5, 0);
            drawLine(325, 755, 325 + 29 * item.name.length - 2, 755);
            drawWords(item.desc, 60, 775, 5, 0)
        } else {
            ctx.clearRect(60, 725, 850, 150)
        }
    }
    if (game == "gameover") {
        drawWords("game over.", 100, 400, 16, 0);
        drawWords("final score: "+score,250,500,5,0)
        oBoxes = [new OptionBox("try again?", 340, 555, 6)]
        cont = false
    }
    oBoxes.forEach(function (e) {
        e.drawOptionBox()
    });
    if (game != "mainMenu" && optionMenu != null) optionMenu.drawMenu();

    if (mapMenuActive) {
        ctx.fillStyle = "black";

        if(outside){
            ctx.fillRect(110, 150, 780, 650);
            ctx.strokeRect(110, 150, 780, 650);
            ctx.beginPath();
            ctx.lineWidth = 10
            ctx.arc(500,500,145,0,2*Math.PI);
            spr = new Sprite(155, 172, 34, 34).draw(398, 398, 6)
            dirOpt =[new OptionBox("north", 415, 250, 5), new OptionBox("south", 415, 710, 5)]
            console.log()
            if(currentRoom.moveOpts.east != null){
                dirOpt.push(new OptionBox("east",690,475,5))
            }if(currentRoom.moveOpts.west != null){
                dirOpt.push(new OptionBox("west",170,475,5))
            }
            ctx.stroke();
            ctx.lineWidth = 5
            dirOpt.forEach(function (e) {
                e.drawOptionBox()
            });
        }else {
            ctx.fillRect(200, 150, 600, 650);
            ctx.strokeRect(200, 150, 600, 650);
            for (i = 0; i < currentHouse.matrix.length; i++) {
                for (j = 0; j < currentHouse.matrix[i].length; j++) {
                    ctx.strokeStyle = "white";
                    ctx.fillStyle = "white";
                    if (currentHouse.matrix[i][j] != "closed" && currentHouse.matrix[i][j] != null) {
                        l = 95;
                        w = 95;
                        if (currentHouse.matrix[i][j] == "open"){
                            ctx.strokeStyle = "yellow"
                        }
                        else if (currentHouse.matrix[i][j] == "entrance" || currentHouse.matrix[i][j].name == "entrance") {
                            ctx.strokeStyle = "green"
                        }
                        currentRoom.name == "entrance" ? ctx.fillStyle = "green" : ctx.fillStyle = "white";
                        if (currentRoom == currentHouse.matrix[i][j]) {
                            ctx.fillRect(115 * i + 220, 115 * j + 220, w, l)
                        } else {
                            ctx.strokeRect(115 * i + 220, 115 * j + 220, w, l)
                        }
                        //console.log("checking adjacent room for space at: ["+i+","+j+"]")
                        if (currentHouse.matrix[i][j] != currentRoom && adjacentRoom(i, j)) {
                            //console.log("creating room option")
                            roomOpt.push({
                                indI: i,
                                indJ: j,
                                x: 115 * i + 220,
                                y: 115 * j + 220,
                                w: w,
                                h: l,
                                in: function (x, y) {
                                    if (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h) {
                                        return true
                                    }
                                }
                            })
                        }
                    }
                }
            }
        }
        drawWords("where?",415,165,5,0)
        ctx.strokeStyle = 'green';
    }
    if(drawOpenChest != null || drawCatto){
        ctx.fillStyle = "black"
        ctx.fillRect(335,335,290,215)
        drawCatto ? new Sprite(106, 172, 49, 34).draw(350, 350, 5) : spriteArray.misc.draw(345, 350,5,{x:drawOpenChest,y:0})
        ctx.strokeRect(335,335,290,215)
    }
    if(anim != null) anim.play()
}

function drawWords(str, x_on_canvas, y_on_canvas, scale, dontDraw) {
    str = str.substring(0, str.length - dontDraw);
    words = str.split(' ');
    lines = [];
    line = "";
    while (words.length > 0) {
        if (line.length + words[0].length > 31) {
            lines.push(line);
            line = ""
        } else {
            line += words.shift() + " "
        }
    }
    if (line.length > 0) lines.push(line);
    lines.forEach(function (li) {
        var x_for_this_render = x_on_canvas;
        lets = li.split('');
        lets.forEach(function (lt) {
            numb = parseInt(lt);
            if (!isNaN(numb)) {
                spriteArray.nums.draw(x_for_this_render, y_on_canvas, scale, {x: 0, y: numb})
            } else if (['.', ',', ':', '/', '\''].includes(lt)) {
                spriteArray.punkSp.draw(x_for_this_render, y_on_canvas, scale, {x: punks[lt], y: 0})
            } else {
                spriteArray.abc.draw(x_for_this_render, y_on_canvas, scale, {x: abc[lt], y: 0})
            }
            var mult = 0
            if(lt == ' '){
                mult = 3
            }else if((['.','\'','?','/']).includes(lt)){
                mult = 2
            }else{
                mult = 6
            }
            x_for_this_render += mult * scale
        });
        y_on_canvas += 5 * scale + 20

    })
}

function drawLine(xFrom, yFrom, xTo, yTo) {
    ctx.beginPath();
    ctx.moveTo(xFrom, yFrom);
    ctx.lineTo(xTo, yTo);
    ctx.stroke()
}

// ======================================================== END ========================================================

// ===================================== UPDATER AND THINGS THAT HAPPEN ON FRAME COUNTS ================================
function globalCounter() {
    setTimeout(function () {
        if (global_frame_counter < 999999) {
            global_frame_counter++
        } else {
            global_frame_counter = 0
        }
        if (global_frame_counter % 2 == 0 && dontDraw >= 0) {
            ctx.clearRect(60, 725, 850, 150);
            drawWords(dialog, 60, 725, 5, dontDraw--)
        }
        if (dontDraw == 0 && !waitForScroll) {
            if (eventQ.queue.length > 0) {
                waitForScroll = true;
                drawScrollArrow = true
            } else {
                standby = true;
                oBoxes.forEach(function (e) {
                    e.drawOptionBox()
                })
            }
        }
        if (waitForScroll && global_frame_counter % 30 == 0) {
            if (drawScrollArrow) {
                spriteArray.scroll.draw(900, 890, 5);
                drawScrollArrow = false
            } else {
                ctx.clearRect(900, 890, 50, 50);
                drawScrollArrow = true
            }
        }
        if (anim != null) {
            refreshGlobalDraw()
        }
        if(cont) {
            globalCounter()
        }
    }, 17)
}

// ======================================================== END ========================================================

function setDialog(diag) {
    standby = false;
    dialog = diag;
    dontDraw = dialog.length;
    refreshGlobalDraw()
}

function initNewGame() {

    //Initializes main character
    mainC = {hp: 25, totalHp: 25, atk: 8, def: 6, spd: 5, luck: 6, hunger: 100, sanity: 74, defMod: 0, atkMod: 0,
        acc: 0.9,
        protecc: function (dmg) {
            //console.log("damage done: "+dmg+" mainC def: "+this.def+" mainC defModifier:" +this.defMod)
            dmg -= Math.ceil(dmg * ((this.def+this.defMod) * 3 / 100));
            this.hp -= dmg;
            this.sanity -= 7
            return dmg
        },
        performAction: function (decision) {
            if (decision == "attack") {
                var actualAcc = this.acc
                var missMsg = ""
                if(this.sanity < 40){
                    actualAcc = 0.75
                    missMsg = "...but panic set in"
                }else if(boozedCounter > 0){
                    actualAcc = 0.85
                    missMsg = "...but your inebriation got in the way"
                }
                eventQ.insert(null, "you attack");
                var rng = Math.random()

                if (rng > actualAcc) {

                    eventQ.insert(null, missMsg == "" ? "...but you missed":missMsg)
                } else {
                    var dmg = this.atk;
                    dmg += (this.luck * 3) / 100 > Math.random() ? Math.ceil(this.luck * 3 * this.atk / 100) : 0;
                    eventQ.insert(function () {
                        mainC.hunger -= 5;
                    }, enemy.name + " received " + enemy.protecc(dmg) + " damage.")
                }
            }
            if (decision == "defend"){
                this.defMod += this.def
                eventQ.insert(null,"you defend")
            }
        },
        performDeath: function (str) {
            eventQ.insert(function () {switchState("gameover", "fight")},null)
            setDialog(str)
        }
    }
    boozedCounter = 0
    hungerCounter = 10
    toughnessCounter = 12
    eventQ = {
        queue: [],
        insert: function(extra,text){
            const ext = extra
            const txt = text
            var fnc = function(){
                if(ext != null){
                    ext()
                }
                if(txt != null) {
                    setDialog(txt)
                }}
            this.queue.push(fnc)
        },
        perform: function(){
            this.queue.shift()()
        }
    }
    //Room enemy is null
    enemy = null;
    //Chest doesn't exists

    currentHouse = new House()

    currentHouse.insert(1, 1, roomArray.bedroom.copy());
    //There is no item name selected
    itemName = null;
    //Item Slots is initiated.
    itemSlots = [];
    y_pos = 150;
    x_pos = 75;
    for (i = 0; i < 5; i++) {
        for (j = 0; j < 4; j++) {
            itemSlots.push(new ItemSlot(null, x_pos, y_pos));
            x_pos += 100
        }
        y_pos += 100;
        x_pos = 75
    }
    //Event Queue starts empty
    roomOpt = []
    dirOpt = []
    //New Room is created
    currentRoom = currentHouse.matrix[1][1];
    currentHouse.matrix[0][0] = "entrance"
    //New Mood flag is set so that the mood is determined
    //Counter for next hunger check is reset.
    withdrawal_prob = 0.01;
    withdrawal_increment = 0.05
    //You are not waiting for scroll or drawing scroll arrow
    waitForScroll = drawScrollArrow = false;
    //Global Frame Counter is set to 0 and so is dont Draw
    global_frame_counter = dontDraw = 0;
    //Option menu is set to null
    globalItemIndex = null;
    //You are on standby
    //Item is set.
    addItem(itemArray.requestSpecific("instant lunch"))
    addItem(itemArray.requestSpecific("ciggy"))
    //New Box is defined
    outside = false
    score = 0
}

function addItem(item) {
    for (i = 0; i < itemSlots.length; i++) {
        if (itemSlots[i].item == null) {
            itemSlots[i].item = item;
            return
        }
    }
    eventQ.insert(null,"...but there's no space in your inventory")
}

function adjacentRoom(i, j) {
    pos = currentRoom.pos
    //console.log("checking adjacent room for Current Room: ["+inds[k][0]+","+inds[k][1]+"] and indexes: i"+i+" j"+j)
    if ((pos[1] == j && (i == (pos[0] + 1) || i == (pos[0] - 1))) || (pos[0] == i && (j == (pos[1] + 1) || j == (pos[1] - 1)))) {
        return true
    }
    return false
}

function finishAnim(diag,state,offset){
    anim = null
    if(offset != null)ctx.translate(-offset,0)
    if(diag != null)setDialog(diag)

    if(state == "explore"){
        if (currentRoom.enemy != null){
            enemy = currentRoom.enemy
            eventQ.insert(function(){switchState("fight","encounter")},"you encounter " + currentRoom.enemy.name)
        }else{
            eventQ.insert(function(){switchState("explore","room")},null)
        }
    } else if(state == "fight"){
        eventQ.perform()
    }else if(state == "starving"){
        eventQ.insert(function(){switchState("explore","starved")},null)
    }
}

function setDmgAnim(diag,state){
    anim = {
        offset: 0, x: 25, duration: 10, play: function () {
            this.offset += this.x
            ctx.translate(this.x, 0)
            if (this.offset >= 25) {
                this.x = -50
            } else {
                this.x = 50
            }
            if (this.duration-- <= -1) finishAnim(diag, state, this.offset)
        }
    }
}

function setTransAnim(diag, state,newRoom) {
    anim = {
        top_y: 0, bot_y: 1000, status: "coming", play: function () {
            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, 1000, this.top_y)
            ctx.fillRect(0, this.bot_y, 1000, 500)
            if (this.status == "coming") {
                this.top_y += 50
                this.bot_y -= 50
            } else {
                this.top_y -= 50
                this.bot_y += 50
                if (this.top_y <= 0) {
                    mainC.hunger -= 7
                    finishAnim(diag,state)
                }
            }
            if (this.top_y >= 500) {
                lastRoom = currentRoom
                currentRoom = newRoom
                this.status = "going"
                dialog = null

            }
        }
    }
}
