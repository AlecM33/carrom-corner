export class DoublesTournament {

  public id: number;
  public name: string;
  public playoffsStarted: boolean;
  public winner: number;
  public size: number;
  public rounds: number;
  public ended: boolean;
  public currentRound: number;
  public winnerName: string;

  constructor(
    name: string,
    size: number,
    rounds: number
    ) {

    this.id = null;
    this.name = name;
    this.playoffsStarted = false;
    this.winner = null;
    this.size = size;
    this.rounds = rounds;
    this.ended = null;
    this.currentRound = 0;
    this.winnerName = null;
  }
}
