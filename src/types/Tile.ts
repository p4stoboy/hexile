import { v4 } from 'uuid';

export type Tile = {
    pos: any
    transparency: number
    size: number
    draw_order?: 0 | 1
    team: 0 | string
    color: number
    id: string
    [key: string]: any
}


