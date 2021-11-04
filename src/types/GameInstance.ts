import {Socket} from "socket.io";
import {Tile} from "./Tile";

export type Player = {
    p: 1 | 2
    id: string
    color: number
    socket: Socket
};


export type GameInstance = {
    p1: Player
    p2: Player | null
    id: string
    map: Tile[]
    turn: string
    remaining: 0 | 1 | 2
    ended: boolean
    reason: string
};

type ClientColors = {
    [key: string]: number | undefined
}

export type ClientState = {
    map: Tile[],
    p1id: string,
    p2id: string | undefined,
    turn: string,
    colors: ClientColors | undefined,
    remaining: number,
    ended: boolean,
    reason: string

};