
export class Playoff {
    public id: number;
    public tournamentId: number;
    public playIns: any[];
    public byePlayers: any[]
    public firstRound: any[];

    constructor(id: number, tournamentId: number, playIns: any[], byePlayers: any[], firstRound: any[]) {
        this.id = id;
        this.tournamentId = tournamentId;
        this.playIns = playIns;
        this.byePlayers = byePlayers;
        this.firstRound = firstRound;
    }
}