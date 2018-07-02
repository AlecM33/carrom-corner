import { PercentPipe } from "@angular/common";

// The player model 
export class Player {

    public id: number;
    public name: string;
    public nickname: string;
    public elo: number;
    public wins: number;
    public losses: number;
    public winPtg: number;

    constructor(id: number,
                name: string,
                nickname: string='',
                elo: number=1200,
                wins: number=0,
                losses: number=0,
                winPtg: number=0.0) {

        this.id = id;
        this.name = name;
        this.nickname = nickname;
        this.elo = elo;
        this.wins = wins;
        this.losses = losses;
        this.winPtg = winPtg;
    
    }
}