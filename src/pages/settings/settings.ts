import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { NgForm } from "@angular/forms/src/forms";
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  currentTelephone: string;
  currentPostalCode: string;
  currentCity: string;
  currentCompanyName: string;
  currentAddress: string;
  currentEmail: string;
  settings: any;
  provinces: { abbrev: string; name: string; }[];
  currentName: string;
  defaultUnits: string;
  currentProvince: string;
  constructor(private storage: Storage, private toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    this.provinces = [{ abbrev: "AB", name: "Alberta" }, { abbrev: "BC", name: "British Columbia" }, { abbrev: "MB", name: "Manitoba" }, { abbrev: "NB", name: "New Brunswick" }, { abbrev: "NL", name: "Newfoundland & Labrador" }, { abbrev: "NT", name: "Northwest Territories" }, { abbrev: "NS", name: "Nova Scotia" }, { abbrev: "NU", name: "Nunavut" }, { abbrev: "ON", name: "Ontario" }, { abbrev: "PE", name: "Prince Edward Island" }, { abbrev: "QC", name: "Quebec" }, { abbrev: "SK", name: "Saskatchewan" }, { abbrev: "YT", name: "Yukon Territory" }];
    this.settings = {};
    //get current settings from storage
    storage.get('settings').then((settings: any) => {
      if (settings) {
        this.settings = settings;
        this.defaultUnits = settings.defaultUnits;
        this.currentName = settings.name;
        this.currentAddress = settings.address;
        this.currentCompanyName = settings.companyName;
        this.currentCity = settings.city;
        this.currentEmail = settings.email;
        this.currentPostalCode = settings.postalCode;
        this.currentTelephone = settings.telephone;
        this.currentProvince = settings.province;
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }
  /**
   * save the users settings to storage
   * @param form form with data to be processed
   */
  saveSettings(form: NgForm) {
    if (form.value.userNameInput && form.value.companyNameInput && form.value.cityInput && form.value.addressInput && form.value.postalInput && form.value.phoneInput) {
      this.settings.name = form.value.userNameInput;
      this.settings.companyName = form.value.companyNameInput;
      this.settings.city = form.value.cityInput;
      this.settings.email = form.value.emailInput;
      this.settings.address = form.value.addressInput;
      this.settings.telephone = form.value.phoneInput;
      this.settings.postalCode = form.value.postalInput;
      this.settings.province = this.currentProvince;
      this.settings.defaultUnits = this.defaultUnits;

      this.storage.set('settings', this.settings);

      this.toastCtrl.create({
        message: 'Changes Saved.',
        duration: 2000
      }).present().then(() => {
        this.closeModal();
      });
    }
  }
  /**
   * close the settings modal
   */
  closeModal() {
    this.viewCtrl.dismiss().then(() => console.log('view dismissed')).catch(err => console.log(err));
  }

}
