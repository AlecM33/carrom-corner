export class BracketNode {

    public winner: Object;
    public childA: BracketNode;
    public childB: BracketNode;
    public parent: BracketNode;

    constructor() {

    }

    public isLeaf() {
      return this.childA === undefined && this.childB === undefined;
    }
}
