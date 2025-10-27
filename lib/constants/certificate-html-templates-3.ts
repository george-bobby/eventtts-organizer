// Additional Certificate Templates (Templates 6-10)
import {
	CertificateData,
	CertificateColors,
} from './certificate-html-templates';

// Template 6: Academic Excellence Certificate
export const generateAcademicTemplate = (
	data: CertificateData,
	colors: CertificateColors
): string => {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate - ${data.recipientName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Lato', sans-serif;
          background: linear-gradient(135deg, ${colors.background} 0%, ${
		colors.primary
	}10 100%);
          padding: 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate {
          width: 1000px;
          height: 700px;
          background: white;
          border: 3px solid ${colors.primary};
          padding: 50px;
          text-align: center;
          position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        .academic-header {
          border-bottom: 2px solid ${colors.primary};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .institution-name {
          font-size: 18px;
          color: ${colors.primary};
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        
        .certificate-title {
          font-family: 'Crimson Text', serif;
          font-size: 48px;
          font-weight: 700;
          color: ${colors.primary};
          margin: 20px 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .subtitle {
          font-size: 16px;
          color: ${colors.secondary};
          font-weight: 400;
          margin-bottom: 30px;
        }
        
        .recipient-section {
          margin: 40px 0;
        }
        
        .presented-to {
          font-size: 18px;
          color: ${colors.text};
          margin-bottom: 15px;
        }
        
        .recipient-name {
          font-family: 'Crimson Text', serif;
          font-size: 36px;
          font-weight: 600;
          color: ${colors.primary};
          margin: 20px 0;
          border-bottom: 2px solid ${colors.accent};
          padding-bottom: 10px;
          display: inline-block;
        }
        
        .achievement-text {
          font-size: 16px;
          color: ${colors.text};
          line-height: 1.6;
          margin: 25px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .event-details {
          margin: 30px 0;
        }
        
        .event-name {
          font-family: 'Crimson Text', serif;
          font-size: 24px;
          font-weight: 600;
          color: ${colors.primary};
          margin-bottom: 10px;
        }
        
        .event-date {
          font-size: 16px;
          color: ${colors.secondary};
        }
        
        .footer-section {
          position: absolute;
          bottom: 40px;
          left: 50px;
          right: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .signature-area {
          text-align: center;
        }
        
        .signature-line {
          width: 200px;
          height: 1px;
          background: ${colors.primary};
          margin-bottom: 5px;
        }
        
        .organizer-name {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.text};
        }
        
        .organizer-title {
          font-size: 12px;
          color: ${colors.secondary};
        }
        
        .academic-seal {
          width: 80px;
          height: 80px;
          border: 3px solid ${colors.primary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${colors.accent}20;
          font-size: 12px;
          font-weight: 700;
          color: ${colors.primary};
          text-align: center;
          line-height: 1.2;
        }
        
        .certificate-id {
          position: absolute;
          bottom: 15px;
          right: 20px;
          font-size: 10px;
          color: ${colors.secondary};
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="academic-header">
          <div class="institution-name">Eventtts Certificate Authority</div>
        </div>
        
        <div class="certificate-title">Certificate</div>
        <div class="subtitle">of ${data.certificateType}</div>
        
        <div class="recipient-section">
          <div class="presented-to">This is to certify that</div>
          <div class="recipient-name">${data.recipientName}</div>
          <div class="achievement-text">
            has successfully demonstrated excellence as a <strong>${
							data.role
						}</strong> and has made valuable contributions to the success of this event.
          </div>
        </div>
        
        <div class="event-details">
          <div class="event-name">${data.eventName}</div>
          <div class="event-date">${data.eventDate}</div>
        </div>
        
        <div class="footer-section">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="organizer-name">${data.organizerName}</div>
            <div class="organizer-title">Event Organizer</div>
          </div>
          
          <div class="academic-seal">
            OFFICIAL<br>SEAL
          </div>
        </div>
        
        ${
					data.certificateId
						? `<div class="certificate-id">Certificate ID: ${data.certificateId}</div>`
						: ''
				}
      </div>
    </body>
    </html>
  `;
};

// Template 7: Creative Artistic Certificate
export const generateArtisticTemplate = (
	data: CertificateData,
	colors: CertificateColors
): string => {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate - ${data.recipientName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Poppins:wght@300;400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          background: radial-gradient(circle at center, ${
						colors.background
					} 0%, ${colors.primary}15 100%);
          padding: 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .certificate {
          width: 1000px;
          height: 700px;
          background: white;
          border-radius: 30px;
          padding: 50px;
          text-align: center;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        
        .artistic-bg {
          position: absolute;
          top: -50px;
          left: -50px;
          right: -50px;
          bottom: -50px;
          background: 
            radial-gradient(circle at 20% 20%, ${
							colors.accent
						}20 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${
							colors.secondary
						}20 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, ${
							colors.primary
						}15 0%, transparent 50%);
          z-index: 1;
        }
        
        .content {
          position: relative;
          z-index: 2;
        }
        
        .artistic-title {
          font-family: 'Dancing Script', cursive;
          font-size: 64px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .subtitle {
          font-size: 18px;
          color: ${colors.secondary};
          font-weight: 300;
          margin-bottom: 40px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        
        .decorative-line {
          width: 200px;
          height: 3px;
          background: linear-gradient(90deg, ${colors.primary}, ${
		colors.accent
	}, ${colors.secondary});
          margin: 20px auto;
          border-radius: 2px;
        }
        
        .recipient-name {
          font-family: 'Dancing Script', cursive;
          font-size: 42px;
          font-weight: 600;
          color: ${colors.primary};
          margin: 30px 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .achievement-text {
          font-size: 16px;
          color: ${colors.text};
          line-height: 1.8;
          margin: 25px 0;
          font-weight: 300;
        }
        
        .event-name {
          font-size: 28px;
          font-weight: 600;
          color: ${colors.primary};
          margin: 20px 0 10px;
        }
        
        .event-date {
          font-size: 16px;
          color: ${colors.secondary};
          font-style: italic;
        }
        
        .artistic-footer {
          position: absolute;
          bottom: 30px;
          left: 50px;
          right: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .signature-artistic {
          text-align: center;
        }
        
        .signature-line {
          width: 180px;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${
						colors.primary
					}, transparent);
          margin-bottom: 8px;
        }
        
        .organizer-name {
          font-family: 'Dancing Script', cursive;
          font-size: 18px;
          font-weight: 600;
          color: ${colors.primary};
        }
        
        .organizer-title {
          font-size: 12px;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .certificate-id {
          position: absolute;
          bottom: 15px;
          right: 20px;
          font-size: 10px;
          color: ${colors.secondary};
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="artistic-bg"></div>
        <div class="content">
          <div class="artistic-title">Certificate</div>
          <div class="subtitle">of ${data.certificateType}</div>
          <div class="decorative-line"></div>
          
          <div style="margin: 40px 0;">
            <div style="font-size: 18px; color: ${
							colors.text
						}; margin-bottom: 15px;">
              Proudly presented to
            </div>
            <div class="recipient-name">${data.recipientName}</div>
            <div class="achievement-text">
              for outstanding contribution as a <strong>${
								data.role
							}</strong><br>
              and for bringing creativity and excellence to
            </div>
          </div>
          
          <div class="event-name">${data.eventName}</div>
          <div class="event-date">${data.eventDate}</div>
          <div class="decorative-line" style="margin-top: 30px;"></div>
        </div>
        
        <div class="artistic-footer">
          <div class="signature-artistic">
            <div class="signature-line"></div>
            <div class="organizer-name">${data.organizerName}</div>
            <div class="organizer-title">Event Organizer</div>
          </div>
        </div>
        
        ${
					data.certificateId
						? `<div class="certificate-id">Certificate ID: ${data.certificateId}</div>`
						: ''
				}
      </div>
    </body>
    </html>
  `;
};

// Template 8: Tech Innovation Certificate
export const generateTechTemplate = (
	data: CertificateData,
	colors: CertificateColors
): string => {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificate - ${data.recipientName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Roboto', sans-serif;
          background: linear-gradient(135deg, #0f0f23 0%, ${
						colors.primary
					}20 100%);
          padding: 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .certificate {
          width: 1000px;
          height: 700px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid ${colors.primary};
          border-radius: 15px;
          padding: 50px;
          text-align: center;
          position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        .tech-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(${colors.primary}10 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}10 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.3;
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
        }

        .tech-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
        }

        .circuit-icon {
          width: 60px;
          height: 60px;
          border: 3px solid ${colors.primary};
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${colors.primary}15;
          margin-right: 20px;
          font-size: 24px;
          color: ${colors.primary};
          font-weight: 700;
        }

        .tech-title {
          font-family: 'Orbitron', monospace;
          font-size: 48px;
          font-weight: 900;
          color: ${colors.primary};
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .subtitle {
          font-family: 'Orbitron', monospace;
          font-size: 16px;
          color: ${colors.secondary};
          font-weight: 400;
          margin-bottom: 40px;
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        .data-block {
          background: ${colors.primary}05;
          border: 1px solid ${colors.primary}30;
          border-radius: 8px;
          padding: 30px;
          margin: 30px 0;
        }

        .recipient-label {
          font-family: 'Orbitron', monospace;
          font-size: 12px;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .recipient-name {
          font-family: 'Orbitron', monospace;
          font-size: 32px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .achievement-code {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          color: ${colors.text};
          line-height: 1.6;
          background: ${colors.accent}10;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid ${colors.accent};
          text-align: left;
          margin: 20px 0;
        }

        .event-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 30px 0;
          padding: 20px;
          background: ${colors.secondary}05;
          border-radius: 8px;
        }

        .event-name {
          font-family: 'Orbitron', monospace;
          font-size: 20px;
          font-weight: 700;
          color: ${colors.primary};
        }

        .event-date {
          font-family: 'Orbitron', monospace;
          font-size: 14px;
          color: ${colors.secondary};
        }

        .tech-footer {
          position: absolute;
          bottom: 30px;
          left: 50px;
          right: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .digital-signature {
          text-align: left;
        }

        .signature-hash {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          color: ${colors.secondary};
          background: ${colors.primary}10;
          padding: 5px 10px;
          border-radius: 3px;
          margin-bottom: 5px;
        }

        .organizer-name {
          font-family: 'Orbitron', monospace;
          font-size: 14px;
          font-weight: 700;
          color: ${colors.primary};
        }

        .organizer-title {
          font-size: 10px;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .verification-code {
          text-align: right;
        }

        .qr-placeholder {
          width: 60px;
          height: 60px;
          border: 2px solid ${colors.primary};
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${colors.primary}10;
          font-size: 10px;
          color: ${colors.primary};
          text-align: center;
          line-height: 1.2;
        }

        .certificate-id {
          position: absolute;
          bottom: 15px;
          right: 20px;
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          color: ${colors.secondary};
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="tech-grid"></div>
        <div class="content">
          <div class="tech-header">
            <div class="circuit-icon">⚡</div>
            <div class="tech-title">Certificate</div>
          </div>
          <div class="subtitle">of ${data.certificateType}</div>

          <div class="data-block">
            <div class="recipient-label">Certified Individual</div>
            <div class="recipient-name">${data.recipientName}</div>
            <div class="achievement-code">
              // Achievement Verified<br>
              Role: ${data.role}<br>
              Status: COMPLETED<br>
              Performance: EXCELLENT
            </div>
          </div>

          <div class="event-info">
            <div>
              <div class="event-name">${data.eventName}</div>
              <div style="font-size: 12px; color: ${
								colors.text
							}; margin-top: 5px;">
                Successfully participated in tech innovation event
              </div>
            </div>
            <div class="event-date">${data.eventDate}</div>
          </div>
        </div>

        <div class="tech-footer">
          <div class="digital-signature">
            <div class="signature-hash">SHA256: ${Math.random()
							.toString(36)
							.substr(2, 16)
							.toUpperCase()}</div>
            <div class="organizer-name">${data.organizerName}</div>
            <div class="organizer-title">Digital Authority</div>
          </div>

          <div class="verification-code">
            <div class="qr-placeholder">
              VERIFY<br>CODE
            </div>
          </div>
        </div>

        ${
					data.certificateId
						? `<div class="certificate-id">ID: ${data.certificateId}</div>`
						: ''
				}
      </div>
    </body>
    </html>
  `;
};
