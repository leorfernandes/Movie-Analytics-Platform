import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

// PDF Executive Report Export
export const exportDashboardToPDF = async (analytics, movies) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Company Header
  pdf.setFontSize(24);
  pdf.setTextColor(25, 118, 210); // Primary blue
  pdf.text('MovieMetrics', 20, 25);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Executive Business Intelligence Report', 20, 35);
  
  // Date and Report Info
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, 45);
  pdf.text(`Report Period: Full Portfolio Analysis`, 20, 50);

  // Executive Summary Section
  pdf.setFontSize(14);
  pdf.setTextColor(25, 118, 210);
  pdf.text('📊 EXECUTIVE SUMMARY', 20, 65);
  
  // Key Metrics in a nice layout
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const kpiData = [
    ['Total Portfolio Revenue', `$${((analytics?.financial_summary?.total_revenue || 0) / 1000000).toFixed(1)}M`],
    ['Overall ROI', `${(analytics?.financial_summary?.overall_roi || 0).toFixed(1)}%`],
    ['Total Movies Analyzed', `${analytics?.overview?.total_movies || movies.length}`],
    ['Portfolio Success Rate', `${analytics?.overview?.total_movies > 0 ? 
      ((analytics?.profitability?.profitable_movies / analytics?.overview?.total_movies) * 100).toFixed(1) : 0}%`],
    ['Data Completion Rate', `${(analytics?.overview?.completion_rate || 0).toFixed(1)}%`],
    ['Profitable Movies', `${analytics?.profitability?.profitable_movies || 0}`]
  ];

  let yPos = 75;
  kpiData.forEach(([label, value]) => {
    pdf.setFont(undefined, 'normal');
    pdf.text(label + ':', 25, yPos);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(25, 118, 210);
    pdf.text(value, 120, yPos);
    pdf.setTextColor(0, 0, 0);
    yPos += 8;
  });

  // Business Insights Section
  pdf.setFontSize(14);
  pdf.setTextColor(25, 118, 210);
  pdf.text('💡 KEY BUSINESS INSIGHTS', 20, yPos + 15);
  
  yPos += 25;
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  
  const insights = [
    `• Portfolio Health: ${((analytics?.profitability?.profitable_movies || 0) / (analytics?.overview?.total_movies || 1) * 100).toFixed(1)}% of movies generated positive ROI`,
    `• Investment Performance: Average ROI of ${(analytics?.financial_summary?.overall_roi || 0).toFixed(1)}% indicates ${analytics?.financial_summary?.overall_roi > 50 ? 'strong' : analytics?.financial_summary?.overall_roi > 0 ? 'moderate' : 'poor'} portfolio performance`,
    `• Revenue Generation: Total portfolio revenue of $${((analytics?.financial_summary?.total_revenue || 0) / 1000000).toFixed(1)}M across ${analytics?.overview?.total_movies || movies.length} productions`,
    `• Risk Assessment: ${analytics?.overview?.completion_rate > 80 ? 'High data quality' : 'Moderate data quality'} with ${(analytics?.overview?.completion_rate || 0).toFixed(1)}% complete financial records`,
    `• Recommendation: ${analytics?.financial_summary?.overall_roi > 100 ? 'Continue current investment strategy' : analytics?.financial_summary?.overall_roi > 0 ? 'Optimize investment selection criteria' : 'Review and restructure investment approach'}`
  ];
  
  insights.forEach(insight => {
    const lines = pdf.splitTextToSize(insight, pageWidth - 45);
    lines.forEach(line => {
      pdf.text(line, 25, yPos);
      yPos += 6;
    });
    yPos += 2;
  });

  // Top Performing Movies Table
  if (movies && movies.length > 0) {
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(25, 118, 210);
    pdf.text('🏆 TOP PERFORMING MOVIES', 20, 25);
    
    const tableData = movies
      .filter(m => m.revenue && m.budget && m.roi)
      .sort((a, b) => parseFloat(b.roi || 0) - parseFloat(a.roi || 0))
      .slice(0, 20) // Top 20
      .map(movie => [
        movie.title || 'N/A',
        `$${((movie.budget || 0) / 1000000).toFixed(1)}M`,
        `$${((movie.revenue || 0) / 1000000).toFixed(1)}M`,
        `${parseFloat(movie.roi || 0).toFixed(1)}%`,
        movie.performance_rating || 'N/A'
      ]);
    
    // Auto table with styling
    pdf.autoTable({
      startY: 35,
      head: [['Movie Title', 'Budget', 'Revenue', 'ROI', 'Rating']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [25, 118, 210], 
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 60 }, // Movie title
        1: { cellWidth: 25, halign: 'right' }, // Budget
        2: { cellWidth: 25, halign: 'right' }, // Revenue
        3: { cellWidth: 20, halign: 'right' }, // ROI
        4: { cellWidth: 30, halign: 'center' }  // Rating
      }
    });
  }

  // Footer on each page
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`MovieMetrics Business Intelligence Platform | Page ${i} of ${totalPages}`, 20, pageHeight - 10);
    pdf.text('Confidential Business Report', pageWidth - 60, pageHeight - 10);
  }
  
  // Save the PDF
  pdf.save(`MovieMetrics-Executive-Report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// CSV Data Export
export const exportMovieDataToCSV = (movies) => {
  const headers = [
    'Title', 
    'Budget ($)', 
    'Revenue ($)', 
    'ROI (%)', 
    'Performance Rating', 
    'Studio', 
    'Release Year',
    'Profit/Loss ($)',
    'Budget Category'
  ];
  
  const csvData = [
    headers.join(','),
    ...movies.map(movie => [
      `"${(movie.title || 'N/A').replace(/"/g, '""')}"`, // Escape quotes
      movie.budget || 0,
      movie.revenue || 0,
      parseFloat(movie.roi || 0).toFixed(2),
      `"${(movie.performance_rating || 'N/A').replace(/"/g, '""')}"`,
      `"${(movie.studio_name || movie.studio || 'Unknown').replace(/"/g, '""')}"`,
      movie.release_year || movie.release_date || 'N/A',
      (movie.revenue || 0) - (movie.budget || 0), // Calculate profit/loss
      `"${(movie.budget_category || 'N/A').replace(/"/g, '""')}"`,
    ].join(','))
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `MovieMetrics-Full-Dataset-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Analytics Summary CSV Export
export const exportAnalyticsToCSV = (analytics) => {
  const summaryData = [
    ['Metric', 'Value', 'Description'],
    ['Total Revenue', `$${((analytics?.financial_summary?.total_revenue || 0) / 1000000).toFixed(2)}M`, 'Total box office revenue across all movies'],
    ['Overall ROI', `${(analytics?.financial_summary?.overall_roi || 0).toFixed(2)}%`, 'Average return on investment'],
    ['Total Movies', analytics?.overview?.total_movies || 0, 'Number of movies in portfolio'],
    ['Profitable Movies', analytics?.profitability?.profitable_movies || 0, 'Movies with positive ROI'],
    ['Success Rate', `${analytics?.overview?.total_movies > 0 ? ((analytics?.profitability?.profitable_movies / analytics?.overview?.total_movies) * 100).toFixed(2) : 0}%`, 'Percentage of profitable movies'],
    ['Data Completion', `${(analytics?.overview?.completion_rate || 0).toFixed(2)}%`, 'Percentage of complete financial records']
  ];

  const csvContent = summaryData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `MovieMetrics-Analytics-Summary-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Chart Export as Image
export const exportChartAsImage = async (chartElementId, filename) => {
  try {
    const chartElement = document.getElementById(chartElementId);
    if (!chartElement) {
      console.error('Chart element not found');
      return;
    }

    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false
    });
    
    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Error exporting chart:', error);
  }
};