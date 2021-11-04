import {ClientState, GameInstance, Player} from "./types/GameInstance";
import {Socket} from "socket.io";
import {Tile} from "./types/Tile";
import {v4} from "uuid";
const width = 330;
const height = 335;

export const generate_game_map = (size: number = 30): Array<Tile> => {
    const tiles: Array<Tile> = [];
    for (let y = size; y < height - 5; y+=Math.floor(Math.sin(45) * size) * 2) {
        let dy = y % 2 === 0 ? 0 : Math.sin(45) * size;
        for (let x = size; x < width; x += Math.floor(Math.cos(45) * size) * 3) {
            dy = dy === 0 ? Math.sin(45) * size : 0;
            const noise_val = 1;
            const tile = resolve_tile(x, y + dy, noise_val, size);
            tiles.push(tile);
        }
    }
    return [...tiles];
}

export const resolve_tile = (x: number, y: number, nv: number, s: number): Tile => {
    return {
        pos: {x: x, y: y},
        size: s,
        color: 255,
        draw_order: 1,
        team: 0,
        transparency: 0.5,
        id: v4()
    };
};

export const instantiate_game = (socket: Socket): GameInstance => {
    const player: Player = {
        p: 1,
        id: socket.id,
        socket: socket,
        color: Math.floor(Math.random() * 359)
    };

    const game: GameInstance = {
        p1: player,
        p2: null,
        id: socket.id,
        map: generate_game_map(),
        turn: socket.id,
        remaining: 2,
        ended: false,
        reason: ''
    };
    return {...game};
}

export const get_player_2 = (socket: Socket): Player => {
    return {
        p: 2,
        id: socket.id,
        socket: socket,
        color: Math.floor(Math.random() * 359)
    };
}

export const resolve_client_state = (game: GameInstance): ClientState | void => {
    return {
        map: game.map,
        p1id: game.p1.id,
        p2id: game.p2?.id,
        turn: game.turn,
        colors: {[`${game.p1.id}`]: game.p1.color, [`${game.p2?.id}`]: game.p2?.color},
        remaining: game.remaining,
        ended: game.ended,
        reason: game.reason

    }
}

export const resolve_turn = (game: GameInstance, tile_id: string, socket: Socket): GameInstance => {
    if (!game.p2) return game;
    const player = game.p1.id === socket.id ? game.p1 : game.p2 as Player;
    const nu_map = claim_tiles(tile_id, player, game.map);
    game.remaining--;
    const remaining_tiles: 0 | 1 | 2 = game.remaining as 0 | 1 | 2;
    const turn = remaining_tiles === 0 ? player === game.p1 ? game.p2.id : game.p1.id : player.id;
    const rem = remaining_tiles === 0 ? 2 : remaining_tiles;
    return {
        ...game,
        map: [...nu_map],
        turn,
        remaining: rem
    };
}

export const claim_tiles = (tile_id: string, player: Player, map: Tile[]): Array<Tile> => {
    let mut_map = [...map];
    let t = mut_map.filter(x => x.id === tile_id)[0];
    t.team = player.id;
    t.color = player.color;
    t.transparency = 1;
    for (let tile of map) {
        if (Math.sqrt(Math.pow(tile.pos.x - t.pos.x, 2) + Math.pow(tile.pos.y - t.pos.y, 2)) <= Math.sin(45) * tile.size * 2 + 2 && tile.team !== 0)
        {
            tile.team = player.id;
            tile.color = player.color;
            tile.transparency = 1;
        }
    }
    return [...mut_map];
}

export const find_game_id_via_socket = (games: Map<string, GameInstance>, socket: Socket): string | null => {
    let game_id = null;
    games.forEach((v, k) => {
        if (v.p1.id === socket.id || v.p2 && v.p2.id === socket.id) {
            game_id = k;
        }
    });
    return game_id;
}