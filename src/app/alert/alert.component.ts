import {Component, Input, OnInit} from '@angular/core';
import { Alert} from './alert.enum';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {


  @Input()
  message: string;

  @Input()
  type: string;


  constructor() { }

  ngOnInit() {
  }

  public get alert(): typeof Alert {
    return Alert;
  }

}
