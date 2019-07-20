export class DoublesBracketNode {

  public id: number;
  public bracketId: number;
  public team1Id: number;
  public team2Id: number;
  public seed1: number;
  public seed2: number;
  public nodeIndex: number;

  constructor(
    bracketId: number,
    team1Id: number,
    team2Id: number,
    seed1: number,
    seed2: number,
    nodeIndex: number) {

    this.id = null;
    this.bracketId = bracketId;
    this.team1Id = team1Id;
    this.team2Id = team2Id;
    this.seed1 = seed1;
    this.seed2 = seed2;
    this.nodeIndex = nodeIndex;
  }
}

