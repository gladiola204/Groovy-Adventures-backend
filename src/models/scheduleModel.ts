import { Schema, model } from "mongoose"
import { IScheduleDocument, IScheduleModel } from "../types/schedule.interface";

const scheduleSchema = new Schema<IScheduleDocument, IScheduleModel>({
    tourId: {
        type: Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Please add a tour ID'],
    },
    startDate: {
        type: Date,  // np. new Date('2023-07-01'),
        required: [true, "Please add a start date of journey"]
    },
    endDate: {
        type: Date,
        required: [true, "Please add an end date of journey"]
    },
    price: {
        type: Number,
        required: [true, "Please add a price"]
    },
    availability: {
        type: Number,
        required: [true, "Please add a quantity"],
    },
    lastMinute: {
        isLastMinute: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            required: function(this: IScheduleDocument) {
                if(this.lastMinute.isLastMinute === true) {
                    return [true, 'Please add a expires date of Last Minute']
                };
                return false;
            },
        },
    },
    discount: {
        isDiscounted: {
            type: Boolean,
            default: false,
        },
        percentageOfDiscount: {
            type: Number,
            required: function(this: IScheduleDocument) {
                if(this.discount.isDiscounted === true) {
                    return [true, 'Please add a percentage of discount']
                };
                return false;
            },
        },
        expiresAt: {
            type: Date,
            required: function(this: IScheduleDocument) {
                if(this.discount.isDiscounted === true) {
                    return [true, 'Please add an expires date']
                };
                return false;
            },
        },
    }
});

const Schedule = model("Schedule", scheduleSchema);

export default Schedule;