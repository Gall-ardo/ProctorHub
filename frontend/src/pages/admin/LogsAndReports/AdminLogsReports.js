import React, { useState, useEffect } from 'react';
import AdminNavBar from '../AdminNavBar';
import axios from 'axios';
import { saveAs } from 'file-saver';
import styles from './AdminLogsReports.module.css';
import ErrorPopup from '../ErrorPopup';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminLogsReports = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [filterText, setFilterText] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  //const [selectedReportIds, setSelectedReportIds] = useState([]);
  //const [downloadingAll, setDownloadingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [yearsRes, typesRes, semestersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/reports/years`),
        axios.get(`${API_URL}/api/admin/reports/types`),
        axios.get(`${API_URL}/api/admin/reports/semesters`)
      ]);

      setAvailableYears(yearsRes.data.data || []);
      setReportTypes(typesRes.data.data || []);
      setSemesters(semestersRes.data.data || []);
    } catch (error) {
      setErrorMessage('Failed to fetch initial report data.');
      setShowError(true);
    } finally {
      setLoading(false);
      fetchReports();
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedYear) params.year = selectedYear;
      if (selectedReport) params.type = selectedReport;
      if (selectedSemester) params.semester = selectedSemester;
      if (filterText) params.search = filterText;

      const response = await axios.get(`${API_URL}/api/admin/reports`, { params });
      setReports(response.data.data || []);
    } catch (error) {
      setErrorMessage('Failed to fetch reports.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedYear, selectedReport, selectedSemester, filterText]);

 const handleDownload = async (reportId) => {
  setLoading(true);
  try {
    const report = reports.find(r => r.id === reportId);

    const response = await axios.post(`${API_URL}/api/admin/reports/download`, {
      type: report.type,
      year: report.year,
      semester: report.semester
    }, { responseType: 'blob' });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    saveAs(blob, `${report.name.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    setErrorMessage('Failed to download report.');
    setShowError(true);
  } finally {
    setLoading(false);
  }
};



  /*const handleDownloadSelected = async () => {
    if (selectedReportIds.length === 0) {
      setErrorMessage('Please select at least one report to download');
      setShowError(true);
      return;
    }

    setDownloadingAll(true);
    try {
      const response = await axios.post(`${API_URL}/api/admin/reports/download-multiple`, {
        ids: selectedReportIds
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      saveAs(blob, `reports_${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (error) {
      setErrorMessage('Failed to download reports.');
      setShowError(true);
    } finally {
      setDownloadingAll(false);
    }
  };*/

  const handleGenerateReport = async (type) => {
    if (!selectedYear || !selectedSemester) {
      setErrorMessage('Please select a year and semester.');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/reports/generate/${type}`, {
        params: {
          year: selectedYear,
          semester: selectedSemester
        }
      });

      await fetchReports();
      alert(`${response.data.data.name} generated successfully.`);
    } catch (error) {
      setErrorMessage(`Failed to generate ${type} report.`);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  /*const handleReportSelection = (reportId, isChecked) => {
    setSelectedReportIds(prev => isChecked ? [...prev, reportId] : prev.filter(id => id !== reportId));
  };

  const handleSelectAll = (isChecked) => {
    setSelectedReportIds(isChecked ? reports.map(r => r.id) : []);
  };*/

  const handleClearFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedReport('');
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
                disabled={loading}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Report Type</label>
              <select 
                value={selectedReport} 
                onChange={(e) => setSelectedReport(e.target.value)}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            
            <button 
              className={styles.clearFiltersBtn}
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className={styles.reportsSection}>
          <div className={styles.reportsHeader}>
            <h2>Available Reports ({reports.length})</h2>
          </div>
          
          <div className={styles.reportsTableContainer}>
            {loading ? (
              <div className={styles.loadingSpinner}>Loading...</div>
            ) : (
              <table className={styles.reportsTable}>
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map(report => (
                      <tr key={report.id}>
                        <td>{report.name}</td>
                        <td>
                          {reportTypes.find(t => t.id === report.type)?.name || report.type}
                        </td>
                        <td>{report.year}</td>
                        <td>
                          {semesters.find(s => s.id === report.semester)?.name || report.semester}
                        </td>
                        <td>
                          <button 
                            className={styles.downloadBtn}
                            onClick={() => handleDownload(report.id)}
                            disabled={loading}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noReportsMessage}>
                        No reports found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogsReports;