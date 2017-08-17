import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { DataSharingService } from "../../shared/data-sharing.service";
import { NgForm } from "@angular/forms/src/forms";
import { Storage } from "@ionic/storage";
declare var cordova: any;

@Component({
    selector: 'page-review',
    templateUrl: 'review.html',
})
export class ReviewPage {
    client: any;
    editingIndex: number;
    enableExportBtn: boolean = false;
    location: string;
    name: string;
    newHeightUnits: string;
    newWidthUnits: string;
    oldHeight: number;
    oldQuantity: number;
    oldWidth: number;
    settings: any;
    showEditForm: boolean;
    surveyItems: any[];
    surveyType: string;
    constructor(private alertCtrl: AlertController, private toastCtrl: ToastController, private dataSharing: DataSharingService, private storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
        this.client = navParams.data.client;
        this.name = navParams.data.name;
        this.location = navParams.data.location;
        this.surveyType = navParams.data.surveyType;
        this.surveyItems = dataSharing.getItems();
        console.log(navParams.data);
        storage.get('settings').then(settings => {
            this.settings = settings;
            console.log(settings);
        });
        storage.get('editEntryTipPresented').then((val: boolean) => {
            if (!val) {
                this.toastCtrl.create({
                    message: 'Press & hold entries to edit them',
                    position: 'middle',
                    showCloseButton: true,
                    closeButtonText: 'Got it'
                }).present().then(() => {
                    this.storage.set('editEntryTipPresented', true);
                });
            }
        })
        console.log(this.surveyItems);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReviewPage');
        if (this.surveyItems.length > 0) {
            this.enableExportBtn = true;
        }
    }

    deleteEntry(item) {
        this.alertCtrl.create({
            title: 'Remove Entry',
            subTitle: 'Do you really want to remove this entry?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.dataSharing.removeItem(item);
                        this.showEditForm = false;
                    }
                }
            ]
        }).present();
    }

    editEntry(item, index) {
        this.showEditForm = true;
        this.editingIndex = index;
        this.oldHeight = Number.parseInt(item.height);
        this.oldWidth = Number.parseInt(item.width);
        this.oldQuantity = Number.parseInt(item.quantity);
        this.newHeightUnits = item.heightUnits;
        this.newWidthUnits = item.widthUnits;
    }

    saveChanges(form: NgForm) {
        form.value.newHeightInput ? this.surveyItems[this.editingIndex].height = form.value.newHeightInput : this.surveyItems[this.editingIndex].height = this.oldHeight;
        form.value.newHeightInput ? this.surveyItems[this.editingIndex].width = form.value.newWidthInput : this.surveyItems[this.editingIndex].width = this.oldWidth;
        form.value.newHeightInput ? this.surveyItems[this.editingIndex].quantity = form.value.newQtyInput : this.surveyItems[this.editingIndex].quantity = this.oldQuantity;
        this.surveyItems[this.editingIndex].widthUnits = this.newWidthUnits;
        this.surveyItems[this.editingIndex].heightUnits = this.newHeightUnits;
        this.editingIndex = null;
        this.showEditForm = false;
    }
    //gen PDF
    toPdf() {
        let pdfItems = '';
        for (let i = 0; i < this.surveyItems.length; i++) {
            pdfItems += `<table style="width: 100%" class="nobreak">
            <tr>
                <td style="width: 15%" class="session-item-td">` + (i + 1) + `</td>
                <td style="width: 50%" class="session-item-td">
                    <img style="width: 100%" src="` + this.surveyItems[i].image + `" alt="img">
                </td>
                <td style="width:35%" class="session-item-td">
                    ` + this.surveyItems[i].signType + `
                    <p>Notes: ` + this.surveyItems[i].htmlNotes + `</p>
                    <p>Dimensions:<br>
                        <ul>
                            <li>Height: `+ this.surveyItems[i].height + ' ' + this.surveyItems[i].heightUnits + `</li>
                            <li>Width: ` + this.surveyItems[i].width + ' ' + this.surveyItems[i].widthUnits + `</li>
                            <li>Quantity: `+ this.surveyItems[i].quantity + `</li>
                        </ul>
                    </p>
                </td>
            </tr>
        </table>`
        }

        let date = new Date;
        let contactInfo = "";
        this.client.companyName ? contactInfo += "<li>"+ this.client.companyName + "</li>" : null;
        this.client.address ? contactInfo += "<li>"+ this.client.address + "</li>" : null;
        this.client.telephone ? contactInfo += "<li>"+ this.client.telephone + "</li>" : null;
        this.client.email ? contactInfo += "<li>"+ this.client.email + "</li>" : null;
        let d = date.toDateString().slice(date.toDateString().indexOf(' '));
        cordova.plugins.pdf.htmlToPDF({
            data: `<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        body {
            font-family: 'Arial', 'sans-serif';
            position: relative;
            margin-left: 90px;
            margin-right: 90px;
        }

        .nobreak {
            page-break-inside: avoid;
        }

        #page-header {
            width: 100%;
        }

        .page-header-table {
            font-size: 12px !important;
        }

        #main-content {
            position: absolute;
            width: 100%;
            top: 350px;
        }

        .session-item-td {
            border: 1px solid black;
            vertical-align: top;
            padding-left: 5px;
            padding-right: 5px;
            padding-top: 5px;
            font-size: 12px;
        }

        #contact-info-container {
            list-style-type: none;
            font-size: 12px;
            text-align: left;
            vertical-align: top;
            padding-left: 91px;
        }
    </style>
</head>

<body>
    <table style="width: 100%">
        <tr>
            <td style="vertical-align:top; width: 60%; text-align: left">
                <img style="width:80%;" src="https://www.speedprocanada.com/images/default-source/default-album/new-speedpro-imaging.jpg?sfvrsn=4" alt="logo">
                <ul id="contact-info-container">
                    <li>`+ this.settings.companyName + `</li>
                    <li>`+ this.settings.address + `</li>
                    <li>T `+ this.settings.telephone + `</li>
                    <li>E ` + this.settings.email + `</li>
                </ul>
            </td>
            <td style="vertical-align:top; width: 40%; text-align: right">
                <h2>Site Survey</h2>
            </td>
        </tr>
    </table><br>
    <table id="page-header" class="page-header-table">
        <tr>
            <td style="vertical-align:top">Client:</td>
            <td style="vertical-align:top">` + this.client.name + `</td>
            <td style="vertical-align:top"></td>
        </tr>
        <tr>
            <td style="vertical-align:top">Location:</td>
            <td style="vertical-align: top">
                <ul style="display: inline;list-style-type: none;">
                    <li>`+ this.client.companyName +`</li>
                    <li>`+ this.client.address +`</li>
                    <li>T `+ this.client.telephone +`</li>
                    <li>E `+ this.client.email +`</li>
                </ul>
            </td>
            <td style="vertical-align:bottom">Inspected By:</td>
        </tr>
        <tr>
            <td style="vertical-align:top">Date Visited</td>
            <td style="vertical-align:top">` + d + `</td>
            <td style="vertical-align:top">`+ this.settings.name + `</td>
        </tr>
    </table>
    <div id="main-content">
        ` + pdfItems + `
    </div>
</body>

</html>`,
            type: "share",
            landscape: "portrait",
            documentSize: "A4"
        }, (success) => console.log('success', success), (err) => console.error('error', err));
    }

}
