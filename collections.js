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
enemyArray = {
    ratboy: new Enemy("ratboy",spriteArray.enemies, 1, [
        {
            prob: 0.3, funct: function () {
                eventQ.insert(null,"rat boy hits you with his pixaxe.")
                eventQ.insert(null,"... but it's made of cardboard")
            }
        },
        {
            prob: 1.0, funct: function () {
                Enemy.prototype.atacc("rat boy bites you")
            }
        }]),
   twitcher: new Enemy("twitcher", spriteArray.enemies, 0, [
        {
            prob: 0.3, funct: function () {
                eventQ.insert(null,"twitcher starts streaming.")
                eventQ.insert(null,"... but there's no internet")
            }
        },
        {
            prob: 1.0, funct: function () {
                Enemy.prototype.atacc("twitcher drop kicks you")
            }
        }]),
    influencer: new Enemy("influncer", spriteArray.enemies, 2, [
        {
            prob: 0.3, funct: function () {
                eventQ.insert(null,"twitcher starts streaming.")
                eventQ.insert(null,"... but there's no internet")
            }
        },
        {
            prob: 1.0, funct: function () {
                Enemy.prototype.atacc("twitcher drop kicks you")
            }
        }]),
    yourself: new Enemy("yourself", spriteArray.mc, 0, [
        {
            prob: 0.3, funct: function () {
                eventQ.insert(null,"you laugh maniacaly")
                eventQ.insert(null,"... laughter echoes through the night")
            }
        },
        {
            prob: 1.0, funct: function () {
                Enemy.prototype.atacc("doom falls upon you")
            }
        }]),
};
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

itemArray = {
    instantLunch: {prob: 0.2, i:new Item("instant lunch", "highly nutritious and healthy... or not. it will satiate some of your hunger", spriteArray.items,0, 0, 6, 15, 0)},
    mcDaniels:    {prob: 0.11,i:new Item("mcdaniel's", "tastes a bit like cardboard, but that mayo is damn good", spriteArray.items,1,0,4,20,0)},
    ciggy:        {prob: 0.25,i:new Item("ciggy", "helps you reduce tension at the expense of your health", spriteArray.items,2,0,-3,0,15)},
    benzos:       {prob: 0.02,i:new Item("benzos", "chill you right up, but they're dangerously addictive", spriteArray.items,3,0,0,0,25)},
    booze:        {prob: 0.2,i:new Item("booze", "will help you carry on. lowers your accuracy", spriteArray.items,4,0,0,0,20)},
    bandAid:      {prob: 0.02,i:new Item("band aid", "it's all white magic", spriteArray.items,5,0,10,0,0)},
    cheatOs:      {prob: 0.2,i:new Item("cheat o's", "that greasy cheat o's dust gets everywhere", spriteArray.items,5,0,3,10,0)}
}