import express from 'express';
import path from 'path';
import fs from 'fs';
import {Server} from 'socket.io';
import {GameInstance} from "./types/GameInstance";
import {find_game_id_via_socket, get_player_2, instantiate_game, resolve_client_state, resolve_turn} from "./functions";

const app = express();
const http = require('http');
const https = require('https');
const server = http.createServer(app);
const https_server = https.createServer({
    key: fs.readFileSync('/your-key', 'utf8'),
    cert: fs.readFileSync('/your-fullchain.pem', 'utf8'),
    ca: fs.readFileSync('/your-fullchain.pem', 'utf8')
}, app);
const io = new Server(https_server);
const games: Map<string, GameInstance> = new Map<string, GameInstance>();


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    socket.on('disconnect', () => {
        const game_id = find_game_id_via_socket(games, socket);
        if (!game_id) return;
        const game = games.get(game_id);
        games.delete(game_id);
        if (!game || !game.p2) return;
        const rem_player = game.p1.id === socket.id ? game.p2 : game.p1;
        rem_player.socket.emit('oppo_left');
    });

    socket.on('new_game', () => {
        const game = instantiate_game(socket);
        games.set(socket.id, {...game});
        io.to(socket.id).emit('new_state', resolve_client_state({...game}));
    });

    socket.on('join_game', (game_id) => {
        const game = games.get(game_id);
        if (!game || game.p2 !== null) return;
        const new_game = {...game, p2: get_player_2(socket)};
        games.set(game_id, {...new_game});
        // join game room (p1 id)
        socket.join(game_id);
        io.to(game.id).emit('new_state', resolve_client_state({...new_game}));
    });

    socket.on('player_move', (d: {game_id: string, tile_id: string}) => {
        const {game_id, tile_id} = d;
        const game = games.get(game_id);
        if (!game || game.p2 === null || game.turn !== socket.id) return;
        const tile = game.map.filter(x => x.id === tile_id)[0];
        if (tile.team !== 0) return;
        const new_state: GameInstance = resolve_turn(game, tile_id, socket);
        games.set(game_id, new_state);
        io.to(game_id).emit('new_state', resolve_client_state({...new_state}));
    });
});


https_server.listen(443, () => console.log('HTTPS Server Started'));
server.listen(80, () => {
    console.log('HTTP server started');
});
