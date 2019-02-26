import { AlertService } from './alert.service';
import { isNullOrUndefined } from 'util';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, AfterViewInit{

    @Input()
    public type:string;

    @Input()
    public dismiss:number;

    @Input()
    public message:string;

    constructor(private alertService:AlertService) 
    { 
        this.dismiss = isNullOrUndefined(this.dismiss)?60000 :this.dismiss;
    }

    public ngOnInit(): void { }
    public ngAfterViewInit(): void
    {
        setTimeout(()=>
        {
            this.alertService.delete();
        },this.dismiss)
    }
}
