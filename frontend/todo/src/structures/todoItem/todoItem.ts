export default class todoItem{
    title:string;
    description:string;
    idCompleted:boolean;
    deadLine?:Date;
    image?:string;

    constructor(
        title:string,
        description:string,
        idCompleted:boolean,
        image?:string
    ){
        this.title = title;
        this.description = description;
        this.idCompleted = idCompleted;
        this.image = image;
    }

    get_date_togo():string{
        if(this.deadLine == null){
            return "";
        }
        const razlika:number = this.deadLine.getTime() - Date.now();
        switch(razlika){
            case -1:
                return "Yesterday";
            case 0:
                return "Today";
            case 1:
                return "Tomorrow";
            case 7:
                return "One week";
            case 14:
                return "One fortnight";
            case 21:
                return "Three weeks";
            case 28:
                return "One month";
        }
        if(razlika < -1){
            return this.deadLine.getDate().toString();
        }
        if(razlika < 7){
            return this.deadLine.getDate().toString() + " - " + razlika.toString() + "d to go";
        }
        if(razlika < 30){
            const weeks:number = razlika%7;
            return this.deadLine.getDate().toString() + " - " + weeks.toString() + "weeks to go";
        }
        if(razlika < 365){
            const months:number = razlika%28;
            return this.deadLine.getDate().toString() + " - " + months.toString() + "months to go";
        }
        else{
            const years:number = razlika%28;
            return this.deadLine.getDate().toString() + " - " + years.toString() + "years to go";
        }
    }
}