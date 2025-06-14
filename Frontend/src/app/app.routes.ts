import { Routes } from '@angular/router';
import { DHomeComponent } from './Pages/DoctorRole/d-home/d-home.component';
import { DAppointmentComponent } from './Pages/DoctorRole/d-appointment/d-appointment.component';
import { DBlogComponent } from './Pages/DoctorRole/d-blog/d-blog.component';
import { DChatComponent } from './Pages/DoctorRole/d-chat/d-chat.component';
import { DContactComponent } from './Pages/DoctorRole/d-contact/d-contact.component';
import { DNotificationComponent } from './Pages/DoctorRole/d-notification/d-notification.component';
import { DProfileComponent } from './Pages/DoctorRole/d-profile/d-profile.component';
import { DLayoutComponent } from './Pages/DoctorRole/d-layout/d-layout.component';
import { LLayoutComponent } from './Pages/Landing/l-layout/l-layout.component';
import { LHomeComponent } from './Pages/Landing/l-home/l-home.component';
import { LContactComponent } from './Pages/Landing/l-contact/l-contact.component';
import { FaqComponent } from './Pages/Landing/l-faq/l-faq.component';
import { LBlogComponent } from './Pages/Landing/l-blog/l-blog.component';


import { PLayoutComponent } from './Pages/Patient/p-layout/p-layout.component';

import { PHomeComponent } from './Pages/Patient/p-home/p-home.component';
import { PAppointmentComponent } from './Pages/Patient/p-appointment/p-appointment.component';
import { PBlogComponent } from './Pages/Patient/p-blog/p-blog.component';
import { PChatComponent } from './Pages/Patient/p-chat/p-chat.component';

import { PContactUsComponent } from './Pages/Patient/p-contact-us/p-contact-us.component';
import { PNotificationComponent } from './Pages/Patient/p-notification/p-notification.component';
import { PProfileComponent } from './Pages/Patient/p-profile/p-profile.component';
import { LoginComponent } from './Pages/Landing/log-in/log-in.component';
import { SignUpComponent } from './Pages/Landing/sign-up/sign-up.component';
import { LAboutComponent } from './Pages/Landing/l-about/l-about.component';
import { PaymentComponent } from './Pages/Reusable/payment/payment.component';
import { authGuard } from './guard/auth.guard';
import { ALayoutComponent } from './Pages/admin/a-layout/a-layout.component';
import { AHomeComponent } from './Pages/admin/a-home/a-home.component';
import { AAppointmentComponent } from './Pages/admin/a-appointment/a-appointment.component';
import { ABlogComponent } from './Pages/admin/a-blog/a-blog.component';
import { AUserComponent } from './Pages/admin/a-user/a-user.component';
import { ASettingComponent } from './Pages/admin/a-setting/a-setting.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'Dashboard',
    pathMatch: 'full',
  },
  {
    path: 'Dashboard',
    component: LLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'Home',
      },
      {
        path: 'Home',
        component: LHomeComponent,
      },
      {
        path: 'Blog',
        component: LBlogComponent,
      },
      {
        path: 'About',
        component: LAboutComponent,
      },
      {
        path: 'Contact',
        component: LContactComponent,
      },
      {
        path: 'FAQ',
        component: FaqComponent,
      },
      {
        path: 'payment',
        component: PaymentComponent,
      },
      {
        path: 'logIn',
        component: LoginComponent,
      },
      {
        path: 'SignUp',
        component: SignUpComponent,
      },
    ],
  },

  {
    path: 'Doctor',
    component: DLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'Home',
      },
      { path: 'Home', component: DHomeComponent },
      { path: 'Appointment', component: DAppointmentComponent },
      { path: 'Blog', component: DBlogComponent },
      { path: 'Chat', component: DChatComponent },
      { path: 'Contact', component: DContactComponent },
      { path: 'Notification', component: DNotificationComponent },
      { path: 'Profile', component: DProfileComponent },
    ],
    canActivate: [authGuard]
  },
  {
    path: 'Patient',
    component: PLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'Home',
      },
      { path: 'Home', component: PHomeComponent },
      { path: 'Appointment', component: PAppointmentComponent },
      { path: 'Blog', component: PBlogComponent },
      { path: 'Chat', component: PChatComponent },
      { path: 'Contact', component: PContactUsComponent },
      { path: 'Notification', component: PNotificationComponent },
      { path: 'Profile', component: PProfileComponent },
    ],
    canActivate: [authGuard]
  },
  
  {
    path: 'Admin',
    component:ALayoutComponent,
    children: [
      {  path: '', redirectTo: 'Home' },
      {path: 'Home', component: AHomeComponent },
      {path: 'Appointment', component: AAppointmentComponent },
      {path: 'Blog', component: ABlogComponent },
      {path: 'User', component: AUserComponent},
      {path: 'Payment', component: AAppointmentComponent},
      {path: 'Setting', component: ASettingComponent},
      
    ]
  }
 
];
