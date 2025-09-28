import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api';

class PDFReportGenerator {
  constructor() {
    this.doc = null;
  }

  // Initialize new PDF document
  initializeDoc() {
    this.doc = new jsPDF();
    this.addHeader();
    return this.doc;
  }

  // Add company header to PDF
  addHeader() {
    // Company Logo/Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('⚡ ELECTROSTORE', 20, 20);
    
    // Company subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Jaimaruthi Electricals and Hardware Store', 20, 30);
    
    // Separator line
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 35, 190, 35);
  }

  // Add report title and date
  addReportTitle(title, dateRange) {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, 50);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 60);
    
    if (dateRange) {
      this.doc.text(`Period: ${dateRange}`, 20, 67);
    }
  }

  // Generate Monthly Sales Report
  async generateMonthlyReport() {
    try {
      // Fetch monthly data
      const response = await api.get('/orders/admin/monthly-summary');
      const monthlyData = response.data.data || [];

      this.initializeDoc();
      this.addReportTitle('Monthly Sales Report', 'Last 12 Months');

      // Prepare table data
      const tableData = monthlyData.map(item => [
        item.month,
        item.totalOrders.toString(),
        `₹${item.totalRevenue.toLocaleString()}`,
        `₹${item.averageOrderValue.toLocaleString()}`,
        item.topProduct || 'N/A'
      ]);

      // Add summary statistics
      const totalRevenue = monthlyData.reduce((sum, item) => sum + item.totalRevenue, 0);
      const totalOrders = monthlyData.reduce((sum, item) => sum + item.totalOrders, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Summary Statistics:', 20, 85);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`, 25, 95);
      this.doc.text(`Total Orders: ${totalOrders}`, 25, 102);
      this.doc.text(`Average Order Value: ₹${avgOrderValue.toLocaleString()}`, 25, 109);

      // Add table
      this.doc.autoTable({
        head: [['Month', 'Orders', 'Revenue', 'Avg Order Value', 'Top Product']],
        body: tableData,
        startY: 120,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 9 }
      });

      // Download PDF
      this.doc.save(`Monthly_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      alert('Failed to generate monthly report. Please try again.');
      return false;
    }
  }

  // Generate Yearly Sales Report
  async generateYearlyReport() {
    try {
      // Fetch yearly data (we'll use monthly data and aggregate by year)
      const response = await api.get('/orders/admin/sales-analytics');
      const analyticsData = response.data.data || {};

      this.initializeDoc();
      this.addReportTitle('Yearly Sales Report', `Year ${new Date().getFullYear()}`);

      // Add key metrics
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Key Performance Indicators:', 20, 85);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      let yPosition = 95;
      if (analyticsData.totalRevenue) {
        this.doc.text(`Total Revenue: ₹${analyticsData.totalRevenue.toLocaleString()}`, 25, yPosition);
        yPosition += 7;
      }
      if (analyticsData.totalOrders) {
        this.doc.text(`Total Orders: ${analyticsData.totalOrders}`, 25, yPosition);
        yPosition += 7;
      }
      if (analyticsData.averageOrderValue) {
        this.doc.text(`Average Order Value: ₹${analyticsData.averageOrderValue.toLocaleString()}`, 25, yPosition);
        yPosition += 7;
      }

      // Fetch top products for the year
      try {
        const topProductsResponse = await api.get('/orders/admin/top-products');
        const topProducts = topProductsResponse.data.data || [];

        if (topProducts.length > 0) {
          this.doc.setFontSize(12);
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('Top Performing Products:', 20, yPosition + 15);

          const productTableData = topProducts.slice(0, 10).map((product, index) => [
            (index + 1).toString(),
            product.name || 'Unknown Product',
            product.totalSold?.toString() || '0',
            `₹${(product.totalRevenue || 0).toLocaleString()}`
          ]);

          this.doc.autoTable({
            head: [['Rank', 'Product Name', 'Units Sold', 'Revenue']],
            body: productTableData,
            startY: yPosition + 25,
            theme: 'striped',
            headStyles: { fillColor: [102, 126, 234] },
            styles: { fontSize: 9 }
          });
        }
      } catch (productError) {
        console.warn('Could not fetch top products data:', productError);
      }

      // Download PDF
      this.doc.save(`Yearly_Sales_Report_${new Date().getFullYear()}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating yearly report:', error);
      alert('Failed to generate yearly report. Please try again.');
      return false;
    }
  }

  // Generate Custom Date Range Report
  async generateCustomReport(startDate, endDate) {
    try {
      // Fetch orders for date range
      const response = await api.get(`/orders/admin/all-orders?startDate=${startDate}&endDate=${endDate}`);
      const orders = response.data.data || [];

      this.initializeDoc();
      this.addReportTitle('Custom Date Range Report', `${startDate} to ${endDate}`);

      if (orders.length === 0) {
        this.doc.setFontSize(12);
        this.doc.text('No orders found for the selected date range.', 20, 85);
        this.doc.save(`Custom_Report_${startDate}_to_${endDate}.pdf`);
        return true;
      }

      // Calculate summary
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Add summary
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Summary:', 20, 85);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`, 25, 95);
      this.doc.text(`Total Orders: ${totalOrders}`, 25, 102);
      this.doc.text(`Average Order Value: ₹${avgOrderValue.toLocaleString()}`, 25, 109);

      // Prepare orders table data
      const tableData = orders.slice(0, 50).map(order => [
        order._id?.slice(-8) || 'N/A',
        new Date(order.createdAt).toLocaleDateString(),
        order.customerName || order.userId?.name || 'Unknown',
        `₹${(order.totalAmount || 0).toLocaleString()}`,
        order.status || 'Unknown'
      ]);

      // Add orders table
      this.doc.autoTable({
        head: [['Order ID', 'Date', 'Customer', 'Amount', 'Status']],
        body: tableData,
        startY: 120,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 8 }
      });

      if (orders.length > 50) {
        const finalY = this.doc.lastAutoTable.finalY + 10;
        this.doc.text(`Note: Showing first 50 orders out of ${orders.length} total orders.`, 20, finalY);
      }

      // Download PDF
      this.doc.save(`Custom_Report_${startDate}_to_${endDate}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating custom report:', error);
      alert('Failed to generate custom report. Please try again.');
      return false;
    }
  }
}

export default new PDFReportGenerator();