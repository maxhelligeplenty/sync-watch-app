import { AlertService } from './alert.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'alert-panel',
    templateUrl: './alert-panel.component.html',
    styleUrls: ['./alert-panel.component.scss']
})
export class AlertPanelComponent implements OnInit {
    constructor(protected alertService:AlertService) { }

    ngOnInit(): void {}
}
