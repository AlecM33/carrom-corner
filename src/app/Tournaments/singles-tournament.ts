export class SinglesTournament {

  public id: number;
  public name: string;
  public playoffsStarted: boolean;
  public winner;
  public winnerName: string;
  public size: number;
  public rounds: number;
  public ended: boolean;
  public currentRound: number;

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
    this.winnerName = null;
    this.ended = null;
    this.rounds = rounds;
    this.currentRound = 0;
  }
}
