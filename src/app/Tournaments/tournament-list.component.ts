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
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

@Component({
  selector: 'cr-tournaments',
  templateUrl: './tournament-list.component.html',
})

export class TournamentListComponent implements OnInit {

  public singlesTournaments: SinglesTournament[];
  public doublesTournaments: DoublesTournament[];

  constructor(public _tournyService: TournamentService, private http: HttpClient, private router: Router) {
  }

  ngOnInit() {
    this.refreshTournamentList();
  }

  refreshTournamentList() {
    this._tournyService.getSinglesTournaments().subscribe((tournaments) => {
      this.singlesTournaments = tournaments;
    });
    this._tournyService.getDoublesTournaments().subscribe((tournaments) => {
      this.doublesTournaments = tournaments;
    });
  }

  viewPlayoff(e, tournament) {
    if (e) e.preventDefault();
    if (this.singlesTournaments.includes(tournament)) {
      this.router.navigateByUrl('/playoffs/singles/' + tournament.id);
    } else {
      this.router.navigateByUrl('/playoffs/doubles/' + tournament.id);
    }
  }

  deleteTournament(tournament) {
      this._tournyService.deleteTournament(tournament, tournament.name).pipe(
        tap((res) => {
          console.log('Delete tournament result:');
          console.dir(res);
          this.refreshTournamentList();
        },
        catchError((err, obs) => {
          console.error(err);
          return of(err, obs);
        }))
      ).subscribe();
  }

  viewTournament(e, tournament) {
    if (e) e.preventDefault();
    if (tournament.playoffsStarted) {
      this.viewPlayoff(e, tournament);
    } else {
      if (this.singlesTournaments.includes(tournament)) {
        this.router.navigateByUrl('/tournaments/singles/' + tournament.name + '/' + tournament.id + '/' + tournament.currentRound);
      } else {
        this.router.navigateByUrl('/tournaments/doubles/' + tournament.name + '/' + tournament.id + '/' + tournament.currentRound);
      }
    }
  }
}
