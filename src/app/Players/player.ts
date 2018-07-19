import { PercentPipe } from "@angular/common";

// The player model 
export class Player {

    public id: number;
    public name: string;
    public nickname: string;
    public elo: number;
    public doublesElo: number;
    public wins: number;
    public losses: number;
    public totalDiff: number;
    public singlesPlayed: number;
    public doublesPlayed: number;

    constructor(id: number,
                name: string,
                nickname: string='',
                elo: number,
                doublesElo: number, 
                wins: number=0,
                losses: number=0,
                totalDiff: number,
                singlesPlayed: number,
                doublesPlayed: number) {

        this.id = id;
        this.name = name;
        this.elo = elo;
        this.doublesElo = doublesElo;
        this.nickname = nickname;
        this.wins = wins;
        this.losses = losses;
        this.totalDiff = totalDiff;
        this.singlesPlayed = singlesPlayed;
        this.doublesPlayed = doublesPlayed;
    
    }
}