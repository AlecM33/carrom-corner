
export class Pool {
    public pools: any[];
    public tournyName: string;

    constructor(pools: any[], tournyName: string) {
        this.pools = pools;
        this.tournyName = tournyName;
    }
}