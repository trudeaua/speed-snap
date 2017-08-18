import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { NgForm } from "@angular/forms/src/forms";
import { Storage } from "@ionic/storage";

@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {
  provinces: any[];
  selectedProvince: string;
  defaultUnits: string;
  constructor(private storage: Storage, private viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.provinces = [{ abbrev: "AB", name: "Alberta" }, { abbrev: "BC", name: "British Columbia" }, { abbrev: "MB", name: "Manitoba" }, { abbrev: "NB", name: "New Brunswick" }, { abbrev: "NL", name: "Newfoundland & Labrador" }, { abbrev: "NT", name: "Northwest Territories" }, { abbrev: "NS", name: "Nova Scotia" }, { abbrev: "NU", name: "Nunavut" }, { abbrev: "ON", name: "Ontario" }, { abbrev: "PE", name: "Prince Edward Island" }, { abbrev: "QC", name: "Quebec" }, { abbrev: "SK", name: "Saskatchewan" }, { abbrev: "YT", name: "Yukon Territory" }];
  }
  /**
   * Process a form's data fields
   * @param form form containing data to be processed
   */
  process(form: NgForm) {
    if (form.value.nameInput && form.value.companyNameInput && form.value.addressInput && form.value.cityInput && form.value.postalInput && this.selectedProvince && this.defaultUnits) {
      console.log(form.value.nameInput);
      let settings = {
        address: form.value.addressInput,
        companyName: form.value.companyNameInput,
        city: form.value.cityInput,
        postalCode: form.value.postalInput,
        province: this.selectedProvince,
        telephone: form.value.phoneInput ? form.value.phoneInput : null,
        email: form.value.emailInput ? form.value.emailInput : null,
        name: form.value.nameInput,
        defaultUnits: this.defaultUnits
      };
      this.storage.set('settings', settings);
      //form data processed, so set the welcome screen presented as true
      this.storage.set('welcomeScreenPresented', true);
      this.viewCtrl.dismiss().then(() => console.log('view dismissed')).catch(err => console.error(err));
      console.log('submitted!');
    }
  }

}