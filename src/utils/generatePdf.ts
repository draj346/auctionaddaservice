import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Response } from 'express';
import { AuctionPlayer, GenerateTeamPDFProps, LiveAuctionProps, OwnerInformation } from '../types/auction.types';
import { getFormattedAmount } from './common';

// Helper function to calculate total amount
function calculateTotalAmount(teamPlayers: AuctionPlayer[]): number {
  return teamPlayers.reduce((total, player) => total + (player.points || 0), 0);
}

// Function to add watermark to each page
function addWatermark(doc: typeof PDFDocument, siteLogoPath: string): void {
  doc.save();
  doc.opacity(0.7);
  
  // Add text watermark
  doc.fontSize(20)
     .fillColor('#cccccc')
     .text("Powered by Auction Adda", doc.page.width - 200, doc.page.height - 100, {
       align: 'center'
     });
  
  // Add logo watermark if it exists
  if (fs.existsSync(siteLogoPath)) {
    doc.image(siteLogoPath, doc.page.width - 150, doc.page.height - 50, {
      width: 120,
      height: 40
    });
  }
  
  doc.restore();
}

// Function to add header with auction name and logo
function addHeader(
  doc: typeof PDFDocument, 
  auction: LiveAuctionProps, 
  auctionImagePath: string, 
  teamColor: { primary: string; secondary: string }
): void {
  // Header background
  doc.rect(0, 0, doc.page.width, 80)
     .fill(teamColor.primary);

const auctionName = auction.season ? 
    `${auction.name || 'Auction'} - Season ${auction.season}` : 
    (auction.name || 'Auction');
  
  // Auction logo
  if (fs.existsSync(auctionImagePath)) {
    doc.image(auctionImagePath, 40, 20, {
      width: 40,
      height: 40
    });
  } else {
    // Placeholder if logo doesn't exist
    doc.circle(60, 40, 20)
       .fill(teamColor.secondary);
  }
  
  // Auction name
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text(auctionName, 100, 30);
}

// Function to add auction stats section
function addStatsSection(
  doc: typeof PDFDocument, 
  remainingAmount: number, 
  actualTotalAmount: number, 
  playersCount: string, 
  teamColor: { primary: string; secondary: string }
): number {
  const startY = 100;
  
  // Section title
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#34495e')
     .text('Auction Stats', 40, startY);
  
  // Stats container
  const statBoxWidth = (doc.page.width - 100) / 3;
  const statBoxHeight = 80;
  
  // Remaining Amount
  doc.rect(40, startY + 30, statBoxWidth, statBoxHeight)
     .fill(teamColor.primary);
  
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#7f8c8d')
     .text('Remaining Amount', 60, startY + 40, {
       width: statBoxWidth - 40,
       align: 'center'
     });
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text(getFormattedAmount(remainingAmount), 60, startY + 60, {
       width: statBoxWidth - 40,
       align: 'center'
     });
  
  // Total Spent
  doc.rect(40 + statBoxWidth + 10, startY + 30, statBoxWidth, statBoxHeight)
     .fill(teamColor.primary);
  
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#7f8c8d')
     .text('Total Spent', 60 + statBoxWidth + 10, startY + 40, {
       width: statBoxWidth - 40,
       align: 'center'
     });
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text(getFormattedAmount(actualTotalAmount), 60 + statBoxWidth + 10, startY + 60, {
       width: statBoxWidth - 40,
       align: 'center'
     });
  
  // Players
  doc.rect(40 + (statBoxWidth + 10) * 2, startY + 30, statBoxWidth, statBoxHeight)
     .fill(teamColor.primary);
  
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#7f8c8d')
     .text('Players', 60 + (statBoxWidth + 10) * 2, startY + 40, {
       width: statBoxWidth - 40,
       align: 'center'
     });
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text(playersCount, 60 + (statBoxWidth + 10) * 2, startY + 60, {
       width: statBoxWidth - 40,
       align: 'center'
     });
  
  return startY + statBoxHeight + 50;
}

// Function to add owners section
function addOwnersSection(doc: typeof PDFDocument, owners: OwnerInformation[] | null, startY: number): number {
  // Section title
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#34495e')
     .text('Owner Details', 40, startY);
  
  if (!owners || owners.length === 0) {
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text('No owners assigned to team', 40, startY + 30);
    return startY + 60;
  }
  
  // Table headers
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50');
  
    doc.text('S.No.', 40, startY + 30);
  doc.text('Name', 90, startY + 30);
  doc.text('Email', 200, startY + 30);
  doc.text('Phone', 350, startY + 30);
  doc.text('Type', 450, startY + 30);

  owners.forEach((owner, index) => {
    const y = startY + 50 + (index * 20);
     doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#2c3e50');
    doc.text((index + 1).toString(), 40, y);
    doc.text(owner.name, 90, y);
    doc.text(owner.email || '-', 200, y);
    doc.text(owner.mobile || '-', 350, y);
    doc.text(owner.type, 450, y);
  });
  
  return startY + 50 + (owners.length * 20) + 30;
}

// Function to add players section
function addPlayersSection(
  doc: typeof PDFDocument, 
  players: AuctionPlayer[], 
  title: string, 
  teamColor: { primary: string; secondary: string },
  siteLogoPath: string,
  startY: number
): number {
  // Check if we need a new page
  if (startY > doc.page.height - 200) {
    doc.addPage();
    addWatermark(doc, siteLogoPath);
    startY = 50;
  }
  
  // Section title
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#34495e')
     .text(title, 40, startY);
  
  if (!players || players.length === 0) {
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#7f8c8d')
       .text(`No ${title.toLowerCase()}`, 40, startY + 30);
    return startY + 50;
  }
  
  // Define column widths and positions that fit within page width
  const pageWidth = doc.page.width;
  const leftMargin = 40;
  const rightMargin = 40;
  const availableWidth = pageWidth - leftMargin - rightMargin;
  
  const colWidths = [
    40,  // S.No.
    50,  // P.No.
    150, // Name
    120, // Email
    100, // Phone
    80   // Points
  ];
  
  // Adjust if total width exceeds available width
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth > availableWidth) {
    // Scale down proportionally
    const scaleFactor = availableWidth / totalWidth;
    for (let i = 0; i < colWidths.length; i++) {
      colWidths[i] = colWidths[i] * scaleFactor;
    }
  }
  
  // Calculate column positions
  const colPositions = [leftMargin];
  for (let i = 1; i < colWidths.length; i++) {
    colPositions[i] = colPositions[i - 1] + colWidths[i - 1];
  }
  
  // Table headers
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50');
  
  doc.text('S.No.', colPositions[0], startY + 30, { align: 'center', width: colWidths[0] });
  doc.text('P.No.', colPositions[1], startY + 30, { align: 'center', width: colWidths[1] });
  doc.text('Name', colPositions[2], startY + 30, { align: 'center', width: colWidths[2] });
  doc.text('Email', colPositions[3], startY + 30, { align: 'center', width: colWidths[3] });
  doc.text('Phone', colPositions[4], startY + 30, { align: 'center', width: colWidths[4] });
  doc.text('Points', colPositions[5], startY + 30, { align: 'center', width: colWidths[5] });
  
  // Table rows with alternating background colors
  let currentY = startY + 50;
  
  players.forEach((player, index) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 50) {
      doc.addPage();
      addWatermark(doc, siteLogoPath);
      
      // Re-add table headers on new page
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50');
      
      doc.text('S.No.', colPositions[0], 50, { align: 'center', width: colWidths[0] });
      doc.text('P.No.', colPositions[1], 50, { align: 'center', width: colWidths[1] });
      doc.text('Name', colPositions[2], 50, { align: 'center', width: colWidths[2] });
      doc.text('Email', colPositions[3], 50, { align: 'center', width: colWidths[3] });
      doc.text('Phone', colPositions[4], 50, { align: 'center', width: colWidths[4] });
      doc.text('Points', colPositions[5], 50, { align: 'center', width: colWidths[5] });
      
      currentY = 70;
    }
    
    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(leftMargin, currentY - 5, availableWidth, 20)
         .fill(teamColor.primary);
    }
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#2c3e50');
    
    doc.text((index + 1).toString(), colPositions[0], currentY, { align: 'center', width: colWidths[0] });
    doc.text(player.number.toString(), colPositions[1], currentY, { align: 'center', width: colWidths[1] });
    
    // For longer text fields (Name, Email, Phone), use ellipsis if needed
    const nameText = doc.widthOfString(player.name) > colWidths[2] ? 
      player.name.substring(0, Math.floor(colWidths[2] / 5)) + '...' : player.name;
    doc.text(nameText, colPositions[2], currentY, { align: 'center', width: colWidths[2] });
    
    const emailText = player.email && doc.widthOfString(player.email) > colWidths[3] ? 
      player.email.substring(0, Math.floor(colWidths[3] / 5)) + '...' : (player.email || '-');
    doc.text(emailText, colPositions[3], currentY, { align: 'center', width: colWidths[3] });
    
    const phoneText = player.mobile && doc.widthOfString(player.mobile) > colWidths[4] ? 
      player.mobile.substring(0, Math.floor(colWidths[4] / 5)) + '...' : (player.mobile || '-');
    doc.text(phoneText, colPositions[4], currentY, { align: 'center', width: colWidths[4] });
    
    doc.text(getFormattedAmount(player.points || 0), colPositions[5], currentY, { align: 'center', width: colWidths[5] });
    
    currentY += 20;
  });
  
  return currentY + 20;
}

// Main PDF generation function
export const generateTeamPDF = ({
  team,
  teamPlayers,
  auction,
  auctionImagePath,
  siteLogoPath,
  res,
}: GenerateTeamPDFProps & { res: Response }): void => {
  try {
    // Calculate values
    const actualTotalAmount = calculateTotalAmount(teamPlayers);
    const remainingAmount = (auction.pointPerTeam || 0) - actualTotalAmount;
    const playersCount = `${teamPlayers.length}/${auction.maxPlayerPerTeam || 0}`;

    // Create PDF document
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // Set response headers
    res.setHeader("Content-Disposition", `attachment; filename="${team.name}-summary.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    
    // Handle errors
    doc.on("error", (error) => {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "PDF generation failed. Please try again." });
      }
    });

    // doc.on('pageAdded', () => {
    //   addWatermark(doc, siteLogoPath);
    // });

    // Pipe to response
    doc.pipe(res);

     addWatermark(doc, siteLogoPath);

    // Team color theme (rotating through 10 themes based on teamId)
    const teamColorIndex = team.teamId % 10;
    const teamColors = [
      { primary: '#ffebee', secondary: '#ffcdd2' }, // team-0
      { primary: '#e8f5e9', secondary: '#c8e6c9' }, // team-1
      { primary: '#e3f2fd', secondary: '#bbdefb' }, // team-2
      { primary: '#fff8e1', secondary: '#ffecb3' }, // team-3
      { primary: '#f1f8e9', secondary: '#dcedc8' }, // team-4
      { primary: '#e0f2f1', secondary: '#b2dfdb' }, // team-5
      { primary: '#f3e5f5', secondary: '#e1bee7' }, // team-6
      { primary: '#fff3e0', secondary: '#ffe0b2' }, // team-7
      { primary: '#e8eaf6', secondary: '#c5cae9' }, // team-8
      { primary: '#ffecb3', secondary: '#ffe082' }, // team-9
    ];
    
    const teamColor = teamColors[teamColorIndex];

    // Add watermark to first page
    addWatermark(doc, siteLogoPath);

    // Add header with auction name and logo
    addHeader(doc, auction, auctionImagePath, teamColor);

    // Add auction stats section
    let currentY = addStatsSection(doc, remainingAmount, actualTotalAmount, playersCount, teamColor);

    // Add owner details section
    currentY = addOwnersSection(doc, team.owners, currentY);

    // Add retained players section
    const retainedPlayers = teamPlayers.filter(player => 
      player.soldStatus && player.soldStatus.toLowerCase() === "retain"
    );
    currentY = addPlayersSection(doc, retainedPlayers, "Retained Players", teamColor, siteLogoPath, currentY);

    // Add sold players section
    const soldPlayers = teamPlayers.filter(player => 
      !player.soldStatus || player.soldStatus.toLowerCase() !== "retain"
    );
    addPlayersSection(doc, soldPlayers, "Sold Players", teamColor,siteLogoPath,  currentY);

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF generation failed. Please try again." });
    }
  }
};

export default generateTeamPDF;