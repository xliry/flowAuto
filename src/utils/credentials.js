require('dotenv').config();
// const inquirer = require('inquirer'); // Remove old require

class CredentialManager {
  constructor() {
    this.credentials = null;
  }

  async getCredentials() {
    if (this.credentials) {
      return this.credentials;
    }

    // Önce .env dosyasından kontrol et
    if (process.env.GOOGLE_EMAIL && process.env.GOOGLE_PASSWORD) {
      this.credentials = {
        email: process.env.GOOGLE_EMAIL,
        password: process.env.GOOGLE_PASSWORD
      };
      console.log('Kimlik bilgileri .env dosyasından alındı');
      return this.credentials;
    }

    // Manuel giriş iste
    console.log('Google hesap bilgilerinizi girin:');
    const inquirer = await import('inquirer');
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email adresiniz:',
        validate: (input) => {
          if (!input.includes('@')) {
            return 'Geçerli bir email adresi girin';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Şifreniz:',
        mask: '*',
        validate: (input) => {
          if (input.length < 1) {
            return 'Şifre boş olamaz';
          }
          return true;
        }
      }
    ]);

    this.credentials = answers;
    return this.credentials;
  }

  clearCredentials() {
    this.credentials = null;
  }
}

module.exports = new CredentialManager();