import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SignUpComponent } from '../../Landing/sign-up/sign-up.component';
import { Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [NgFor, SignUpComponent, NgClass, NgIf, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @Input() isLandingPage: boolean = false;

  constructor(private router: Router) {}
  book() {
    setTimeout(() => {
      this.router.navigate(['Patient/Appointment']);
    }, 1000);
  }
  // services
  services = [
    {
      icon: 'assets/icons/laboratory-microscope.svg',
      title: 'Well equipped lab',
    },
    {
      icon: 'assets/icons/ambulance.svg',
      title: 'Emergency Ambulance',
    },
    {
      icon: 'assets/icons/appointment.svg',
      title: 'Online Appointment',
    },
    { icon: 'assets/icons/call-center.svg', title: 'Call Center' },
  ];

  activeCardIndex: number = 1;

  setActiveCard(index: number): void {
    this.activeCardIndex = index;
  }

  // doctors render
  doctors = [
    {
      image: 'assets/images/doctor1.png',
      name: 'Dr. Robert Henry',
      specialty: 'Cardiologist',
      ratings: '★★★★★',
      reviews: '(102)',
      available: true,
    },
    {
      image: 'assets/images/image2.png',
      name: 'Dr. Harry Littleton',
      specialty: 'Neurologist',
      ratings: '★★★★★',
      reviews: '(97)',
      available: true,
    },
    {
      image: 'assets/images/image3.png',
      name: 'Dr. Sharina Khan',
      specialty: 'Gynecologist',
      ratings: '★★★★★',
      reviews: '(115)',
      available: false,
      
    },
    {
      image: 'assets/images/image4.png',
      name: 'Dr. Sanjeev Kapoor',
      available: false,
      specialty: 'Child Specialist',
      ratings: '★★★★★',
      reviews: '(73)',
    },
    {
      image: 'assets/images/image3.png',
      name: 'Dr. Emily Watson',
      specialty: 'Dermatologist',
      ratings: '★★★★☆',
      reviews: '(85)',
      available: false,
     
    },
    {
      image: 'assets/images/image4.png',
      name: 'Dr. Michael Johnson',
      specialty: 'Orthopedic Surgeon',
      ratings: '★★★★★',
      reviews: '(120)',
      available:true,
    },
  ];
  // Track whether to show all cards or just the first 4
  showAllCards: boolean = false;

  // Method to toggle between showing limited and all cards
  toggleShowAllCards(): void {
    this.showAllCards = !this.showAllCards; // Toggle the state
  }

  // Get the visible doctors based on the current state
  get visibleDoctors(): any[] {
    return this.showAllCards ? this.doctors : this.doctors.slice(0, 4);
  }

  // Array of testimonials
  testimonials = [
    {
      image: 'assets/images/image2.png',
      name: 'Sara Ali Khan',
      type: 'Cardiologist Patient',
      rating: '★★★★★',
      message: 'Thanks for all the services, no doubt it is the best hospital.',
    },
    {
      image: 'assets/images/image.png',
      name: 'Simon Targett',
      type: 'Neurologist Patient',
      rating: '★★★★★',
      message: 'Thanks for all the services, no doubt it is the best hospital.',
    },
    {
      image: 'assets/images/image4.png',
      name: 'Sara Ali Khan',
      type: 'Cardiologist Patient',
      rating: '★★★★★',
      message: 'Thanks for all the services, no doubt it is the best hospital.',
    },
    {
      image: 'assets/images/image2.png',
      name: 'John Doe',
      type: 'Orthopedic Patient',
      rating: '★★★★☆',
      message: 'Great experience with the staff and doctors!',
    },
    {
      image: 'assets/images/image4.png',
      name: 'Jane Smith',
      type: 'Dermatology Patient',
      rating: '★★★★★',
      message: 'Highly recommend this hospital for skin treatments.',
    },
  ];

  // latest blog
  blogs = [
    {
      image: 'assets/images/image10.png',
      title: 'Understanding Heart Health: A Comprehensive Guide',
      description: 'Learn about the latest advancements in cardiology and how to maintain a healthy heart. Our expert cardiologists share valuable insights on preventive care, common heart conditions, and treatment options. Discover practical tips for heart-healthy living and the importance of regular check-ups.',
      link: '#',
    },
    {
      image: 'assets/images/image11.png',
      title: 'Mental Health in the Digital Age',
      description: 'Explore the impact of technology on mental health and discover effective strategies for maintaining emotional well-being in today\'s digital world. Our mental health professionals discuss coping mechanisms, stress management, and the importance of work-life balance.',
      link: '#',
    },
    {
      image: 'assets/images/image10.png',
      title: 'Pediatric Care: What Every Parent Should Know',
      description: 'Essential information for parents about child healthcare, from newborn care to adolescent health. Our pediatric specialists cover vaccination schedules, developmental milestones, common childhood illnesses, and when to seek medical attention.',
      link: '#',
    }
  ];

  // Track which article is featured
  featuredArticleIndex: number = 0;

  searchQuery: string = ''; // Single search input
  filteredDoctors: any[] = []; // Stores filtered doctors
  mockDoctors: any[] = [
    {
      name: 'Dr. John Doe',
      speciality: 'Cardiologist',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Jane Smith',
      speciality: 'Dermatologist',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Alex Johnson',
      speciality: 'Pediatrician',
      available: false,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Emily Davis',
      speciality: 'Neurologist',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Michael Wilson',
      speciality: 'Pediatrician',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Emily Davis',
      speciality: 'Neurologist',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Michael Wilson',
      speciality: 'Pediatrician',
      available: false,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Emily Davis',
      speciality: 'Neurologist',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Michael Wilson',
      speciality: 'Pediatrician',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Emily Davis',
      speciality: 'Neurologist',
      available: true,
      image: 'assets/images/doctor1.png',
    },
    {
      name: 'Dr. Michael Wilson',
      speciality: 'Pediatrician',
      available: true,
      image: 'assets/images/doctor1.png',
    },
  ];

  onSearch() {
    const query = this.searchQuery.trim().toLowerCase(); // Normalize the search query

    if (!query) {
      this.filteredDoctors = []; // Clear results if the query is empty
      return;
    }

    // Filter doctors by name or speciality
    this.filteredDoctors = this.mockDoctors.filter((doctor) => {
      const matchesName = doctor.name.toLowerCase().includes(query);
      const matchesSpeciality = doctor.speciality.toLowerCase().includes(query);
      return matchesName || matchesSpeciality;
    });
  }

  // Focus on the search input
  onInputFocus() {
    console.log('Search input focused');
    // Scroll to the "Our Medical Services" section
    setTimeout(() => {
      const medicalServicesSection =
        document.getElementById('medical-services');
      if (medicalServicesSection) {
        medicalServicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  expandDescription(blog: any) {
    // Create a modal or expand the text in place
    const modal = document.createElement('div');
    modal.className = 'description-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>${blog.title}</h3>
        <p>${blog.description}</p>
        <button class="close-btn">Close</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
      .description-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 90%;
        width: 500px;
        max-height: 80vh;
        overflow-y: auto;
      }
      .modal-content h3 {
        margin-bottom: 1rem;
        color: #333;
      }
      .modal-content p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }
      .close-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .close-btn:hover {
        background: #0056b3;
      }
    `;
    document.head.appendChild(style);

    // Handle close button click
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        document.head.removeChild(style);
      }
    });
  }
}
