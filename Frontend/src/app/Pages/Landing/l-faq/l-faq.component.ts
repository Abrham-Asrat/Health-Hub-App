import { Component } from '@angular/core';

@Component({
  selector: 'app-l-faq',
  templateUrl: './l-faq.component.html',
  styleUrls: ['./l-faq.component.css']
})
export class FaqComponent {
  faqs = [
    {
      question: 'What is E-Health?',
      answer: 'E-Health is a digital healthcare platform that enables online consultations, appointment bookings, and secure medical record management.',
      isOpen: false
    },
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our online portal or mobile app.',
      isOpen: false
    },
    {
      question: 'What should I do if I forget my password?',
      answer: 'If you forget your password, use the "Forgot Password" option on the login page to reset it.',
      isOpen: false
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your data.',
      isOpen: false
    },
    {
      question: 'Can I access my medical records online?',
      answer: 'Yes, you can access your medical records through your profile in our E-Health platform.',
      isOpen: false
    },
    {
      question: 'What types of consultations are available?',
      answer: 'We offer various types of consultations including general practice, specialist consultations, and mental health services.',
      isOpen: false
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can contact customer support through the "Contact Us" section on our website or app.',
      isOpen: false
    },
    {
      question: 'What are the hours of operation?',
      answer: 'Our support team is available 24/7 to assist you with any questions or concerns.',
      isOpen: false
    },
    {
      question: 'Can I change my appointment?',
      answer: 'Yes, you can change your appointment through your account settings in the app.',
      isOpen: false
    },
    {
      question: 'Do you accept insurance?',
      answer: 'Yes, we accept various insurance plans. Please check with your provider for details.',
      isOpen: false
    }
  ];

  toggleFAQ(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen; // Toggle open state
  }
}