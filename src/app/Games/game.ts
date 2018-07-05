import { Player } from "../Players/player";
import { Team } from "../Teams/team"

export class Game {
    public id: number;
    public playoff: boolean
    public tournamentId: number;
    public scheduleIndex: number; // for randomized scheduling 
    public id1: number;
    public id2: number;
    public winner: number;
    public differential: number;

    constructor(id: number, playoff: boolean, tournamentId: number, scheduleIndex: number, id1: number, id2: number, winner: number, differential: number) {
        this.id = id;
        this.playoff = playoff;
        this.tournamentId = tournamentId;
        this.scheduleIndex = scheduleIndex;
        this.id1 = id1;
        this.id2 = id2;
        this.winner = winner;
        this.differential = differential
    }
}