import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityToggleComponent } from '../availability-status/availability-toggle/availability-toggle';
import { BreakModeComponent } from '../availability-status/break-mode/break-mode';
import { StatusSummaryComponent } from '../availability-status/status-summary/status-summary';

export interface StatusLog {
  status: 'Online' | 'Offline' | 'Break';
  timestamp: Date;
  note?: string;
  reason?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AvailabilityToggleComponent,
    BreakModeComponent,
    StatusSummaryComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  @ViewChild(StatusSummaryComponent) statusLogger!: StatusSummaryComponent;
  
  currentStatus: 'Online' | 'Offline' | 'Break' = 'Offline';
  currentTimestamp: Date = new Date();
  statusLogs: StatusLog[] = [];
  
  // Add these missing properties
  isOnline = false;
  isOnBreak = false;
  breakReason = '';

  changeStatus(newStatus: 'Online' | 'Offline' | 'Break', note?: string, reason?: string) {
    this.currentStatus = newStatus;
    this.currentTimestamp = new Date();
    
    // Update individual properties
    this.isOnline = newStatus === 'Online';
    this.isOnBreak = newStatus === 'Break';
    this.breakReason = reason || '';
    
    const newLog: StatusLog = {
      status: newStatus,
      timestamp: this.currentTimestamp,
      note,
      reason
    };
    
    this.statusLogs.unshift(newLog);
    
    if (this.statusLogs.length > 50) this.statusLogs.pop();
    
    if (this.statusLogger) {
      this.statusLogger.addNewLog(newLog);
    }
    
    console.log('Status changed to:', newStatus, 'at', this.currentTimestamp);
  }

  onAvailabilityChange(isOnline: boolean) {
    this.changeStatus(isOnline ? 'Online' : 'Offline', `Driver went ${isOnline ? 'online' : 'offline'}`);
  }

  onBreakModeChange(event: { isOnBreak: boolean, breakReason: string }) {
    this.changeStatus(
      event.isOnBreak ? 'Break' : 'Online', 
      event.isOnBreak ? 'Started break' : 'Ended break', 
      event.breakReason
    );
  }
}
