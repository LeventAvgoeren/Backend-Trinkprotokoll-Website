import { Schema, Types, model } from "mongoose";

export interface IProtokoll{
    patient:string;
    datum:Date;
    public?:boolean;
    closed?:boolean;
    updatedAt:Date;
    ersteller:Types.ObjectId
}
//Patient und datum Kombination ist unique 
const protokollSchema = new Schema<IProtokoll>({
patient:{type:String,required:true},
datum:{type:Date,required:true},
public:{type:Boolean,default:false},
closed:{type:Boolean,default:false},
ersteller:{type:Schema.Types.ObjectId,ref:"Pfleger",required:true}
},
{timestamps:true}
)
export const Protokoll =model<IProtokoll>("Protokoll",protokollSchema)