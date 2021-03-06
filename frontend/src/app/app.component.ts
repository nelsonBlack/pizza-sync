import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { LANGUAGES } from 'app/core/injection-tokens';
import { IStore } from 'app/shared/interfaces/store.interface';
import * as UiActions from 'app/shared/states/ui/ui.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    @Inject(LANGUAGES) public languages,
    private store$: Store<IStore>,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    // default and fallback language
    // if a translation isn't found in a language,
    // it'll try to get it on the default language
    // by default here, we take the first of the array
    this.translate.setDefaultLang(this.languages[0]);
    this.store$.dispatch(
      new UiActions.SetLanguage({ language: this.languages[0] })
    );

    // when the language changes in store,
    // change it in translate provider
    this.store$
      .select(state => state.ui.language)
      .pipe(
        takeUntil(this.onDestroy$),
        filter(language => !!language),
        tap(language => this.translate.use(language))
      )
      .subscribe();

    const safeLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      '/assets/img/github-logo.svg'
    );
    this.matIconRegistry.addSvgIcon('github', safeLogo);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
