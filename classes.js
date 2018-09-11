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
        if(rng < 0.1){
            this.enemy = enemyArray.youtuber.copy()
        }if(rng < 0.2){
            this.chest = true
        }
        if (this.cInit != null) this.cInit()
        var mm = house.matrix
        var assignRooms = true
        var chance = 0.60
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
        this.roomBg.draw(0, 160, 6, {x: this.mx, y: 0})
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
        if(room != null){
            this.moveOpts.east = room
        }else {
            if (Math.random() < 0.35) {
                Math.random() > 0.5 ? this.moveOpts.east = "open" : this.moveOpts.west = "open"
                if (Math.random() < 0.20) {
                    this.moveOpts.east == "open" ? this.moveOpts.west = "open" : this.moveOpts.east = "open"
                }
            }
        }
        this.name = "street";
        this.desc = "streets of rage";
        this.enemy = null;
        this.chest = false
    }

    drawRoom() {
        spriteArray.rooms.draw(0, 160, 6, {x: 1, y: 0})
    }
}

//Character class
class Enemy {
    //Has some attributes, like the name, lvl(?), hp, etc.
    //Must decide whether to leave lvl, spec and sanity... might not be necesary.
    constructor(name, sprite, xm, actions) {
        this.name = name;
        this.sprite = sprite;
        this.hp = 10;
        this.atk = 5;
        this.def = 5;
        this.spd = 5;
        this.luck = 5;
        this.actions = actions;
        this.xm = xm
    }

    //Attack method takes into consideration luck. Luck is nice.
    atacc() {
        var dmg = enemy.atk;
        dmg += (enemy.luck * 3) / 100 > Math.random() ? Math.ceil(enemy.luck * 3 * enemy.atk / 100) : 0;
        eventQ.insert(null,enemy.name + " attacks")
        eventQ.insert(function(){
           setDmgAnim(null,"fight")
        },null)
        eventQ.insert(function(){
            var Ddealt = mainC.protecc(dmg)
            setDialog("you received " + Ddealt + " damage.")
        },null)
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
        eventQ.insert(function(){
            currentRoom.enemy = null
            switchState("explore")},null)
    }

    draw() {
        this.sprite.draw(350, 200, 7, {x: this.xm, y: 0})
    }

    copy(){
        let name = this.name
        let actions = this.actions;
        let xm = this.xm
        return new Enemy(name, this.sprite, xm, actions)
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