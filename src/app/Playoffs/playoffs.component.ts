import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { PlayerService } from '../Services/player.service';
import { TournamentService } from '../Services/tournament.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Player } from '../Players/player';
import { GameService } from '../Services/game.service';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
import { EloService } from '../Services/elo.service';
import {PlayoffService} from '../Services/playoff.service';
import {BracketService} from '../Services/bracket.service';
const swal: SweetAlert = _swal as any;
import * as d3 from 'd3';
import {SinglesGame} from '../Games/singles-game';
import {DoublesGame} from '../Games/doubles-game';

@Component({
    templateUrl: 'playoffs.component.html',
})
export class PlayoffsComponent implements OnInit {

    constructor(public _playerService: PlayerService,
                public _tournyService: TournamentService,
                public http: HttpClient, public router: Router,
                public active_route: ActivatedRoute,
                public _gameService: GameService,
                public tooltipConfig: NgbTooltipConfig,
                public elo_adjuster: EloService,
                public _playoffService: PlayoffService,
                public _bracketService: BracketService) {
    }

    public players: Player[];
    public playoffId: string;
    public winner: Player;
    public playoff: Object;
    public bracket = [];
    public tournyType = 'singles';
    public playInRound = [];
    public newPlayoffGames = [];
    public tournamentWinner: any;
    public scoreDifferential: number;
    public round: number;
    public isOver = true;
    public bracketDepth: number;
    tournament: any;
    public tournamentId: any;
    public tournamentName: any;
    public nodes = [];
    public playoffGames = [];
    public currentGame = undefined;
    public currentNode = undefined;

    // variables related to modal for playoff game result entry
    public modalOpen = false;
    public validator: any;
    public modalWinner: any;
    public modalLoser: any;
    validatorBlank = false;
    scoreBlank = false;
    scoreInvalid = false;

    @ViewChild('playoffModal') playoffModal: ElementRef;
    @ViewChild('updateBtn') updateBtn: ElementRef;

    ngOnInit() {
      this.tournyType = this.active_route.snapshot.paramMap.get('type');
      this.tournamentId = this.active_route.snapshot.paramMap.get('tourny_id');
      this._tournyService.getTournament(this.tournamentId, this.tournyType).subscribe((tournament) => {
        this.tournamentName = tournament[0]['name'];
        this._playoffService.getPlayoff(tournament[0].id, this.tournyType).subscribe((playoff) => {
          const playoffId = playoff[0].id;
          this._bracketService.getBracket(playoffId, this.tournyType).subscribe((bracket) => {
            this.bracketDepth = bracket[0]['depth'];
            this._bracketService.getBracketNodes(bracket[0]['id'], this.tournyType).subscribe((nodes) => {
              Object.assign(this.nodes, nodes);
              this.sortNodes();
              const root = nodes.shift();
              const tree = [{index: 1, a: this.convertToName(root.player1Id), b: this.convertToName(root.player2Id), aSeed: root.seed1,
                bSeed: root.seed2, children: []}];
              this._gameService.getPlayoffGames(this.tournyType, playoffId).subscribe((playoffGames: any) => {
                this.playoffGames = playoffGames;
                this.buildJSONTree(tree, nodes);
                this.buildD3Graph(tree);
              });
            });
          });
        });
      });

      this._playerService.getPlayers().subscribe((players) => {
          this.players = players;
          this.playoffId = this.active_route.snapshot.paramMap.get('id');
      });

    }

    sortNodes() {
      this.nodes.sort((a, b) => {
          return a.nodeIndex > b.nodeIndex ? 1 : -1;
        }
      );
    }

  buildJSONTree(tree, nodes) {
    if (tree[0]) {
      this.buildJSONTree(tree[0].children, nodes);
    }
    if (tree[1]) {
      this.buildJSONTree(tree[1].children, nodes);
    }
    if (nodes.length > 0) {
      const node = nodes.shift();
      const parent = tree.find((parentNode) => parentNode.index === Math.ceil((node.nodeIndex - 1) / 2));
      if (parent) {
        parent.children.push({
          index: node.nodeIndex, a: this.convertToName(node.player1Id), b: this.convertToName(node.player2Id),
          aSeed: node.seed1, bSeed: node.seed2, children: []
        });
        this.buildJSONTree(tree, nodes);
      } else {
        nodes.unshift(node);
        if (tree[0]) {
          this.buildJSONTree(tree[0].children, nodes);
        }
        if (tree[1]) {
          this.buildJSONTree(tree[1].children, nodes);
        }
      }
    }
  }

  buildD3Graph(tree) {
    const margin = {top: 65, right: 90, bottom: 50, left: 150},
      width = (260 * this.bracketDepth) - margin.left - margin.right,
      height = (210 * this.bracketDepth) - margin.top - margin.bottom,
      separationConstant = 1;
    // line connector between nodes
    const line = d3.line()
      .x(d => width - d.y)
      .y(d => d.x)
      .curve(d3.curveStep);

    // declares a tree layout and assigns the size
    const treemap = d3.tree()
      .size([height, width])
      .separation((a, b) => a.parent === b.parent ? 1 : separationConstant);

    //  assigns the data to a hierarchy using parent-child relationships
    console.log(tree);
    let nodes = d3.hierarchy(tree[0]);

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    const svg = d3.select('#bracket-svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', 'translate(' + margin.left  + ',' + margin.top + ')');

    // adds the links between the nodes
    const link = g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => line([d, d.parent ]));

    // adds labels to the nodes
    function gameTemplate(d) {
      return '' +
        '<div class=\'node-row\'>' +
        '<span class=\'cell seed\'>' + (d.data.aSeed || ' ') + '</span>' +
        '<span class=\'cell name\'>' + (d.data.a || ' ') + '</span>' +
        '</div>' +
        '<div class=\'node-row\'>' +
        '<span class=\'cell seed\'>' + (d.data.bSeed || ' ') + '</span>' +
        '<span class=\'cell name\'>' + (d.data.b || ' ') + '</span>' +
        '</div>';
    }
    console.log(nodes.descendants());

    const labels = d3.select('#labels').selectAll('div')
      .data(nodes.descendants())
      .enter()
      .append('div')
      .classed('node', true)
      .style('left', d => (width - d.y + margin.left - 100) + 'px')
      .style('top', d => (d.x + 26) + 'px')
      .html(d => gameTemplate(d));

    labels.exit();

    const labelDivs = d3.select('#labels').selectAll('div');
    labels.filter((div) => div.data.a && div.data.b).classed('node clickable', true).on('click', (node) => {
      this.enterPlayoffGame(node);
    });


  }

  enterPlayoffGame(node) {
    this.currentNode = node;
    this.currentGame = this.tournyType === 'singles' ?
      this.currentGame = this.playoffGames.find((game) => game.player1Id === node.data.a && game.player2Id === node.data.b)
      : this.currentGame = this.playoffGames.find((game) => game.team1Id === node.data.a && game.team2Id === node.data.b);
    if (!this.currentGame) {
      this.currentGame = this.tournyType === 'singles' ?
        this.currentGame = new SinglesGame(this.tournamentId, null, null, true, this.getId(node.data.a), this.getId(node.data.b))
        : this.currentGame = new DoublesGame(this.tournamentId, null, null, true, node.data.a, node.data.b);
    }
    this.openModal();
  }

  getId(name: string) {
    return this.players.find((player) => player.name === name).id;
  }

  setGameWinner(winnerId: number, loserId: number) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.currentGame.winner = winnerId;
    this.currentGame.loser = loserId;
  }

  setValidator(id) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.currentGame.validator = id;
  }

  setFlipWinner(id) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.currentGame.coinFlipWinner = id;
  }

  setGameDifferential(plusOrMinus: string) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    if (plusOrMinus === 'plus') {
      if (this.currentGame.differential < 11) {
        this.currentGame.differential += 1;
      }
    } else {
      if (this.currentGame.differential > 1) {
        this.currentGame.differential -= 1;
      }
    }
  }


  hideModal() {
    this.playoffModal.nativeElement.className = 'modal hidden';
  }

  openModal() {
    this.playoffModal.nativeElement.className = 'modal';
  }

  submitGame() {
    this.playoffModal.nativeElement.className = 'modal hidden';
    const parentNode = this.nodes.findIndex((node) => node.nodeIndex === Math.ceil((this.currentNode.data.index - 1) / 2));
    if (this.currentNode.data.index % 2 === 0) {
      this.nodes[parentNode].player1Id = this.currentGame.winner;
      this.nodes[parentNode].seed1 = this.currentNode.data.aSeed;
    } else {
      this.nodes[parentNode].player2Id = this.currentGame.winner;
      this.nodes[parentNode].seed2 = this.currentNode.data.bSeed;
    }
    const newNodes = [];
    Object.assign(newNodes, this.nodes);
    const root = newNodes.shift();
    const tree = [{index: 1, a: this.convertToName(root.player1Id), b: this.convertToName(root.player2Id), aSeed: root.seed1,
      bSeed: root.seed2, children: []}];
    d3.select('#labels').selectAll('div').remove();
    this.buildJSONTree(tree, newNodes);
    this.buildD3Graph(tree);
    // if (this.validateGame()) {
    //   this.updateBtn.nativeElement.innerText = 'Updating...';
    //   this.updateBtn.nativeElement.className = 'app-btn';
    //   const call = this.tournyType === 'singles' ? this._gameService.updateSinglesGame(this.currentGame)
    //     : this._gameService.updateDoublesGame(this.currentGame);
    //   call.subscribe(() => {
    //     if (this.tournyType === 'doubles') {
    //       //this.patchDoublesPlayers();
    //     } else {
    //       //this.patchSinglesPlayers();
    //     }
    //     this.updateBtn.nativeElement.innerText = 'Updated';
    //     this.updateBtn.nativeElement.className = 'app-btn confirmed';
    //   });
    // }
  }

    // Updates player database with results from entered doubles game
    patchDoublesPlayers(game) {
        const winner1 = this.players.find((player) => player.id === game.winner[0]);
        const winner2 = this.players.find((player) => player.id === game.winner[1]);
        const loser1 = this.players.find((player) => player.id === game.team2[0]);
        const loser2 = this.players.find((player) => player.id === game.team2[1]);

        const newElos = this.elo_adjuster.getNewDoublesElos(winner1, winner2, loser1, loser2);

        this._playerService.updatePlayer(
          winner1.id, winner1.elo, newElos[0], winner1.wins + 1, winner1.losses, winner1.totalDiff + game.differential,
          winner1.singlesPlayed, winner1.doublesPlayed + 1)
          .subscribe();

        this._playerService.updatePlayer(
          winner2.id, winner2.elo, newElos[1], winner2.wins + 1, winner2.losses, winner2.totalDiff + game.differential,
          winner2.singlesPlayed, winner2.doublesPlayed + 1)
          .subscribe();

        this._playerService.updatePlayer(
          loser1.id, loser1.elo, newElos[2], loser1.wins, loser1.losses + 1, loser1.totalDiff - game.differential,
          loser1.singlesPlayed, loser1.doublesPlayed + 1)
          .subscribe();

        this._playerService.updatePlayer(
          loser2.id, loser2.elo, newElos[3], loser2.wins, loser2.losses + 1, loser2.totalDiff - game.differential,
          loser2.singlesPlayed, loser2.doublesPlayed + 1)
          .subscribe();

    }

    // Updates player database with results from entered singles game
    patchSinglesPlayers(game) {
        const winner = this.players.find((player) => player.id === game.winner);
        const loser = this.players.find((player) => player.id === game.team2);

        // Determines the severity of elo fluctuation based on the games played by each player
        const winningKFactor = this.elo_adjuster.getKFactor(winner, true);
        const losingKFactor = this.elo_adjuster.getKFactor(loser, true);

        const newWinnerElo = this.elo_adjuster
          .calculateNewElo(winner.elo, 1, this.elo_adjuster.calculateExpScore(winner.elo, loser.elo), winningKFactor);
        const newLoserElo = this.elo_adjuster
          .calculateNewElo(loser.elo, 0, this.elo_adjuster.calculateExpScore(loser.elo, winner.elo), losingKFactor);

        this._playerService.updatePlayer(winner.id, newWinnerElo, winner.doublesElo, winner.wins + 1, winner.losses,
          winner.totalDiff + game.differential, winner.singlesPlayed + 1, winner.doublesPlayed)
          .subscribe();

        this._playerService.updatePlayer(loser.id, newLoserElo, loser.doublesElo, loser.wins, loser.losses + 1,
          loser.totalDiff - game.differential, loser.singlesPlayed + 1, loser.doublesPlayed)
          .subscribe();

    }

  // Function for validating form
  validateGame() {
    return !(this.currentGame.winner === undefined) && !(this.currentGame.differential === undefined);
  }

  convertToName(id) {
    if (id) {
      if (this.tournyType === 'singles') {
        return this.players.find((player) => player.id === id).name;
      } else {
        // const foundTeam = this.teams.find((team) => team.id === id);
        // return this.players.find((player) => player.id === foundTeam.player1Id).name
        //   + ', ' + this.players.find((player) => player.id === foundTeam.player2Id).name;
        // // TODO: fetch teams in doubles tournament and map to names;
      }
    } else {
      return undefined;
    }
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  isPowerOfTwo(x) {
    return (Math.log(x) / Math.log(2)) % 1 === 0;
  }

  returnPower(i): number {
    return Math.pow(2, i);
  }

}
