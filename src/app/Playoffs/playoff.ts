
export class Playoff {
    public id: number;
    public tournamentId: number;
    public bracket: any[];
    public playInSpots: number[];

    constructor(id: number, tournamentId: number, playInSpots: number[], bracket: any[]) {
        
        this.id = id;
        this.tournamentId = tournamentId;
        this.playInSpots = playInSpots;
        this.bracket = bracket;
    }
}