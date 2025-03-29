import React, { useState } from 'react';
import AdminNavBar from '../AdminNavBar'; // Import the AdminNavBar component
import styles from './AdminLogsReports.module.css';

const AdminLogsReports = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [filterText, setFilterText] = useState('');

  // Sample data for available years
  const availableYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
    new Date().getFullYear() - 3
  ];

  // Sample data for reports
  const reportTypes = [
    { id: 'attendance', name: 'Attendance Reports' },
    { id: 'exams', name: 'Exam Reports' },
    { id: 'grades', name: 'Grade Reports' },
    { id: 'students', name: 'Student Lists' },
    { id: 'courses', name: 'Course Lists' },
    { id: 'classrooms', name: 'Classroom Usage' }
  ];

  // Sample data for semesters
  const semesters = [
    { id: 'fall', name: 'Fall Semester' },
    { id: 'spring', name: 'Spring Semester' },
    { id: 'summer', name: 'Summer Semester' }
  ];

  // Sample data for reports (would come from API in real implementation)
  const reportsData = [
    { id: 1, name: 'CS101 Attendance Fall', type: 'attendance', year: 2025, semester: 'fall', date: '2025-02-15' },
    { id: 2, name: 'CS102 Attendance Fall', type: 'attendance', year: 2025, semester: 'fall', date: '2025-02-10' },
    { id: 3, name: 'EE205 Attendance Fall', type: 'attendance', year: 2025, semester: 'fall', date: '2025-02-05' },
    { id: 4, name: 'Midterm Exam Results CS101', type: 'exams', year: 2025, semester: 'fall', date: '2025-01-20' },
    { id: 5, name: 'Final Exam Results CS102', type: 'exams', year: 2025, semester: 'fall', date: '2025-01-15' },
    { id: 6, name: 'Student List - CS Department', type: 'students', year: 2025, semester: 'fall', date: '2025-01-10' },
    { id: 7, name: 'CS101 Attendance Spring', type: 'attendance', year: 2024, semester: 'spring', date: '2024-05-15' },
    { id: 8, name: 'CS102 Attendance Spring', type: 'attendance', year: 2024, semester: 'spring', date: '2024-05-10' },
    { id: 9, name: 'Final Grades CS Department', type: 'grades', year: 2024, semester: 'spring', date: '2024-06-20' },
    { id: 10, name: 'Classroom Usage Statistics', type: 'classrooms', year: 2024, semester: 'spring', date: '2024-06-15' }
  ];

  // Filter reports based on selections
  const filteredReports = reportsData.filter(report => {
    // Filter by year
    if (selectedYear && report.year !== selectedYear) {
      return false;
    }
    
    // Filter by report type
    if (selectedReport && report.type !== selectedReport) {
      return false;
    }
    
    // Filter by semester
    if (selectedSemester && report.semester !== selectedSemester) {
      return false;
    }
    
    // Filter by search text
    if (filterText && !report.name.toLowerCase().includes(filterText.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleDownload = (reportId) => {
    const report = reportsData.find(r => r.id === reportId);
    console.log(`Downloading report: ${report.name}`);
    // In a real implementation, this would trigger an API call to download the file
    alert(`Downloading ${report.name}...`);
  };

  const handleDownloadSelected = () => {
    const selectedReports = document.querySelectorAll('input[name="report-checkbox"]:checked');
    if (selectedReports.length === 0) {
      alert('Please select at least one report to download');
      return;
    }
    
    const reportIds = Array.from(selectedReports).map(cb => parseInt(cb.value));
    console.log('Downloading selected reports:', reportIds);
    alert(`Downloading ${reportIds.length} selected reports...`);
  };

  const handleClearFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedReport(null);
    setSelectedSemester('');
    setFilterText('');
  };

  return (
    <div className={styles.logsReportsContainer}>
      {/* Using the reusable AdminNavBar component */}
      <AdminNavBar />

      <div className={styles.logsReportsContent}>
        <h1 className={styles.pageTitle}>Logs and Reports</h1>
        
        <div className={styles.filterSection}>
          <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
              <label>Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Report Type</label>
              <select 
                value={selectedReport || ''} 
                onChange={(e) => setSelectedReport(e.target.value || null)}
              >
                <option value="">All Reports</option>
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Semester</label>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>
            
            <div className={`${styles.filterGroup} ${styles.searchFilter}`}>
              <label>Search</label>
              <input 
                type="text" 
                placeholder="Search reports..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            
            <button 
              className={styles.clearFiltersBtn}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className={styles.reportsSection}>
          <div className={styles.reportsHeader}>
            <h2>Available Reports ({filteredReports.length})</h2>
            <button 
              className={styles.downloadSelectedBtn}
              onClick={handleDownloadSelected}
            >
              Download Selected
            </button>
          </div>
          
          <div className={styles.reportsTableContainer}>
            <table className={styles.reportsTable}>
              <thead>
                <tr>
                  <th className={styles.checkboxColumn}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        const checkboxes = document.querySelectorAll('input[name="report-checkbox"]');
                        checkboxes.forEach(cb => {
                          cb.checked = e.target.checked;
                        });
                      }}
                    />
                  </th>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          name="report-checkbox" 
                          value={report.id}
                        />
                      </td>
                      <td>{report.name}</td>
                      <td>
                        {reportTypes.find(t => t.id === report.type)?.name || report.type}
                      </td>
                      <td>{report.year}</td>
                      <td>
                        {semesters.find(s => s.id === report.semester)?.name || report.semester}
                      </td>
                      <td>{report.date}</td>
                      <td>
                        <button 
                          className={styles.downloadBtn}
                          onClick={() => handleDownload(report.id)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={styles.noReportsMessage}>
                      No reports found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogsReports;