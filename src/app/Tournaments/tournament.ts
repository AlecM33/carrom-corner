import { Player } from "../Players/player";
import { Game } from "../Games/game";

export class Tournament {
    
    public id: number;
    playoffDefined: boolean;
    public winner: any;
    public name: string;
    public singles: boolean;
    public size: number;
    public teams: any[];

    constructor(
        id: number, 
        playoffDefined: boolean,
        winner: any,
        name: string,
        singles: boolean,
        size: number,
        teams: any[]) {

            this.id = id;
            this.playoffDefined = playoffDefined
            this.winner = winner;
            this.name = name;
            this.singles = singles;
            this.size = size;
            this.teams = teams;
    }
}