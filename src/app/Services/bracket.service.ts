import { Injectable } from '@angular/core';
import { BracketGraph } from '../Brackets/bracketgraph';
import { BracketNode } from '../Brackets/bracketnode';
import { ChildTeams } from '../Brackets/childteams';
import {Player} from '../Players/player';
import {Team} from '../Teams/team';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {SinglesBracketNode} from '../Brackets/singles-bracket-node';
import {DoublesBracketNode} from '../Brackets/doubles-bracket-node';

/* This service provides relevant methods for constructing a tournament bracket with a variable number of players */
@Injectable()
export class BracketService {

  constructor(private http: HttpClient) {}

    generateBracket(playerList: Object[]): BracketGraph {
        const bracketGraph = new BracketGraph();
        bracketGraph.winnerNode = this.generateNode(undefined, playerList);
        return bracketGraph;
    }

    generateNode(parentNode: BracketNode, playerList: Object[]): BracketNode {
        if (playerList.length < 1) {
            return undefined;
        }
        const node = new BracketNode();
        node.winner = playerList[0];
        node.parent = parentNode;
        if (playerList.length > 1) {
            const children = this.splitChildPlayers(playerList);
            node.childA = this.generateNode(node, children.subtreeA);
            node.childB = this.generateNode(node, children.subtreeB);
        }
        return node;
    }

    getNodesAtLevel(root: BracketNode, depth, nodes) {
        if (depth === 0) {
            if (root.isLeaf()) {
                const playerRecord = root.winner;
                playerRecord['parent'] = root.parent.winner['team'];
                nodes.push(playerRecord);
            } else {
                nodes.push({});
            }
        } else {
            if (root.childA !== undefined) {
                this.getNodesAtLevel(root.childA, depth - 1, nodes);
            }
            if (root.childB !== undefined) {
                this.getNodesAtLevel(root.childB, depth - 1, nodes);
            }
        }
        return nodes;
    }

    getTreeDepth (node: BracketNode) {
        if (node === undefined) {
            return 0;
        }
        const aDepth = this.getTreeDepth(node.childA);
        const bDepth = this.getTreeDepth(node.childB);
        if (aDepth < bDepth) {
            return 1 + aDepth;
        } else {
            return 1 + bDepth;
        }
    }

    splitChildPlayers(playerList: Object[]): ChildTeams {
        const output = new ChildTeams();
        let aWeight = 0;
        let bWeight = 0;
        for (let i = 0; i < playerList.length; i++) {
            const player = playerList.find((eachPlayer) => playerList.indexOf(eachPlayer) === i);
            const playerWeight = playerList.length - i;

            if (aWeight < bWeight) {
                output.subtreeA.push(player);
                aWeight += playerWeight;

            } else if (aWeight > bWeight) {
                output.subtreeB.push(player);
                bWeight += playerWeight;

            } else {

                // Ties break towards (a).
                output.subtreeA.push(player);
                aWeight += playerWeight;
            }
        }
        return output;
    }

    addSinglesBracket(playoffId: number, depth: number): Observable<Object> {
      const payload = {
        'playoff_id': playoffId,
        'depth': depth
      };
      return this.http.request('post', '/api/brackets/singles/post', {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    addDoublesBracket(playoffId: number, depth: number) {
      const payload = {
        'playoff_id': playoffId,
        'depth': depth
      };
      return this.http.request('post', '/api/brackets/doubles/post', {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  addSinglesBracketNode(node: SinglesBracketNode): Observable<Object> {
    const payload = {
      'bracket_id': node.bracketId,
      'player1_id': node.player1Id,
      'player2_id': node.player2Id,
      'seed1': node.seed1,
      'seed2': node.seed2,
      'node_index': node.nodeIndex
    };
    return this.http.request('post', '/api/brackets/singles/nodes/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addDoublesBracketNode(node: DoublesBracketNode): Observable<Object> {
    const payload = {
      'bracket_id': node.bracketId,
      'team1_id': node.team1Id,
      'team2_id': node.team2Id,
      'seed1': node.seed1,
      'seed2': node.seed2,
      'node_index': node.nodeIndex
    };
    return this.http.request('post', '/api/brackets/doubles/nodes/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getBracket(id: number, type: string): Observable<any> {
    if (type === 'singles') {
      return this.http.request('get', '/api/brackets/singles/get/' + id, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return this.http.request('get', '/api/brackets/doubles/get/' + id, {
        headers: {
          'Content-Type': 'application/json'}
      });
    }
  }

  getBracketNodes(id: number, type: string): Observable<any> {
    if (type === 'singles') {
      return this.http.request('get', '/api/brackets/singles/nodes/get/' + id, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).map(this.populateWithSinglesNodes);
    } else {
      return this.http.request('get', '/api/brackets/doubles/nodes/get/' + id, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).map(this.populateWithDoublesNodes);
    }
  }

  updateSinglesParentNode(node: SinglesBracketNode) {
    const payload = {
      'player1_id': node.player1Id,
      'player2_id': node.player2Id,
      'seed1': node.seed1,
      'seed2': node.seed2
    };
    return this.http.request('post', '/api/brackets/singles/nodes/update/' + node.id, {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateDoublesParentNode(node: DoublesBracketNode) {
    const payload = {
      'team1_id': node.team1Id,
      'team2_id': node.team2Id,
      'seed1': node.seed1,
      'seed2': node.seed2
    };
    return this.http.request('post', '/api/brackets/doubles/nodes/update/' + node.id, {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  populateWithSinglesNodes(response: any[]): SinglesBracketNode[] {
    const nodes = [];
    for (const jsonNode of response) {
      const newNode = new SinglesBracketNode(
        jsonNode['bracket_id'],
        jsonNode['player1_id'],
        jsonNode['player2_id'],
        jsonNode['seed1'],
        jsonNode['seed2'],
        jsonNode['node_index']);
      newNode.id = jsonNode['id'];
      nodes.push(newNode);
    }
    return nodes;
  }

  populateWithDoublesNodes(response: any[]): DoublesBracketNode[] {
    const nodes = [];
    for (const jsonNode of response) {
      const newNode = new DoublesBracketNode(
        jsonNode['bracket_id'],
        jsonNode['team1_id'],
        jsonNode['team2_id'],
        jsonNode['seed1'],
        jsonNode['seed2'],
        jsonNode['node_index']);
      newNode.id = jsonNode['id'];
      nodes.push(newNode);
    }
    return nodes;
  }
}
