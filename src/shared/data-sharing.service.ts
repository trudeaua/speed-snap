import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
@Injectable()
export class DataSharingService {
    items: any[];
    address: string;
    city: string;
    companyName: string;
    postalCode: string;
    province: string;
    telephone: string;

    counter: number;
    constructor(private storage: Storage) {
        this.items = [];
    }
    /**
     * get survey items
     */
    getItems() {
        return this.items;
    }
    /**
     * set survey items
     * @param items survey items to be set
     */
    setItems(items: any[]) {
        this.items = items;
    }
    /**
     * add another item to the session items
     * @param item new survey item
     */
    addItem(item: any) {
        this.items.push(item);
    }
    /**
     * remove an item from the session
     * @param item item to be removed
     */
    removeItem(item) {
        let index = this.getItemIndexById(item.id, this.items);
        this.items.splice(index, 1);
    }
    /**
     * return a survey item by its id
     * @param id id number of the survey item
     * @param array an array of survey items
     */
    getItemIndexById(id, array: any[]) {
        for (let i = 0; i < array.length; i++) {
            if (id == array[i].id) {
                return i;
            }
        }
        return null;
    }
    /**
     * replace a survey item with another
     * @param item new survey item
     * @param index index of the survey item in the items array
     */
    replaceItem(item: any, index: number) {
        this.items[index] = item;
    }
    /**
         * calculate the surface area of the sign
         * @param height height of the sign
         * @param width width of the sign
         * @param heightUnits units of the sign height
         * @param widthUnits units of the sign width
         */
    calcArea(height: number, width: number, heightUnits: string, widthUnits: string) {
        if (heightUnits == widthUnits && heightUnits == 'cm') {
            return (height / 100 / 3.28084 * width / 100 / 3.28084).toFixed(2) + ' sq ft.';
        }
        else if (heightUnits == widthUnits && heightUnits == 'm') {
            return (height / 3.28084 * width / 3.28084).toFixed(2) + ' sq ft.';
        }
        else if (heightUnits == widthUnits && heightUnits == 'in') {
            return (height / 12 * width / 12).toFixed(2) + ' sq ft.';
        }
        else if (heightUnits == widthUnits && heightUnits == 'ft') {
            return (height * width).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'cm' && widthUnits == 'm') || (widthUnits == 'cm' && heightUnits == 'm')) {
            return (height / 100 / 3.28084 * width / 3.28084).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'cm' && widthUnits == 'in') || (widthUnits == 'cm' && heightUnits == 'in')) {
            return (height / 100 / 3.28084 * width / 12).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'cm' && widthUnits == 'ft') || (widthUnits == 'cm' && heightUnits == 'ft')) {
            return (height / 100 / 3.28084 * width).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'm' && widthUnits == 'in') || (widthUnits == 'm' && heightUnits == 'in')) {
            return (height / 3.28084 * width / 12).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'm' && widthUnits == 'ft') || (widthUnits == 'm' && heightUnits == 'ft')) {
            return (height / 3.28084 * width).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'in' && widthUnits == 'ft') || (widthUnits == 'in' && heightUnits == 'ft')) {
            return (height / 12 * width).toFixed(2) + ' sq ft.';
        }
    }
    /**
     * set past and present sessions to storage
     * @param sessions previous sessions
     */
    setSessionsToStorage(sessions: any) {
        return new Promise(resolve => {
            this.storage.set('sessionsInProgress', sessions).then(() => {
                resolve();
            });
        });
    }
    /**
     * find the index of a session by its id
     * @param id id number of a session
     * @param sessions array of sessions
     */
    getSessionIndexById(id: number, sessions: any[]) {
        for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].id == id) {
                return i;
            }
        }
        return null;
    }
    /**
     * get the current date
     */
    getCurrentDate() {
        let months = ["January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October",
            "November", "December"];
        let d = new Date();
        return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }
}