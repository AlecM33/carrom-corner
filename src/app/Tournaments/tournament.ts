import { Player } from "../Players/player";
import { Game } from "../Games/game";
import { Team } from "../Teams/team";

export class Tournament {
    
    public id: number;
    playoffDefined: boolean;
    public winner: string[];
    public name: string;
    public singles: boolean;
    public size: number;
    public players: number[];
    public teams: number[];
    public games: number[];
    public pools: any[];

    constructor(
        id: number, 
        playoffDefined: boolean,
        winner: string[],
        name: string,
        singles: boolean,
        size: number,
        players: number[],
        teams: number[],
        games: number[],
        pools: any[]) {

            this.id = id;
            this.playoffDefined = playoffDefined
            this.winner = winner;
            this.name = name;
            this.singles = singles;
            this.size = size;
            this.players = players;
            this.teams = teams;
            this.games = games;
            this.pools = pools;
    }
}