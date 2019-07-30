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
import {TeamService} from '../Services/team.service';
import {Team} from '../Teams/team';

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
                public _bracketService: BracketService,
                public _teamService: TeamService) {
    }

    public players: Player[];
    public playoffId: string;
    public winner: Player;
    public playoff: Object;
    public bracket = [];
    public tournyType = 'singles';
    public playInRound = [];
    public newPlayoffGames = [];
    public scoreDifferential: number;
    public round: number;
    public isOver = true;
    public bracketDepth: number;
    public tournament: any;
    public tournamentId: any;
    public nodes = [];
    public playoffGames = [];
    public currentGame = undefined;
    public currentNode = undefined;
    public teams: Team[];

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
        this.tournament = tournament[0];
        this._playoffService.getPlayoff(tournament[0].id, this.tournyType).subscribe((playoff) => {
          this.playoffId = playoff[0].id;
          this._gameService.getPlayoffGames(this.tournyType, parseInt(this.playoffId, 10)).subscribe((playoffGames: any) => {
            this.playoffGames = playoffGames;
          });
          this._bracketService.getBracket(parseInt(this.playoffId, 10), this.tournyType).subscribe((bracket) => {
            this.bracketDepth = bracket[0]['depth'];
            this._bracketService.getBracketNodes(bracket[0]['id'], this.tournyType).subscribe((nodes) => {
              this.constructBracketFromNodes(nodes, this.playoffId);
            });
          });
        });
      });

      this._playerService.getPlayers().subscribe((players) => {
          this.players = players;
          if (this.tournyType === 'doubles') {
            this._teamService.getTeams(this.tournamentId).subscribe((teams) => {
              this.teams = teams;
            });
          }
      });

    }

    constructBracketFromNodes(nodes, playoffId) {
      this.nodes = JSON.parse(JSON.stringify(nodes));
      const root = nodes.shift();
      let tree;
      if (this.tournyType === 'singles') {
        tree = [{
          index: 1, a: root.player1Id, b: root.player2Id, aSeed: root.seed1,
          bSeed: root.seed2, children: []
        }];
      } else  {
        tree = [{
          index: 1, a: root.team1Id, b: root.team2Id, aSeed: root.seed1,
          bSeed: root.seed2, children: []
        }];
      }
      this.buildJSONTree(tree, nodes);
      this.buildD3Graph(tree);
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
        if (this.tournyType === 'singles') {
          parent.children.push({
            index: node.nodeIndex, a: node.player1Id, b: node.player2Id,
            aSeed: node.seed1, bSeed: node.seed2, children: []
          });
        } else {
          parent.children.push({
            index: node.nodeIndex, a: node.team1Id, b: node.team2Id,
            aSeed: node.seed1, bSeed: node.seed2, children: []
          });
        }
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
    const margin = {top: 0, right: 90, bottom: 50, left: 150},
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
    const gameTemplate = (d) => {
      return '' +
        '<div class=\'node-row\'>' +
        '<span class=\'cell seed\'>' + (d.data.aSeed || ' ') + '</span>' +
        '<span class=\'cell name\'>' + (this.convertToName(d.data.a) || ' ') + '</span>' +
        '</div>' +
        '<div class=\'node-row\'>' +
        '<span class=\'cell seed\'>' + (d.data.bSeed || ' ') + '</span>' +
        '<span class=\'cell name\'>' + (this.convertToName(d.data.b) || ' ') + '</span>' +
        '</div>';
    };

    const labels = d3.select('#labels').selectAll('div')
      .data(nodes.descendants())
      .enter()
      .append('div')
      .classed('node', true)
      .style('left', d => (width - d.y + margin.left - 100) + 'px')
      .style('top', d => (d.x - 40) + 'px')
      .html(d => gameTemplate(d));

    labels.exit();

    const labelDivs = d3.select('#labels').selectAll('div');
    if (!this.tournament.ended) {
      labels.filter((div) => div.data.a && div.data.b).classed('node clickable', true).on('click', (node) => {
        this.enterPlayoffGame(node);
      });
    }
  }

  enterPlayoffGame(node) {
    this.currentNode = node;
    this.currentGame = this.tournyType === 'singles' ?
      this.currentGame = this.playoffGames.find((game) => game.player1Id === node.data.a && game.player2Id === node.data.b)
      : this.currentGame = this.playoffGames.find((game) => game.team1Id === node.data.a && game.team2Id === node.data.b);
    if (!this.currentGame) {
      this.currentGame = this.tournyType === 'singles' ?
        this.currentGame = this.playoffGames.find((game) => game.player1Id === null && game.player2Id === null)
        : this.currentGame = this.playoffGames.find((game) => game.team1Id === null && game.team2Id === null);
    }
    if (this.tournyType === 'singles') {
      this.currentGame.player1Id = node.data.a;
      this.currentGame.player2Id = node.data.b;
    } else {
      this.currentGame.team1Id = node.data.a;
      this.currentGame.team2Id = node.data.b;
    }
    this.openModal();
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
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.playoffModal.nativeElement.className = 'modal';
  }

  updateD3Graph() {
    if (this.currentNode.data.index === 1) {
      this.tournament.winner = this.currentGame.winner;
      if (this.tournyType === 'singles') {
        this._tournyService.updateSinglesTournamentWinner(this.tournamentId, this.currentGame.winner,
          this.convertToName(this.currentGame.winner)).subscribe();
      } else {
        this._tournyService.updateDoublesTournamentWinner(this.tournamentId, this.currentGame.winner,
          this.convertToName(this.currentGame.winner)).subscribe();
      }
    } else {
      const parentIndex = this.nodes.findIndex((node) => node.nodeIndex === Math.ceil((this.currentNode.data.index - 1) / 2));
      if (this.currentNode.data.index % 2 === 0) {
        this.tournyType === 'singles' ? this.nodes[parentIndex].player1Id = this.currentGame.winner
          : this.nodes[parentIndex].team1Id = this.currentGame.winner;
        this.nodes[parentIndex].seed1 = this.currentNode.data.aSeed;
      } else {
        this.tournyType === 'singles' ? this.nodes[parentIndex].player2Id = this.currentGame.winner
          : this.nodes[parentIndex].team2Id = this.currentGame.winner;
        this.nodes[parentIndex].seed2 = this.currentNode.data.bSeed;
      }
      this.tournyType === 'singles' ? this._bracketService.updateSinglesParentNode(this.nodes[parentIndex]).subscribe()
        : this._bracketService.updateDoublesParentNode(this.nodes[parentIndex]).subscribe();
      const newNodes = JSON.parse(JSON.stringify(this.nodes));
      d3.select('#labels').selectAll('div').remove();
      this.constructBracketFromNodes(newNodes, this.playoffId);
    }
  }

  submitGame() {
    this.updateD3Graph();
    if (this.validateGame()) {
      this.updateBtn.nativeElement.innerText = 'Updating...';
      this.updateBtn.nativeElement.className = 'app-btn';
      const call = this.tournyType === 'singles' ? this._gameService.updateSinglesGame(this.currentGame)
        : this._gameService.updateDoublesGame(this.currentGame);
      call.subscribe(() => {
        this.updateBtn.nativeElement.innerText = 'Updated';
        this.updateBtn.nativeElement.className = 'app-btn confirmed';
        this.playoffModal.nativeElement.className = 'modal hidden';
      });
    }
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
        const foundTeam = this.teams.find((team) => team.id === id);
        return this.players.find((player) => player.id === foundTeam.player1Id).name
          + ', ' + this.players.find((player) => player.id === foundTeam.player2Id).name;
      }
    } else {
      return undefined;
    }
  }

  endTournament() {
      const endObs = this.tournyType === 'singles ' ?
        this._tournyService.updateSinglesTournamentEnded(this.tournamentId)
        : this._tournyService.updateDoublesTournamentEnded(this.tournamentId);
      endObs.subscribe((resp) => {
        this.router.navigateByUrl('/winner/' + this.tournyType + '/' + this.tournamentId + '/' + this.tournament.winner);
      });
  }
}
