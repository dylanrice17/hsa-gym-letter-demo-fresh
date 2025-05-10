# HSA Gym Letter Generator

A web application that helps users generate medical necessity letters for gym memberships using HSA/FSA funds.

## Features

- Health assessment form
- Medical necessity letter generation
- PDF download capability
- Modern, responsive UI
- Secure data handling

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hsa-gym-letter-generator
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

## Running the Application

1. Start the development server:
```bash
npm run dev:full
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click on "Start Health Assessment" to begin the process
3. Fill out the health assessment form with your information
4. Submit the form to generate your medical necessity letter
5. Download the generated letter as a PDF

## Development

- Frontend: React with Material-UI
- Backend: Node.js with Express
- PDF Generation: PDFKit

## Security Considerations

- All form data is handled securely
- No sensitive medical information is stored permanently
- HTTPS is recommended for production deployment

## License

MIT License

## Disclaimer

This application is for informational purposes only. Users should consult with their healthcare providers and insurance companies to ensure compliance with HSA/FSA regulations and requirements. 