// import { inject } from '@angular/core';
// import { Router, CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
  
//   // Check if token exists in localStorage
//   const token = localStorage.getItem('token');
//   const userRole = localStorage.getItem('userRole');

//   if (!token) {
//     // No token found, redirect to Dashboard where login modal is
//     router.navigate(['/Dashboard']);
//     return false;
//   }

//   // Check if user is trying to access the correct role-based route
//   const requestedRole = state.url.split('/')[1]; // Gets 'Doctor' or 'Patient' from URL
//   if (requestedRole && userRole?.toLowerCase() !== requestedRole.toLowerCase()) {
//     // User is trying to access a route they don't have permission for
//     router.navigate([userRole || '/Dashboard']);
//     return false;
//   }

//   return true;
// };
