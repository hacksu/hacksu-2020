<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>{{ title }}</h1>
        <p class="description" v-html="description"></p>
      </div>
      <div class="wave-divider">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
        </svg>
      </div>
    </div>

    <!-- Contact Options -->
    <div class="contact-options">
      <!-- Email Card -->
      <div class="contact-card">
        <div class="card-icon">
          <i class="fas fa-envelope"></i>
        </div>
        <h3>Email Us</h3>
        <p>Send us an email and we'll get back to you within 24 hours</p>
        <a href="mailto:hacksu@cs.kent.edu" class="contact-link">hacksu@cs.kent.edu</a>
      </div>

      <!-- Discord Card -->
      <div class="contact-card">
        <div class="card-icon">
          <i class="fab fa-discord"></i>
        </div>
        <h3>Join Our Discord</h3>
        <p>Get instant help and connect with our community</p>
        <a :href="discord" target="_blank" rel="noopener noreferrer" class="contact-link">Join Discord Server</a>
      </div>

      <!-- Social Media Card -->
      <div class="contact-card">
        <div class="card-icon">
          <i class="fab fa-github"></i>
        </div>
        <h3>Follow Us</h3>
        <p>Check out our projects and contributions</p>
        <a href="https://github.com/hacksu" target="_blank" rel="noopener noreferrer" class="contact-link">GitHub</a>
      </div>
    </div>

    <!-- Contact Form -->
    <div class="contact-form-section" :class="{ 'form-submitted': submitted }">
      <div class="form-container">
        <h2>Send us a Message</h2>
        <form @submit.prevent="submitForm" v-if="!submitted">
          <div class="form-group">
            <label for="name">Your Name</label>
            <input 
              type="text" 
              id="name"
              v-model="form.name"
              :class="{ 'error': errors.name }"
              placeholder="John Doe"
              required
            >
            <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="email">Your Email</label>
            <input 
              type="email" 
              id="email"
              v-model="form.email"
              :class="{ 'error': errors.email }"
              placeholder="email@example.com"
              required
            >
            <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="subject">Subject</label>
            <input 
              type="text" 
              id="subject"
              v-model="form.subject"
              :class="{ 'error': errors.subject }"
              placeholder="What do you need help with?"
              required
            >
            <span class="error-message" v-if="errors.subject">{{ errors.subject }}</span>
          </div>

          <div class="form-group">
            <label for="message">Message</label>
            <textarea 
              id="message"
              v-model="form.message"
              :class="{ 'error': errors.message }"
              placeholder="Write your message here..."
              rows="5"
              required
            ></textarea>
            <span class="error-message" v-if="errors.message">{{ errors.message }}</span>
          </div>

          <button type="submit" class="submit-button" :disabled="isSubmitting">
            <span v-if="isSubmitting">Sending...</span>
            <span v-else>Send Message</span>
          </button>
        </form>

        <div class="success-message" v-else>
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Message Sent!</h3>
          <p>Thank you for contacting us. We'll get back to you soon!</p>
          <button class="submit-button" @click="resetForm">Send Another Message</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { contact as details } from '@/details';
import { discord } from '@/details';

export default {
  name: 'Contact',
  data() {
    return {
      ...details,
      discord,
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      errors: {},
      isSubmitting: false,
      submitted: false
    };
  },
  methods: {
    validateForm() {
      this.errors = {};
      let isValid = true;

      if (!this.form.name.trim()) {
        this.errors.name = 'Name is required';
        isValid = false;
      }

      if (!this.form.email.trim()) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else if (!this.validateEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email address';
        isValid = false;
      }

      if (!this.form.subject.trim()) {
        this.errors.subject = 'Subject is required';
        isValid = false;
      }

      if (!this.form.message.trim()) {
        this.errors.message = 'Message is required';
        isValid = false;
      }

      return isValid;
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    async submitForm() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.form.name,
            email: this.form.email,
            subject: this.form.subject,
            body: this.form.message
          }),
        });

        if (response.ok) {
          this.submitted = true;
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again later.');
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      this.errors = {};
      this.submitted = false;
    }
  }
};
</script>

<style scoped lang="scss">
.contact-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.hero-section {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  padding: 6rem 2rem 0;
  position: relative;
  text-align: center;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: 6rem;

    h1 {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }

    .description {
      font-size: 1.2rem;
      line-height: 1.6;
      opacity: 0.9;
    }
  }

  .wave-divider {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;

    svg {
      position: relative;
      display: block;
      width: 100%;
      height: 120px;

      path {
        fill: #f8f9fa;
      }
    }
  }
}

.contact-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: -4rem auto 0;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.contact-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .card-icon {
    width: 60px;
    height: 60px;
    background: #3498db;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;

    i {
      font-size: 1.5rem;
      color: white;
    }
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .contact-link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #2980b9;
    }
  }
}

.contact-form-section {
  max-width: 800px;
  margin: 4rem auto;
  padding: 0 2rem;

  .form-container {
    background: white;
    padding: 3rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      text-align: center;
      font-size: 2rem;
    }
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
    font-weight: 500;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3498db;
    }

    &.error {
      border-color: #e74c3c;
    }
  }

  .error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
}

.success-message {
  text-align: center;
  padding: 2rem;

  .success-icon {
    font-size: 4rem;
    color: #2ecc71;
    margin-bottom: 1.5rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 1rem 0;

    .hero-content {
      padding-bottom: 4rem;

      h1 {
        font-size: 2.5rem;
      }
    }
  }

  .contact-options {
    margin-top: -2rem;
    grid-template-columns: 1fr;
  }

  .contact-form-section {
    margin: 2rem auto;

    .form-container {
      padding: 2rem;
    }
  }
}
</style>
