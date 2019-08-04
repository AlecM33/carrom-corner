export class SinglesTournament {

  public id: number;
  public name: string;
  public playoffsStarted: boolean;
  public winner;
  public winnerName: string;
  public size: number;
  public rounds: number;
  public robinType: string;
  public ended: boolean;
  public currentRound: number;

  constructor(
    name: string,
    size: number,
    rounds: number,
    robinType: string
  ) {

    this.id = null;
    this.name = name;
    this.playoffsStarted = false;
    this.winner = null;
    this.size = size;
    this.winnerName = null;
    this.robinType = robinType;
    this.ended = null;
    this.rounds = rounds;
    this.currentRound = 0;
  }
}
