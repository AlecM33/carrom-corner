export class SinglesPlayoff {
  public id: number;
  public tournamentId: number;
  public winner: number;
  public ended: boolean;

  constructor(tournamentId: number) {
    this.id = null;
    this.tournamentId = tournamentId;
    this.winner = null;
    this.ended = false;
  }
}
