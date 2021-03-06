import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { Configuration } from './app.constants';
import { routing } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { FlexLayoutModule } from '@angular/flex-layout';
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
    AuthModule,
    OidcSecurityService,
    ConfigResult,
    OidcConfigService,
    OpenIdConfiguration
} from 'angular-auth-oidc-client';

export function loadConfig(oidcConfigService: OidcConfigService) {
    console.log('APP_INITIALIZER STARTING');
    return () => oidcConfigService.load_using_stsServer('https://localhost:44318');
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        routing,
        HttpClientModule,
        AuthModule.forRoot(),
        FlexLayoutModule,
        StoreDevtoolsModule.instrument({
            maxAge: 25 //  Retains last 25 states
        }),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        MatToolbarModule,
        MatButtonModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        UnauthorizedComponent
    ],
    providers: [
        OidcSecurityService,
        OidcConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: loadConfig,
            deps: [OidcConfigService],
            multi: true
        },
        Configuration
    ],
    bootstrap:    [AppComponent],
})

export class AppModule {
    constructor(
        private oidcSecurityService: OidcSecurityService,
        private oidcConfigService: OidcConfigService,
    ) {
        this.oidcConfigService.onConfigurationLoaded.subscribe((configResult: ConfigResult) => {

            const config: OpenIdConfiguration = {
                stsServer: 'https://localhost:44318',
                redirect_url: 'https://localhost:44395',
                client_id: 'angularclient2',
                response_type: 'code',
                scope: 'dataEventRecords openid profile email',
                post_logout_redirect_uri: 'https://localhost:44395/unauthorized',
                start_checksession: false,
                silent_renew: true,
                silent_renew_url: 'https://localhost:44395/silent-renew.html',
                post_login_route: '/dm',
                forbidden_route: '/unauthorized',
                unauthorized_route: '/unauthorized',
                log_console_warning_active: true,
                log_console_debug_active: false,
                max_id_token_iat_offset_allowed_in_seconds: 10,
                history_cleanup_off: true
                // iss_validation_off: false
                // disable_iat_offset_validation: true
            };

            this.oidcSecurityService.setupModule(config, configResult.authWellknownEndpoints);
        });

        console.log('APP STARTING');
    }
}
