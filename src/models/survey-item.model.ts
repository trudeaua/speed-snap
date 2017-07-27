export class SurveyItem {
    public height: number;
    public width: number;
    public quantity: number;
    public signType: string;
    public notes: string[];
    public image: string;
    public heightUnits: string;
    public widthUnits: string;

    constructor(height: number, width: number, quantity: number, signType: string, notes: string[], image: string, heightUnits: string, widthUnits) {
        this.height = height;
        this.width = width;
        this.quantity = quantity;
        this.signType = signType;
        this.notes = notes;
        this.image = image;
        this.heightUnits = heightUnits;
        this.widthUnits = widthUnits;
    }
    /**
     * calculate the surface area of the sign
     * @param height height of the sign
     * @param width width of the sign
     */
    calcArea(height: number, width: number, heightUnits: string, widthUnits: string) {
        if (heightUnits == widthUnits && (heightUnits == 'm' || heightUnits == 'cm')) {
            return (height * width).toFixed(2) + ' ' + heightUnits + '&#178;';
        }
        else if (heightUnits == widthUnits && (heightUnits == 'in' || heightUnits == 'ft')) {
            return (height * width).toFixed(2) + ' sq ' + heightUnits + '.';
        }
        else if ((heightUnits == 'm' && widthUnits == 'cm') || (heightUnits == 'cm' && widthUnits == 'm')) {
            return (height * width / 100).toFixed(2) + ' m&#178;';
        }
        else if ((heightUnits == 'in' && widthUnits == 'ft') || (heightUnits == 'ft' && widthUnits == 'in')) {
            return (height * width / 12).toFixed(2) + ' sq ft.';
        }
        else if ((heightUnits == 'ft' && widthUnits == 'm') || (heightUnits == 'm' && widthUnits == 'ft')) {
            return (height * 0.3048 * width).toFixed(2) + ' m&#178;';
        }
        else if ((heightUnits == 'in' && widthUnits == 'm') || (heightUnits == 'm' && widthUnits == 'in')) {
            return (height / 12 * 0.3048 * width).toFixed(2) + ' m&#178;';
        }
        else if ((heightUnits == 'cm' && widthUnits == 'ft') || (heightUnits == 'ft' && widthUnits == 'cm')) {
            return (height / 100 * width * 0.3048).toFixed(2) + ' m&#178;';
        }
        else if ((heightUnits == 'in' && widthUnits == 'cm') || (heightUnits == 'cm' && widthUnits == 'in')) {
            return (height / 12 * 0.3048 * width / 100).toFixed(2) + ' m&#178;';
        }
    }
}