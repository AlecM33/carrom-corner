import { Component, OnInit } from '@angular/core';
import { Tournament } from './tournament';
import { HttpModule, JsonpModule } from '@angular/http';
import { TournamentService } from './tournament.service';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Config } from 'protractor';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';

@Component({
  selector: 'cr-tournaments',
  templateUrl: './tournament-list.component.html',
})

export class TournamentListComponent implements OnInit {

  public tournaments = [];
  
  constructor(public ts: TournamentService, private http: HttpClient, private router: Router) { 
  }

  playoffDefined(id): boolean {
    return this.ts.getPlayoff(id) !== undefined;
  }

  viewPlayoff(id) {
    this.router.navigateByUrl('/playoffs/' + id);
  }

  delete(tournament) {
    if(confirm('Delete this bracket?')) {
      this.tournaments = [];
      this.ts.deleteTournament(tournament, tournament.name).do(() => {
          this.ts.getTournaments().subscribe((tournaments) => {
            this.tournaments = tournaments;
          })
      }).subscribe();
    }
  }

  viewTournament(tournament) {
    if (tournament.singles) {
      this.router.navigateByUrl('/tournaments/singles/' + tournament.name);
    } else {
      this.router.navigateByUrl('/tournaments/doubles/' + tournament.name)
    }
  }
  
  ngOnInit() {
    this.ts.getTournaments().subscribe((tournaments) => {
      this.tournaments = tournaments;
    });
  }
}