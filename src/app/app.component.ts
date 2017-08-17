import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from "@ionic/storage";

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(events: Events, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      this.storage.get('sessionInProgress').then((sessionData: any) => {
        if (sessionData != null) {
          console.log(sessionData);
          events.publish('loadPreviousSession', sessionData);
        }
      });
    });
  }
}

