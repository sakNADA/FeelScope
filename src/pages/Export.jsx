// src/pages/Export.jsx
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFileCsv, FaFilePdf } from 'react-icons/fa';

const Export = ({ darkMode }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/history')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => toast.error('Failed to fetch data for export.'));
  }, []);

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.warn('No data to export.');
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `feelScope_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      toast.warn('No data to export.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('FeelScope Export', 14, 22);

    const tableData = data.map(item => [
      item.text,
      item.sentiment,
      Array.isArray(item.emotion) ? item.emotion.join(', ') : item.emotion,
      item.topic,
      new Date(item.timestamp).toLocaleString(),
      item.source
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Text', 'Sentiment', 'Emotion', 'Topic', 'Timestamp', 'Source']],
      body: tableData,
      styles: { fontSize: 9 }
    });

    doc.save(`feelScope_export_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div>
      <h2 className={darkMode ? 'text-white' : 'text-dark'}>Export</h2>
      <p className={darkMode ? 'text-white' : 'text-dark'}>Choose a format to export your sentiment analysis history:</p>
      
      <div className="d-flex gap-3 flex-wrap">
        <Button 
          onClick={handleExportCSV}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '15px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
          }}
        >
          <FaFileCsv className="me-2" />
          Export as CSV
        </Button>
        
        <Button 
          onClick={handleExportPDF}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none',
            borderRadius: '15px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
          }}
        >
          <FaFilePdf className="me-2" />
          Export as PDF
        </Button>
      </div>
      
      {data.length > 0 && (
        <div className="mt-4">
          <p className={`${darkMode ? 'text-white' : 'text-dark'} mb-2`}>
            <strong>Available data:</strong> {data.length} analysis records
          </p>
        </div>
      )}
    </div>
  );
};

export default Export;
