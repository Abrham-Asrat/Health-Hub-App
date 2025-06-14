import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-a-setting',
  imports: [CommonModule, FormsModule],
  templateUrl: './a-setting.component.html',
  styleUrl: './a-setting.component.css'
})
export class ASettingComponent {
  admin = {
    name: 'Admin User',
    email: 'admin@ehealth.com',
  };

  password = {
    current: '',
    new: '',
    confirm: '',
  };

  platformSettings = {
    siteTitle: 'eHealth Platform',
    maintenanceMode: false,
  };

  notificationsSettings = {
    chatNotifications: true,
    commentNotifications: true,
    appointmentReminders: true,
    paymentNotifications: true,
  };

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  showMessage(text: string, type: 'success' | 'error' = 'success') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 3000);
  }

  updateAdminInfo() {
    this.showMessage('Admin info updated successfully!', 'success');
  }

  updatePassword() {
    if (!this.password.current || !this.password.new || !this.password.confirm) {
      this.showMessage('All password fields are required.', 'error');
      return;
    }

    if (this.password.new !== this.password.confirm) {
      this.showMessage('New passwords do not match!', 'error');
      return;
    }

    if (this.password.new.length < 8) {
      this.showMessage('New password must be at least 8 characters long.', 'error');
      return;
    }

    if (this.password.current === this.password.new) {
      this.showMessage('New password must be different from current password.', 'error');
      return;
    }

    this.showMessage('Password updated successfully!', 'success');
    this.password = { current: '', new: '', confirm: '' };
  }

  updatePlatformSettings() {
    this.showMessage('Platform settings saved!', 'success');
  }

  updateNotifications() {
    this.showMessage('Notification settings updated!', 'success');
  }
}
