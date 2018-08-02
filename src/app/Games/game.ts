import { Player } from "../Players/player";

export class Game {
    public id: number;
    public playoff: boolean
    public tournamentId: number;
    public scheduleIndex: number; // for randomized scheduling 
    public team1: any;
    public team2: any;
    public winner: any;
    public differential: number;

    constructor(id: number, playoff: boolean, tournamentId: number, scheduleIndex: number, team1: any, team2: any, winner: any, differential: number) {
        this.id = id;
        this.playoff = playoff;
        this.tournamentId = tournamentId;
        this.scheduleIndex = scheduleIndex;
        this.team1 = team1;
        this.team2 = team2;
        this.winner = winner;
        this.differential = differential
    }
}