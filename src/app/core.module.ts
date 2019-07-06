import { NgModule, Optional, SkipSelf } from '@angular/core';
import { PlayerService } from './Services/player.service';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { TournamentService } from './Services/tournament.service';
import { BracketService } from './Services/bracket.service';
import { EloService } from './Services/elo.service';
import { GameService } from './Services/game.service';
import {TournamentSetupService} from './Services/tournament-setup.service';

@NgModule({
    providers: [PlayerService, TournamentService, BracketService, EloService, GameService, TournamentSetupService]
})
export class CoreModule {
    constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
          throw new Error(
            'CoreModule is already loaded. Import it in the AppModule only');
        }
      }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule
        };
      }

}
