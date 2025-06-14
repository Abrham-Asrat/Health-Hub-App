import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActiveTabService {
  private activeTabSource = new BehaviorSubject<string>('');
  currentTab$ = this.activeTabSource.asObservable();

  setActiveTab(tab: string) {
    this.activeTabSource.next(tab);
  }
}
