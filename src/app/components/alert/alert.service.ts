import { AlertInterface } from './data/alert.interface';
import { Injectable } from '@angular/core';

@Injectable()
export class AlertService 
{
    public alerts:Array<AlertInterface> = [];

    constructor()
    {
    }

    public add(alert:AlertInterface):void
    {
        this.alerts.push(alert);
    }

    public delete():void
    {
        // TODO: Delete referenced alert lol
        this.alerts = [];
    }
}