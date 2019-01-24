import { Injectable } from '@angular/core';
import { BracketGraph } from '../Brackets/bracketgraph';
import { BracketNode } from '../Brackets/bracketnode';
import { split } from 'ts-node';
import { ChildTeams } from '../Brackets/childteams';

/* This service provides relevant methods for constructing a tournament bracket with a variable number of players */
@Injectable()
export class BracketService {


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
            const player = playerList.find((player) => playerList.indexOf(player) === i);
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









}

