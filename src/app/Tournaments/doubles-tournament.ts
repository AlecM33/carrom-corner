export class DoublesTournament {

  public id: number;
  public name: string;
  public playoffsStarted: boolean;
  public winner1: number;
  public winner2: number;
  public size: number;
  public rounds: number;
  public currentRound: number;

  constructor(
    name: string,
    size: number,
    rounds: number
    ) {

    this.id = null;
    this.name = name;
    this.playoffsStarted = false;
    this.winner1 = null;
    this.winner2 = null;
    this.size = size;
    this.rounds = rounds;
    this.currentRound = 0;
  }
}
