import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { Contacts, Contact, ContactField, ContactName, ContactAddress, ContactOrganization } from "@ionic-native/contacts";
import { NgForm } from "@angular/forms/src/forms";

@Component({
  selector: 'page-create-contact',
  templateUrl: 'create-contact.html',
})
export class CreateContactPage {
  contact: Contact;
  constructor(private toastCtrl: ToastController, private viewCtrl: ViewController, private contacts: Contacts, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateContactPage');
  }
  closeModal() {
    this.viewCtrl.dismiss(this.contact);
  }
  createContact(form: NgForm) {
    if (form.value.firstName && form.value.lastName && form.value.address) {
      this.contact = this.contacts.create();
      this.contact.name = new ContactName(form.value.firstName + ' ' + form.value.lastName, form.value.lastName, form.value.firstName);
      this.contact.addresses= [new ContactAddress(false, "work", form.value.address, form.value.address)];
      this.contact.displayName = form.value.firstName;
      this.contact.emails = [new ContactField("work", form.value.email, false)];
      this.contact.nickname = form.value.firstName;
      this.contact.organizations = [new ContactOrganization("other", form.value.companyName, null, null, false)];
      this.contact.phoneNumbers = [new ContactField("mobile", form.value.phoneNumber, false)];
      this.contact.save().then(() => {
        console.log("Conact saved!");
        this.closeModal();
      }).catch(err => console.error(err));
    }
    else {
      this.toastCtrl.create({
        message: 'Please complete all required fields.',
        duration: 1500,
        position: 'middle'
      }).present();
    }
  }

}
