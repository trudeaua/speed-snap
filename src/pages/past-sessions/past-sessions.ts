import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from "@ionic/storage";

@Component({
  selector: 'page-past-sessions',
  templateUrl: 'past-sessions.html',
})
export class PastSessionsPage {
  sessionsData: any[];

  constructor(private storage: Storage, public navCtrl: NavController, private viewCtrl: ViewController, public navParams: NavParams) {
    this.sessionsData = navParams.data;
  }
  /**
   * open a previous session
   * @param session a previous session
   */
  openSession(session: any) {
    this.viewCtrl.dismiss(session);
  }
  /**
   * remove a session from storage
   * @param session session to be deleted
   */
  deleteSession(session: any) {
    let index = this.getSessionIndexById(session.id);
    if (index != null) {
      this.sessionsData.splice(index, 1);
      this.storage.set('sessionsInProgress', this.sessionsData);
    }
  }
  /**
   * start a new session
   */
  newSession() {
    let client = { name: null, companyName: null, address: null, telephone: null, email: null };
    let d = new Date();
    let id = d.getTime();
    let items = [];
    this.viewCtrl.dismiss({ client: client, items: items, id: id });
  }
  /**
   * get a session by a unique id number
   * @param id a session id number
   */
  getSessionIndexById(id: number) {
    for (let i = 0; i < this.sessionsData.length; i++) {
      if (this.sessionsData[i].id == id) {
        return i;
      }
    }
    return null;
  }
}
