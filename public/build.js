function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
var set_scores = function (game, p1_tiles, p2_tiles) {
    var turn_text = game.turn === player_id ? 'your turn' : 'oppo turn';
    var turn_div = document.getElementById('turn');
    turn_div.innerHTML = turn_text;
    turn_div.style.color = "hsl(" + game.colors[game.turn] + ", 100%, 75%)";
    var score1 = document.getElementById('score1');
    score1.innerHTML = p1_tiles.toString();
    score1.style.color = "hsl(" + game.colors[game.p1id] + ", 100%, 75%)";
    var score2 = document.getElementById('score2');
    score2.innerHTML = p2_tiles.toString();
    score2.style.color = "hsl(" + game.colors[game.p2id] + ", 100%, 75%)";
};
var i_style = function (game) {
    var m = document.getElementsByClassName("modal");
    var h = document.getElementById('header');
    var color = "hsl(" + game.colors[player_id] + ", 100%, 75%)";
    h.style.color = color;
    for (var i = 0; i < m.length; i++) {
        m[i].style.backgroundColor = "hsl(" + game.colors[player_id] + ", 100%, 75%, 70%)";
    }
};
var copy_url = function () {
    var copyText = document.getElementById("urlText");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var bg;
var game_id;
var player_id;
var game = null;
var socket;
var init_styles = false;
function setup() {
    var canvas = createCanvas(330, 335);
    canvas.parent('gamediv');
    colorMode(HSL);
    textAlign(CENTER);
    textSize(18);
    bg = color(263, 9, 18);
    socket = io();
    socket.on('connect', function () {
        player_id = socket.id;
        console.log(player_id);
        game_id = getParameterByName('game');
        if (game_id !== "") {
            socket.emit('join_game', game_id);
        }
        else {
            socket.emit('new_game');
            game_id = socket.id;
            var container = document.getElementById('ucontainer');
            container.style.display = 'block';
            var id_div = document.getElementById('urlText');
            id_div.value = 'https://hexile.xyz/?game=' + socket.id;
        }
    });
    socket.on('new_state', function (new_state) {
        game = __assign({}, new_state);
        if (!init_styles) {
            i_style(game);
        }
        var open_tiles = game.map.filter(function (x) { return x.team === 0; });
        var p1_tiles = game.map.filter(function (x) { return x.team === game.p1id; }).length;
        var p2_tiles = game.map.filter(function (x) { return x.team === game.p2id; }).length;
        set_scores(game, p1_tiles.toString(), p2_tiles.toString());
        if (open_tiles.length === 0) {
            var winner = p1_tiles < p2_tiles ? game.p2id : game.p1id;
            var modal = void 0;
            if (winner === player_id) {
                modal = document.getElementById('win');
            }
            else {
                modal = document.getElementById('lose');
            }
            modal.style.display = 'block';
        }
    });
    socket.on('oppo_left', function () {
        var modal = document.getElementById('o_left');
        modal.style.display = 'block';
        socket.close();
    });
}
function draw() {
    if (!game)
        return;
    var tiles = game.map;
    tiles.sort(function (a, b) { return a.draw_order - b.draw_order; });
    background(bg);
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        render(tile);
        var tpos = createVector(tile.pos.x, tile.pos.y);
        if (p5.Vector.dist(tpos, createVector(mouseX, mouseY)) < sin(45) * 30) {
            tile.draw_order = 1;
            tile.size = 30 * 1.3;
            if (mouseIsPressed && tile.team === 0) {
                socket.emit('player_move', { game_id: game_id, tile_id: tile.id });
            }
        }
        else {
            tile.draw_order = 0;
            tile.size = 30;
        }
    }
    if (!game.p2id) {
        stroke(255);
        text('WAITING FOR OPPONENT', width / 2, height / 2);
    }
}
var render = function (tile) {
    stroke(0);
    strokeWeight(2);
    fill((tile.color === 255 ? color(255, 100, 100, tile.transparency) : color(tile.color, 100, 75, tile.transparency)));
    beginShape();
    for (var i = 0; i < 6; i++) {
        var angle = i * 2 * PI / 6;
        vertex(tile.pos.x + tile.size * cos(angle), tile.pos.y + tile.size * sin(angle));
    }
    endShape(CLOSE);
};
//# sourceMappingURL=../sketch/sketch/build.js.map