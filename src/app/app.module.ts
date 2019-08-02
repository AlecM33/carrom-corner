import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppComponent } from './app.component';
import { Router, RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { PlayerListComponent } from './Players/player-list.component';
import { AddPlayerComponent } from './Players/add-player.component';
import { environment } from '../environments/environment';
import { AddTournamentComponent } from './Tournaments/add-tournament.component'
import { CoreModule } from './core.module';
import { TournamentListComponent } from './Tournaments/tournament-list.component';
import { PlayoffsComponent } from './Playoffs/playoffs.component';
import { WinnerComponent } from './Playoffs/winner.component';
import { HomepageComponent } from './Homepage/homepage-component';
import {NgbModule, NgbTooltip, NgbTooltipConfig} from '@ng-bootstrap/ng-bootstrap';
import { ViewPoolComponent } from './Pools/view-pool/view-pool.component';
import { ViewRoundComponent } from './Tournaments/view-round/view-round.component';
import {ModuleWithProviders} from '@angular/compiler/src/core';
import {PlayerService} from './Services/player.service';

@NgModule({
  declarations: [
    AppComponent, PlayerListComponent, AddPlayerComponent, AddTournamentComponent,
    TournamentListComponent, PlayoffsComponent,
    WinnerComponent, HomepageComponent, ViewPoolComponent, ViewRoundComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    JsonpModule,
    NgbModule,
    RouterModule.forRoot([
      { path: 'players/add', component: AddPlayerComponent },
      { path: 'players', component: PlayerListComponent},
      { path: 'tournament/:type/new', component: AddTournamentComponent},
      { path: 'tournaments', component: TournamentListComponent},
      { path: 'playoffs/:type/:tourny_id', component: PlayoffsComponent},
      { path: 'winner/:type/:tourny_id/:tourny_name/:winner_id', component: WinnerComponent},
      { path: 'tournaments/:type/:name/:tourny_id/:round', component: ViewRoundComponent},
      { path: 'tournaments/:type/:name/:tourny_id/:round/:round_id/:pool_id/:letter', component: ViewPoolComponent},
      { path: 'stats', component: HomepageComponent}
    ]),
    CoreModule.forRoot()
  ],
  providers: [ NgbTooltipConfig ],
  bootstrap: [AppComponent]
})
export class AppModule {}
