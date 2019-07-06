import { Component, OnInit } from '@angular/core';
import { Tournament } from './tournament';
import { HttpModule, JsonpModule } from '@angular/http';
import { TournamentService } from '../Services/tournament.service';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Config } from 'protractor';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';
import {SinglesTournament} from './singles-tournament';
import {DoublesTournament} from './doubles-tournament';

@Component({
  selector: 'cr-tournaments',
  templateUrl: './tournament-list.component.html',
})

export class TournamentListComponent implements OnInit {

  public singlesTournaments: SinglesTournament[];
  public doublesTournaments: DoublesTournament[];

  constructor(public _tournyService: TournamentService, private http: HttpClient, private router: Router) {
  }

  playoffDefined(id): boolean {
    return this._tournyService.getPlayoff(id) !== undefined;
  }

  viewPlayoff(e, id) {
    e.preventDefault();
    this.router.navigateByUrl('/playoffs/' + id);
  }

  // delete(e, tournament) {
  //   e.preventDefault();
  //   swal({
  //     title: "Delete Tournament",
  //     text: "Are you sure you wish to delete this tournament? You will lose all associated game results. Player stats resulting from the tournament will be preserved.",
  //     buttons: [true, true],
  //   }).then((wantsToSave) => {
  //     if (wantsToSave) {
  //       this.tournaments = [];
  //       this._tournyService.deleteTournament(tournament, tournament.name).do(() => {
  //         this._tournyService.getTournaments().subscribe((tournaments) => {
  //           this.tournaments = tournaments;
  //         })
  //       }).subscribe();
  //     }
  //   });
  // }

  viewTournament(e, tournament) {
    e.preventDefault();
    if (tournament.singles) {
      this.router.navigateByUrl('/tournaments/singles/' + tournament.name);
    } else {
      this.router.navigateByUrl('/tournaments/doubles/' + tournament.name)
    }
  }

  ngOnInit() {
    this._tournyService.getSinglesTournaments().subscribe((tournaments) => {
      this.singlesTournaments = tournaments;
    });
    this._tournyService.getDoublesTournaments().subscribe((tournaments) => {
      this.doublesTournaments = tournaments;
    });
  }
}
