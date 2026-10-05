import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'custom-search-bar-container-after',
  imports: [],
  templateUrl: './search-bar-container-after.component.html',
  styleUrl: './search-bar-container-after.component.scss'
})
export class SearchBarContainerAfterComponent implements OnInit {

  @HostBinding('style.display') display = 'none'; // masqué par défaut

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const isOnHomepage = !!this.elementRef.nativeElement.closest('.custom-search-bar-container');
    this.display = isOnHomepage ? '' : 'none';
  }
}
