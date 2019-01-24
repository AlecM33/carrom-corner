export class Playoff {
    public id: number;
    public tournamentId: number;
    public bracket: any[];
    public playInSpots: number[];
    public winner: any;
    public ended: boolean;

    constructor(id: number, tournamentId: number, playInSpots: number[], bracket: any[], winner: any, ended: boolean) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.playInSpots = playInSpots;
        this.bracket = bracket;
        this.winner = winner;
        this.ended = ended;
    }
}
