export class SinglesRound {

  public id: number;
  public tournamentId: number;
  public size: number;
  public number: number;

  constructor(
    tournamentId: number,
    size: number,
    number: number
  ) {

    this.id = null;
    this.tournamentId = tournamentId;
    this.size = size;
    this.number = number;
  }
}
