const puppeteer = require('puppeteer');
const fs = require('fs');

async function generatePDF(inputPath, outputPath) {
    let browser;
    
    try {
        // Try Puppeteer first
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        const htmlContent = fs.readFileSync(inputPath, 'utf8');
        
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        console.log('PDF generated successfully with Puppeteer');
    } catch (error) {
        console.error('Puppeteer failed, trying html-pdf-node...', error);
        
        // Fallback to html-pdf-node
        const htmlPdf = require('html-pdf-node');
        const htmlContent = fs.readFileSync(inputPath, 'utf8');
        
        const options = { format: 'A4', path: outputPath };
        const file = { content: htmlContent };
        
        await htmlPdf.generatePdf(file, options);
        console.log('PDF generated successfully with html-pdf-node');
    } finally {
        if (browser) await browser.close();
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');

if (inputIndex === -1 || outputIndex === -1) {
    console.error('Usage: node render-contract-pdf.cjs --input <html_file> --output <pdf_file>');
    process.exit(1);
}

const inputPath = args[inputIndex + 1];
const outputPath = args[outputIndex + 1];

generatePDF(inputPath, outputPath)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('PDF generation failed:', error);
        process.exit(1);
    });
