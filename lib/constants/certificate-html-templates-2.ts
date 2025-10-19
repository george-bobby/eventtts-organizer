// Additional Certificate Templates (Templates 4 & 5)
import { CertificateData, CertificateColors } from './certificate-html-templates';

// Template 4: Creative Geometric Certificate
export const generateGeometricTemplate = (data: CertificateData, colors: CertificateColors): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate - ${data.recipientName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Montserrat', sans-serif;
          background: linear-gradient(135deg, ${colors.background} 0%, ${colors.primary}15 100%);
          padding: 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate {
          width: 800px;
          height: 600px;
          background: white;
          border-radius: 25px;
          padding: 50px;
          text-align: center;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .geometric-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          background-image: 
            linear-gradient(45deg, ${colors.primary} 25%, transparent 25%),
            linear-gradient(-45deg, ${colors.secondary} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${colors.accent} 75%),
            linear-gradient(-45deg, transparent 75%, ${colors.primary} 75%);
          background-size: 60px 60px;
          background-position: 0 0, 0 30px, 30px -30px, -30px 0px;
        }
        
        .content {
          position: relative;
          z-index: 2;
        }
        
        .header {
          margin-bottom: 40px;
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});
          border-radius: 2px;
        }
        
        .title {
          font-size: 48px;
          font-weight: 800;
          color: ${colors.primary};
          margin-bottom: 8px;
          letter-spacing: -2px;
          text-transform: uppercase;
        }
        
        .subtitle {
          font-size: 14px;
          color: ${colors.secondary};
          font-weight: 400;
          letter-spacing: 6px;
          text-transform: uppercase;
        }
        
        .diamond {
          width: 20px;
          height: 20px;
          background: ${colors.accent};
          transform: rotate(45deg);
          margin: 20px auto;
        }
        
        .recipient-section {
          margin: 30px 0;
          position: relative;
        }
        
        .awarded-to {
          font-size: 16px;
          color: ${colors.text};
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }
        
        .recipient {
          font-size: 36px;
          font-weight: 700;
          color: ${colors.primary};
          margin: 20px 0;
          position: relative;
          display: inline-block;
        }
        
        .recipient::before,
        .recipient::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40px;
          height: 2px;
          background: ${colors.accent};
        }
        
        .recipient::before {
          left: -60px;
        }
        
        .recipient::after {
          right: -60px;
        }
        
        .achievement-text {
          font-size: 16px;
          color: ${colors.text};
          line-height: 1.8;
          margin: 25px 0;
          font-weight: 300;
        }
        
        .role-badge {
          display: inline-block;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 10px 0;
        }
        
        .event-info {
          background: linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08);
          border-left: 4px solid ${colors.accent};
          padding: 20px;
          margin: 30px 0;
          text-align: left;
          border-radius: 0 10px 10px 0;
        }
        
        .event-name {
          font-size: 22px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 8px;
        }
        
        .event-date {
          font-size: 14px;
          color: ${colors.secondary};
          font-weight: 500;
        }
        
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
        }
        
        .organizer-info {
          text-align: center;
        }
        
        .organizer-name {
          font-size: 16px;
          font-weight: 700;
          color: ${colors.text};
          margin-bottom: 5px;
        }
        
        .organizer-title {
          font-size: 12px;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .verification-code {
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 10px;
          color: ${colors.secondary};
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="geometric-bg"></div>
        <div class="content">
          <div class="header">
            <div class="title">Certificate</div>
            <div class="subtitle">of Achievement</div>
          </div>
          
          <div class="diamond"></div>
          
          <div class="recipient-section">
            <div class="awarded-to">Awarded to</div>
            <div class="recipient">${data.recipientName}</div>
            <div class="achievement-text">
              For exceptional performance and dedication as
            </div>
            <div class="role-badge">${data.role}</div>
          </div>
          
          <div class="event-info">
            <div class="event-name">${data.eventName}</div>
            <div class="event-date">📅 ${data.eventDate}</div>
          </div>
          
          <div class="footer">
            <div class="organizer-info">
              <div class="organizer-name">${data.organizerName}</div>
              <div class="organizer-title">Event Organizer</div>
            </div>
          </div>
          
          ${data.certificateId ? `<div class="verification-code">ID: ${data.certificateId}</div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template 5: Professional Corporate Certificate
export const generateCorporateTemplate = (data: CertificateData, colors: CertificateColors): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate - ${data.recipientName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&family=Merriweather:wght@700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Source Sans Pro', sans-serif;
          background: ${colors.background};
          padding: 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate {
          width: 800px;
          height: 600px;
          background: white;
          border: 1px solid ${colors.primary}30;
          padding: 60px;
          text-align: center;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent});
        }
        
        .logo-section {
          margin-bottom: 30px;
        }
        
        .logo-placeholder {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          border-radius: 50%;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
        }
        
        .organization {
          font-size: 14px;
          color: ${colors.secondary};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .title {
          font-family: 'Merriweather', serif;
          font-size: 42px;
          font-weight: 700;
          color: ${colors.primary};
          margin: 30px 0 15px;
          line-height: 1.2;
        }
        
        .subtitle {
          font-size: 18px;
          color: ${colors.secondary};
          font-weight: 400;
          margin-bottom: 40px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        
        .content-section {
          margin: 40px 0;
          line-height: 1.8;
        }
        
        .certification-text {
          font-size: 16px;
          color: ${colors.text};
          margin-bottom: 25px;
        }
        
        .recipient {
          font-family: 'Merriweather', serif;
          font-size: 32px;
          font-weight: 700;
          color: ${colors.primary};
          margin: 25px 0;
          border-bottom: 2px solid ${colors.accent};
          padding-bottom: 10px;
          display: inline-block;
        }
        
        .completion-text {
          font-size: 16px;
          color: ${colors.text};
          margin: 25px 0;
        }
        
        .role-highlight {
          color: ${colors.primary};
          font-weight: 600;
        }
        
        .event-details-box {
          background: ${colors.background};
          border: 1px solid ${colors.accent}40;
          padding: 25px;
          margin: 30px 0;
          border-radius: 5px;
        }
        
        .event-name {
          font-size: 20px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 10px;
        }
        
        .event-meta {
          font-size: 14px;
          color: ${colors.secondary};
          display: flex;
          justify-content: center;
          gap: 30px;
        }
        
        .footer-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          align-items: end;
        }
        
        .date-issued {
          text-align: left;
          font-size: 12px;
          color: ${colors.secondary};
        }
        
        .signature-block {
          text-align: center;
        }
        
        .signature-line {
          width: 200px;
          height: 1px;
          background: ${colors.text};
          margin: 20px auto 10px;
        }
        
        .organizer-name {
          font-size: 16px;
          font-weight: 700;
          color: ${colors.text};
          margin-bottom: 5px;
        }
        
        .organizer-title {
          font-size: 12px;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .certificate-number {
          position: absolute;
          bottom: 20px;
          left: 30px;
          font-size: 10px;
          color: ${colors.secondary};
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="header-bar"></div>
        
        <div class="logo-section">
          <div class="logo-placeholder">E</div>
          <div class="organization">EventTTS Platform</div>
        </div>
        
        <div class="title">Certificate</div>
        <div class="subtitle">of ${data.certificateType}</div>
        
        <div class="content-section">
          <div class="certification-text">
            This is to certify that
          </div>
          
          <div class="recipient">${data.recipientName}</div>
          
          <div class="completion-text">
            has successfully completed their role as <span class="role-highlight">${data.role}</span> in the following event:
          </div>
          
          <div class="event-details-box">
            <div class="event-name">${data.eventName}</div>
            <div class="event-meta">
              <span>Date: ${data.eventDate}</span>
              <span>Type: ${data.certificateType}</span>
            </div>
          </div>
        </div>
        
        <div class="footer-section">
          <div class="date-issued">
            Date Issued:<br>
            ${new Date().toLocaleDateString()}
          </div>
          
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="organizer-name">${data.organizerName}</div>
            <div class="organizer-title">Authorized Signatory</div>
          </div>
        </div>
        
        ${data.certificateId ? `<div class="certificate-number">Certificate No: ${data.certificateId}</div>` : ''}
      </div>
    </body>
    </html>
  `;
};
