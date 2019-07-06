export class SinglesTournament {

  public id: number;
  public name: string;
  public playoffsStarted: boolean;
  public winner;
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
    this.winner = null;
    this.size = size;
    this.rounds = rounds;
    this.currentRound = 0;
  }
}
