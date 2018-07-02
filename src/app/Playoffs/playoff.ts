
export class Playoff {
    public id: number;
    public tournamentId: number;
    public bracket: any[];

    constructor(id: number, tournamentId: number, bracket: any[]) {
        
        this.id = id;
        this.tournamentId = tournamentId;
        this.bracket = bracket;
    }
}