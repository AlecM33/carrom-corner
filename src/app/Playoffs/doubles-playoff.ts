export class DoublesPlayoff {
  public id: number;
  public tournamentId: number;
  public winner1: number;
  public winner2: number;
  public ended: boolean;

  constructor(tournamentId: number) {
    this.id = null;
    this.tournamentId = tournamentId;
    this.winner1 = null;
    this.winner2 = null;
    this.ended = false;
  }
}
