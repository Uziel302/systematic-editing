import { Component, OnInit } from '@angular/core';
import { TyposService } from '../typos/typos.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  loading: boolean = true;

  constructor(
    public typosService: TyposService,
  ) { }

  ngOnInit(): void {
    this.typosService.getStats();
  }

}
