// Enhanced HTML/CSS Certificate Templates with 5 distinct designs and 5 color variations each

export interface CertificateColors {
	primary: string;
	secondary: string;
	accent: string;
	text: string;
	background: string;
}

export interface CertificateData {
	recipientName: string;
	eventName: string;
	organizerName: string;
	certificateType: string;
	eventDate: string;
	role: string;
	certificateId?: string;
}

// Color schemes (5 variations)
export const COLOR_SCHEMES: Record<string, CertificateColors> = {
	blue: {
		primary: '#1e40af',
		secondary: '#3b82f6',
		accent: '#60a5fa',
		text: '#1f2937',
		background: '#f8fafc',
	},
	purple: {
		primary: '#7c3aed',
		secondary: '#a855f7',
		accent: '#c084fc',
		text: '#1f2937',
		background: '#faf5ff',
	},
	green: {
		primary: '#059669',
		secondary: '#10b981',
		accent: '#34d399',
		text: '#1f2937',
		background: '#f0fdf4',
	},
	orange: {
		primary: '#ea580c',
		secondary: '#f97316',
		accent: '#fb923c',
		text: '#1f2937',
		background: '#fff7ed',
	},
	gold: {
		primary: '#d97706',
		secondary: '#f59e0b',
		accent: '#fbbf24',
		text: '#1f2937',
		background: '#fffbeb',
	},
};

// Template 1: Classic Formal Certificate
export const generateClassicTemplate = (
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
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
          border: 8px solid ${colors.primary};
          border-radius: 20px;
          padding: 60px;
          text-align: center;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid ${colors.accent};
          border-radius: 12px;
        }
        
        .header {
          margin-bottom: 30px;
        }
        
        .title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .subtitle {
          font-size: 18px;
          color: ${colors.secondary};
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .content {
          margin: 40px 0;
        }
        
        .recipient {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: ${colors.text};
          margin: 20px 0;
          border-bottom: 3px solid ${colors.accent};
          padding-bottom: 10px;
          display: inline-block;
        }
        
        .description {
          font-size: 16px;
          color: ${colors.text};
          line-height: 1.6;
          margin: 20px 0;
        }
        
        .event-details {
          background: linear-gradient(135deg, ${colors.primary}20, ${
		colors.secondary
	}20);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        
        .event-name {
          font-size: 24px;
          font-weight: 600;
          color: ${colors.primary};
          margin-bottom: 5px;
        }
        
        .event-date {
          font-size: 14px;
          color: ${colors.text};
        }
        
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
        }
        
        .signature {
          text-align: center;
        }
        
        .signature-line {
          width: 200px;
          height: 2px;
          background: ${colors.primary};
          margin: 20px auto 10px;
        }
        
        .organizer-name {
          font-weight: 600;
          color: ${colors.text};
        }
        
        .organizer-title {
          font-size: 12px;
          color: ${colors.secondary};
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .certificate-id {
          font-size: 10px;
          color: ${colors.secondary};
          position: absolute;
          bottom: 20px;
          right: 30px;
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="header">
          <div class="title">Certificate</div>
          <div class="subtitle">of ${data.certificateType}</div>
        </div>
        
        <div class="content">
          <div class="description">This is to certify that</div>
          <div class="recipient">${data.recipientName}</div>
          <div class="description">
            has successfully participated as a <strong>${data.role}</strong> in
          </div>
          
          <div class="event-details">
            <div class="event-name">${data.eventName}</div>
            <div class="event-date">${data.eventDate}</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature">
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

// Template 2: Modern Minimalist Certificate
export const generateModernTemplate = (
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, ${colors.background} 0%, ${colors.primary}10 100%);
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
          border-radius: 30px;
          padding: 50px;
          text-align: center;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, ${colors.accent}20 50%, transparent 60%);
          transform: rotate(-45deg);
        }
        
        .content {
          position: relative;
          z-index: 2;
        }
        
        .badge {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          border-radius: 50%;
          margin: 0 auto 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
        }
        
        .title {
          font-size: 42px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        
        .subtitle {
          font-size: 16px;
          color: ${colors.secondary};
          font-weight: 300;
          margin-bottom: 40px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        
        .recipient {
          font-size: 32px;
          font-weight: 600;
          color: ${colors.text};
          margin: 30px 0;
          position: relative;
        }
        
        .recipient::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});
          border-radius: 2px;
        }
        
        .description {
          font-size: 16px;
          color: ${colors.text};
          line-height: 1.8;
          margin: 30px 0;
          font-weight: 300;
        }
        
        .event-card {
          background: linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}05);
          border: 1px solid ${colors.accent}30;
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
        }
        
        .event-name {
          font-size: 20px;
          font-weight: 600;
          color: ${colors.primary};
          margin-bottom: 8px;
        }
        
        .event-meta {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 14px;
          color: ${colors.secondary};
        }
        
        .organizer {
          margin-top: 40px;
          font-size: 14px;
          color: ${colors.text};
        }
        
        .organizer-name {
          font-weight: 600;
          color: ${colors.primary};
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="content">
          <div class="badge">🏆</div>
          <div class="title">Achievement</div>
          <div class="subtitle">Certificate</div>
          
          <div class="description">Awarded to</div>
          <div class="recipient">${data.recipientName}</div>
          <div class="description">
            For outstanding participation as <strong>${data.role}</strong>
          </div>
          
          <div class="event-card">
            <div class="event-name">${data.eventName}</div>
            <div class="event-meta">
              <span>📅 ${data.eventDate}</span>
              <span>🎯 ${data.certificateType}</span>
            </div>
          </div>
          
          <div class="organizer">
            Certified by <span class="organizer-name">${data.organizerName}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template 3: Elegant Vintage Certificate
export const generateVintageTemplate = (
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
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Dancing+Script:wght@700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Crimson Text', serif;
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
          border: 12px solid ${colors.primary};
          border-image: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary}) 1;
          padding: 40px;
          text-align: center;
          position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
        }

        .ornament {
          position: absolute;
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, ${colors.accent}, ${colors.secondary});
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .ornament.top-left { top: -30px; left: -30px; }
        .ornament.top-right { top: -30px; right: -30px; }
        .ornament.bottom-left { bottom: -30px; left: -30px; }
        .ornament.bottom-right { bottom: -30px; right: -30px; }

        .header {
          margin-bottom: 30px;
          border-bottom: 3px double ${colors.primary};
          padding-bottom: 20px;
        }

        .title {
          font-family: 'Dancing Script', cursive;
          font-size: 56px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .subtitle {
          font-size: 20px;
          color: ${colors.secondary};
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .content {
          margin: 30px 0;
        }

        .proclamation {
          font-size: 18px;
          color: ${colors.text};
          font-style: italic;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .recipient {
          font-family: 'Dancing Script', cursive;
          font-size: 42px;
          font-weight: 700;
          color: ${colors.primary};
          margin: 25px 0;
          text-decoration: underline;
          text-decoration-color: ${colors.accent};
          text-underline-offset: 8px;
        }

        .achievement {
          font-size: 16px;
          color: ${colors.text};
          margin: 20px 0;
          line-height: 1.8;
        }

        .event-section {
          background: linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08);
          border: 2px solid ${colors.accent}40;
          border-radius: 15px;
          padding: 20px;
          margin: 25px 0;
          position: relative;
        }

        .event-section::before,
        .event-section::after {
          content: '❦';
          position: absolute;
          color: ${colors.accent};
          font-size: 20px;
        }

        .event-section::before { top: 10px; left: 20px; }
        .event-section::after { bottom: 10px; right: 20px; }

        .event-name {
          font-size: 22px;
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 8px;
        }

        .event-details {
          font-size: 14px;
          color: ${colors.secondary};
          font-style: italic;
        }

        .footer {
          margin-top: 30px;
          border-top: 2px solid ${colors.accent};
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .seal {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, ${colors.primary}, ${colors.secondary});
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          text-align: center;
          line-height: 1.2;
        }

        .signature-area {
          text-align: center;
        }

        .signature-line {
          width: 180px;
          height: 2px;
          background: ${colors.primary};
          margin: 15px auto 8px;
        }

        .organizer-name {
          font-weight: 700;
          color: ${colors.text};
          font-size: 16px;
        }

        .organizer-title {
          font-size: 12px;
          color: ${colors.secondary};
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="certificate" id="certificate">
        <div class="ornament top-left">✦</div>
        <div class="ornament top-right">✦</div>
        <div class="ornament bottom-left">✦</div>
        <div class="ornament bottom-right">✦</div>

        <div class="header">
          <div class="title">Certificate</div>
          <div class="subtitle">of ${data.certificateType}</div>
        </div>

        <div class="content">
          <div class="proclamation">
            Be it known that
          </div>
          <div class="recipient">${data.recipientName}</div>
          <div class="achievement">
            has demonstrated exceptional commitment and skill as a <strong>${data.role}</strong> in the distinguished event
          </div>

          <div class="event-section">
            <div class="event-name">${data.eventName}</div>
            <div class="event-details">Held on ${data.eventDate}</div>
          </div>
        </div>

        <div class="footer">
          <div class="seal">
            OFFICIAL<br>SEAL
          </div>
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="organizer-name">${data.organizerName}</div>
            <div class="organizer-title">Event Organizer</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
