
export class Pool {
    public tournamentId: number;
    public pools: any[];
    public tournyName: string;

    constructor(tournamentId: number, pools: any[], tournyName: string) {
        this.tournamentId = tournamentId;
        this.pools = pools;
        this.tournyName = tournyName;
    }
}