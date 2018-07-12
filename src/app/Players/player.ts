import { PercentPipe } from "@angular/common";

// The player model 
export class Player {

    public id: number;
    public name: string;
    public nickname: string;
    public wins: number;
    public losses: number;
    public totalDiff: number;
    public gamesPlayed: number;

    constructor(id: number,
                name: string,
                nickname: string='',
                wins: number=0,
                losses: number=0,
                totalDiff: number,
                gamesPlayed: number) {

        this.id = id;
        this.name = name;
        this.nickname = nickname;
        this.wins = wins;
        this.losses = losses;
        this.totalDiff = totalDiff;
        this.gamesPlayed = gamesPlayed;
    
    }
}