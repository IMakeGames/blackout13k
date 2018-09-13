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
            }],19,6,8,4,5)},
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
            }],15,8,5,5,6)},
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
            }],25,9,4,7,7)},
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
            }],30,15,2,6,8)}

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
    {p: 20, m: new Item("instant lunch", "highly nutritious and healthy... or not. it will satiate some of your hunger", spriteArray.items,0, 0, 6, 15, 0)},
    {p: 11,m: new Item("mcdaniel's", "tastes a bit like cardboard, but that mayo is damn good", spriteArray.items,1,0,4,20,0)},
    {p: 25,m: new Item("ciggy", "helps you reduce tension at the expense of your health", spriteArray.items,2,0,-3,0,15)},
    {p: 2,m: new Item("benzos", "chill you right up, but they're dangerously addictive", spriteArray.items,3,0,0,0,25)},
    {p: 20,m: new Item("booze", "will help you carry on. lowers your accuracy", spriteArray.items,4,0,0,0,20)},
    {p: 2,m: new Item("band aid", "it's all white magic", spriteArray.items,5,0,10,0,0)},
    {p: 20,m: new Item("cheat o's", "that greasy cheat o's dust gets everywhere", spriteArray.items,5,0,3,10,0)}
])

itemArray.init()